import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowUp, FiEdit2, FiTrash2, FiUpload, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { fileService } from '../services/api';

const DocumentsPage = () => {
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const loadDocuments = async () => {
            if (!user?.id) return;
            setLoading(true);
            setError('');
            try {
                const result = await fileService.getUserFiles(user.id);
                if (result.success) {
                    setFiles(result.data);
                } else {
                    setError(result.error || 'Failed to load documents');
                }
            } catch (err) {
                setError('Network error. Please check your connection.');
            } finally {
                setLoading(false);
            }
        };
        loadDocuments();
    }, [user?.id]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !user?.id) return;
        setUploading(true);
        setError('');
        try {
            const result = await fileService.uploadFile(file, user.id);
            if (result.success) {
                setFiles(prev => [result.data, ...prev]);
                event.target.value = '';
            } else {
                setError(result.error || 'Upload failed');
            }
        } catch (err) {
            setError('Network error. Please check your connection.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            const result = await fileService.deleteFile(fileId);
            if (result.success) {
                setFiles(prev => prev.filter(file => file.id !== fileId));
            } else {
                setError(result.error || 'Failed to delete file.');
            }
        }
    };

    const handleRename = (fileId) => {
        alert(`Rename functionality for file ${fileId} is not yet implemented.`);
    };
    
    if (loading) {
        return <div className="w-full min-h-[calc(100vh-65px)] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#193A83]"></div></div>;
    }

    return (
        <div className="w-full min-h-[calc(100vh-65px)] p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-[#19154E]">Documents</h2>
                    <label className="bg-[#193A83] text-white font-semibold px-4 py-2 rounded-lg cursor-pointer hover:bg-opacity-90 transition-colors flex items-center gap-2">
                        <FiUpload size={16} />
                        {uploading ? 'Uploading...' : 'Upload File'}
                        <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                    </label>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-500">
                            <div className="col-span-6 flex items-center gap-1">Title <FiArrowUp /></div>
                            <div className="col-span-2">Type</div>
                            <div className="col-span-2">Date <FiArrowUp /></div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>
                    </div>
                    <div>
                        {files.length === 0 ? (
                            <div className="text-center py-12">
                                <FiUpload size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                                <p className="text-gray-500 mb-4">Upload your first PDF document to get started.</p>
                            </div>
                        ) : (
                            files.map(file => (
                                <div key={file.id} className="grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                    <div className="col-span-6 font-medium text-gray-800 truncate">
                                        <Link to={`/dashboard/documents/${file.id}`} className="hover:underline">{file.name}</Link>
                                    </div>
                                    <div className="col-span-2 text-gray-500 text-sm">PDF</div>
                                    <div className="col-span-2 text-gray-500 text-sm">{new Date(file.uploadDate).toLocaleDateString()}</div>
                                    <div className="col-span-2 flex items-center justify-end space-x-2">
                                        <Link to={`/dashboard/documents/${file.id}`} className="bg-[#193A83] text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-opacity-90 flex items-center gap-1.5">
                                            <FiMessageSquare size={12} />
                                            Chat
                                        </Link>
                                        <button onClick={() => handleRename(file.id)} className="text-gray-400 hover:text-gray-600 p-1"><FiEdit2 size={14}/></button>
                                        <button onClick={() => handleDelete(file.id)} className="text-red-400 hover:text-red-600 p-1"><FiTrash2 size={14}/></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DocumentsPage;