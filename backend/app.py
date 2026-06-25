# Mock API Backend for Tata UISL Connection Portal
# Written in Python to enable running locally without a .NET SDK environment.
# Run 'pip install flask flask-cors' before executing this file.

import os
import sys
import random
import time
from datetime import datetime

try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
except ImportError:
    print("Error: Flask and Flask-CORS are required to run this mock backend.")
    print("Please install them by running: pip install flask flask-cors")
    sys.exit(1)

app = Flask(__name__)
CORS(app) # Allow cross-origin requests from React frontend

# In-Memory Datastores
USERS = [
    { "id": 1, "fullName": "System Administrator", "email": "admin@tatauisl.com", "mobileNumber": "9999999999", "role": "Admin", "isActive": True, "createdAt": "2026-01-01T10:00:00Z", "password": "Admin@123" },
    { "id": 2, "fullName": "Rajesh Kumar", "email": "rajesh.kumar@gmail.com", "mobileNumber": "9876543210", "role": "Customer", "isActive": True, "createdAt": "2026-06-01T12:00:00Z", "password": "Customer@123" },
    { "id": 3, "fullName": "Priya Sharma", "email": "priya.sharma@yahoo.com", "mobileNumber": "8765432109", "role": "Customer", "isActive": True, "createdAt": "2026-06-10T14:30:00Z", "password": "Customer@123" }
]

CONNECTION_TYPES = [
    { "id": 1, "name": "Domestic New Connection", "category": "Domestic" },
    { "id": 2, "name": "Commercial New Connection", "category": "Commercial" },
    { "id": 3, "name": "Industrial Power Line", "category": "Industrial" },
    { "id": 4, "name": "Domestic Name Transfer", "category": "Domestic" },
    { "id": 5, "name": "Domestic Load Enhancement", "category": "Domestic" },
    { "id": 6, "name": "Temporary Connection (Construction/Events)", "category": "Other" }
]

APPLICATIONS = [
    {
        "id": "app_001",
        "applicationNumber": "TATA-UISL-2026-98124",
        "customerId": 2,
        "customerName": "Rajesh Kumar",
        "customerEmail": "rajesh.kumar@gmail.com",
        "customerMobile": "9876543210",
        "fullName": "Rajesh Kumar",
        "fatherName": "Ram Sharan Kumar",
        "motherName": "Sita Devi",
        "gender": "Male",
        "dateOfBirth": "1985-05-15",
        "aadhaarNumber": "123456789012",
        "panNumber": "ABCDE1234F",
        "occupation": "Self Employed",
        "annualIncome": 450000.0,
        "addressLine1": "H.No 124, Sector 4, Bistupur",
        "addressLine2": "Near Regal Ground",
        "city": "Jamshedpur",
        "state": "Jharkhand",
        "district": "East Singhbhum",
        "pinCode": "831001",
        "connectionTypeId": 1,
        "connectionTypeName": "Domestic New Connection",
        "connectionCategory": "Domestic",
        "applicationType": "New Connection",
        "propertyType": "Residential Flat",
        "houseNumber": "124",
        "wardNumber": "Ward 12",
        "area": "Bistupur",
        "landmark": "Regal Ground",
        "currentStatus": "Connection Completed",
        "submittedDate": "2026-06-15T09:15:00Z",
        "assignedOfficer": "Officer Alok Prasad",
        "profileCompletion": 100,
        "documents": [
            { "id": "doc_101", "documentType": "Aadhaar Card", "fileName": "aadhaar_rajesh.pdf", "fileSize": 1024000, "filePath": "#", "verificationStatus": "Verified", "uploadedAt": "2026-06-15T09:20:00Z" },
            { "id": "doc_102", "documentType": "PAN Card", "fileName": "pan_rajesh.jpg", "fileSize": 450000, "filePath": "#", "verificationStatus": "Verified", "uploadedAt": "2026-06-15T09:21:00Z" },
            { "id": "doc_103", "documentType": "Ownership Proof", "fileName": "property_deed.pdf", "fileSize": 5400000, "filePath": "#", "verificationStatus": "Verified", "uploadedAt": "2026-06-15T09:23:00Z" }
        ],
        "remarks": [
            { "id": "rem_101", "applicationId": "app_001", "officerName": "Officer Alok Prasad", "remarks": "Physical connection completed, smart meter installed.", "createdAt": "2026-06-20T16:00:00Z" }
        ]
    },
    {
        "id": "app_002",
        "applicationNumber": "TATA-UISL-2026-98150",
        "customerId": 3,
        "customerName": "Priya Sharma",
        "customerEmail": "priya.sharma@yahoo.com",
        "customerMobile": "8765432109",
        "fullName": "Priya Sharma",
        "fatherName": "Sanjay Sharma",
        "motherName": "Sunita Sharma",
        "gender": "Female",
        "dateOfBirth": "1992-09-24",
        "aadhaarNumber": "987654321098",
        "panNumber": "XYZWP5678Q",
        "occupation": "Corporate Professional",
        "annualIncome": 850000.0,
        "addressLine1": "Flat 4B, Hill View Apartments",
        "addressLine2": "CH Area",
        "city": "Jamshedpur",
        "state": "Jharkhand",
        "district": "East Singhbhum",
        "pinCode": "831008",
        "connectionTypeId": 2,
        "connectionTypeName": "Commercial New Connection",
        "connectionCategory": "Commercial",
        "applicationType": "New Connection",
        "propertyType": "Retail Shop",
        "houseNumber": "Shop No 12, Ground Floor",
        "wardNumber": "Ward 3",
        "area": "Sakchi",
        "landmark": "Sakchi Market Plaza",
        "currentStatus": "Document Verification",
        "submittedDate": "2026-06-22T11:45:00Z",
        "assignedOfficer": "Officer Neha Sen",
        "profileCompletion": 80,
        "documents": [
            { "id": "doc_201", "documentType": "Aadhaar Card", "fileName": "priya_aadhaar.pdf", "fileSize": 1204000, "filePath": "#", "verificationStatus": "Pending", "uploadedAt": "2026-06-22T11:50:00Z" },
            { "id": "doc_202", "documentType": "PAN Card", "fileName": "priya_pan.png", "fileSize": 300000, "filePath": "#", "verificationStatus": "Rejected", "uploadedAt": "2026-06-22T11:51:00Z", "rejectionReason": "The PAN card image is blurry. Please re-upload a clear copy." },
            { "id": "doc_203", "documentType": "Passport Size Photo", "fileName": "photo.jpg", "fileSize": 150000, "filePath": "#", "verificationStatus": "Verified", "uploadedAt": "2026-06-22T11:52:00Z" }
        ],
        "remarks": [
            { "id": "rem_201", "applicationId": "app_002", "officerName": "Officer Neha Sen", "remarks": "Requested re-upload of PAN card due to poor scan quality.", "createdAt": "2026-06-23T10:00:00Z" }
        ]
    }
]

NOTIFICATIONS = [
    { "id": "not_001", "userId": 2, "title": "Application Submitted Successfully", "message": "Your application TATA-UISL-2026-98124 has been submitted. Tracking has been initialized.", "type": "Success", "isRead": True, "createdAt": "2026-06-15T09:25:00Z" },
    { "id": "not_002", "userId": 2, "title": "Connection Setup Scheduled", "message": "An installation officer is scheduled to visit your property on 2026-06-19.", "type": "Info", "isRead": True, "createdAt": "2026-06-18T10:00:00Z" },
    { "id": "not_003", "userId": 2, "title": "Power Connection Activated", "message": "Congratulations! Your connection under application number TATA-UISL-2026-98124 is now active.", "type": "Success", "isRead": False, "createdAt": "2026-06-20T16:05:00Z" },
    { "id": "not_004", "userId": 3, "title": "Document Re-upload Required", "message": "Officer Neha Sen has requested a re-upload of your PAN Card because the image is blurry.", "type": "Warning", "isRead": False, "createdAt": "2026-06-23T10:05:00Z" }
]

AUDIT_LOGS = [
    { "id": "log_001", "userId": 1, "userName": "System Administrator", "action": "User Seeding", "tableName": "Users", "recordId": "1", "timestamp": "2026-06-25T09:00:00Z", "ipAddress": "127.0.0.1", "details": "Initial system users seeded." },
    { "id": "log_002", "userId": 3, "userName": "Priya Sharma", "action": "Application Creation", "tableName": "Applications", "recordId": "app_002", "timestamp": "2026-06-22T11:45:00Z", "ipAddress": "192.168.1.45", "details": "Priya Sharma submitted a new connection request." },
    { "id": "log_003", "userId": 1, "userName": "Officer Neha Sen", "action": "Document Verification Update", "tableName": "Documents", "recordId": "doc_202", "timestamp": "2026-06-23T10:00:00Z", "ipAddress": "10.0.2.14", "details": "Officer rejected Priya's PAN Card due to blurriness." }
]

SETTINGS = {
    "requiredDocuments": ["Aadhaar Card", "PAN Card", "Passport Size Photo", "Address Proof", "Ownership Proof", "Electricity Bill", "Signature"],
    "allowRegistration": "true",
    "supportEmail": "support.uisl@tatasteel.com",
    "supportPhone": "1800-345-6789"
}

def write_audit_log(user_id, user_name, action, table_name, record_id=None, details=""):
    log = {
        "id": f"log_{int(time.time() * 1000)}",
        "userId": user_id,
        "userName": user_name,
        "action": action,
        "tableName": table_name,
        "recordId": str(record_id) if record_id else None,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "ipAddress": "127.0.0.1",
        "details": details
    }
    AUDIT_LOGS.insert(0, log)

def add_notification(user_id, title, message, type_val="Info"):
    notif = {
        "id": f"not_{int(time.time() * 1000)}",
        "userId": user_id,
        "title": title,
        "message": message,
        "type": type_val,
        "isRead": False,
        "createdAt": datetime.utcnow().isoformat() + "Z"
    }
    NOTIFICATIONS.insert(0, notif)

# Helper to verify token and extract user
def get_user_from_headers():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    # In mock, token is formatted as: mock_jwt_token_{user_id}_{timestamp}
    if not token.startswith("mock_jwt_token_"):
        return None
    try:
        user_id = int(token.split("_")[3])
        return next((u for u in USERS if u["id"] == user_id), None)
    except:
        return None

# API ENDPOINTS

# --- AUTH MODULE ---
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email", "")
    if any(u["email"].lower() == email.lower() for u in USERS):
        return jsonify({ "message": "Email already registered." }), 400
    
    new_user = {
        "id": len(USERS) + 1,
        "fullName": data.get("fullName", ""),
        "email": email,
        "mobileNumber": data.get("mobileNumber", ""),
        "role": "Customer",
        "isActive": True,
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "password": "Customer@123" # Default demo password
    }
    USERS.append(new_user)
    write_audit_log(new_user["id"], new_user["fullName"], "Registration", "Users", new_user["id"], "User registered self")
    return jsonify({ "message": "Registration successful! Verification OTP sent to " + email })

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email", "")
    password = data.get("password", "")
    
    user = next((u for u in USERS if u["email"].lower() == email.lower()), None)
    if not user:
        return jsonify({ "message": "User not found. Please register." }), 404
        
    if not user["isActive"]:
        return jsonify({ "message": "Your account is deactivated. Contact Admin." }), 400
        
    # Validation check for passwords
    if user["role"] == "Admin" and password != "Admin@123":
        return jsonify({ "message": "Invalid password for Administrator." }), 401
    
    token = f"mock_jwt_token_{user['id']}_{int(time.time())}"
    write_audit_log(user["id"], user["fullName"], "Login", "Users", user["id"], "Successful login")
    
    # Return user details without password
    user_resp = {k: v for k, v in user.items() if k != "password"}
    return jsonify({ "token": token, "user": user_resp })

@app.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    otp = data.get("otp", "")
    if otp in ["123456", "000000"]:
        return jsonify({ "success": True, "message": "OTP verified." })
    return jsonify({ "message": "Invalid OTP. Use demo code: '123456'" }), 400

@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email", "")
    if not any(u["email"].lower() == email.lower() for u in USERS):
        return jsonify({ "message": "No user found with this email." }), 400
    return jsonify({ "message": "Password reset link sent to your registered email." })

# --- APPLICATION MODULE ---
@app.route("/api/applications", methods=["GET"])
def get_applications():
    user = get_user_from_headers()
    if not user:
        return jsonify({ "message": "Unauthorized" }), 401
        
    if user["role"] == "Admin":
        return jsonify(APPLICATIONS)
    else:
        user_apps = [a for a in APPLICATIONS if a["customerId"] == user["id"]]
        return jsonify(user_apps)

@app.route("/api/applications/<id>", methods=["GET"])
def get_application_by_id(id):
    app = next((a for a in APPLICATIONS if a["id"] == id), None)
    if not app:
        return jsonify({ "message": "Application not found" }), 404
    return jsonify(app)

@app.route("/api/applications", methods=["POST"])
def submit_application():
    user = get_user_from_headers()
    if not user:
        return jsonify({ "message": "Unauthorized" }), 401
        
    data = request.json
    conn_type_id = int(data.get("connectionTypeId", 1))
    conn_type = next((t for t in CONNECTION_TYPES if t["id"] == conn_type_id), CONNECTION_TYPES[0])
    app_num = f"TATA-UISL-2026-{random.randint(10000, 99999)}"
    
    docs_payload = []
    for doc in data.get("documents", []):
        docs_payload.append({
            "id": f"doc_{int(time.time() * 1000)}_{random.randint(10, 99)}",
            "documentType": doc.get("documentType", ""),
            "fileName": doc.get("fileName", ""),
            "fileSize": doc.get("fileSize", 0),
            "filePath": doc.get("filePath", "#"),
            "verificationStatus": "Pending",
            "uploadedAt": datetime.utcnow().isoformat() + "Z"
        })
        
    new_app = {
        "id": f"app_{int(time.time() * 1000)}",
        "applicationNumber": app_num,
        "customerId": user["id"],
        "customerName": user["fullName"],
        "customerEmail": user["email"],
        "customerMobile": user["mobileNumber"],
        
        "fullName": data.get("fullName", user["fullName"]),
        "fatherName": data.get("fatherName", ""),
        "motherName": data.get("motherName", ""),
        "gender": data.get("gender", "Male"),
        "dateOfBirth": data.get("dateOfBirth", ""),
        "aadhaarNumber": data.get("aadhaarNumber", ""),
        "panNumber": data.get("panNumber", ""),
        "occupation": data.get("occupation", ""),
        "annualIncome": float(data.get("annualIncome", 0)),
        
        "addressLine1": data.get("addressLine1", ""),
        "addressLine2": data.get("addressLine2", ""),
        "city": data.get("city", "Jamshedpur"),
        "state": data.get("state", "Jharkhand"),
        "district": data.get("district", "East Singhbhum"),
        "pinCode": data.get("pinCode", ""),
        
        "connectionTypeId": conn_type_id,
        "connectionTypeName": conn_type["name"],
        "connectionCategory": conn_type["category"],
        "applicationType": data.get("applicationType", "New Connection"),
        
        "propertyType": data.get("propertyType", ""),
        "houseNumber": data.get("houseNumber", ""),
        "wardNumber": data.get("wardNumber", ""),
        "area": data.get("area", ""),
        "landmark": data.get("landmark", ""),
        
        "currentStatus": "Submitted",
        "submittedDate": datetime.utcnow().isoformat() + "Z",
        "assignedOfficer": "Unassigned",
        "profileCompletion": 80,
        "documents": docs_payload,
        "remarks": []
    }
    
    APPLICATIONS.insert(0, new_app)
    add_notification(user["id"], "Application Submitted", f"Application {app_num} submitted successfully.", "Success")
    write_audit_log(user["id"], user["fullName"], "Submit Application", "Applications", new_app["id"], f"Created application {app_num}")
    
    return jsonify(new_app)

@app.route("/api/applications/<id>/status", methods=["PUT"])
def update_application_status(id):
    user = get_user_from_headers()
    if not user or user["role"] != "Admin":
        return jsonify({ "message": "Forbidden" }), 403
        
    data = request.json
    status = data.get("status", "")
    remarks = data.get("remarks", "")
    
    app = next((a for a in APPLICATIONS if a["id"] == id), None)
    if not app:
        return jsonify({ "message": "Application not found" }), 404
        
    app["currentStatus"] = status
    if remarks:
        remark_obj = {
            "id": f"rem_{int(time.time() * 1000)}",
            "applicationId": id,
            "officerName": user["fullName"],
            "remarks": remarks,
            "createdAt": datetime.utcnow().isoformat() + "Z"
        }
        app["remarks"].append(remark_obj)
        
    # Notify customer
    notif_type = "Success" if status in ["Approved", "Connection Completed"] else "Error" if status == "Rejected" else "Info"
    add_notification(app["customerId"], f"Application Status: {status}", f"Your application {app['applicationNumber']} was updated to: {status}. Remarks: {remarks}", notif_type)
    write_audit_log(user["id"], user["fullName"], "Status Change", "Applications", id, f"Changed status of {app['applicationNumber']} to {status}")
    
    return jsonify(app)

@app.route("/api/applications/<id>/assign", methods=["PUT"])
def assign_officer(id):
    user = get_user_from_headers()
    if not user or user["role"] != "Admin":
        return jsonify({ "message": "Forbidden" }), 403
        
    data = request.json
    officer_name = data.get("officerName", "")
    
    app = next((a for a in APPLICATIONS if a["id"] == id), None)
    if not app:
        return jsonify({ "message": "Application not found" }), 404
        
    app["assignedOfficer"] = officer_name
    write_audit_log(user["id"], user["fullName"], "Assign Officer", "Applications", id, f"Assigned officer {officer_name} to {app['applicationNumber']}")
    
    return jsonify(app)

# --- DOCUMENTS MODULE ---
@app.route("/api/applications/<app_id>/documents", methods=["POST"])
def upload_document(app_id):
    user = get_user_from_headers()
    if not user:
        return jsonify({ "message": "Unauthorized" }), 401
        
    data = request.json
    doc_type = data.get("documentType", "")
    file_name = data.get("fileName", "")
    file_size = data.get("fileSize", 0)
    file_base64 = data.get("fileBase64", "")
    
    app = next((a for a in APPLICATIONS if a["id"] == app_id), None)
    if not app:
        return jsonify({ "message": "Application not found" }), 404
        
    # Remove existing document of the same type if present
    app["documents"] = [d for d in app["documents"] if d["documentType"] != doc_type]
    
    new_doc = {
        "id": f"doc_{int(time.time() * 1000)}_{random.randint(10, 99)}",
        "documentType": doc_type,
        "fileName": file_name,
        "fileSize": file_size,
        "filePath": file_base64,
        "verificationStatus": "Pending",
        "uploadedAt": datetime.utcnow().isoformat() + "Z"
    }
    app["documents"].append(new_doc)
    
    # Recalculate profile completion
    req_docs = SETTINGS["requiredDocuments"]
    uploaded_req = len([d for d in app["documents"] if d["documentType"] in req_docs])
    app["profileCompletion"] = min(100, int((uploaded_req / len(req_docs)) * 100))
    
    write_audit_log(user["id"], user["fullName"], "Upload Document", "Documents", new_doc["id"], f"Uploaded {doc_type} for {app['applicationNumber']}")
    return jsonify(new_doc)

@app.route("/api/applications/<app_id>/documents/<doc_id>/verify", methods=["PUT"])
def verify_document(app_id, doc_id):
    user = get_user_from_headers()
    if not user or user["role"] != "Admin":
        return jsonify({ "message": "Forbidden" }), 403
        
    data = request.json
    status = data.get("status", "")
    reason = data.get("reason", "")
    
    app = next((a for a in APPLICATIONS if a["id"] == app_id), None)
    if not app:
        return jsonify({ "message": "Application not found" }), 404
        
    doc = next((d for d in app["documents"] if d["id"] == doc_id), None)
    if not doc:
        return jsonify({ "message": "Document not found" }), 404
        
    doc["verificationStatus"] = status
    if reason:
        doc["rejectionReason"] = reason
        
    if status == "Rejected":
        add_notification(app["customerId"], "Document Rejected", f"Your {doc['documentType']} for {app['applicationNumber']} was rejected. Reason: {reason}", "Warning")
    else:
        add_notification(app["customerId"], "Document Verified", f"Your {doc['documentType']} was successfully verified.", "Success")
        
    write_audit_log(user["id"], user["fullName"], "Verify Document", "Documents", doc_id, f"Verified {doc['documentType']} as {status}")
    return jsonify(app)

# --- NOTIFICATIONS MODULE ---
@app.route("/api/notifications", methods=["GET"])
def get_notifications():
    user = get_user_from_headers()
    if not user:
        return jsonify({ "message": "Unauthorized" }), 401
    user_notifs = [n for n in NOTIFICATIONS if n["userId"] == user["id"]]
    return jsonify(user_notifs)

@app.route("/api/notifications/<id>/read", methods=["PUT"])
def mark_notification_read(id):
    notif = next((n for n in NOTIFICATIONS if n["id"] == id), None)
    if notif:
        notif["isRead"] = True
    return jsonify({ "success": True })

# --- ADMIN USER MANAGEMENT ---
@app.route("/api/admin/customers", methods=["GET"])
def get_customers():
    custs = [u for u in USERS if u["role"] == "Customer"]
    # return without password keys
    resp = [{k: v for k, v in u.items() if k != "password"} for u in custs]
    return jsonify(resp)

@app.route("/api/admin/customers/<id>/toggle", methods=["PUT"])
def toggle_customer_status(id):
    user = next((u for u in USERS if u["id"] == int(id)), None)
    if not user:
        return jsonify({ "message": "User not found" }), 404
    user["isActive"] = not user["isActive"]
    
    admin = get_user_from_headers()
    write_audit_log(admin["id"] if admin else 1, admin["fullName"] if admin else "Admin", "Toggle Active Status", "Users", id, f"Toggled status of user {user['email']} to {user['isActive']}")
    return jsonify({ "message": f"User status set to {user['isActive']}." })

@app.route("/api/admin/customers/<id>/reset-password", methods=["POST"])
def reset_customer_password(id):
    user = next((u for u in USERS if u["id"] == int(id)), None)
    if not user:
        return jsonify({ "message": "User not found" }), 404
    admin = get_user_from_headers()
    write_audit_log(admin["id"] if admin else 1, admin["fullName"] if admin else "Admin", "Reset Password", "Users", id, f"Generated reset token for: {user['email']}")
    return jsonify({ "message": f"Password reset link/token generated successfully for {user['fullName']}." })

@app.route("/api/admin/audit-logs", methods=["GET"])
def get_audit_logs():
    return jsonify(AUDIT_LOGS)

@app.route("/api/admin/notifications", methods=["POST"])
def send_custom_notification():
    admin = get_user_from_headers()
    data = request.json
    user_id = int(data.get("userId", 0))
    title = data.get("title", "")
    message = data.get("message", "")
    type_val = data.get("type", "Info")
    
    add_notification(user_id, title, message, type_val)
    write_audit_log(admin["id"] if admin else 1, admin["fullName"] if admin else "Admin", "Send Notification", "Notifications", None, f"Sent custom notification to User ID {user_id}")
    return jsonify({ "message": "Notification sent successfully." })

# --- SETTINGS MODULE ---
@app.route("/api/settings", methods=["GET"])
def get_settings():
    return jsonify({
        "requiredDocuments": SETTINGS["requiredDocuments"],
        "allowRegistration": SETTINGS["allowRegistration"],
        "supportEmail": SETTINGS["supportEmail"],
        "supportPhone": SETTINGS["supportPhone"]
    })

@app.route("/api/settings", methods=["PUT"])
def update_settings():
    admin = get_user_from_headers()
    data = request.json
    SETTINGS["supportEmail"] = data.get("supportEmail", SETTINGS["supportEmail"])
    SETTINGS["supportPhone"] = data.get("supportPhone", SETTINGS["supportPhone"])
    
    write_audit_log(admin["id"] if admin else 1, admin["fullName"] if admin else "Admin", "Update Settings", "Settings", None, "System configurations modified")
    return jsonify(SETTINGS)

@app.route("/api/settings/connection-types", methods=["GET"])
def get_connection_types():
    return jsonify(CONNECTION_TYPES)

@app.route("/api/settings/connection-types", methods=["POST"])
def save_connection_type():
    admin = get_user_from_headers()
    data = request.json
    type_id = data.get("id")
    
    if type_id:
        existing = next((t for t in CONNECTION_TYPES if t["id"] == type_id), None)
        if existing:
            existing["name"] = data.get("name", existing["name"])
            existing["category"] = data.get("category", existing["category"])
    else:
        new_type = {
            "id": len(CONNECTION_TYPES) + 1,
            "name": data.get("name", ""),
            "category": data.get("category", "Other")
        }
        CONNECTION_TYPES.append(new_type)
        
    write_audit_log(admin["id"] if admin else 1, admin["fullName"] if admin else "Admin", "Save Connection Type", "ConnectionTypes", type_id or "New", f"Saved connection type: {data.get('name')}")
    return jsonify(CONNECTION_TYPES)

@app.route("/api/settings/connection-types/<id>", methods=["DELETE"])
def delete_connection_type(id):
    global CONNECTION_TYPES
    admin = get_user_from_headers()
    CONNECTION_TYPES = [t for t in CONNECTION_TYPES if t["id"] != int(id)]
    
    write_audit_log(admin["id"] if admin else 1, admin["fullName"] if admin else "Admin", "Delete Connection Type", "ConnectionTypes", id, f"Deleted connection type ID {id}")
    return jsonify(CONNECTION_TYPES)

# --- REPORTS MODULE ---
@app.route("/api/reports/export", methods=["GET"])
def export_report_rows():
    rows = []
    for a in APPLICATIONS:
        cust = next((u for u in USERS if u["id"] == a["customerId"]), None)
        rows.append({
            "applicationNumber": a["applicationNumber"],
            "customerName": a["fullName"],
            "email": a["customerEmail"],
            "mobile": a["customerMobile"],
            "connectionCategory": a["connectionTypeName"],
            "status": a["currentStatus"],
            "submittedDate": a["submittedDate"],
            "assignedOfficer": a["assignedOfficer"],
            "income": a["annualIncome"]
        })
    return jsonify(rows)

if __name__ == "__main__":
    print("---------------------------------------------------------")
    print("Tata UISL Mock Backend API hosting on http://localhost:5000")
    print("Keep this process running to process live API requests!")
    print("---------------------------------------------------------")
    app.run(host="0.0.0.0", port=5000, debug=True)
