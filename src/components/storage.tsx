import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { fetchAllFiles } from '@/lib/storageUtils';
import { 
  Search, Download, Eye, Trash2, Edit3, Upload, File, Calendar, User, 
  Grid3X3, List, CheckSquare, Square, FileText, Image, RefreshCw, 
  SortAsc, SortDesc, ArrowUpRight, HardDrive, Cloud, Users, Activity, X,
  ChevronRight, Home, Building2, FolderOpen, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const BUCKET_NAME = 'client-documents';

const AdminStoragePage = () => {
  // --- Navigation State ---
  const [currentView, setCurrentView] = useState('companies'); // 'companies', 'subfolders', 'files'
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedSubfolder, setSelectedSubfolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([{ name: 'Companies', view: 'companies' }]);

  // --- All State Management ---
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [previewFile, setPreviewFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [renameFile, setRenameFile] = useState(null);

  // --- State and Ref for Upload Modal ---
  const [uploadCompany, setUploadCompany] = useState('');
  const [uploadSubfolder, setUploadSubfolder] = useState('');
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const supabaseFiles = await fetchAllFiles(BUCKET_NAME);
      const formattedFiles = supabaseFiles.map(file => {
        const pathParts = file.path.split('/');
        // Skip userId (pathParts[0]) and start from companies
        // Expected structure: userId/companies/subfolder/filename
        const userId = pathParts[0];
        const company = pathParts.length > 2 ? pathParts[1] : 'General';
        const subfolder = pathParts.length > 3 ? pathParts[2] : 'Uncategorized';
        const fileName = pathParts[pathParts.length - 1];
        
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(file.path);

        return {
          id: file.id, 
          name: fileName, 
          company: company, 
          subfolder: subfolder,
          size: file.metadata.size, 
          type: file.metadata.mimetype, 
          uploadedAt: file.created_at,
          uploadedBy: 'N/A', 
          path: file.path, 
          url: publicUrl,
          userId: userId
        };
      });
      setFiles(formattedFiles);
    } catch (error) {
      console.error('Error loading files from Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Navigation Functions ---
  const navigateToSubfolders = (companyName) => {
    setSelectedCompany(companyName);
    setSelectedSubfolder(null);
    setCurrentView('subfolders');
    setBreadcrumb([
      { name: 'Companies', view: 'companies' },
      { name: companyName, view: 'subfolders' }
    ]);
    setSelectedFiles(new Set());
  };

  const navigateToFiles = (subfolderName) => {
    setSelectedSubfolder(subfolderName);
    setCurrentView('files');
    setBreadcrumb([
      { name: 'Companies', view: 'companies' },
      { name: selectedCompany, view: 'subfolders' },
      { name: subfolderName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), view: 'files' }
    ]);
    setSelectedFiles(new Set());
  };

  const navigateTo = (targetView, company = null, subfolder = null) => {
    if (targetView === 'companies') {
      setCurrentView('companies');
      setSelectedCompany(null);
      setSelectedSubfolder(null);
      setBreadcrumb([{ name: 'Companies', view: 'companies' }]);
    } else if (targetView === 'subfolders' && company) {
      setSelectedCompany(company);
      setSelectedSubfolder(null);
      setCurrentView('subfolders');
      setBreadcrumb([
        { name: 'Companies', view: 'companies' },
        { name: company, view: 'subfolders' }
      ]);
    }
    setSelectedFiles(new Set());
  };

  // --- Memoized Calculations ---
  const storageStats = useMemo(() => {
    if (files.length === 0) {
      return { totalFiles: 0, totalSize: 0, recentUploads: 0, activeCompanies: 0 };
    }
    return {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      recentUploads: files.filter(f =>
        new Date(f.uploadedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      activeCompanies: [...new Set(files.map(f => f.company))].length
    };
  }, [files]);

  const companies = useMemo(() => {
    const companyStats = {};
    files.forEach(file => {
      if (!companyStats[file.company]) {
        companyStats[file.company] = {
          name: file.company,
          fileCount: 0,
          totalSize: 0,
          subfolders: new Set(),
          lastUpload: null
        };
      }
      companyStats[file.company].fileCount++;
      companyStats[file.company].totalSize += file.size;
      companyStats[file.company].subfolders.add(file.subfolder);
      
      const uploadDate = new Date(file.uploadedAt);
      if (!companyStats[file.company].lastUpload || uploadDate > new Date(companyStats[file.company].lastUpload)) {
        companyStats[file.company].lastUpload = file.uploadedAt;
      }
    });

    return Object.values(companyStats).map(company => ({
      ...company,
      subfolderCount: company.subfolders.size,
      subfolders: Array.from(company.subfolders)
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [files]);

  const subfolders = useMemo(() => {
    if (!selectedCompany) return [];
    
    const subfolderStats = {};
    files.filter(file => file.company === selectedCompany).forEach(file => {
      if (!subfolderStats[file.subfolder]) {
        subfolderStats[file.subfolder] = {
          name: file.subfolder,
          fileCount: 0,
          totalSize: 0,
          lastUpload: null
        };
      }
      subfolderStats[file.subfolder].fileCount++;
      subfolderStats[file.subfolder].totalSize += file.size;
      
      const uploadDate = new Date(file.uploadedAt);
      if (!subfolderStats[file.subfolder].lastUpload || uploadDate > new Date(subfolderStats[file.subfolder].lastUpload)) {
        subfolderStats[file.subfolder].lastUpload = file.uploadedAt;
      }
    });

    return Object.values(subfolderStats).sort((a, b) => a.name.localeCompare(b.name));
  }, [files, selectedCompany]);

  const currentFiles = useMemo(() => {
    if (currentView !== 'files' || !selectedCompany || !selectedSubfolder) return [];
    
    let filtered = files.filter(file => 
      file.company === selectedCompany && 
      file.subfolder === selectedSubfolder &&
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name': comparison = a.name.localeCompare(b.name); break;
        case 'date': comparison = new Date(b.uploadedAt) - new Date(a.uploadedAt); break;
        case 'size': comparison = a.size - b.size; break;
        default: comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return filtered;
  }, [files, selectedCompany, selectedSubfolder, searchTerm, sortBy, sortOrder, currentView]);

  const uniqueCompanies = useMemo(() => [...new Set(files.map(file => file.company).sort())], [files]);
  const uniqueSubfolders = useMemo(() => [...new Set(files.map(file => file.subfolder).sort())], [files]);

  // --- Helper & Handler Functions ---
  const handleFileSelect = (fileId) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === currentFiles.length && currentFiles.length > 0) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(currentFiles.map(f => f.id)));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getFileIcon = (file, size = "h-4 w-4") => {
    const fileType = file.type || '';
    if (fileType.startsWith('image/')) {
      return <Image className={`${size} text-purple-400`} />;
    } else if (fileType === 'application/pdf') {
      return <FileText className={`${size} text-red-400`} />;
    } else {
      return <File className={`${size} text-blue-400`} />;
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // --- Download Functions ---
  const downloadFile = async (file) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Failed to download file: ${error.message}`);
    }
  };

  const downloadSelectedFiles = async () => {
    if (selectedFiles.size === 0) return;
    
    const filesToDownload = currentFiles.filter(f => selectedFiles.has(f.id));
    
    for (const file of filesToDownload) {
      await downloadFile(file);
      // Add a small delay between downloads to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const deleteFile = async (fileId) => {
    const fileToDelete = files.find(f => f.id === fileId);
    if (!fileToDelete) return;
    if (window.confirm(`Are you sure you want to delete "${fileToDelete.name}"?`)) {
      try {
        const { error } = await supabase.storage.from(BUCKET_NAME).remove([fileToDelete.path]);
        if (error) throw error;
        setFiles(prev => prev.filter(f => f.id !== fileId));
        if (previewFile && previewFile.id === fileId) setPreviewFile(null);
      } catch (error) {
        alert(`Failed to delete file: ${error.message}`);
      }
    }
  };

  const bulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedFiles.size} selected files?`)) {
      const pathsToDelete = files.filter(f => selectedFiles.has(f.id)).map(f => f.path);
      if (pathsToDelete.length === 0) return;
      try {
        const { error } = await supabase.storage.from(BUCKET_NAME).remove(pathsToDelete);
        if (error) throw error;
        setFiles(prev => prev.filter(f => !selectedFiles.has(f.id)));
        setSelectedFiles(new Set());
      } catch (error) {
        alert(`Failed to delete files: ${error.message}`);
      }
    }
  };

  const handleRenameFile = (file, newName) => {
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, name: newName } : f));
    setRenameFile(null);
  };

  // --- Upload Modal Functions ---
  const handleFileUploadSelect = (event) => {
    const chosenFiles = Array.from(event.target.files);
    setFilesToUpload(prevFiles => {
      const newFiles = chosenFiles.filter(
        newFile => !prevFiles.some(existingFile => existingFile.name === newFile.name)
      );
      return [...prevFiles, ...newFiles];
    });
    event.target.value = null;
  };

  const removeFileToUpload = (fileName) => {
    setFilesToUpload(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setTimeout(() => {
      setFilesToUpload([]);
      setUploadCompany('');
      setUploadSubfolder('');
      setIsUploading(false);
      setUploadError(null);
    }, 300);
  };

  const handleUpload = async () => {
    if (!uploadCompany || !uploadSubfolder || filesToUpload.length === 0) {
      setUploadError("Please select a company, a subfolder, and choose at least one file.");
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    
    // Get userId from the first file in the existing files (assuming all belong to the same user)
    const userId = files.length > 0 ? files[0].userId : 'default-user';
    
    const uploadPromises = filesToUpload.map(file => {
      const filePath = `${userId}/${uploadCompany}/${uploadSubfolder}/${file.name}`;
      return supabase.storage.from(BUCKET_NAME).upload(filePath, file, { upsert: false });
    });
    try {
      const results = await Promise.all(uploadPromises);
      const firstError = results.find(result => result.error);
      if (firstError) {
        if (firstError.error.statusCode === '409') {
          throw new Error(`A file with the same name already exists. Please rename it.`);
        }
        throw firstError.error;
      }
      closeUploadModal();
      await loadFiles();
    } catch (error) {
      setUploadError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="flex-1 p-8 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px] opacity-20"></div>
        <div className="relative z-10 flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading files...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px] opacity-20"></div>
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">File Storage</h1>
            <p className="text-slate-400 mt-2">Manage and organize all your company documents</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowUploadModal(true)} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400">
              <Upload className="h-4 w-4 mr-2" /> Upload Files
            </Button>
            <Button variant="outline" onClick={loadFiles} className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/50">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Storage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Files</p>
                  <p className="text-2xl font-bold text-white">{storageStats.totalFiles}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm">+{storageStats.recentUploads} this week</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg"><File className="w-6 h-6 text-blue-400" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Storage Used</p>
                  <p className="text-2xl font-bold text-white">{formatFileSize(storageStats.totalSize)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <HardDrive className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 text-sm">Capacity</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg"><HardDrive className="w-6 h-6 text-purple-400" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Companies</p>
                  <p className="text-2xl font-bold text-white">{storageStats.activeCompanies}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm">with documents</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-lg"><Building2 className="w-6 h-6 text-emerald-400" /></div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Recent Activity</p>
                  <p className="text-2xl font-bold text-white">{storageStats.recentUploads}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 text-sm">this week</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-500/20 rounded-lg"><Activity className="w-6 h-6 text-amber-400" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breadcrumb Navigation */}
        <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <Home className="h-4 w-4 text-slate-400" />
              {breadcrumb.map((item, index) => (
                <React.Fragment key={index}>
                  <button
                    onClick={() => {
                      if (item.view === 'companies') {
                        navigateTo('companies');
                      } else if (item.view === 'subfolders') {
                        navigateTo('subfolders', selectedCompany);
                      }
                    }}
                    className={cn(
                      "hover:text-blue-400 transition-colors",
                      index === breadcrumb.length - 1 ? "text-white font-medium" : "text-slate-400"
                    )}
                  >
                    {item.name}
                  </button>
                  {index < breadcrumb.length - 1 && <ChevronRight className="h-4 w-4 text-slate-500" />}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search and Controls (only for files view) */}
        {currentView === 'files' && (
          <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-2 relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                <div className="bg-slate-700/50 rounded-xl p-1 flex">
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      viewMode === 'list' ? 'bg-slate-600 text-blue-400' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      viewMode === 'grid' ? 'bg-slate-600 text-blue-400' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigateTo('subfolders', selectedCompany)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
              </div>
              {selectedFiles.size > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <span className="text-blue-400 font-medium">{selectedFiles.size} files selected</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadSelectedFiles}
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    >
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={bulkDelete}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
          <CardContent className="p-0">
            {/* Companies View */}
            {currentView === 'companies' && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.map((company) => (
                    <div
                      key={company.name}
                      onClick={() => navigateToSubfolders(company.name)}
                      className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl text-white">
                            <Building2 className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {company.name}
                            </h3>
                            <p className="text-sm text-slate-400">{company.fileCount} files</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Subfolders:</span>
                          <span className="text-white font-medium">{company.subfolderCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Size:</span>
                          <span className="text-white font-medium">{formatFileSize(company.totalSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Last Upload:</span>
                          <span className="text-white font-medium">{formatDate(company.lastUpload)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subfolders View */}
            {currentView === 'subfolders' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Subfolders in {selectedCompany}
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => navigateTo('companies')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Companies
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subfolders.map((subfolder) => (
                    <div
                      key={subfolder.name}
                      onClick={() => navigateToFiles(subfolder.name)}
                      className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl text-white">
                            <FolderOpen className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                              {subfolder.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h3>
                            <p className="text-sm text-slate-400">{subfolder.fileCount} files</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Files:</span>
                          <span className="text-white font-medium">{subfolder.fileCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Size:</span>
                          <span className="text-white font-medium">{formatFileSize(subfolder.totalSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Last Upload:</span>
                          <span className="text-white font-medium">{formatDate(subfolder.lastUpload)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files View */}
            {currentView === 'files' && (
              <>
                {currentFiles.length === 0 ? (
                  <div className="text-center p-16">
                    <File className="mx-auto h-12 w-12 text-slate-500" />
                    <h3 className="mt-4 text-lg font-medium text-white">No files found</h3>
                    <p className="mt-1 text-sm text-slate-400">Try adjusting your search criteria.</p>
                  </div>
                ) : viewMode === 'list' ? (
                  <div className="overflow-hidden">
                    <div className="bg-slate-700/30 px-6 py-4 border-b border-slate-700/50">
                      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-300">
                        <div className="col-span-1 flex items-center">
                          <button onClick={handleSelectAll} className="text-slate-400 hover:text-blue-400">
                            {selectedFiles.size === currentFiles.length && currentFiles.length > 0 ? 
                              <CheckSquare className="h-4 w-4 text-blue-400" /> : 
                              <Square className="h-4 w-4" />
                            }
                          </button>
                        </div>
                        <div className="col-span-5">
                          <button onClick={() => toggleSort('name')} className="flex items-center gap-2 hover:text-white">
                            <span>Name</span>
                            {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                          </button>
                        </div>
                        <div className="col-span-2">
                          <button onClick={() => toggleSort('size')} className="flex items-center gap-2 hover:text-white">
                            <span>Size</span>
                            {sortBy === 'size' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                          </button>
                        </div>
                        <div className="col-span-2">
                          <button onClick={() => toggleSort('date')} className="flex items-center gap-2 hover:text-white">
                            <span>Date</span>
                            {sortBy === 'date' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                          </button>
                        </div>
                        <div className="col-span-2">Actions</div>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-700/50">
                      {currentFiles.map((file) => (
                        <div key={file.id} className="px-6 py-4 hover:bg-slate-700/30 transition-all">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-1">
                              <button onClick={() => handleFileSelect(file.id)} className="text-slate-400 hover:text-blue-400">
                                {selectedFiles.has(file.id) ? 
                                  <CheckSquare className="h-4 w-4 text-blue-400" /> : 
                                  <Square className="h-4 w-4" />
                                }
                              </button>
                            </div>
                            <div className="col-span-5 flex items-center gap-3">
                              <div className="p-2 bg-slate-700/50 rounded-lg">
                                {getFileIcon(file)}
                              </div>
                              <div>
                                <p className="text-white font-medium truncate">{file.name}</p>
                                <p className="text-xs text-slate-400">{file.type.split('/').pop()?.toUpperCase()}</p>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-300 text-sm">{formatFileSize(file.size)}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-400 text-xs">{formatDate(file.uploadedAt)}</span>
                            </div>
                            <div className="col-span-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => downloadFile(file)}
                                  className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"
                                  title="Download"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setRenameFile(file)}
                                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg"
                                  title="Rename"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setPreviewFile(file)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                                  title="Preview"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteFile(file.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {currentFiles.map((file) => (
                        <div
                          key={file.id}
                          onClick={() => handleFileSelect(file.id)}
                          className={cn(
                            "relative group bg-slate-700/30 border border-slate-600/50 rounded-xl p-4 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all cursor-pointer",
                            selectedFiles.has(file.id) && "ring-2 ring-blue-500/50 border-blue-500/50"
                          )}
                        >
                          <div className="text-center">
                            <div className="mx-auto mb-3 p-3 bg-slate-600/50 rounded-xl w-fit group-hover:scale-110 transition-transform">
                              {getFileIcon(file, "h-6 w-6")}
                            </div>
                            <h3 className="text-sm font-medium text-white truncate mb-1" title={file.name}>
                              {file.name}
                            </h3>
                            <p className="text-xs text-slate-400 mb-1">{formatFileSize(file.size)}</p>
                            <p className="text-xs text-slate-500">{formatDate(file.uploadedAt)}</p>
                            <div className="mt-3 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); downloadFile(file); }}
                                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"
                                title="Download"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setRenameFile(file); }}
                                className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg"
                                title="Rename"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}
                                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                                title="Preview"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-slate-800/80 border border-slate-700 rounded-2xl w-full max-w-lg m-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Upload Files</h2>
              <button onClick={closeUploadModal} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Company</label>
                  <select
                    value={uploadCompany}
                    onChange={(e) => setUploadCompany(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="" disabled>Select a company...</option>
                    {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Subfolder</label>
                  <select
                    value={uploadSubfolder}
                    onChange={(e) => setUploadSubfolder(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="" disabled>Select a subfolder...</option>
                    {uniqueSubfolders.map(s => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-xl bg-slate-700/30 text-slate-400 hover:border-blue-500 hover:bg-slate-700/50 transition-all cursor-pointer"
              >
                <Cloud className="h-8 w-8 mb-2"/>
                <p className="text-sm">Drag & drop or <span className="font-semibold text-blue-400">click to browse</span></p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUploadSelect}
                  className="hidden"
                />
              </div>
              {filesToUpload.length > 0 && (
                <div className="mt-4 max-h-40 overflow-y-auto space-y-2 pr-2">
                  <h3 className="text-sm font-medium text-slate-300">Selected Files:</h3>
                  {filesToUpload.map(file => (
                    <div key={file.name} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-lg">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {getFileIcon(file, "h-5 w-5")}
                        <span className="text-sm text-white truncate" title={file.name}>{file.name}</span>
                        <span className="text-xs text-slate-400 flex-shrink-0">{formatFileSize(file.size)}</span>
                      </div>
                      <button
                        onClick={() => removeFileToUpload(file.name)}
                        className="p-1 text-slate-400 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {uploadError && (
                <div className="mt-4 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">
                  {uploadError}
                </div>
              )}
            </div>
            <div className="flex justify-end p-6 border-t border-slate-700 gap-3">
              <Button
                variant="outline"
                onClick={closeUploadModal}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || filesToUpload.length === 0}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : `Upload ${filesToUpload.length} File(s)`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPreviewFile(null)}>
          <div className="relative bg-slate-800/80 border border-slate-700 rounded-2xl w-full max-w-4xl h-[90vh] m-4 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white truncate">{previewFile.name}</h2>
              </div>
              <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-grow p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
              <div className="md:col-span-2 bg-slate-900/50 rounded-lg flex items-center justify-center overflow-auto p-4">
                {previewFile.type.startsWith('image/') ? (
                  <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-full object-contain" />
                ) : previewFile.type === 'application/pdf' ? (
                  <iframe src={previewFile.url} className="w-full h-full border-0" title={previewFile.name}></iframe>
                ) : (
                  <div className="text-center text-slate-400">
                    {getFileIcon(previewFile, "h-24 w-24")}
                    <p className="mt-4">No preview available for this file type.</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-4 text-sm overflow-y-auto">
                <h3 className="text-lg font-bold text-white">File Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company:</span>
                    <span className="text-white font-medium">{previewFile.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subfolder:</span>
                    <span className="text-white font-medium capitalize">{previewFile.subfolder.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Size:</span>
                    <span className="text-white font-medium">{formatFileSize(previewFile.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uploaded By:</span>
                    <span className="text-white font-medium">{previewFile.uploadedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Upload Date:</span>
                    <span className="text-white font-medium">{formatDate(previewFile.uploadedAt)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400">Path:</span>
                    <span className="text-slate-300 font-mono text-xs break-all">{previewFile.path}</span>
                  </div>
                </div>
                <div className="mt-auto pt-4 flex gap-3">
                  <Button
                    onClick={() => downloadFile(previewFile)}
                    className="w-full bg-blue-600 hover:bg-blue-500"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => deleteFile(previewFile.id)}
                    className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRenameFile(renameFile, e.target.newName.value);
            }}
            className="relative bg-slate-800/80 border border-slate-700 rounded-2xl w-full max-w-md m-4"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Rename File</h2>
              <button type="button" onClick={() => setRenameFile(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <label htmlFor="newName" className="text-sm font-medium text-slate-300 mb-2 block">
                New file name
              </label>
              <input
                id="newName"
                name="newName"
                type="text"
                defaultValue={renameFile.name}
                className="w-full pl-4 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex justify-end p-6 border-t border-slate-700 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameFile(null)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminStoragePage;