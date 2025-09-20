import { useState, useCallback } from 'react';
import { fileService } from '../services/api';
import { useAuth } from './useAuth';

export const useFileUpload = () => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const uploadFile = useCallback(async (file) => {
        // Check if user is authenticated
        if (!user?.id) {
            setError('User not authenticated. Please log in to upload files.');
            return { success: false, error: 'User not authenticated' };
        }

        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            // Call file service with userId from auth context
            const result = await fileService.uploadFile(file, user.id);

            clearInterval(progressInterval);
            setProgress(100);

            if (result.success) {
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setUploading(false);
        }
    }, [user?.id]);

    const resetUpload = useCallback(() => {
        setUploading(false);
        setProgress(0);
        setError(null);
    }, []);

    return {
        uploading,
        progress,
        error,
        uploadFile,
        resetUpload
    };
};
