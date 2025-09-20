#!/usr/bin/env python3
"""
Quick setup script for Legal Document Assistant
Automates the initial setup process
"""
import subprocess
import sys
import os
from pathlib import Path

def run_command(command, cwd=None, shell=True):
    """Run a command and return success status"""
    try:
        print(f"🔄 Running: {command}")
        result = subprocess.run(
            command,
            cwd=cwd,
            shell=shell,
            check=True,
            capture_output=True,
            text=True
        )
        print(f"✅ Success: {command}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed: {command}")
        print(f"   Error: {e.stderr}")
        return False

def check_python():
    """Check if Python is installed"""
    print("🔍 Checking Python installation...")
    try:
        result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
        print(f"✅ Python found: {result.stdout.strip()}")
        return True
    except FileNotFoundError:
        print("❌ Python not found. Please install Python 3.8+")
        return False

def check_node():
    """Check if Node.js is installed"""
    print("🔍 Checking Node.js installation...")
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        print(f"✅ Node.js found: {result.stdout.strip()}")
        return True
    except FileNotFoundError:
        print("❌ Node.js not found. Please install Node.js 16+")
        return False

def setup_backend():
    """Setup backend environment"""
    print("\n🔧 Setting up backend...")
    backend_dir = Path("backend")
    
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    # Create virtual environment
    if not (backend_dir / "venv").exists():
        print("📦 Creating Python virtual environment...")
        if not run_command(f"{sys.executable} -m venv venv", cwd=backend_dir):
            return False
    
    # Activate virtual environment and install dependencies
    if os.name == 'nt':  # Windows
        activate_cmd = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
    else:  # Unix-like
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
    
    print("📦 Installing Python dependencies...")
    if not run_command(f"{pip_cmd} install -r requirements.txt", cwd=backend_dir):
        return False
    
    print("✅ Backend setup completed")
    return True

def setup_frontend():
    """Setup frontend environment"""
    print("\n🔧 Setting up frontend...")
    frontend_dir = Path("frontend")
    
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    print("📦 Installing Node.js dependencies...")
    if not run_command("npm install", cwd=frontend_dir):
        return False
    
    print("✅ Frontend setup completed")
    return True

def check_credentials():
    """Check if required credential files exist"""
    print("\n🔍 Checking credential files...")
    
    backend_dir = Path("backend")
    required_files = [
        "legal-firebase.json",
        "gemini-api-key.json"
    ]
    
    missing_files = []
    for file in required_files:
        if not (backend_dir / file).exists():
            missing_files.append(file)
    
    if missing_files:
        print("⚠️  Missing credential files:")
        for file in missing_files:
            print(f"   - {file}")
        print("\n📝 Please add the following files to the backend directory:")
        print("   1. legal-firebase.json - Google Firestore service account key")
        print("   2. gemini-api-key.json - Google Gemini API key")
        print("\n   You can get these from:")
        print("   - Firestore: https://console.cloud.google.com/")
        print("   - Gemini: https://aistudio.google.com/")
        return False
    else:
        print("✅ All credential files found")
        return True

def main():
    """Main setup function"""
    print("=" * 60)
    print("🚀 Legal Document Assistant - Quick Setup")
    print("=" * 60)
    
    # Check prerequisites
    if not check_python():
        return 1
    
    if not check_node():
        return 1
    
    # Setup backend
    if not setup_backend():
        print("❌ Backend setup failed")
        return 1
    
    # Setup frontend
    if not setup_frontend():
        print("❌ Frontend setup failed")
        return 1
    
    # Check credentials
    credentials_ok = check_credentials()
    
    print("\n" + "=" * 60)
    print("📋 Setup Summary")
    print("=" * 60)
    print("✅ Python environment: Ready")
    print("✅ Node.js environment: Ready")
    print("✅ Backend dependencies: Installed")
    print("✅ Frontend dependencies: Installed")
    
    if credentials_ok:
        print("✅ Credentials: Configured")
        print("\n🎉 Setup completed successfully!")
        print("\n🚀 To start the application, run:")
        print("   python start_app.py")
    else:
        print("⚠️  Credentials: Need configuration")
        print("\n🔧 Setup partially completed. Please add credential files and run:")
        print("   python start_app.py")
    
    print("\n📚 For more information, see README.md")
    return 0

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n🛑 Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
