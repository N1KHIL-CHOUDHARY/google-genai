// API Service - Centralized API management
// This file contains all API calls and can be easily modified to point to real endpoints

// Base configuration
const API_BASE_URL = 'http://localhost:8000';
const API_TIMEOUT = 30000; 

const createRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            ...options.headers,
        },
        ...options,
    };

    // Only set Content-Type for JSON requests
    if (options.body && typeof options.body === 'string' && !options.headers?.['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
    }

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        const response = await fetch(url, {
            ...config,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;
            
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch {
                // If not JSON, use the text as is
                errorMessage = errorText || errorMessage;
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        if (error.name === 'AbortError') {
            return { success: false, error: 'Request timeout. Please try again.' };
        }
        return { success: false, error: error.message || 'An error occurred' };
    }
};

// Simulate API delay for development
const simulateDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication Services
export const authService = {
    // Login with email and password
    login: async (email, password) => {
        try {
            const result = await createRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (result.success) {
                const userData = {
                    id: result.data.user.id,
                    email: result.data.user.email,
                    name: result.data.user.name,
                    avatar: `https://ui-avatars.com/api/?name=${result.data.user.name}&background=193A83&color=fff`,
                    token: `token_${result.data.user.id}`
                };

                // Store token for future requests
                localStorage.setItem('authToken', userData.token);
                return { success: true, data: userData };
            } else {
                return { success: false, error: result.error || 'Login failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please check your connection.' };
        }
    },

    // Register new user
    signup: async (name, email, password) => {
        try {
            const result = await createRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });

            if (result.success) {
                const userData = {
                    id: result.data.user.id,
                    name: result.data.user.name,
                    email: result.data.user.email,
                    avatar: `https://ui-avatars.com/api/?name=${result.data.user.name}&background=193A83&color=fff`,
                    token: `token_${result.data.user.id}`
                };

                // Store token for future requests
                localStorage.setItem('authToken', userData.token);
                return { success: true, data: userData };
            } else {
                return { success: false, error: result.error || 'Registration failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please check your connection.' };
        }
    },

    // Google OAuth login
    loginWithGoogle: async () => {
        await simulateDelay(1500); // Simulate OAuth flow delay
        
        const userData = {
            id: Date.now(),
            name: 'Google User',
            email: 'user@gmail.com',
            avatar: 'https://ui-avatars.com/api/?name=Google+User&background=193A83&color=fff',
            token: `google_token_${Date.now()}`
        };

        // Store token for future requests
        localStorage.setItem('authToken', userData.token);
        
        return { success: true, data: userData };
    },

    // Logout user
    logout: async () => {
        await simulateDelay(500); // Simulate network delay
        
        // Clear stored token
        localStorage.removeItem('authToken');
        
        return { success: true };
    },

    // Verify current token
    verifyToken: async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return { success: false, error: 'No token found' };
        }

        await simulateDelay(500);
        
        // Simulate token verification
        return { success: true, data: { valid: true } };
    },

    // Refresh token
    refreshToken: async () => {
        await simulateDelay(500);
        
        const newToken = `refreshed_token_${Date.now()}`;
        localStorage.setItem('authToken', newToken);
        
        return { success: true, data: { token: newToken } };
    }
};

// File Upload Services
export const fileService = {
    // Upload file for analysis
    uploadFile: async (file, userId) => {
        try {
            // File validation
            if (!file) {
                return { success: false, error: 'No file provided' };
            }

            if (file.type !== 'application/pdf') {
                return { success: false, error: 'Only PDF files are allowed' };
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                return { success: false, error: 'File size must be less than 10MB' };
            }

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('user_id', userId);

            const result = await createRequest('/documents/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    // Don't set Content-Type, let browser set it with boundary
                }
            });

            if (result.success) {
                const fileData = {
                    id: result.data.doc_id,
                    name: result.data.meta.filename || file.name,
                    size: file.size,
                    type: file.type,
                    uploadDate: new Date().toISOString(),
                    status: 'uploaded',
                    analysisId: result.data.doc_id,
                    summary: result.data.summary
                };

                return { success: true, data: fileData };
            } else {
                return { success: false, error: result.error || 'Upload failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please check your connection.' };
        }
    },

    // Get file analysis status
    getAnalysisStatus: async (fileId) => {
        await simulateDelay(500);
        
        // Simulate analysis status
        const statuses = ['uploaded', 'processing', 'analyzing', 'completed', 'failed'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        return { 
            success: true, 
            data: { 
                fileId, 
                status: randomStatus,
                progress: randomStatus === 'completed' ? 100 : Math.floor(Math.random() * 90)
            } 
        };
    },

    // Get file analysis results
    getAnalysisResults: async (fileId) => {
        await simulateDelay(1000);
        
        // Simulate analysis results
        const results = {
            fileId,
            summary: "This is a mock summary generated by the AI after analyzing your document. It highlights the main arguments, identifies key entities, and provides a concise overview of the content to help you quickly grasp the core information without reading the entire file.",
            keyPoints: [
                "Key point 1: Important information extracted from the document",
                "Key point 2: Another significant finding",
                "Key point 3: Additional insights from the analysis"
            ],
            entities: [
                { name: "Entity 1", type: "Person", confidence: 0.95 },
                { name: "Entity 2", type: "Organization", confidence: 0.87 },
                { name: "Entity 3", type: "Location", confidence: 0.92 }
            ],
            sentiment: "positive",
            confidence: 0.88,
            createdAt: new Date().toISOString()
        };

        return { success: true, data: results };
    },

    // Get user's files
    getUserFiles: async (userId) => {
        try {
            const result = await createRequest(`/documents/user/${userId}`, {
                method: 'GET'
            });

            if (result.success) {
                const files = result.data.documents.map(doc => ({
                    id: doc.doc_id,
                    name: doc.doc_name,
                    size: 0, // Not stored in backend
                    uploadDate: doc.upload_date,
                    status: "completed",
                    analysisId: doc.doc_id,
                    summary: doc.summary
                }));

                return { success: true, data: files };
            } else {
                return { success: false, error: result.error || 'Failed to fetch files' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please check your connection.' };
        }
    },

    // Delete file
    deleteFile: async (fileId) => {
        try {
            const result = await createRequest(`/documents/${fileId}`, {
                method: 'DELETE'
            });

            if (result.success) {
                return { success: true, data: { fileId, deleted: true } };
            } else {
                return { success: false, error: result.error || 'Failed to delete file' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please check your connection.' };
        }
    },

    // Rename file
    renameFile: async (fileId, newName) => {
        try {
            const result = await createRequest(`/documents/${fileId}/rename`, {
                method: 'PUT',
                body: JSON.stringify({ name: newName })
            });

            if (result.success) {
                return { success: true, data: { fileId, newName } };
            } else {
                return { success: false, error: result.error || 'Failed to rename file' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please check your connection.' };
        }
    }
};

// Document Services
export const documentService = {
    // Get document summary
    getSummary: async (documentId) => {
        try {
            const result = await createRequest(`/analysis/${documentId}`, {
                method: 'GET'
            });

            if (result.success) {
                const summary = {
                    id: documentId,
                    title: "Document Summary",
                    content: result.data,
                    wordCount: result.data.length,
                    createdAt: new Date().toISOString()
                };

                return { success: true, data: summary };
            } else {
                return { success: false, error: result.error || 'Failed to fetch summary' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please check your connection.' };
        }
    },

    // Chat with document
    chatWithDocument: async (documentId, userId, message) => {
        try {
            const result = await createRequest('/chat/user', {
                method: 'POST',
                body: JSON.stringify({ 
                    document_id: documentId,
                    user_id: userId,
                    query: message 
                })
            });

            if (result.success) {
                const response = {
                    id: Date.now(),
                    documentId,
                    userId,
                    userMessage: message,
                    aiResponse: result.data.response,
                    timestamp: new Date().toISOString(),
                    confidence: 0.85
                };

                return { success: true, data: response };
            } else {
                return { success: false, error: result.error || 'Failed to get response' };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please check your connection.' };
        }
    }
};

// User Services
export const userService = {
    // Get user profile
    getProfile: async () => {
        await simulateDelay(500);
        
        const profile = {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            avatar: "https://ui-avatars.com/api/?name=John+Doe&background=193A83&color=fff",
            joinDate: "2024-01-01T00:00:00Z",
            totalFiles: 5,
            totalAnalysis: 12
        };

        return { success: true, data: profile };
    },

    // Update user profile
    updateProfile: async (profileData) => {
        await simulateDelay(1000);
        
        return { success: true, data: { ...profileData, updatedAt: new Date().toISOString() } };
    }
};

// Contact Services
export const contactService = {
    // Send contact message
    sendMessage: async (messageData) => {
        await simulateDelay(1500); // Simulate email sending delay
        
        // Validate form data
        if (!messageData.name || !messageData.email || !messageData.message) {
            return { success: false, error: 'All fields are required' };
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(messageData.email)) {
            return { success: false, error: 'Please enter a valid email address' };
        }

        // Simulate successful email sending to aeztrix5@gmail.com
        const emailData = {
            id: Date.now(),
            to: 'aeztrix5@gmail.com',
            from: messageData.email,
            name: messageData.name,
            message: messageData.message,
            timestamp: new Date().toISOString(),
            status: 'sent',
            subject: `New Contact Form Submission from ${messageData.name}`
        };

        // Log the email data for development
        console.log('📧 Contact form submission received:');
        console.log('To: aeztrix5@gmail.com');
        console.log('From:', messageData.email);
        console.log('Name:', messageData.name);
        console.log('Message:', messageData.message);
        console.log('Timestamp:', emailData.timestamp);
        
        // In a real implementation, this would send an actual email using:
        // - SMTP (Nodemailer)
        // - SendGrid API
        // - AWS SES
        // - Or any other email service
        
        return { success: true, data: emailData };
    },

    // Get contact messages (admin only)
    getMessages: async () => {
        await simulateDelay(800);
        
        // Simulate contact messages
        const messages = [
            {
                id: 1,
                name: "John Doe",
                email: "john@example.com",
                message: "Great service! I love using Aeztrix AI for document analysis.",
                timestamp: "2024-01-15T10:30:00Z",
                status: "read"
            },
            {
                id: 2,
                name: "Jane Smith",
                email: "jane@example.com",
                message: "How can I integrate this with my existing workflow?",
                timestamp: "2024-01-14T15:45:00Z",
                status: "unread"
            }
        ];

        return { success: true, data: messages };
    }
};

// Error handling utility
export const handleApiError = (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
        // Server responded with error status
        return error.response.data?.message || 'Server error occurred';
    } else if (error.request) {
        // Request was made but no response received
        return 'Network error. Please check your connection.';
    } else {
        // Something else happened
        return error.message || 'An unexpected error occurred';
    }
};

// Export all services
export default {
    authService,
    fileService,
    documentService,
    userService,
    contactService,
    handleApiError
};
