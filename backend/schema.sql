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
    [FullName] NVARCHAR(100) NOT NULL,
    [FatherName] NVARCHAR(100) NULL,
    [MotherName] NVARCHAR(100) NULL,
    [Gender] NVARCHAR(10) NULL,
    [DateOfBirth] DATE NOT NULL,
    [AadhaarNumber] NVARCHAR(12) NOT NULL,
    [PanNumber] NVARCHAR(10) NOT NULL,
    [Occupation] NVARCHAR(100) NULL,
    [AnnualIncome] DECIMAL(18,2) NOT NULL,

    -- Section 2: Address Details
    [AddressLine1] NVARCHAR(255) NOT NULL,
    [AddressLine2] NVARCHAR(255) NULL,
    [City] NVARCHAR(100) NOT NULL DEFAULT 'Jamshedpur',
    [State] NVARCHAR(100) NOT NULL DEFAULT 'Jharkhand',
    [District] NVARCHAR(100) NOT NULL DEFAULT 'East Singhbhum',
    [PinCode] NVARCHAR(6) NOT NULL,

    -- Section 3: ConnectionDetails
    [ConnectionTypeId] INT NOT NULL,
    [ApplicationType] NVARCHAR(50) NOT NULL DEFAULT 'New Connection',

    -- Section 4: Property Details
    [PropertyType] NVARCHAR(50) NULL,
    [HouseNumber] NVARCHAR(50) NULL,
    [WardNumber] NVARCHAR(50) NULL,
    [Area] NVARCHAR(100) NULL,
    [Landmark] NVARCHAR(100) NULL,

    -- System Fields
    [CurrentStatus] NVARCHAR(50) NOT NULL DEFAULT 'Submitted',
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

-- 9. AuditLogs Table
CREATE TABLE [AuditLogs] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [UserId] INT NULL,
    [UserName] NVARCHAR(100) NOT NULL,
    [Action] NVARCHAR(100) NOT NULL,
    [TableName] NVARCHAR(100) NOT NULL,
    [RecordId] NVARCHAR(50) NULL,
    [Timestamp] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    [IpAddress] NVARCHAR(50) NULL,
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

-- Seed Data Queries
INSERT INTO [Roles] ([Name]) VALUES ('Admin'), ('Customer');

-- Admin Password: Admin@123 (hashed using SHA-256)
INSERT INTO [Users] ([FullName], [Email], [PasswordHash], [MobileNumber], [RoleId], [IsActive])
VALUES ('Tata UISL System Admin', 'admin@tatauisl.com', 'c7d24a9e403d159048a1b5c5e88863f698e6f1df02e21c81ef40d43a68393fd4', '18003456789', 1, 1);

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
