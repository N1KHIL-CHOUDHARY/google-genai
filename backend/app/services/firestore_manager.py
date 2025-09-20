# backend/app/services/firestore_manager.py
import os
import uuid
from google.cloud import firestore
from passlib.context import CryptContext

# --- Password Hashing Setup ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Firestore Initialization ---
try:
    DB_PATH = os.path.join(os.path.dirname(__file__), '../../legal-firebase.json')
    db = firestore.Client.from_service_account_json(DB_PATH)
except Exception as e:
    print(f"FATAL ERROR: Could not connect to Firestore. Check your 'legal-firebase.json' file. Details: {e}")
    db = None

# --- Utility Functions ---
def verify_password(plain_password, hashed_password):
    """Verifies a plain password against a stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hashes a plain-text password for safe storage."""
    return pwd_context.hash(password)

# --- User Management Functions ---
def save_user(name, email, password):
    """Saves a new user to the database with a hashed password."""
    if not db:
        raise ConnectionError("Firestore client is not initialized.")
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(password)
    
    db.collection("users").document(user_id).set({
        "name": name,
        "email": email,
        "password": hashed_password
    })
    return user_id

def get_user_by_email(email):
    """Retrieves a user by their email address."""
    if not db:
        raise ConnectionError("Firestore client is not initialized.")
        
    users_ref = db.collection("users")
    query = users_ref.where("email", "==", email).limit(1).stream()
    for doc in query:
        user = doc.to_dict()
        if user:  # This check prevents the "not subscriptable" error
            user["id"] = doc.id
            return user
    return None

# --- Document Management Functions ---
def save_document_summary(user_id, doc_id, doc_name, summary_json):
    """Saves a document's summary and metadata to Firestore."""
    if not db:
        raise ConnectionError("Firestore client is not initialized.")
        
    db.collection("documents").document(doc_id).set({
        "user_id": user_id,
        "doc_id": doc_id,
        "doc_name": doc_name,
        "summary": summary_json,
        "upload_date": firestore.SERVER_TIMESTAMP
    })

def get_documents_by_user_id(user_id):
    """Fetches all documents belonging to a specific user."""
    if not db:
        raise ConnectionError("Firestore client is not initialized.")
        
    if not user_id:
        return []
        
    docs_ref = db.collection("documents")
    query = docs_ref.where("user_id", "==", user_id).stream()
    documents = []
    for doc in query:
        data = doc.to_dict()
        if data:  # This check prevents the "get" on None error
            documents.append({
                "doc_id": data.get("doc_id"),
                "doc_name": data.get("doc_name"),
                "summary": data.get("summary"),
                "upload_date": data.get("upload_date")
            })
    return documents

def delete_document_by_id(document_id: str):
    """Deletes a document from Firestore by its ID."""
    if not db:
        raise ConnectionError("Firestore client is not initialized.")
        
    doc_ref = db.collection("documents").document(document_id)
    if doc_ref.get().exists:
        doc_ref.delete()
        return True
    return False