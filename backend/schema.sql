-- Tata UISL Customer Connection Portal Database Schema
-- Database Engine: Microsoft SQL Server

-- 1. Roles Table
CREATE TABLE [Roles] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Name] NVARCHAR(50) NOT NULL UNIQUE
);

-- 2. Users Table
CREATE TABLE [Users] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [FullName] NVARCHAR(100) NOT NULL,
    [Email] NVARCHAR(100) NOT NULL UNIQUE,
    [PasswordHash] NVARCHAR(255) NOT NULL,
    [MobileNumber] NVARCHAR(20) NULL,
    [RoleId] INT NOT NULL,
    [OfficerRole] NVARCHAR(50) NOT NULL DEFAULT 'Customer',
    [EmployeeId] NVARCHAR(50) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [FK_Users_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles]([Id]) ON DELETE RESTRICT
);

-- 3. ConnectionTypes Table
CREATE TABLE [ConnectionTypes] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL,
    [Category] NVARCHAR(50) NOT NULL
);

-- 4. Applications Table
CREATE TABLE [Applications] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [ApplicationNumber] NVARCHAR(50) NOT NULL UNIQUE,
    [CustomerId] INT NOT NULL,
    
    -- Section 1: Personal Info
    [FullName] NVARCHAR(100) NULL,
    [FatherName] NVARCHAR(100) NULL,
    [MotherName] NVARCHAR(100) NULL,
    [Gender] NVARCHAR(10) NULL,
    [DateOfBirth] DATE NULL,
    [AadhaarNumber] NVARCHAR(12) NULL,
    [PanNumber] NVARCHAR(10) NULL,
    [Occupation] NVARCHAR(100) NULL,
    [AnnualIncome] DECIMAL(18,2) NULL,

    [CreateNewBp] BIT NOT NULL DEFAULT 1,
    [ExistingBpNo] NVARCHAR(50) NULL,
    [BusinessArea] NVARCHAR(100) NULL,
    [OwnerOrgName] NVARCHAR(100) NULL,
    [RelationshipType] NVARCHAR(50) NULL,
    [RelationshipName] NVARCHAR(100) NULL,
    [IdentityCardType] NVARCHAR(50) NULL,
    [IdentityCardNumber] NVARCHAR(100) NULL,
    [PhoneNumber] NVARCHAR(20) NULL,
    [AlternatePhoneNumber] NVARCHAR(20) NULL,
    [EmailId] NVARCHAR(100) NULL,
    [AlternateEmailId] NVARCHAR(100) NULL,
    [VendorName] NVARCHAR(100) NULL,
    [VendorCertificateNumber] NVARCHAR(100) NULL,

    -- Section 2: Address Details
    [AddressLine1] NVARCHAR(255) NULL,
    [AddressLine2] NVARCHAR(255) NULL,
    [City] NVARCHAR(100) NULL DEFAULT 'Jamshedpur',
    [State] NVARCHAR(100) NULL DEFAULT 'Jharkhand',
    [District] NVARCHAR(100) NULL DEFAULT 'East Singhbhum',
    [PinCode] NVARCHAR(6) NULL,

    -- Section 3: ConnectionDetails
    [ConnectionTypeId] INT NULL,
    [ApplicationType] NVARCHAR(50) NULL DEFAULT 'New Connection',

    -- Section 4: Property Details
    [PropertyType] NVARCHAR(50) NULL,
    [HouseNumber] NVARCHAR(50) NULL,
    [WardNumber] NVARCHAR(50) NULL,
    [Area] NVARCHAR(100) NULL,
    [Landmark] NVARCHAR(100) NULL,

    -- System Fields
    [CurrentStatus] NVARCHAR(50) NOT NULL DEFAULT 'Draft',
    [CurrentStage] NVARCHAR(100) NOT NULL DEFAULT 'Application Verification',
    [Priority] NVARCHAR(50) NOT NULL DEFAULT 'Medium',
    [DueDate] DATETIME NULL,
    [LastUpdated] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    [SubmittedDate] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    [AssignedOfficer] NVARCHAR(100) NOT NULL DEFAULT 'Unassigned',
    [ProfileCompletion] INT NOT NULL DEFAULT 0,

    CONSTRAINT [FK_Applications_Users_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Users]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Applications_ConnectionTypes_ConnectionTypeId] FOREIGN KEY ([ConnectionTypeId]) REFERENCES [ConnectionTypes]([Id]) ON DELETE RESTRICT
);

-- 5. Documents Table
CREATE TABLE [Documents] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [ApplicationId] INT NOT NULL,
    [DocumentType] NVARCHAR(100) NOT NULL,
    [FileName] NVARCHAR(255) NOT NULL,
    [FilePath] NVARCHAR(500) NOT NULL,
    [FileSize] BIGINT NOT NULL,
    [VerificationStatus] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    [RejectionReason] NVARCHAR(MAX) NULL,
    [UploadedAt] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [FK_Documents_Applications_ApplicationId] FOREIGN KEY ([ApplicationId]) REFERENCES [Applications]([Id]) ON DELETE CASCADE
);

-- 6. ApplicationStatuses Table
CREATE TABLE [ApplicationStatuses] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [ApplicationId] INT NOT NULL,
    [Status] NVARCHAR(50) NOT NULL,
    [Stage] NVARCHAR(100) NULL,
    [UpdatedDate] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedById] INT NOT NULL,
    [Notes] NVARCHAR(MAX) NULL,
    CONSTRAINT [FK_ApplicationStatuses_Applications_ApplicationId] FOREIGN KEY ([ApplicationId]) REFERENCES [Applications]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ApplicationStatuses_Users_UpdatedById] FOREIGN KEY ([UpdatedById]) REFERENCES [Users]([Id]) ON DELETE RESTRICT
);

-- 7. ApplicationRemarks Table
CREATE TABLE [ApplicationRemarks] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [ApplicationId] INT NOT NULL,
    [OfficerName] NVARCHAR(100) NOT NULL,
    [Remarks] NVARCHAR(MAX) NOT NULL,
    [CreatedAt] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [FK_ApplicationRemarks_Applications_ApplicationId] FOREIGN KEY ([ApplicationId]) REFERENCES [Applications]([Id]) ON DELETE CASCADE
);

-- 8. Notifications Table
CREATE TABLE [Notifications] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [UserId] INT NOT NULL,
    [Title] NVARCHAR(200) NOT NULL,
    [Message] NVARCHAR(MAX) NOT NULL,
    [Type] NVARCHAR(50) NOT NULL DEFAULT 'Info',
    [IsRead] BIT NOT NULL DEFAULT 0,
    [CreatedAt] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [FK_Notifications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE
);

-- 9. UserSessions Table
CREATE TABLE [UserSessions] (
    [Id] NVARCHAR(100) NOT NULL PRIMARY KEY,
    [UserId] INT NOT NULL,
    [EmployeeId] NVARCHAR(50) NULL,
    [Role] NVARCHAR(50) NOT NULL,
    [LoginTimestamp] DATETIME NOT NULL,
    [LogoutTimestamp] DATETIME NULL,
    [BrowserClosureTimestamp] DATETIME NULL,
    [IsTimeout] BIT NOT NULL DEFAULT 0,
    [IpAddress] NVARCHAR(50) NULL,
    [Browser] NVARCHAR(255) NULL,
    [OperatingSystem] NVARCHAR(100) NULL,
    [Device] NVARCHAR(100) NULL,
    [SessionDuration] INT NULL,
    CONSTRAINT [FK_UserSessions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE
);

-- 10. AuditLogs Table
CREATE TABLE [AuditLogs] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [UserId] INT NULL,
    [EmployeeId] NVARCHAR(50) NULL,
    [UserName] NVARCHAR(100) NOT NULL,
    [Role] NVARCHAR(50) NULL,
    [Module] NVARCHAR(100) NULL,
    [Action] NVARCHAR(100) NOT NULL,
    [TableName] NVARCHAR(100) NOT NULL,
    [RecordId] NVARCHAR(50) NULL,
    [Timestamp] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    [IpAddress] NVARCHAR(50) NULL,
    [Browser] NVARCHAR(255) NULL,
    [OperatingSystem] NVARCHAR(100) NULL,
    [Device] NVARCHAR(100) NULL,
    [Status] NVARCHAR(50) NULL,
    [TicketId] NVARCHAR(100) NULL,
    [TicketNumber] NVARCHAR(100) NULL,
    [ApprovedBy] NVARCHAR(100) NULL,
    [BeforeJson] NVARCHAR(MAX) NULL,
    [AfterJson] NVARCHAR(MAX) NULL,
    [Details] NVARCHAR(MAX) NULL,
    CONSTRAINT [FK_AuditLogs_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE SET NULL
);

-- 10. Settings Table
CREATE TABLE [Settings] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Key] NVARCHAR(100) NOT NULL UNIQUE,
    [Value] NVARCHAR(MAX) NOT NULL,
    [Description] NVARCHAR(500) NULL
);

-- 11. DocumentVerification Table
CREATE TABLE [DocumentVerification] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [ApplicationId] INT NOT NULL,
    [ApplicationNumber] NVARCHAR(50) NOT NULL,
    [OverallScore] INT NOT NULL DEFAULT 0,
    [IdentityMatchScore] INT NOT NULL DEFAULT 0,
    [AddressMatchScore] INT NOT NULL DEFAULT 0,
    [OcrConfidenceScore] INT NOT NULL DEFAULT 0,
    [DocumentQualityScore] INT NOT NULL DEFAULT 0,
    [TotalFieldsCompared] INT NOT NULL DEFAULT 0,
    [ExactMatches] INT NOT NULL DEFAULT 0,
    [PartialMatches] INT NOT NULL DEFAULT 0,
    [Mismatches] INT NOT NULL DEFAULT 0,
    [MissingFields] INT NOT NULL DEFAULT 0,
    [VerificationStatus] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    [Decision] NVARCHAR(50) NULL,
    [DecisionRemarks] NVARCHAR(MAX) NULL,
    [IsOverridden] BIT NOT NULL DEFAULT 0,
    [VerifiedById] INT NULL,
    [VerifiedByName] NVARCHAR(100) NULL,
    [VerifiedAt] DATETIME NULL,
    [CreatedAt] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [FK_DocumentVerification_Applications_ApplicationId] FOREIGN KEY ([ApplicationId]) REFERENCES [Applications]([Id]) ON DELETE CASCADE
);

-- 12. VerificationResults Table
CREATE TABLE [VerificationResults] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [VerificationId] INT NOT NULL,
    [FieldName] NVARCHAR(100) NOT NULL,
    [ApplicationValue] NVARCHAR(500) NULL,
    [DocumentValue] NVARCHAR(500) NULL,
    [MatchType] NVARCHAR(50) NOT NULL, -- Exact, Fuzzy, Semantic
    [MatchStatus] NVARCHAR(50) NOT NULL, -- Exact Match, Partial Match, Mismatch, Missing
    [ConfidenceScore] INT NOT NULL DEFAULT 0,
    [Severity] NVARCHAR(20) NOT NULL DEFAULT 'Low', -- Low, Medium, High
    [DifferenceNote] NVARCHAR(500) NULL,
    [SuggestedAction] NVARCHAR(500) NULL,
    [DocumentType] NVARCHAR(100) NULL,
    CONSTRAINT [FK_VerificationResults_DocumentVerification_VerificationId] FOREIGN KEY ([VerificationId]) REFERENCES [DocumentVerification]([Id]) ON DELETE CASCADE
);

-- 13. OCRExtractedData Table
CREATE TABLE [OCRExtractedData] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [DocumentId] INT NOT NULL,
    [DocumentType] NVARCHAR(100) NOT NULL,
    [RawText] NVARCHAR(MAX) NULL,
    [ExtractedFieldsJson] NVARCHAR(MAX) NOT NULL,
    [OcrEngine] NVARCHAR(50) NOT NULL DEFAULT 'Engine Standard OCR',
    [ConfidenceScore] INT NOT NULL DEFAULT 95,
    [ExtractedAt] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [FK_OCRExtractedData_Documents_DocumentId] FOREIGN KEY ([DocumentId]) REFERENCES [Documents]([Id]) ON DELETE CASCADE
);

-- 14. VerificationHistory Table
CREATE TABLE [VerificationHistory] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [ApplicationId] INT NOT NULL,
    [Action] NVARCHAR(100) NOT NULL,
    [PerformedById] INT NOT NULL,
    [PerformedByName] NVARCHAR(100) NOT NULL,
    [Score] INT NOT NULL,
    [Remarks] NVARCHAR(MAX) NULL,
    [Timestamp] DATETIME NOT NULL DEFAULT GETUTCDATE()
);

-- 15. VerificationReports Table
CREATE TABLE [VerificationReports] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [ApplicationId] INT NOT NULL,
    [ReportNumber] NVARCHAR(100) NOT NULL UNIQUE,
    [OverallScore] INT NOT NULL,
    [GeneratedByName] NVARCHAR(100) NOT NULL,
    [GeneratedAt] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    [PdfFilePath] NVARCHAR(500) NULL
);

-- 16. DocumentQualityMetrics Table
CREATE TABLE [DocumentQualityMetrics] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [DocumentId] INT NOT NULL,
    [DocumentType] NVARCHAR(100) NOT NULL,
    [BlurScore] INT NOT NULL DEFAULT 95,
    [ResolutionScore] INT NOT NULL DEFAULT 98,
    [RotationAngle] INT NOT NULL DEFAULT 0,
    [IsCropped] BIT NOT NULL DEFAULT 0,
    [IsDuplicate] BIT NOT NULL DEFAULT 0,
    [HasWatermark] BIT NOT NULL DEFAULT 0,
    [ReadabilityScore] INT NOT NULL DEFAULT 96,
    [OverallQualityScore] INT NOT NULL DEFAULT 96,
    [QualityStatus] NVARCHAR(50) NOT NULL DEFAULT 'High Quality',
    CONSTRAINT [FK_DocumentQualityMetrics_Documents_DocumentId] FOREIGN KEY ([DocumentId]) REFERENCES [Documents]([Id]) ON DELETE CASCADE
);

-- 17. VerificationAuditLogs Table
CREATE TABLE [VerificationAuditLogs] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [UserId] INT NULL,
    [EmployeeId] NVARCHAR(50) NULL,
    [ApplicationNumber] NVARCHAR(50) NOT NULL,
    [Action] NVARCHAR(100) NOT NULL,
    [VerificationScore] INT NOT NULL,
    [PreviousStatus] NVARCHAR(50) NULL,
    [NewStatus] NVARCHAR(50) NOT NULL,
    [IsOverride] BIT NOT NULL DEFAULT 0,
    [Remarks] NVARCHAR(MAX) NULL,
    [IpAddress] NVARCHAR(50) NULL,
    [Timestamp] DATETIME NOT NULL DEFAULT GETUTCDATE()
);

-- Seed Data Queries
INSERT INTO [Roles] ([Name]) VALUES ('Admin'), ('Customer');

-- Admin Password: Admin@123 (hashed using SHA-256)
INSERT INTO [Users] ([FullName], [Email], [PasswordHash], [MobileNumber], [RoleId], [OfficerRole], [EmployeeId], [IsActive])
VALUES 
('Tata UISL System Admin', 'admin@tatauisl.com', 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7', '18003456789', 1, 'SuperAdmin', 'EMP001', 1),
('Officer 1 - Doc Verifier', 'officer1@tatauisl.com', 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7', '9988776651', 1, 'Officer1', 'EMP002', 1),
('Officer 2 - Tech Surveyor', 'officer2@tatauisl.com', 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7', '9988776652', 1, 'Officer2', 'EMP003', 1),
('Officer 3 - Approval Officer', 'officer3@tatauisl.com', 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7', '9988776653', 1, 'Officer3', 'EMP004', 1);

INSERT INTO [ConnectionTypes] ([Name], [Category])
VALUES 
('Domestic New Connection', 'Domestic'),
('Commercial New Connection', 'Commercial'),
('Industrial Power Line', 'Industrial'),
('Temporary construction load', 'Other');

INSERT INTO [Settings] ([Key], [Value], [Description])
VALUES
('support_email', 'support.uisl@tatasteel.com', 'Emergency support mail'),
('support_phone', '1800-345-6789', 'Emergency toll line'),
('allow_registration', 'true', 'Flag to enable/disable user registration');
