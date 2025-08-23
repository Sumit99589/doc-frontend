import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Clock, User, FolderOpen, Shield, Zap, Download, Eye, Trash2 } from 'lucide-react';

const DocumentUploadPage = () => {
  const [token, setToken] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [files, setFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [totalUploadedFiles, setTotalUploadedFiles] = useState(0);
  const fileInputRefs = useRef({});

  // Extract token from URL on component mount
  useEffect(() => {
    const urlPath = window.location.pathname;
    const tokenMatch = urlPath.match(/\/upload\/(.+)$/);
    if (tokenMatch) {
      const extractedToken = tokenMatch[1];
      setToken(extractedToken);
      validateToken(extractedToken);
    }
  }, []);

  // Validate the upload token
  const validateToken = async (tokenToValidate) => {
    setIsValidatingToken(true);
    setTokenError('');
    
    try {
      const response = await fetch(`http://localhost:3000/api/validate-token/${tokenToValidate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.valid) {
        setTokenData(result.data);
        // Initialize file states for each section
        const initialFiles = {};
        const initialProgress = {};
        const initialStatus = {};
        
        result.data.sections.forEach(section => {
          initialFiles[section] = [];
          initialProgress[section] = {};
          initialStatus[section] = {};
        });
        
        setFiles(initialFiles);
        setUploadProgress(initialProgress);
        setUploadStatus(initialStatus);
      } else {
        setTokenError(result.error || 'Invalid or expired upload link');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setTokenError('Failed to validate upload link. Please check your connection and try again.');
    } finally {
      setIsValidatingToken(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (section, selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => {
      // Basic file validation
      const maxSize = 50 * 1024 * 1024; // 50MB
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'text/csv'
      ];
      
      return file.size <= maxSize && allowedTypes.includes(file.type);
    });

    if (validFiles.length !== fileArray.length) {
      alert(`${fileArray.length - validFiles.length} files were rejected due to size or type restrictions.`);
    }

    setFiles(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), ...validFiles]
    }));

    // Initialize upload status for new files
    validFiles.forEach(file => {
      const fileId = `${file.name}_${file.size}_${file.lastModified}`;
      setUploadStatus(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [fileId]: 'pending'
        }
      }));
    });
  };

  // Remove file from upload list
  const removeFile = (section, fileIndex) => {
    const fileToRemove = files[section][fileIndex];
    const fileId = `${fileToRemove.name}_${fileToRemove.size}_${fileToRemove.lastModified}`;
    
    setFiles(prev => ({
      ...prev,
      [section]: prev[section].filter((_, index) => index !== fileIndex)
    }));

    // Remove from upload status
    setUploadStatus(prev => ({
      ...prev,
      [section]: {
        ...prev[section]
      }
    }));
    delete uploadStatus[section]?.[fileId];
  };

  // Upload files for a specific section
  const uploadSectionFiles = async (section, sectionFiles) => {
    const formData = new FormData();
    
    // Add files to form data
    sectionFiles.forEach(file => {
      formData.append('files', file);
    });
    
    // Add metadata
    formData.append('token', token);
    formData.append('section', section);
    formData.append('clientName', tokenData.clientName);

    try {
      const response = await fetch('http://localhost:3000/api/upload-documents', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Upload-Token': token
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update status for all files in this section
        sectionFiles.forEach(file => {
          const fileId = `${file.name}_${file.size}_${file.lastModified}`;
          setUploadStatus(prev => ({
            ...prev,
            [section]: {
              ...prev[section],
              [fileId]: 'completed'
            }
          }));
        });
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      // Update status to failed for all files in this section
      sectionFiles.forEach(file => {
        const fileId = `${file.name}_${file.size}_${file.lastModified}`;
        setUploadStatus(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [fileId]: 'failed'
          }
        }));
      });
      throw error;
    }
  };

  // Upload all files
  const handleUploadAll = async () => {
    setIsUploading(true);
    setUploadComplete(false);
    
    const sectionsToUpload = Object.entries(files).filter(([_, sectionFiles]) => 
      sectionFiles.length > 0
    );

    if (sectionsToUpload.length === 0) {
      alert('Please select at least one file to upload.');
      setIsUploading(false);
      return;
    }

    let totalSuccess = 0;
    let totalFailed = 0;

    try {
      // Upload files for each section
      for (const [section, sectionFiles] of sectionsToUpload) {
        if (sectionFiles.length > 0) {
          // Set files to uploading status
          sectionFiles.forEach(file => {
            const fileId = `${file.name}_${file.size}_${file.lastModified}`;
            setUploadStatus(prev => ({
              ...prev,
              [section]: {
                ...prev[section],
                [fileId]: 'uploading'
              }
            }));
          });

          try {
            const result = await uploadSectionFiles(section, sectionFiles);
            totalSuccess += result.data.filesUploaded;
          } catch (error) {
            totalFailed += sectionFiles.length;
            console.error(`Failed to upload files for section ${section}:`, error);
          }
        }
      }

      setTotalUploadedFiles(totalSuccess);
      setUploadComplete(true);
      
      if (totalFailed === 0) {
        // All uploads successful - show success message
      } else {
        alert(`Upload completed with issues: ${totalSuccess} successful, ${totalFailed} failed.`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get file type icon
  const getFileTypeIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconClass = "h-5 w-5";
    
    switch (extension) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-500`} />;
      case 'doc':
      case 'docx':
        return <FileText className={`${iconClass} text-blue-500`} />;
      case 'xls':
      case 'xlsx':
        return <FileText className={`${iconClass} text-green-500`} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Eye className={`${iconClass} text-purple-500`} />;
      default:
        return <FileText className={`${iconClass} text-gray-500`} />;
    }
  };

  // Loading state
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border border-slate-200">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Validating Access</h2>
          <p className="text-slate-600">Verifying your upload permissions...</p>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Connection Verified</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-lg w-full border border-red-200">
          <div className="bg-red-100 p-4 rounded-full w-fit mx-auto mb-6">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Access Denied</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">{tokenError}</p>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h3 className="font-semibold text-red-800 mb-3">Common Reasons:</h3>
            <ul className="text-sm text-red-700 space-y-2 text-left">
              <li className="flex items-start space-x-2">
                <X className="h-4 w-4 mt-0.5 text-red-500" />
                <span>Upload link has expired</span>
              </li>
              <li className="flex items-start space-x-2">
                <X className="h-4 w-4 mt-0.5 text-red-500" />
                <span>Link has already been used</span>
              </li>
              <li className="flex items-start space-x-2">
                <X className="h-4 w-4 mt-0.5 text-red-500" />
                <span>Invalid or corrupted link</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-slate-500 mt-6">
            Please contact your accountant for a new upload link.
          </p>
        </div>
      </div>
    );
  }

  // No token data
  if (!tokenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full">
          <div className="bg-slate-100 p-4 rounded-full w-fit mx-auto mb-6">
            <Upload className="h-12 w-12 text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">No Upload Link Found</h2>
          <p className="text-slate-600">Please use a valid upload link to access this page.</p>
        </div>
      </div>
    );
  }

  const expiresAt = new Date(tokenData.expiresAt);
  const timeRemaining = expiresAt.getTime() - Date.now();
  const isExpired = timeRemaining <= 0;

  // Success state
  if (uploadComplete && totalUploadedFiles > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-lg w-full border border-green-200">
          <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Upload Successful!</h2>
          <p className="text-slate-600 mb-6">
            {totalUploadedFiles} file{totalUploadedFiles !== 1 ? 's' : ''} uploaded successfully for <strong>{tokenData.clientName}</strong>
          </p>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-green-800 mb-3">What happens next?</h3>
            <ul className="text-sm text-green-700 space-y-2 text-left">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                <span>Your documents are securely stored</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                <span>Your accountant will be notified</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                <span>Processing will begin shortly</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-slate-500">
            You can safely close this page. Your upload is complete.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Secure Document Upload</h1>
                <p className="text-slate-600">Upload your documents safely and securely</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-3 py-2 rounded-xl">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">SSL Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Client Info Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-slate-200">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
              <div className="bg-blue-100 p-3 rounded-xl">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Client</p>
                <p className="text-xl font-bold text-slate-800">{tokenData.clientName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wide">Expires</p>
                <p className="text-lg font-bold text-slate-800">
                  {isExpired ? 'Expired' : expiresAt.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
              <div className="bg-purple-100 p-3 rounded-xl">
                <FolderOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide">Sections</p>
                <p className="text-lg font-bold text-slate-800">{tokenData.sections.length} Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Sections */}
        <div className="space-y-8">
          {tokenData.sections.map((section, index) => (
            <div key={section} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                      <FolderOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white capitalize">
                        {section.replace(/_/g, ' ')} Documents
                      </h2>
                      <p className="text-white/80 text-sm">
                        {files[section]?.length || 0} file{files[section]?.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* File Upload Area */}
                <div
                  className="relative border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-indigo-400 transition-all duration-300 cursor-pointer bg-gradient-to-br from-slate-50 to-blue-50 hover:from-indigo-50 hover:to-blue-50 group"
                  onClick={() => fileInputRefs.current[section]?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const droppedFiles = e.dataTransfer.files;
                    handleFileSelect(section, droppedFiles);
                  }}
                >
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    <Upload className="h-16 w-16 text-slate-400 mx-auto mb-6 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    Drop files here or click to browse
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Supported formats: PDF, Word, Excel, Images (Max 50MB per file)
                  </p>
                  <input
                    ref={el => fileInputRefs.current[section] = el}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                    onChange={(e) => handleFileSelect(section, e.target.files)}
                  />
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <Zap className="h-5 w-5" />
                    <span>Choose Files</span>
                  </div>
                </div>

                {/* Selected Files */}
                {files[section] && files[section].length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-bold text-slate-800">
                        Selected Files ({files[section].length})
                      </h4>
                      <div className="text-sm text-slate-500">
                        Total size: {formatFileSize(files[section].reduce((acc, file) => acc + file.size, 0))}
                      </div>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {files[section].map((file, fileIndex) => {
                        const fileId = `${file.name}_${file.size}_${file.lastModified}`;
                        const status = uploadStatus[section]?.[fileId] || 'pending';
                        
                        return (
                          <div key={fileIndex} className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              {getFileTypeIcon(file.name)}
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-sm text-slate-500">{formatFileSize(file.size)}</span>
                                  <span className="text-xs bg-slate-200 px-2 py-1 rounded-full text-slate-600">
                                    {file.type.split('/')[1].toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(status)}
                              {status === 'pending' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(section, fileIndex);
                                  }}
                                  className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                                  title="Remove file"
                                >
                                  <Trash2 className="h-4 w-4 text-slate-400 group-hover:text-red-500" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Upload Button */}
        {Object.values(files).some(sectionFiles => sectionFiles.length > 0) && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Upload</h3>
                <p className="text-slate-600">
                  {Object.values(files).reduce((acc, sectionFiles) => acc + sectionFiles.length, 0)} files selected across {Object.values(files).filter(sectionFiles => sectionFiles.length > 0).length} sections
                </p>
              </div>
              
              <button
                onClick={handleUploadAll}
                disabled={isUploading || isExpired}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-4 px-12 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed text-lg"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span>Uploading Files...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6" />
                    <span>Upload All Files</span>
                    <Zap className="h-5 w-5" />
                  </>
                )}
              </button>
              
              {isExpired && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-semibold">
                    ⚠️ This upload link has expired and can no longer be used.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default DocumentUploadPage;