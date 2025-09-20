# Legal Document Assistant

A full-stack AI-powered legal document analysis and Q&A system built with FastAPI and React.

## 🚀 Features

- **Document Upload**: Upload PDF documents for AI analysis
- **AI-Powered Analysis**: Get comprehensive summaries and insights
- **Interactive Q&A**: Chat with your documents using RAG (Retrieval Augmented Generation)
- **User Authentication**: Secure user registration and login
- **Document Management**: View, organize, and manage your documents
- **Real-time Processing**: Fast document processing with progress indicators

## 🏗️ Architecture

- **Backend**: FastAPI with Python
- **Frontend**: React with Vite
- **Database**: Google Firestore
- **AI**: Google Gemini 2.5 Flash
- **Vector Store**: FAISS for document embeddings
- **Authentication**: JWT-based authentication

## 📋 Prerequisites

Before running the application, make sure you have:

- **Python 3.8+** installed
- **Node.js 16+** and **npm** installed
- **Google Cloud Project** with Firestore enabled
- **Google Gemini API** access
- **Tesseract OCR** installed (for image processing)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gen_ai_project
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\\Scripts\\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up Google Cloud credentials
# Place your service account JSON file as 'legal-firebase.json' in the backend directory
# Place your Gemini API key JSON file as 'gemini-api-key.json' in the backend directory
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

## 🚀 Running the Application

### Option 1: Start Both Servers (Recommended)

```bash
# From the project root directory
python start_app.py
```

This will start both the backend and frontend servers automatically.

### Option 2: Start Servers Separately

#### Backend Server

```bash
cd backend
python run_server.py
```

The backend will be available at: http://localhost:8000

#### Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will be available at: http://localhost:5173

## 📚 API Documentation

Once the backend is running, you can access:

- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and update the values:

```bash
cp env.example .env
```

Key configuration options:

- `BACKEND_PORT`: Backend server port (default: 8000)
- `FRONTEND_PORT`: Frontend server port (default: 5173)
- `FIREBASE_PROJECT_ID`: Your Google Cloud project ID
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to your service account JSON

### Google Cloud Setup

1. Create a Google Cloud Project
2. Enable Firestore API
3. Create a service account and download the JSON key
4. Place the JSON file as `backend/legal-firebase.json`

### Gemini API Setup

1. Get your Gemini API key from Google AI Studio
2. Place the JSON file as `backend/gemini-api-key.json`

## 🧪 Testing

### Backend Testing

```bash
cd backend
# Run tests (if available)
python -m pytest
```

### Frontend Testing

```bash
cd frontend
# Run tests (if available)
npm test
```

### Manual Testing

1. **Registration**: Create a new user account
2. **Login**: Sign in with your credentials
3. **Upload**: Upload a PDF document
4. **Analysis**: View the AI-generated summary
5. **Chat**: Ask questions about your document

## 📁 Project Structure

```
gen_ai_project/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── models.py            # Pydantic models
│   │   ├── services/            # Business logic
│   │   └── utils.py             # Utility functions
│   ├── requirements.txt         # Python dependencies
│   └── run_server.py           # Backend startup script
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   └── hooks/              # Custom hooks
│   ├── package.json            # Node.js dependencies
│   └── vite.config.js          # Vite configuration
├── start_app.py                # Main startup script
└── README.md                   # This file
```

## 🔒 Security Features

- **CORS Protection**: Configured for specific origins
- **Input Validation**: Pydantic models for request validation
- **File Type Validation**: Only PDF files allowed
- **File Size Limits**: 10MB maximum file size
- **Error Handling**: Comprehensive error handling and logging

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port 8000
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   ```

2. **Firestore Connection Issues**
   - Check your service account JSON file
   - Verify Firestore API is enabled
   - Check your Google Cloud project ID

3. **Gemini API Issues**
   - Verify your API key is valid
   - Check API quotas and limits
   - Ensure the JSON file is properly formatted

4. **Frontend Build Issues**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

### Logs

- Backend logs: Check console output when running `python run_server.py`
- Frontend logs: Check browser console and terminal output

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all dependencies are properly installed
4. Verify your Google Cloud and Gemini API configurations

## 🔄 Updates

To update the application:

1. Pull the latest changes: `git pull origin main`
2. Update backend dependencies: `pip install -r backend/requirements.txt`
3. Update frontend dependencies: `npm install` (in frontend directory)
4. Restart the application: `python start_app.py`

---

**Happy Document Analysis! 📚✨**
