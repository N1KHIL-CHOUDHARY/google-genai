#!/usr/bin/env python3
"""
Main startup script for Legal Document Assistant
Starts both backend and frontend servers
"""
import subprocess
import sys
import time
import os
import signal
import threading
from pathlib import Path

class AppManager:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.running = True
        
    def start_backend(self):
        """Start the FastAPI backend server"""
        print("🚀 Starting Backend Server...")
        backend_dir = Path(__file__).parent / "backend"
        
        try:
            self.backend_process = subprocess.Popen(
                [sys.executable, "run_server.py"],
                cwd=backend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                bufsize=1
            )
            
            # Monitor backend output
            def monitor_backend():
                for line in iter(self.backend_process.stdout.readline, ''):
                    if self.running:
                        print(f"[BACKEND] {line.strip()}")
                    else:
                        break
                        
            threading.Thread(target=monitor_backend, daemon=True).start()
            
            # Wait a moment for backend to start
            time.sleep(3)
            
            if self.backend_process.poll() is None:
                print("✅ Backend server started successfully")
                return True
            else:
                print("❌ Backend server failed to start")
                return False
                
        except Exception as e:
            print(f"❌ Error starting backend: {e}")
            return False
    
    def start_frontend(self):
        """Start the React frontend server"""
        print("🚀 Starting Frontend Server...")
        frontend_dir = Path(__file__).parent / "frontend"
        
        try:
            self.frontend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                bufsize=1
            )
            
            # Monitor frontend output
            def monitor_frontend():
                for line in iter(self.frontend_process.stdout.readline, ''):
                    if self.running:
                        print(f"[FRONTEND] {line.strip()}")
                    else:
                        break
                        
            threading.Thread(target=monitor_frontend, daemon=True).start()
            
            # Wait a moment for frontend to start
            time.sleep(5)
            
            if self.frontend_process.poll() is None:
                print("✅ Frontend server started successfully")
                return True
            else:
                print("❌ Frontend server failed to start")
                return False
                
        except Exception as e:
            print(f"❌ Error starting frontend: {e}")
            return False
    
    def stop_servers(self):
        """Stop both servers"""
        print("\n🛑 Stopping servers...")
        self.running = False
        
        if self.backend_process:
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
        
        if self.frontend_process:
            self.frontend_process.terminate()
            try:
                self.frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()
        
        print("✅ Servers stopped")
    
    def run(self):
        """Main run method"""
        print("=" * 60)
        print("🏛️  Legal Document Assistant - Full Stack Application")
        print("=" * 60)
        print("📍 Backend API: http://localhost:8000")
        print("📍 Frontend UI: http://localhost:5173")
        print("📚 API Docs: http://localhost:8000/docs")
        print("=" * 60)
        
        # Start backend
        if not self.start_backend():
            print("❌ Failed to start backend. Exiting...")
            return
        
        # Start frontend
        if not self.start_frontend():
            print("❌ Failed to start frontend. Stopping backend...")
            self.stop_servers()
            return
        
        print("\n🎉 Application is running!")
        print("Press Ctrl+C to stop both servers")
        print("-" * 60)
        
        try:
            # Keep the main thread alive
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Received interrupt signal...")
        finally:
            self.stop_servers()

def main():
    # Check if we're in the right directory
    if not Path("backend").exists() or not Path("frontend").exists():
        print("❌ Error: Please run this script from the project root directory")
        print("   Make sure 'backend' and 'frontend' folders exist")
        sys.exit(1)
    
    # Check if Node.js is installed
    try:
        subprocess.run(["node", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Error: Node.js is not installed or not in PATH")
        print("   Please install Node.js from https://nodejs.org/")
        sys.exit(1)
    
    # Check if npm is available
    try:
        subprocess.run(["npm", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Error: npm is not installed or not in PATH")
        sys.exit(1)
    
    # Check if Python dependencies are installed
    backend_dir = Path("backend")
    if not (backend_dir / "venv").exists():
        print("⚠️  Warning: Python virtual environment not found")
        print("   Please run: cd backend && python -m venv venv && venv\\Scripts\\activate && pip install -r requirements.txt")
    
    app = AppManager()
    
    # Handle graceful shutdown
    def signal_handler(signum, frame):
        print(f"\n🛑 Received signal {signum}")
        app.stop_servers()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    app.run()

if __name__ == "__main__":
    main()
