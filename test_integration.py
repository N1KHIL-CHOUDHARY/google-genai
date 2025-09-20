#!/usr/bin/env python3
"""
Integration test script for Legal Document Assistant
Tests the connection between frontend and backend
"""
import requests
import json
import time
import sys
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"
TEST_TIMEOUT = 10

def test_backend_health():
    """Test if backend is running and healthy"""
    print("🔍 Testing backend health...")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=TEST_TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is healthy: {data}")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend is not accessible: {e}")
        return False

def test_backend_root():
    """Test backend root endpoint"""
    print("🔍 Testing backend root endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=TEST_TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend root endpoint working: {data}")
            return True
        else:
            print(f"❌ Backend root endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend root endpoint error: {e}")
        return False

def test_backend_cors():
    """Test CORS configuration"""
    print("🔍 Testing CORS configuration...")
    try:
        headers = {
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options(f"{BACKEND_URL}/auth/login", headers=headers, timeout=TEST_TIMEOUT)
        if response.status_code == 200:
            cors_headers = response.headers
            print(f"✅ CORS preflight successful")
            print(f"   Allow-Origin: {cors_headers.get('Access-Control-Allow-Origin', 'Not set')}")
            print(f"   Allow-Methods: {cors_headers.get('Access-Control-Allow-Methods', 'Not set')}")
            return True
        else:
            print(f"❌ CORS preflight failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ CORS test error: {e}")
        return False

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("🔍 Testing authentication endpoints...")
    
    # Test registration
    try:
        test_user = {
            "name": "Test User",
            "email": f"test_{int(time.time())}@example.com",
            "password": "testpassword123"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register",
            json=test_user,
            headers={'Content-Type': 'application/json'},
            timeout=TEST_TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ User registration successful: {data['message']}")
            user_id = data['user']['id']
            
            # Test login
            login_data = {
                "email": test_user["email"],
                "password": test_user["password"]
            }
            
            response = requests.post(
                f"{BACKEND_URL}/auth/login",
                json=login_data,
                headers={'Content-Type': 'application/json'},
                timeout=TEST_TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ User login successful: {data['message']}")
                return True, user_id
            else:
                print(f"❌ User login failed: {response.status_code} - {response.text}")
                return False, None
        else:
            print(f"❌ User registration failed: {response.status_code} - {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Authentication test error: {e}")
        return False, None

def test_documents_endpoint(user_id):
    """Test documents endpoint"""
    print("🔍 Testing documents endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/documents/user/{user_id}", timeout=TEST_TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Documents endpoint working: {len(data.get('documents', []))} documents found")
            return True
        else:
            print(f"❌ Documents endpoint failed: {response.status_code} - {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Documents endpoint error: {e}")
        return False

def test_frontend_accessibility():
    """Test if frontend is accessible"""
    print("🔍 Testing frontend accessibility...")
    try:
        response = requests.get(FRONTEND_URL, timeout=TEST_TIMEOUT)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend accessibility failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend is not accessible: {e}")
        return False

def main():
    """Main test function"""
    print("=" * 60)
    print("🧪 Legal Document Assistant - Integration Tests")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 6
    
    # Test 1: Backend Health
    if test_backend_health():
        tests_passed += 1
    
    # Test 2: Backend Root
    if test_backend_root():
        tests_passed += 1
    
    # Test 3: CORS Configuration
    if test_backend_cors():
        tests_passed += 1
    
    # Test 4: Authentication
    auth_success, user_id = test_auth_endpoints()
    if auth_success:
        tests_passed += 1
    
    # Test 5: Documents Endpoint
    if user_id and test_documents_endpoint(user_id):
        tests_passed += 1
    
    # Test 6: Frontend Accessibility
    if test_frontend_accessibility():
        tests_passed += 1
    
    # Results
    print("\n" + "=" * 60)
    print("📊 Test Results")
    print("=" * 60)
    print(f"Tests Passed: {tests_passed}/{total_tests}")
    print(f"Success Rate: {(tests_passed/total_tests)*100:.1f}%")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! Integration is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
