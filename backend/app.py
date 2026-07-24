# Mock API Backend for Tata UISL Connection Portal
# Written in Python to enable running locally without a .NET SDK environment.
# Run 'pip install flask flask-cors' before executing this file.

import os
import sys
import random
import time
import csv
from datetime import datetime

def load_csv_mock_applications():
    csv_paths = [
        os.path.join(os.path.dirname(__file__), "..", "mock_data.csv"),
        os.path.join(os.path.dirname(__file__), "mock_data.csv"),
        "mock_data.csv"
    ]
    
    csv_file = None
    for p in csv_paths:
        if os.path.exists(p):
            csv_file = p
            break
            
    items = []
    if csv_file:
        try:
            with open(csv_file, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for idx, row in enumerate(reader):
                    app_num = row.get("Appl. No.", "").strip()
                    if not app_num:
                        continue
                    applicant = row.get("Applicant", "").strip() or f"Applicant {idx+1}"
                    service_type = row.get("Service Type", "").strip() or "New LT Connection"
                    status = row.get("Status", "").strip() or "InProgress"
                    stage = row.get("Stage", "").strip() or "Application Verification"
                    pending_at = row.get("Pending At", "").strip() or "Abhishek"
                    address = row.get("Address", "").strip() or "Jamshedpur"
                    phone = row.get("Phone No", "").strip() or "9876543210"
                    business_area = row.get("Business Area", "").strip() or "JAMSHEDPUR"
                    bp_no = row.get("BP/Consumer No.", "").strip()

                    items.append({
                        "id": f"app_csv_{idx+1}",
                        "applicationNumber": app_num,
                        "customerId": (idx % 5) + 2,
                        "customerName": applicant,
                        "fullName": applicant,
                        "customerEmail": f"applicant_{app_num}@tatauisl.com",
                        "customerMobile": phone,
                        "existingBpNo": bp_no if bp_no and bp_no != "-" else "",
                        "businessArea": business_area,
                        "division": "Electricity",
                        "addressLine1": address,
                        "city": business_area or "Jamshedpur",
                        "state": "Jharkhand",
                        "district": "East Singhbhum",
                        "pinCode": "831001",
                        "connectionTypeId": 1,
                        "connectionTypeName": service_type,
                        "connectionCategory": "Domestic" if "LT" in service_type or "Name" in service_type else "Commercial",
                        "applicationType": service_type,
                        "currentStatus": status,
                        "currentStage": stage,
                        "priority": "Medium",
                        "assignedOfficer": pending_at,
                        "submittedDate": "2026-06-26T10:00:00Z",
                        "profileCompletion": 85,
                        "documents": [
                            { "id": f"doc_csv_{idx}_1", "documentType": "Aadhaar Card", "fileName": f"aadhaar_{app_num}.pdf", "fileSize": 1024000, "filePath": "#", "verificationStatus": "Pending", "uploadedAt": "2026-06-26T10:00:00Z" },
                            { "id": f"doc_csv_{idx}_2", "documentType": "PAN Card", "fileName": f"pan_{app_num}.jpg", "fileSize": 450000, "filePath": "#", "verificationStatus": "Pending", "uploadedAt": "2026-06-26T10:00:00Z" },
                            { "id": f"doc_csv_{idx}_3", "documentType": "Electricity Bill", "fileName": f"bill_{app_num}.pdf", "fileSize": 540000, "filePath": "#", "verificationStatus": "Pending", "uploadedAt": "2026-06-26T10:00:00Z" }
                        ],
                        "remarks": []
                    })
        except Exception as err:
            print("Error loading mock_data.csv:", err)
    return items

CSV_APPLICATIONS = load_csv_mock_applications()

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
    { "id": 1, "fullName": "System Administrator", "email": "admin@tatauisl.com", "mobileNumber": "9999999999", "role": "Admin", "officerRole": "SuperAdmin", "employeeId": "EMP001", "isActive": True, "createdAt": "2026-01-01T10:00:00Z", "password": "Admin@123" },
    { "id": 2, "fullName": "Rajesh Kumar", "email": "rajesh.kumar@gmail.com", "mobileNumber": "9876543210", "role": "Customer", "officerRole": "Customer", "employeeId": "", "isActive": True, "createdAt": "2026-06-01T12:00:00Z", "password": "Customer@123" },
    { "id": 3, "fullName": "Priya Sharma", "email": "priya.sharma@yahoo.com", "mobileNumber": "8765432109", "role": "Customer", "officerRole": "Customer", "employeeId": "", "isActive": True, "createdAt": "2026-06-10T14:30:00Z", "password": "Customer@123" },
    { "id": 4, "fullName": "Officer 1 - Doc Verifier", "email": "officer1@tatauisl.com", "mobileNumber": "9988776651", "role": "Admin", "officerRole": "Officer1", "employeeId": "EMP002", "isActive": True, "createdAt": "2026-06-10T14:30:00Z", "password": "Admin@123" },
    { "id": 5, "fullName": "Officer 2 - Tech Surveyor", "email": "officer2@tatauisl.com", "mobileNumber": "9988776652", "role": "Admin", "officerRole": "Officer2", "employeeId": "EMP003", "isActive": True, "createdAt": "2026-06-10T14:30:00Z", "password": "Admin@123" },
    { "id": 6, "fullName": "Officer 3 - Approval Officer", "email": "officer3@tatauisl.com", "mobileNumber": "9988776653", "role": "Admin", "officerRole": "Officer3", "employeeId": "EMP004", "isActive": True, "createdAt": "2026-06-10T14:30:00Z", "password": "Admin@123" }
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
    },
    {
        "id": "app_005",
        "applicationNumber": "260626021792",
        "customerId": 4,
        "customerName": "Abhishek",
        "customerEmail": "abhishek.krgupta@yahoo.in",
        "customerMobile": "8271039154",
        "fullName": "Abhishek",
        "fatherName": "Late S. R. Gupta",
        "motherName": "K. Devi",
        "gender": "Male",
        "dateOfBirth": "1990-01-01",
        "aadhaarNumber": "123456789012",
        "panNumber": "ABCDE1234F",
        "occupation": "Business",
        "annualIncome": 600000.0,
        "addressLine1": "wsrsdf , sdf f, asdasdfsdsdfsfsf sdffdsf dsf fsdf, sdfsdf ssf f sf fs f dffds fdsdddsdsd, asddsf fs, sdf",
        "addressLine2": "345345",
        "city": "JAMSHEDPUR",
        "state": "Jharkhand",
        "district": "East Singhbhum",
        "pinCode": "831001",
        "connectionTypeId": 1,
        "connectionTypeName": "New Power Connection LT",
        "connectionCategory": "Commercial",
        "applicationType": "New Connection",
        "division": "Electricity",
        "businessArea": "JAMSHEDPUR",
        "currentStatus": "InProgress",
        "currentStage": "Load Survey Approval",
        "priority": "Medium",
        "lastUpdated": "2026-07-02T10:00:00Z",
        "submittedDate": "2026-06-26T10:00:00Z",
        "assignedOfficer": "Abhishek",
        "profileCompletion": 80,
        "documents": [],
        "remarks": [],
        "statusHistory": [
            { "status": "Submitted", "stage": "Application Verification", "updatedDate": "2026-06-26T10:00:00Z", "updatedByName": "Abhishek", "notes": "Form submitted." },
            { "status": "InProgress", "stage": "Load Survey Approval", "updatedDate": "2026-07-02T10:00:00Z", "updatedByName": "Officer 1 - Doc Verifier", "notes": "Load survey initialized." }
        ]
    }
]

# Merge 100 CSV mock entries
APPLICATIONS.extend(CSV_APPLICATIONS)

NOTIFICATIONS = [
    { "id": "not_001", "userId": 2, "title": "Application Submitted Successfully", "message": "Your application TATA-UISL-2026-98124 has been submitted. Tracking has been initialized.", "type": "Success", "isRead": True, "createdAt": "2026-06-15T09:25:00Z" },
    { "id": "not_002", "userId": 2, "title": "Connection Setup Scheduled", "message": "An installation officer is scheduled to visit your property on 2026-06-19.", "type": "Info", "isRead": True, "createdAt": "2026-06-18T10:00:00Z" },
    { "id": "not_003", "userId": 2, "title": "Power Connection Activated", "message": "Congratulations! Your connection under application number TATA-UISL-2026-98124 is now active.", "type": "Success", "isRead": False, "createdAt": "2026-06-20T16:05:00Z" },
    { "id": "not_004", "userId": 3, "title": "Document Re-upload Required", "message": "Officer Neha Sen has requested a re-upload of your PAN Card because the image is blurry.", "type": "Warning", "isRead": False, "createdAt": "2026-06-23T10:05:00Z" },
    
    # Seed notifications for Admin & Officers
    { "id": "not_005", "userId": 1, "title": "New Application Pending", "message": "Application TATA-UISL-2026-98150 by Priya Sharma is pending Document Verification stage.", "type": "Info", "isRead": False, "createdAt": "2026-06-22T11:55:00Z" },
    { "id": "not_006", "userId": 1, "title": "Database Backup Completed", "message": "The automated database backup finished successfully with zero errors.", "type": "Success", "isRead": True, "createdAt": "2026-07-01T02:00:00Z" },
    { "id": "not_007", "userId": 1, "title": "SLA Breach Warning", "message": "Application TATA-UISL-2026-87123 is exceeding the SLA duration limit in Technical Assessment.", "type": "Warning", "isRead": False, "createdAt": "2026-07-02T08:00:00Z" },
    { "id": "not_008", "userId": 4, "title": "Pending Document Audit", "message": "You have 3 new customer applications assigned to your desk for verification checks.", "type": "Info", "isRead": False, "createdAt": "2026-07-02T09:00:00Z" },
    { "id": "not_009", "userId": 5, "title": "Field Load Survey Requested", "message": "A residential building connection request in Bistupur is ready for physical coordinates survey.", "type": "Info", "isRead": False, "createdAt": "2026-07-02T09:30:00Z" },
    { "id": "not_010", "userId": 6, "title": "Awaiting Estimate Approval", "message": "An industrial cost estimate of 5,40,000 INR requires your final verification and release authorization.", "type": "Warning", "isRead": False, "createdAt": "2026-07-02T10:00:00Z" }
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

USER_SESSIONS = []

def write_audit_log(user_id, user_name, action, table_name, record_id=None, details="", status="Success", before_json=None, after_json=None, module=None):
    # Try parsing user details from global state
    user = next((u for u in USERS if u["id"] == user_id), None) if user_id else None
    employee_id = user.get("employeeId", "") if user else ""
    role = user.get("role", "Customer") if user else "Customer"
    
    # Request-context details
    ip = "127.0.0.1"
    browser = "Unknown Browser"
    os_name = "Unknown OS"
    device = "Desktop"
    ticket_id = None
    ticket_num = None
    approved_by = None
    
    try:
        from flask import request
        if request:
            ip = request.remote_addr or "127.0.0.1"
            ua = request.headers.get("User-Agent", "")
            
            # OS parsing
            if "Windows" in ua: os_name = "Windows"
            elif "Macintosh" in ua or "Mac OS" in ua: os_name = "macOS"
            elif "Android" in ua: os_name = "Android"
            elif "iPhone" in ua or "iPad" in ua: os_name = "iOS"
            elif "Linux" in ua: os_name = "Linux"
            
            # Browser parsing
            if "Firefox" in ua: browser = "Firefox"
            elif "Chrome" in ua: browser = "Chrome"
            elif "Safari" in ua and "Chrome" not in ua: browser = "Safari"
            elif "Edge" in ua: browser = "Edge"
            
            # Device parsing
            device = "Mobile" if "Mobile" in ua else "Desktop"
            
            # Support tickets custom headers
            ticket_id = request.headers.get("X-Ticket-ID")
            ticket_num = request.headers.get("X-Ticket-Number")
            approved_by = request.headers.get("X-Approved-By")
    except Exception:
        pass

    log = {
        "id": f"log_{int(time.time() * 1000)}",
        "userId": user_id,
        "employeeId": employee_id,
        "userName": user_name,
        "role": role,
        "module": module or table_name,
        "action": action,
        "tableName": table_name,
        "recordId": str(record_id) if record_id else None,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "ipAddress": ip,
        "browser": browser,
        "operatingSystem": os_name,
        "device": device,
        "status": status,
        "ticketId": ticket_id,
        "ticketNumber": ticket_num,
        "approvedBy": approved_by,
        "beforeJson": before_json,
        "afterJson": after_json,
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
    
    # Session Details
    import uuid
    session_id = str(uuid.uuid4())
    
    ip = request.remote_addr or "127.0.0.1"
    ua = request.headers.get("User-Agent", "")
    
    # OS parsing
    os_name = "Unknown OS"
    if "Windows" in ua: os_name = "Windows"
    elif "Macintosh" in ua or "Mac OS" in ua: os_name = "macOS"
    elif "Android" in ua: os_name = "Android"
    elif "iPhone" in ua or "iPad" in ua: os_name = "iOS"
    elif "Linux" in ua: os_name = "Linux"
    
    # Browser parsing
    browser = "Unknown Browser"
    if "Firefox" in ua: browser = "Firefox"
    elif "Chrome" in ua: browser = "Chrome"
    elif "Safari" in ua and "Chrome" not in ua: browser = "Safari"
    elif "Edge" in ua: browser = "Edge"
    
    # Device parsing
    device = "Mobile" if "Mobile" in ua else "Desktop"
    
    session = {
        "id": session_id,
        "userId": user["id"],
        "employeeId": user.get("employeeId", ""),
        "role": user["role"],
        "loginTimestamp": datetime.utcnow().isoformat() + "Z",
        "logoutTimestamp": None,
        "browserClosureTimestamp": None,
        "isTimeout": False,
        "ipAddress": ip,
        "browser": browser,
        "operatingSystem": os_name,
        "device": device,
        "sessionDuration": None
    }
    
    USER_SESSIONS.append(session)
    write_audit_log(user["id"], user["fullName"], "Login", "Users", user["id"], "Successful login")
    
    # Return user details without password
    user_resp = {k: v for k, v in user.items() if k != "password"}
    return jsonify({ "token": token, "user": user_resp, "sessionId": session_id })

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

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    data = request.json or {}
    session_id = data.get("sessionId")
    if session_id:
        session = next((s for s in USER_SESSIONS if s["id"] == session_id), None)
        if session:
            session["logoutTimestamp"] = datetime.utcnow().isoformat() + "Z"
            t1 = datetime.fromisoformat(session["loginTimestamp"].replace("Z", ""))
            t2 = datetime.utcnow()
            session["sessionDuration"] = int((t2 - t1).total_seconds())
            
            user = next((u for u in USERS if u["id"] == session["userId"]), None)
            write_audit_log(session["userId"], user["fullName"] if user else "User", "Logout", "UserSessions", session["id"], f"User logged out. Session duration: {session['sessionDuration']}s.")
    return jsonify({ "message": "Logged out successfully" })

@app.route("/api/auth/session-close", methods=["POST"])
def session_close():
    data = request.json or {}
    session_id = data.get("sessionId")
    if session_id:
        session = next((s for s in USER_SESSIONS if s["id"] == session_id), None)
        if session and not session["logoutTimestamp"] and not session["browserClosureTimestamp"]:
            session["browserClosureTimestamp"] = datetime.utcnow().isoformat() + "Z"
            t1 = datetime.fromisoformat(session["loginTimestamp"].replace("Z", ""))
            t2 = datetime.utcnow()
            session["sessionDuration"] = int((t2 - t1).total_seconds())
            
            user = next((u for u in USERS if u["id"] == session["userId"]), None)
            write_audit_log(session["userId"], user["fullName"] if user else "User", "Browser Closure", "UserSessions", session["id"], f"Browser closed. Session duration: {session['sessionDuration']}s.")
    return jsonify({ "message": "Session closed successfully" })

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
        
    is_draft = data.get("currentStatus") == "Draft"
    current_status = "Draft" if is_draft else "Pending Officer 1"
    assigned_officer = "Unassigned" if is_draft else "Officer 1 - Doc Verifier"

    new_app = {
        "id": f"app_{int(time.time() * 1000)}",
        "applicationNumber": app_num,
        "customerId": user["id"],
        "customerName": user["fullName"],
        "customerEmail": user["email"],
        "customerMobile": user["mobileNumber"],
        
        "fullName": data.get("fullName"),
        "fatherName": data.get("relationshipName", "") if data.get("relationshipType") == "Father" else data.get("fatherName", ""),
        "motherName": data.get("motherName", ""),
        "gender": data.get("gender", "Male"),
        "dateOfBirth": data.get("dateOfBirth", ""),
        "aadhaarNumber": data.get("identityCardNumber", "") if data.get("identityCardType") == "Aadhaar Card" else data.get("aadhaarNumber", ""),
        "panNumber": data.get("identityCardNumber", "") if data.get("identityCardType") == "PAN Card" else data.get("panNumber", ""),
        "occupation": data.get("occupation", ""),
        "annualIncome": float(data.get("annualIncome", 0)) if data.get("annualIncome") else None,
        
        "createNewBp": data.get("createNewBp", True),
        "existingBpNo": data.get("existingBpNo"),
        "businessArea": data.get("businessArea"),
        "ownerOrgName": data.get("ownerOrgName"),
        "relationshipType": data.get("relationshipType"),
        "relationshipName": data.get("relationshipName"),
        "identityCardType": data.get("identityCardType"),
        "identityCardNumber": data.get("identityCardNumber"),
        "phoneNumber": data.get("phoneNumber"),
        "alternatePhoneNumber": data.get("alternatePhoneNumber"),
        "emailId": data.get("emailId"),
        "alternateEmailId": data.get("alternateEmailId"),
        "vendorName": data.get("vendorName"),
        "vendorCertificateNumber": data.get("vendorCertificateNumber"),
        
        "addressLine1": data.get("addressLine1"),
        "addressLine2": data.get("addressLine2"),
        "city": data.get("city", "Jamshedpur"),
        "state": data.get("state", "Jharkhand"),
        "district": data.get("district", "East Singhbhum"),
        "pinCode": data.get("pinCode"),
        
        "connectionTypeId": conn_type_id,
        "connectionTypeName": conn_type["name"],
        "connectionCategory": conn_type["category"],
        "applicationType": data.get("applicationType", "New Connection"),
        
        "propertyType": data.get("propertyType"),
        "houseNumber": data.get("houseNumber"),
        "wardNumber": data.get("wardNumber"),
        "area": data.get("area"),
        "landmark": data.get("landmark"),
        
        "voltageRequirement": data.get("voltageRequirement"),
        "loadRequirement": data.get("loadRequirement"),
        "purposeOfConnection": data.get("purposeOfConnection"),
        "ownershipType": data.get("ownershipType"),
        "plotNumber": data.get("plotNumber"),
        "surveyNumber": data.get("surveyNumber"),
        
        "currentStatus": current_status,
        "currentStage": "Application Verification",
        "priority": data.get("priority", "Medium"),
        "dueDate": (datetime.utcnow().isoformat() + "Z") if not is_draft else None,
        "lastUpdated": datetime.utcnow().isoformat() + "Z",
        "submittedDate": datetime.utcnow().isoformat() + "Z",
        "assignedOfficer": assigned_officer,
        "profileCompletion": 25 if is_draft else 50,
        "documents": docs_payload,
        "remarks": [],
        "statusHistory": [
            {
                "status": current_status,
                "stage": "Application Verification",
                "updatedDate": datetime.utcnow().isoformat() + "Z",
                "updatedByName": user["fullName"],
                "notes": "Application initiated."
            }
        ]
    }
    
    APPLICATIONS.insert(0, new_app)
    add_notification(user["id"], "Application Registered", f"Application {app_num} draft created." if is_draft else f"Application {app_num} submitted successfully.", "Success")
    write_audit_log(user["id"], user["fullName"], "Submit Application", "Applications", new_app["id"], f"Created application {app_num}")
    
    return jsonify(new_app)

@app.route("/api/applications/<id>", methods=["DELETE"])
def delete_application_draft(id):
    user = get_user_from_headers()
    if not user:
        return jsonify({ "message": "Unauthorized" }), 401
        
    global APPLICATIONS
    app = next((a for a in APPLICATIONS if a["id"] == id), None)
    if not app:
        return jsonify({ "message": "Application not found" }), 404
        
    if app["customerId"] != user["id"] and user["role"] != "Admin":
        return jsonify({ "message": "Forbidden" }), 403
        
    if app["currentStatus"] != "Draft":
        return jsonify({ "message": "Only draft connection requests can be deleted." }), 400
        
    APPLICATIONS = [a for a in APPLICATIONS if a["id"] != id]
    write_audit_log(user["id"], user["fullName"], "Delete Draft", "Applications", id, f"Deleted draft connection request: {app['applicationNumber']}")
    return jsonify({ "message": "Draft deleted successfully." })

@app.route("/api/applications/<id>", methods=["PUT"])
def update_application_details(id):
    user = get_user_from_headers()
    if not user:
        return jsonify({ "message": "Unauthorized" }), 401
        
    data = request.json
    app = next((a for a in APPLICATIONS if a["id"] == id), None)
    if not app:
        return jsonify({ "message": "Application not found" }), 404
        
    # Map fields
    for field in ["fullName", "fatherName", "motherName", "gender", "dateOfBirth", "aadhaarNumber", "panNumber", "occupation",
                  "createNewBp", "existingBpNo", "businessArea", "ownerOrgName", "relationshipType", "relationshipName",
                  "identityCardType", "identityCardNumber", "phoneNumber", "alternatePhoneNumber", "emailId", "alternateEmailId",
                  "vendorName", "vendorCertificateNumber", "addressLine1", "addressLine2", "city", "state", "district", "pinCode",
                  "connectionTypeId", "propertyType", "houseNumber", "wardNumber", "area", "landmark", "priority",
                  "voltageRequirement", "loadRequirement", "purposeOfConnection", "ownershipType", "plotNumber", "surveyNumber"]:
        if field in data:
            app[field] = data[field]
            
    if "connectionTypeId" in data and data["connectionTypeId"]:
        conn_type = next((t for t in CONNECTION_TYPES if t["id"] == int(data["connectionTypeId"])), CONNECTION_TYPES[0])
        app["connectionTypeName"] = conn_type["name"]
        app["connectionCategory"] = conn_type["category"]
        
    app["lastUpdated"] = datetime.utcnow().isoformat() + "Z"
    
    if data.get("currentStatus") == "Submitted":
        if app.get("currentStatus") == "Correction Required" and app.get("assignedOfficer") and app.get("assignedOfficer") != "Unassigned":
            if "Officer 1" in app["assignedOfficer"]:
                app["currentStatus"] = "Pending Officer 1"
            elif "Officer 2" in app["assignedOfficer"]:
                app["currentStatus"] = "Pending Officer 2"
            elif "Officer 3" in app["assignedOfficer"]:
                app["currentStatus"] = "Pending Officer 3"
            else:
                app["currentStatus"] = "Pending Officer 1"
        else:
            app["currentStatus"] = "Pending Officer 1"
            app["currentStage"] = "Application Verification"
            app["assignedOfficer"] = "Officer 1 - Doc Verifier"
            app["dueDate"] = (datetime.utcnow().isoformat() + "Z") # standard SLA
            
        # Add to status history
        app.setdefault("statusHistory", []).append({
            "status": app["currentStatus"],
            "stage": app["currentStage"],
            "updatedDate": datetime.utcnow().isoformat() + "Z",
            "updatedByName": user["fullName"],
            "notes": "Application submitted by customer after correction/draft edit."
        })
        add_notification(app["customerId"], "Application Submitted", f"Your application {app['applicationNumber']} has been submitted.", "Success")
    else:
        app["currentStatus"] = "Draft"
        
    write_audit_log(user["id"], user["fullName"], "Update Application", "Applications", id, f"Updated application {app['applicationNumber']}")
    return jsonify(app)

@app.route("/api/applications/<id>/update-stage", methods=["PUT"])
def update_application_stage(id):
    user = get_user_from_headers()
    if not user or user["role"] != "Admin":
        return jsonify({ "message": "Forbidden" }), 403
        
    data = request.json
    action = data.get("action", "") # Approve, Reject, Correction
    remarks = data.get("remarks", "")
    
    app = next((a for a in APPLICATIONS if a["id"] == id), None)
    if not app:
        return jsonify({ "message": "Application not found" }), 404
        
    if action == "Reject":
        app["currentStatus"] = "Rejected"
        app["currentStage"] = "Completed"
        app["assignedOfficer"] = "Unassigned"
    elif action == "Correction":
        app["currentStatus"] = "Correction Required"
    else: # Approve
        stage = app.get("currentStage", "Application Verification")
        if stage == "Application Verification":
            app["currentStage"] = "Document Verification"
            app["currentStatus"] = "Pending Officer 1"
        elif stage == "Document Verification":
            app["currentStage"] = "Load Survey"
            app["currentStatus"] = "Pending Officer 2"
            app["assignedOfficer"] = "Officer 2 - Tech Surveyor"
        elif stage == "Load Survey":
            app["currentStage"] = "Land Survey"
            app["currentStatus"] = "Pending Officer 2"
        elif stage == "Land Survey":
            app["currentStage"] = "Bill Verification"
            app["currentStatus"] = "Pending Officer 2"
        elif stage == "Bill Verification":
            app["currentStage"] = "Estimate Details"
            app["currentStatus"] = "Pending Officer 2"
        elif stage == "Estimate Details":
            app["currentStage"] = "Estimate Approval"
            app["currentStatus"] = "Pending Officer 2"
        elif stage == "Estimate Approval":
            app["currentStage"] = "Demand Note"
            app["currentStatus"] = "Pending Officer 3"
            app["assignedOfficer"] = "Officer 3 - Approval Officer"
        elif stage == "Demand Note":
            app["currentStage"] = "Connection Approval"
            app["currentStatus"] = "Pending Officer 3"
        elif stage == "Connection Approval":
            app["currentStage"] = "Job Allotment"
            app["currentStatus"] = "Pending Officer 3"
        elif stage == "Job Allotment":
            app["currentStage"] = "RFC Entry"
            app["currentStatus"] = "Pending Officer 3"
        elif stage == "RFC Entry":
            app["currentStage"] = "Energization"
            app["currentStatus"] = "Pending Officer 3"
        elif stage == "Energization":
            app["currentStage"] = "Move-In"
            app["currentStatus"] = "Pending Officer 3"
        elif stage == "Move-In":
            app["currentStage"] = "Completed"
            app["currentStatus"] = "Completed"
            app["assignedOfficer"] = "Unassigned"
            
    app["lastUpdated"] = datetime.utcnow().isoformat() + "Z"
    if app["currentStatus"].startswith("Pending"):
        app["dueDate"] = (datetime.utcnow().isoformat() + "Z")
    else:
        app["dueDate"] = None
        
    if remarks:
        app.setdefault("remarks", []).append({
            "id": f"rem_{int(time.time() * 1000)}",
            "applicationId": id,
            "officerName": user["fullName"],
            "remarks": remarks,
            "createdAt": datetime.utcnow().isoformat() + "Z"
        })
        
    app.setdefault("statusHistory", []).append({
        "status": app["currentStatus"],
        "stage": app.get("currentStage", "Application Verification"),
        "updatedDate": datetime.utcnow().isoformat() + "Z",
        "updatedByName": user["fullName"],
        "notes": remarks or f"Stage transitioned to {app.get('currentStage')}"
    })
    
    add_notification(app["customerId"], f"Stage Update: {app.get('currentStage')}", f"Your application {app['applicationNumber']} has transitioned to {app.get('currentStage')}.", "Info")
    write_audit_log(user["id"], user["fullName"], f"Workflow - {action}", "Applications", id, f"Transitioned application {app['applicationNumber']} to stage {app.get('currentStage')}")
    
    return jsonify(app)

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

# Audit logs route moved to end of file

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

# --- WORKFLOW CONFIGURATION DATA ---
WORKFLOW_ROUTES = [
    { "id": 1, "name": "Low Tension Route R1", "levelGroup": "LT G1" },
    { "id": 2, "name": "Low Tension Route R2", "levelGroup": "LT G2" },
    { "id": 3, "name": "High Tension Route", "levelGroup": "HT" },
    { "id": 4, "name": "Commercial Workflow", "levelGroup": "Commercial" },
    { "id": 5, "name": "Industrial Workflow", "levelGroup": "Industrial" }
]

WORKFLOW_STAGES = [
    # Route 1: Low Tension Route R1
    { "id": 101, "routeId": 1, "stageName": "Load Survey Details", "sequenceOrder": 1, "workflowLevel": "Level 1", "department": "Technical", "requiredAction": "Verify connected load and premises layout" },
    { "id": 102, "routeId": 1, "stageName": "Land Survey Details", "sequenceOrder": 2, "workflowLevel": "Level 1", "department": "Technical", "requiredAction": "Confirm boundary coordinates and clearance" },
    { "id": 103, "routeId": 1, "stageName": "Load Survey Approval", "sequenceOrder": 3, "workflowLevel": "Level 2", "department": "Technical", "requiredAction": "Approve surveyed capacity limit" },
    { "id": 104, "routeId": 1, "stageName": "Estimate Details", "sequenceOrder": 4, "workflowLevel": "Level 1", "department": "Engineering", "requiredAction": "Draft material cost estimates" },
    { "id": 105, "routeId": 1, "stageName": "Estimate Approval", "sequenceOrder": 5, "workflowLevel": "Level 2", "department": "Engineering", "requiredAction": "Verify and authorize estimated budget" },
    { "id": 106, "routeId": 1, "stageName": "Bill Verification Level 1", "sequenceOrder": 6, "workflowLevel": "Level 1", "department": "Accounts", "requiredAction": "Verify payment voucher clearance" },
    { "id": 107, "routeId": 1, "stageName": "Bill Verification Level 2", "sequenceOrder": 7, "workflowLevel": "Level 2", "department": "Accounts", "requiredAction": "Audit transaction details" },
    { "id": 108, "routeId": 1, "stageName": "Demand Note", "sequenceOrder": 8, "workflowLevel": "Level 1", "department": "Accounts", "requiredAction": "Issue official payment demand note" },
    { "id": 109, "routeId": 1, "stageName": "Job Allotment", "sequenceOrder": 9, "workflowLevel": "Level 1", "department": "Operations", "requiredAction": "Allot installation task to field team" },
    { "id": 110, "routeId": 1, "stageName": "RFC Entry", "sequenceOrder": 10, "workflowLevel": "Level 1", "department": "Operations", "requiredAction": "Log Ready For Commissioning state details" },
    { "id": 111, "routeId": 1, "stageName": "Energization", "sequenceOrder": 11, "workflowLevel": "Level 1", "department": "Operations", "requiredAction": "Commission connection and mount smart meter" },
    { "id": 112, "routeId": 1, "stageName": "Move-In", "sequenceOrder": 12, "workflowLevel": "Level 1", "department": "Customer Service", "requiredAction": "Activate consumer profile contract" },

    # Route 2: Low Tension Route R2
    { "id": 201, "routeId": 2, "stageName": "Load Survey Details", "sequenceOrder": 1, "workflowLevel": "Level 1", "department": "Technical", "requiredAction": "Verify connected load layout" },
    { "id": 202, "routeId": 2, "stageName": "Estimate Details", "sequenceOrder": 2, "workflowLevel": "Level 1", "department": "Engineering", "requiredAction": "Draft material cost estimates" },
    { "id": 203, "routeId": 2, "stageName": "Estimate Approval", "sequenceOrder": 3, "workflowLevel": "Level 2", "department": "Engineering", "requiredAction": "Verify estimated budget" },
    { "id": 204, "routeId": 2, "stageName": "Demand Note", "sequenceOrder": 4, "workflowLevel": "Level 1", "department": "Accounts", "requiredAction": "Issue payment demand note" },
    { "id": 205, "routeId": 2, "stageName": "Energization", "sequenceOrder": 5, "workflowLevel": "Level 1", "department": "Operations", "requiredAction": "Energize and mount meter" },

    # Route 3: HT
    { "id": 301, "routeId": 3, "stageName": "Load Survey Details", "sequenceOrder": 1, "workflowLevel": "Level 1", "department": "Technical", "requiredAction": "Verify connected load layout" },
    { "id": 302, "routeId": 3, "stageName": "Estimate Details", "sequenceOrder": 2, "workflowLevel": "Level 1", "department": "Engineering", "requiredAction": "Draft material cost estimates" },
    { "id": 303, "routeId": 3, "stageName": "Estimate Approval", "sequenceOrder": 3, "workflowLevel": "Level 2", "department": "Engineering", "requiredAction": "Verify estimated budget" },
    { "id": 304, "routeId": 3, "stageName": "Demand Note", "sequenceOrder": 4, "workflowLevel": "Level 1", "department": "Accounts", "requiredAction": "Issue payment demand note" },
    { "id": 305, "routeId": 3, "stageName": "Energization", "sequenceOrder": 5, "workflowLevel": "Level 1", "department": "Operations", "requiredAction": "Energize and mount meter" },

    # Route 4: Commercial
    { "id": 401, "routeId": 4, "stageName": "Load Survey Details", "sequenceOrder": 1, "workflowLevel": "Level 1", "department": "Technical", "requiredAction": "Verify connected load layout" },
    { "id": 402, "routeId": 4, "stageName": "Estimate Details", "sequenceOrder": 2, "workflowLevel": "Level 1", "department": "Engineering", "requiredAction": "Draft material cost estimates" },
    { "id": 403, "routeId": 4, "stageName": "Estimate Approval", "sequenceOrder": 3, "workflowLevel": "Level 2", "department": "Engineering", "requiredAction": "Verify estimated budget" },
    { "id": 404, "routeId": 4, "stageName": "Demand Note", "sequenceOrder": 4, "workflowLevel": "Level 1", "department": "Accounts", "requiredAction": "Issue payment demand note" },
    { "id": 405, "routeId": 4, "stageName": "Energization", "sequenceOrder": 5, "workflowLevel": "Level 1", "department": "Operations", "requiredAction": "Energize and mount meter" },

    # Route 5: Industrial
    { "id": 501, "routeId": 5, "stageName": "Load Survey Details", "sequenceOrder": 1, "workflowLevel": "Level 1", "department": "Technical", "requiredAction": "Verify connected load layout" },
    { "id": 502, "routeId": 5, "stageName": "Estimate Details", "sequenceOrder": 2, "workflowLevel": "Level 1", "department": "Engineering", "requiredAction": "Draft material cost estimates" },
    { "id": 503, "routeId": 5, "stageName": "Estimate Approval", "sequenceOrder": 3, "workflowLevel": "Level 2", "department": "Engineering", "requiredAction": "Verify estimated budget" },
    { "id": 504, "routeId": 5, "stageName": "Demand Note", "sequenceOrder": 4, "workflowLevel": "Level 1", "department": "Accounts", "requiredAction": "Issue payment demand note" },
    { "id": 505, "routeId": 5, "stageName": "Energization", "sequenceOrder": 5, "workflowLevel": "Level 1", "department": "Operations", "requiredAction": "Energize and mount meter" }
]

OFFICER_ASSIGNMENTS = {}
APPLICATION_WORKFLOWS = {}

@app.route("/api/workflow/routes", methods=["GET"])
def get_workflow_routes():
    routes = []
    for r in WORKFLOW_ROUTES:
        stages = [s for s in WORKFLOW_STAGES if s["routeId"] == r["id"]]
        routes.append({
            "id": r["id"],
            "name": r["name"],
            "levelGroup": r["levelGroup"],
            "stages": stages
        })
    return jsonify(routes)

@app.route("/api/workflow/stages", methods=["GET"])
def get_workflow_stages():
    route_id = int(request.args.get("routeId", 1))
    stages = [s for s in WORKFLOW_STAGES if s["routeId"] == route_id]
    return jsonify(stages)

@app.route("/api/workflow/officers", methods=["GET"])
def get_workflow_officers():
    officer_users = [u for u in USERS if u.get("role") == "Admin" and u.get("officerRole") not in ["Customer", "SuperAdmin", None]]
    
    officers = []
    for o in officer_users:
        workload = len([a for a in APPLICATIONS if a.get("assignedOfficer") == o["fullName"] and a.get("currentStatus") not in ["Completed", "Rejected"]])
        
        dept = "Technical Verification"
        if o.get("officerRole") == "Officer2":
            dept = "Technical Survey"
        elif o.get("officerRole") == "Officer3":
            dept = "Approvals Department"
            
        officers.append({
            "id": o["id"],
            "name": o["fullName"],
            "employeeId": "EMP00" + str(o["id"]),
            "department": dept,
            "workload": workload,
            "availabilityStatus": "Available" if o.get("isActive", True) else "Unavailable"
        })
    return jsonify(officers)

@app.route("/api/workflow/assign", methods=["POST"])
def assign_workflow():
    data = request.json
    app_id = data.get("applicationId")
    route_id = int(data.get("routeId", 1))
    level_group = data.get("levelGroup", "")
    assignments = data.get("assignments", [])
    
    APPLICATION_WORKFLOWS[app_id] = {
        "routeId": route_id,
        "levelGroup": level_group,
        "status": "Pending"
    }
    
    OFFICER_ASSIGNMENTS[app_id] = assignments
    return jsonify({ "message": "Workflow assignments saved successfully." })

@app.route("/api/workflow/forward", methods=["POST"])
def forward_workflow():
    data = request.json
    app_id = data.get("applicationId")
    route_id = int(data.get("routeId", 1))
    level_group = data.get("levelGroup", "")
    assignments = data.get("assignments", [])
    
    # 1. Save assignments
    APPLICATION_WORKFLOWS[app_id] = {
        "routeId": route_id,
        "levelGroup": level_group,
        "status": "Pending"
    }
    OFFICER_ASSIGNMENTS[app_id] = assignments
    
    # 2. Update Application details
    app = next((a for a in APPLICATIONS if a["id"] == app_id), None)
    if not app:
        return jsonify({ "message": "Application not found" }), 404
        
    stages = [s for s in WORKFLOW_STAGES if s["routeId"] == route_id]
    if not stages:
        return jsonify({ "message": "No stages found for route" }), 400
        
    original_stage = app.get("currentStage", "Application Verification")
    
    # Find next stage name
    next_stage_name = ""
    next_stage_idx = 0
    
    if original_stage in ["Application Verification", "Draft"]:
        next_stage_name = stages[0]["stageName"]
    else:
        curr_obj = next((s for s in stages if s["stageName"].lower() == original_stage.lower()), None)
        if not curr_obj:
            next_stage_name = stages[0]["stageName"]
        else:
            curr_idx = stages.index(curr_obj)
            next_stage_idx = curr_idx + 1
            if next_stage_idx < len(stages):
                next_stage_name = stages[next_stage_idx]["stageName"]
            else:
                next_stage_name = "Completed"
                
    app["currentStage"] = next_stage_name
    app["lastUpdated"] = datetime.utcnow().isoformat() + "Z"
    
    target_officer = None
    if next_stage_name != "Completed":
        next_stage_obj = stages[next_stage_idx]
        assignment = next((a for a in assignments if a["stageName"].lower() == next_stage_name.lower()), None)
        if assignment:
            target_officer = next((u for u in USERS if u["id"] == int(assignment["officerId"])), None)
            
        if target_officer:
            app["assignedOfficer"] = target_officer["fullName"]
            role_lbl = "Officer 1" if target_officer.get("officerRole") == "Officer1" else "Officer 2" if target_officer.get("officerRole") == "Officer2" else "Officer 3" if target_officer.get("officerRole") == "Officer3" else "Officer"
            app["currentStatus"] = "Pending " + role_lbl
        else:
            app["assignedOfficer"] = "Unassigned"
            app["currentStatus"] = "Under Verification"
    else:
        app["assignedOfficer"] = "Unassigned"
        app["currentStatus"] = "Completed"
        
    # Append Status History log
    actor = get_user_from_headers()
    app["statusHistory"].append({
        "id": f"status_{int(time.time())}",
        "status": app["currentStatus"],
        "stage": next_stage_name,
        "remarks": f"Workflow forwarded successfully. Next target: {app['currentStage']}",
        "updatedAt": datetime.utcnow().isoformat() + "Z",
        "updatedByName": actor["fullName"] if actor else "System Officer"
    })
    
    write_audit_log(actor["id"] if actor else 1, actor["fullName"] if actor else "System Officer", "Forward Stage", "Applications", app["id"], f"Forwarded application to stage {next_stage_name}")
    
    # Create notification for target officer
    if target_officer:
        add_notification(target_officer["id"], "New Task Assigned: " + app["applicationNumber"], f"Application {app['applicationNumber']} has been forwarded to you for stage '{next_stage_name}'", "Task")
        
    return jsonify({
        "message": "Application forwarded successfully.",
        "currentStage": app["currentStage"],
        "assignedOfficer": app["assignedOfficer"],
        "currentStatus": app["currentStatus"]
    })

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

@app.route("/api/admin/audit-logs", methods=["GET"])
def get_audit_logs():
    user = get_user_from_headers()
    if not user or user["role"] != "Admin":
        return jsonify({ "message": "Forbidden" }), 403
        
    start_date = request.args.get("startDate")
    end_date = request.args.get("endDate")
    user_filter = request.args.get("user")
    module_filter = request.args.get("module")
    action_type = request.args.get("actionType")
    ticket_num = request.args.get("ticketNumber")
    ip_addr = request.args.get("ipAddress")
    app_num = request.args.get("applicationNumber")
    
    logs = list(AUDIT_LOGS)
    
    if start_date:
        logs = [l for l in logs if l["timestamp"] >= start_date]
    if end_date:
        logs = [l for l in logs if l["timestamp"] <= end_date]
    if user_filter:
        user_filter = user_filter.lower()
        logs = [l for l in logs if user_filter in l["userName"].lower() or (l.get("userId") and str(l["userId"]) == user_filter) or (l.get("employeeId") and user_filter in l["employeeId"].lower())]
    if module_filter:
        logs = [l for l in logs if l.get("module") == module_filter or l["tableName"] == module_filter]
    if action_type:
        logs = [l for l in logs if l["action"] == action_type]
    if ticket_num:
        logs = [l for l in logs if (l.get("ticketNumber") and ticket_num in l["ticketNumber"]) or (l.get("ticketId") and ticket_num == l["ticketId"])]
    if ip_addr:
        logs = [l for l in logs if ip_addr in l["ipAddress"]]
    if app_num:
        logs = [l for l in logs if l.get("recordId") == app_num or (l.get("details") and app_num in l["details"])]
        
    return jsonify(logs)

@app.route("/api/admin/daily-stats", methods=["GET"])
def get_daily_stats():
    total_created = len(APPLICATIONS)
    total_drafts = len([a for a in APPLICATIONS if a.get("currentStatus") == "Draft"])
    total_submitted = len([a for a in APPLICATIONS if a.get("currentStatus") != "Draft"])
    total_approved = len([a for a in APPLICATIONS if a.get("currentStatus") in ["Approved", "Completed"]])
    total_rejected = len([a for a in APPLICATIONS if a.get("currentStatus") == "Rejected"])
    total_pending = len([a for a in APPLICATIONS if a.get("currentStatus") not in ["Draft", "Completed", "Approved", "Rejected"]])
    
    total_returned = len([l for l in AUDIT_LOGS if l["action"] in ["Return", "Returned", "Correction Required"]])
    total_accepted = len([l for l in AUDIT_LOGS if l["action"] in ["Accept", "Accepted", "Assign", "Approve"]])
    
    processed_per_officer = {}
    for l in AUDIT_LOGS:
        if l["action"] in ["Approve", "Reject", "Forward Stage", "Update Application"]:
            o_name = l["userName"]
            if o_name and o_name != "System":
                processed_per_officer[o_name] = processed_per_officer.get(o_name, 0) + 1
                
    completed_apps = [a for a in APPLICATIONS if a.get("currentStatus") in ["Completed", "Approved"] and a.get("submittedDate")]
    avg_processing_time_minutes = 0.0
    if completed_apps:
        total_time = 0.0
        for a in completed_apps:
            try:
                t1 = datetime.fromisoformat(a["submittedDate"].replace("Z", ""))
                t2 = datetime.fromisoformat(a["lastUpdated"].replace("Z", ""))
                total_time += (t2 - t1).total_seconds() / 60.0
            except:
                pass
        avg_processing_time_minutes = round(total_time / len(completed_apps), 1)
        
    return jsonify({
        "totalCreated": total_created,
        "totalDrafts": total_drafts,
        "totalSubmitted": total_submitted,
        "totalApproved": total_approved,
        "totalRejected": total_rejected,
        "totalReturned": total_returned,
        "totalAccepted": total_accepted,
        "totalPending": total_pending,
        "processedPerOfficer": processed_per_officer,
        "avgProcessingTimeMinutes": avg_processing_time_minutes
    })

# -------------------------------------------------------------
# SMART DOCUMENT VERIFICATION ENGINE ENDPOINTS
# -------------------------------------------------------------
VERIFICATION_STORE = {}
VERIFICATION_AUDIT_LOGS = []

try:
    from verification_engine import run_document_verification_engine
except ImportError:
    run_document_verification_engine = None

@app.route("/api/verification/process/<app_id>", methods=["POST"])
def process_document_verification(app_id):
    user = get_user_from_headers()
    if not user or user.get("role") != "Admin":
        return jsonify({ "message": "Unauthorized CRO or Admin access required." }), 403
        
    app_record = next((a for a in APPLICATIONS if str(a["id"]) == str(app_id) or a.get("applicationNumber") == app_id), None)
    if not app_record:
        return jsonify({ "message": "Application not found" }), 404
        
    docs = app_record.get("documents", [])
    
    if run_document_verification_engine:
        verification_data = run_document_verification_engine(app_record, docs)
    else:
        # Fallback inline processing
        verification_data = {
            "applicationId": app_record.get("id"),
            "applicationNumber": app_record.get("applicationNumber"),
            "overallScore": 94,
            "identityMatchScore": 100,
            "addressMatchScore": 95,
            "ocrConfidenceScore": 97,
            "documentQualityScore": 96,
            "totalFieldsCompared": 6,
            "exactMatches": 4,
            "partialMatches": 1,
            "mismatches": 0,
            "missingFields": 0,
            "verificationStatus": "Verified",
            "results": [
                { "fieldName": "Applicant Name", "applicationValue": app_record.get("fullName", "Rahul Sharma"), "documentValue": app_record.get("fullName", "Rahul Sharma"), "matchType": "Exact Match", "matchStatus": "Exact Match", "confidenceScore": 100, "severity": "Low", "differenceNote": "Exact character match.", "suggestedAction": "Auto-verified", "documentType": "Aadhaar Card" },
                { "fieldName": "Aadhaar Number", "applicationValue": app_record.get("aadhaarNumber", "1234 5678 9012"), "documentValue": app_record.get("aadhaarNumber", "1234 5678 9012"), "matchType": "Exact Match", "matchStatus": "Exact Match", "confidenceScore": 100, "severity": "Low", "differenceNote": "Exact match", "suggestedAction": "Auto-verified", "documentType": "Aadhaar Card" },
                { "fieldName": "Father's Name", "applicationValue": app_record.get("fatherName", "Ramesh Sharma"), "documentValue": app_record.get("fatherName", "Ramesh") + " Kumar Sharma", "matchType": "Fuzzy Match", "matchStatus": "Partial Match", "confidenceScore": 89, "severity": "Medium", "differenceNote": "'Kumar' middle name in document.", "suggestedAction": "Review manually.", "documentType": "PAN Card" },
                { "fieldName": "Address", "applicationValue": app_record.get("addressLine1", "Mango, Jamshedpur"), "documentValue": app_record.get("addressLine1", "Mango, Jamshedpur"), "matchType": "Semantic/Address Match", "matchStatus": "Exact Match", "confidenceScore": 97, "severity": "Low", "differenceNote": "Locality verified.", "suggestedAction": "Verified.", "documentType": "Electricity Bill" },
                { "fieldName": "PAN Number", "applicationValue": app_record.get("panNumber", "ABCDE1234F"), "documentValue": app_record.get("panNumber", "ABCDE1234F"), "matchType": "Exact Match", "matchStatus": "Exact Match", "confidenceScore": 100, "severity": "Low", "differenceNote": "Exact match.", "suggestedAction": "Auto-verified", "documentType": "PAN Card" }
            ],
            "extractedDocuments": [
                { "documentType": "Aadhaar Card", "confidenceScore": 98, "extractedFields": { "Name": app_record.get("fullName"), "Aadhaar Number": app_record.get("aadhaarNumber"), "DOB": app_record.get("dateOfBirth"), "Address": app_record.get("addressLine1") } },
                { "documentType": "PAN Card", "confidenceScore": 96, "extractedFields": { "Name": app_record.get("fullName"), "PAN Number": app_record.get("panNumber"), "Father Name": app_record.get("fatherName") } }
            ],
            "qualityMetrics": [
                { "documentType": "Aadhaar Card", "blurScore": 95, "resolutionScore": 98, "rotationAngle": 0, "isCropped": False, "isDuplicate": False, "readabilityScore": 97, "overallQualityScore": 96, "qualityStatus": "High Quality" },
                { "documentType": "PAN Card", "blurScore": 94, "resolutionScore": 96, "rotationAngle": 0, "isCropped": False, "isDuplicate": False, "readabilityScore": 95, "overallQualityScore": 95, "qualityStatus": "High Quality" }
            ],
            "systemRecommendations": [
                "Identity match verified with 100% confidence.",
                "Address verified successfully against premises locality.",
                "Father's name contains middle name variation ('Kumar'); manual CRO review option available.",
                "System Recommendation: Eligible for Verification Approval."
            ],
            "processedAt": datetime.utcnow().isoformat() + "Z"
        }
        
    VERIFICATION_STORE[str(app_record["id"])] = verification_data
    return jsonify(verification_data)

@app.route("/api/verification/results/<app_id>", methods=["GET"])
def get_document_verification(app_id):
    app_record = next((a for a in APPLICATIONS if str(a["id"]) == str(app_id) or a.get("applicationNumber") == app_id), None)
    if not app_record:
        return jsonify({ "message": "Application not found" }), 404
        
    key = str(app_record["id"])
    return process_document_verification(key)

@app.route("/api/verification/action", methods=["POST"])
def submit_verification_action():
    user = get_user_from_headers()
    if not user or user.get("role") != "Admin":
        return jsonify({ "message": "Unauthorized" }), 403
        
    data = request.json or {}
    app_id = data.get("applicationId")
    action = data.get("action") # Approve, Reject, Request Re-upload, Request Additional Document, Manual Override
    remarks = data.get("remarks", "").strip()
    is_override = data.get("isOverride", False)
    
    if (is_override or action == "Manual Override") and not remarks:
        return jsonify({ "message": "Mandatory remarks required for Manual Override." }), 400
        
    app_record = next((a for a in APPLICATIONS if str(a["id"]) == str(app_id) or a.get("applicationNumber") == app_id), None)
    if not app_record:
        return jsonify({ "message": "Application not found" }), 404
        
    prev_status = app_record.get("currentStage", "Document Verification")
    
    if action == "Approve" or action == "Manual Override":
        app_record["currentStage"] = "Load Survey"
        app_record["currentStatus"] = "Under Survey"
        for doc in app_record.get("documents", []):
            doc["verificationStatus"] = "Verified"
    elif action == "Reject":
        app_record["currentStatus"] = "Rejected"
        for doc in app_record.get("documents", []):
            doc["verificationStatus"] = "Rejected"
            doc["rejectionReason"] = remarks or "Document verification rejected by CRO."
    elif action in ["Request Re-upload", "Request Additional Document"]:
        app_record["currentStatus"] = "Correction Required"
        for doc in app_record.get("documents", []):
            if doc.get("verificationStatus") != "Verified":
                doc["verificationStatus"] = "Rejected"
                doc["rejectionReason"] = remarks or "Re-upload requested by CRO."
                
    # Update verification store
    v_data = VERIFICATION_STORE.get(str(app_record["id"]), {})
    v_data["decision"] = action
    v_data["decisionRemarks"] = remarks
    v_data["isOverridden"] = is_override
    v_data["verifiedByName"] = user.get("fullName", "CRO Officer")
    v_data["verifiedAt"] = datetime.utcnow().isoformat() + "Z"
    v_data["verificationStatus"] = "Verified" if action in ["Approve", "Manual Override"] else "Rejected"
    VERIFICATION_STORE[str(app_record["id"])] = v_data

    # Log audit event
    audit_entry = {
        "id": len(VERIFICATION_AUDIT_LOGS) + 1,
        "userId": user.get("id"),
        "employeeId": user.get("employeeId", "EMP-CRO"),
        "userName": user.get("fullName"),
        "applicationNumber": app_record.get("applicationNumber"),
        "action": f"Document Verification: {action}",
        "verificationScore": v_data.get("overallScore", 94),
        "previousStatus": prev_status,
        "newStatus": app_record.get("currentStage"),
        "isOverride": is_override,
        "remarks": remarks,
        "ipAddress": request.remote_addr or "127.0.0.1",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    VERIFICATION_AUDIT_LOGS.append(audit_entry)
    AUDIT_LOGS.append({
        "id": f"log_ver_{len(AUDIT_LOGS)+100}",
        "userId": user.get("id"),
        "userName": user.get("fullName"),
        "employeeId": user.get("employeeId"),
        "role": user.get("role"),
        "module": "Document Verification",
        "action": f"Verification {action}",
        "tableName": "DocumentVerification",
        "recordId": app_record.get("applicationNumber"),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "ipAddress": request.remote_addr or "127.0.0.1",
        "details": f"CRO Decision: {action}. Score: {v_data.get('overallScore', 94)}%. Remarks: {remarks or 'None'}"
    })
    
    return jsonify({
        "success": True,
        "message": f"Verification action '{action}' recorded successfully.",
        "application": app_record,
        "verification": v_data
    })

@app.route("/api/verification/audit/<app_id>", methods=["GET"])
def get_verification_audit_logs(app_id):
    logs = [l for l in VERIFICATION_AUDIT_LOGS if l.get("applicationNumber") == app_id or str(l.get("applicationId")) == str(app_id)]
    return jsonify(logs)

if __name__ == "__main__":
    print("---------------------------------------------------------")
    print("Tata UISL Mock Backend API hosting on http://localhost:5000")
    print("Keep this process running to process live API requests!")
    print("---------------------------------------------------------")
    app.run(host="0.0.0.0", port=5000, debug=True)
