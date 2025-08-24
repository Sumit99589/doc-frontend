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
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get file type icon
  const getFileTypeIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconClass = "h-4 w-4";
    
    switch (extension) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-500`} />;
      case 'doc':
      case 'docx':
        return <FileText className={`${iconClass} text-blue-600`} />;
      case 'xls':
      case 'xlsx':
        return <FileText className={`${iconClass} text-green-600`} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Eye className={`${iconClass} text-purple-600`} />;
      default:
        return <FileText className={`${iconClass} text-gray-600`} />;
    }
  };

  // Loading state
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md w-full border">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Validating Access</h2>
          <p className="text-gray-600 text-sm">Verifying your upload permissions...</p>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Connection</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (tokenError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-lg w-full border border-red-200">
          <div className="bg-red-100 p-3 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-4 text-sm">{tokenError}</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-800 mb-2 text-sm">Common Issues:</h3>
            <ul className="text-xs text-red-700 space-y-1 text-left">
              <li className="flex items-start space-x-2">
                <X className="h-3 w-3 mt-0.5 text-red-500 flex-shrink-0" />
                <span>Upload link has expired</span>
              </li>
              <li className="flex items-start space-x-2">
                <X className="h-3 w-3 mt-0.5 text-red-500 flex-shrink-0" />
                <span>Link has already been used</span>
              </li>
              <li className="flex items-start space-x-2">
                <X className="h-3 w-3 mt-0.5 text-red-500 flex-shrink-0" />
                <span>Invalid or corrupted link</span>
              </li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Please contact your accountant for a new upload link.
          </p>
        </div>
      </div>
    );
  }

  // No token data
  if (!tokenData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="bg-gray-100 p-3 rounded-full w-fit mx-auto mb-4">
            <Upload className="h-8 w-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Upload Link Found</h2>
          <p className="text-gray-600 text-sm">Please use a valid upload link to access this page.</p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-lg w-full border border-green-200">
          <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Upload Successful</h2>
          <p className="text-gray-600 mb-4 text-sm">
            {totalUploadedFiles} file{totalUploadedFiles !== 1 ? 's' : ''} uploaded successfully for <strong>{tokenData.clientName}</strong>
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-green-800 mb-2 text-sm">What happens next?</h3>
            <ul className="text-xs text-green-700 space-y-1 text-left">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Your documents are securely stored</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Your accountant will be notified</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Processing will begin shortly</span>
              </li>
            </ul>
          </div>
          <p className="text-xs text-gray-500">
            You can safely close this page. Your upload is complete.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Document Upload Portal</h1>
                <p className="text-sm text-gray-600">Secure file transfer system</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-3 py-1 rounded-lg">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">SSL Secured</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Client Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Client</p>
                  <p className="text-sm font-semibold text-gray-900">{tokenData.clientName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Expires</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {isExpired ? 'Expired' : expiresAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <FolderOpen className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Sections</p>
                  <p className="text-sm font-semibold text-gray-900">{tokenData.sections.length} Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Sections */}
        <div className="space-y-4">
          {tokenData.sections.map((section, index) => (
            <div key={section} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4 text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-900 capitalize">
                      {section.replace(/_/g, ' ')}
                    </h3>
                    <span className="text-xs text-gray-500">
                      ({files[section]?.length || 0} files)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* File Upload Area */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50"
                  onClick={() => fileInputRefs.current[section]?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const droppedFiles = e.dataTransfer.files;
                    handleFileSelect(section, droppedFiles);
                  }}
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Drop files here or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    PDF, Word, Excel, Images • Max 50MB per file
                  </p>
                  <input
                    ref={el => fileInputRefs.current[section] = el}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                    onChange={(e) => handleFileSelect(section, e.target.files)}
                  />
                  <div className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    <Zap className="h-4 w-4" />
                    <span>Select Files</span>
                  </div>
                </div>

                {/* Selected Files */}
                {files[section] && files[section].length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Selected Files ({files[section].length})
                      </h4>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(files[section].reduce((acc, file) => acc + file.size, 0))}
                      </div>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {files[section].map((file, fileIndex) => {
                        const fileId = `${file.name}_${file.size}_${file.lastModified}`;
                        const status = uploadStatus[section]?.[fileId] || 'pending';
                        
                        return (
                          <div key={fileIndex} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {getFileTypeIcon(file.name)}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">
                                    {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(status)}
                              {status === 'pending' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(section, fileIndex);
                                  }}
                                  className="p-1 hover:bg-red-100 rounded transition-colors"
                                  title="Remove file"
                                >
                                  <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
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
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Ready to Upload</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {Object.values(files).reduce((acc, sectionFiles) => acc + sectionFiles.length, 0)} files selected across {Object.values(files).filter(sectionFiles => sectionFiles.length > 0).length} sections
                  </p>
                </div>
                
                <button
                  onClick={handleUploadAll}
                  disabled={isUploading || isExpired}
                  className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span className="text-sm">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Upload All Files</span>
                    </>
                  )}
                </button>
              </div>
              
              {isExpired && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm font-medium">
                    ⚠️ This upload link has expired and can no longer be used.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadPage;