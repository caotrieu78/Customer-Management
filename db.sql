-- Tạo cơ sở dữ liệu CustomerManagementDB
CREATE DATABASE IF NOT EXISTS CustomerManagementDB;
USE CustomerManagementDB;

-- Bảng người dùng (User) với vai trò Admin, Staff, Manager
CREATE TABLE IF NOT EXISTS user (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(255) NOT NULL UNIQUE, -- Ràng buộc UNIQUE cho Username
    Password VARCHAR(255) NOT NULL,
    FullName VARCHAR(255),
    Email VARCHAR(255) UNIQUE, -- Ràng buộc UNIQUE cho Email
    Role ENUM('Admin', 'Staff', 'Manager') NOT NULL, 
    Avatar VARCHAR(255) DEFAULT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng phân loại khách hàng (Customer Classification)
CREATE TABLE IF NOT EXISTS customer_classification (
    ClassificationID INT PRIMARY KEY AUTO_INCREMENT,
    ClassificationName VARCHAR(100) NOT NULL
);

-- Bảng loại dự án (Project Type)
CREATE TABLE IF NOT EXISTS project_type (
    ProjectTypeID INT PRIMARY KEY AUTO_INCREMENT,
    TypeName VARCHAR(100) NOT NULL
);

-- Bảng khách hàng (Customer)
CREATE TABLE IF NOT EXISTS customer (
    CustomerID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255),
    Phone VARCHAR(50),
    Address VARCHAR(255),
    DateOfBirth DATE, -- Thêm ngày sinh
    Gender ENUM('Male', 'Female', 'Other'), -- Thêm giới tính
    ClassificationID INT, -- Tham chiếu bảng phân loại khách hàng
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ClassificationID) REFERENCES customer_classification(ClassificationID)
);

-- Bảng dự án (Project)
CREATE TABLE IF NOT EXISTS project (
    ProjectID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT, -- Khách hàng tham gia dự án
    UserID INT,  -- Người phụ trách dự án
    ProjectName VARCHAR(255) NOT NULL,
    Description TEXT,
    StartDate DATE,
    EndDate DATE,
    Status ENUM('Ongoing', 'Completed', 'Accepted_NotPaid', 'Canceled') NOT NULL, -- Trạng thái dự án
    ProjectTypeID INT, -- Loại dự án
    TotalAmount DECIMAL(20, 2),  -- Tổng số tiền của dự án
    PaidAmount DECIMAL(20, 2) DEFAULT 0, -- Số tiền đã thanh toán
    RemainingAmount DECIMAL(20, 2) GENERATED ALWAYS AS (TotalAmount - PaidAmount) STORED, -- Số tiền còn lại
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID) ON DELETE SET NULL,
    FOREIGN KEY (UserID) REFERENCES user(UserID) ON DELETE SET NULL,
    FOREIGN KEY (ProjectTypeID) REFERENCES project_type(ProjectTypeID)
);

-- Bảng thanh toán (Payment)
CREATE TABLE IF NOT EXISTS payment (
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT, -- Khách hàng thực hiện thanh toán
    ProjectID INT, -- Dự án liên quan
    InstallmentNumber INT,  -- Số đợt thanh toán
    Amount DECIMAL(20, 2), -- Số tiền thanh toán
    PaymentDate DATE, -- Ngày thanh toán
    PaymentStatus ENUM('Pending', 'Paid', 'Failed'),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID),
    FOREIGN KEY (ProjectID) REFERENCES project(ProjectID)
);

-- Bảng loại sự kiện (Event Type)
CREATE TABLE IF NOT EXISTS event_type (
    EventTypeID INT PRIMARY KEY AUTO_INCREMENT,
    EventTypeName VARCHAR(100) NOT NULL -- Tên loại sự kiện
);

-- Bảng quản lý sự kiện (Event)
CREATE TABLE IF NOT EXISTS event (
    EventID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT, -- Khách hàng liên quan
    ProjectID INT, -- Dự án liên quan
    UserID INT,  -- Người phụ trách sự kiện
    EventTypeID INT, -- Loại sự kiện
    EventDate DATE NOT NULL, -- Ngày diễn ra sự kiện
    Description TEXT, -- Mô tả chi tiết sự kiện
    ReminderDate DATE, -- Ngày nhắc nhở trước khi sự kiện diễn ra
    ReminderSent BOOLEAN DEFAULT FALSE, -- Trạng thái đã gửi nhắc nhở
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID),
    FOREIGN KEY (ProjectID) REFERENCES project(ProjectID),
    FOREIGN KEY (UserID) REFERENCES user(UserID),
    FOREIGN KEY (EventTypeID) REFERENCES event_type(EventTypeID)
);

/* INSERT USER */ /*==================================*/
INSERT INTO user (Username, Password, FullName, Email, Role, Avatar)
VALUES
    ('admin', 'admin123', 'Admin User', 'admin@example.com', 'Admin', 'avatar_admin.png'),
    ('john_doe', 'john123', 'John Doe', 'john.doe@example.com', 'Staff', 'avatar_john.png'),
    ('jane_smith', 'jane123', 'Jane Smith', 'jane.smith@example.com', 'Manager', 'avatar_jane.png'),
    ('alice_johnson', 'alice123', 'Alice Johnson', 'alice.johnson@example.com', 'Staff', 'avatar_alice.png'),
    ('robert_brown', 'robert123', 'Robert Brown', 'robert.brown@example.com', 'Manager', 'avatar_robert.png');

/* INSERT CUSTOMER CLASSIFICATION */
INSERT INTO customer_classification (ClassificationName)
VALUES
    ('VIP'),
    ('Normal'),
    ('Potential');

/* INSERT PROJECT TYPE */
INSERT INTO project_type (TypeName)
VALUES
    ('Resort'),
    ('High-Rise'),
    ('Luxury Housing'),
    ('Residential Area'),
    ('Factory');

/* INSERT CUSTOMER */
INSERT INTO customer (Name, Email, Phone, Address, DateOfBirth, Gender, ClassificationID)
VALUES
    ('John Doe', 'john.doe@example.com', '123456789', '123 Elm Street, Springfield', '1985-07-20', 'Male', 1),
    ('Jane Smith', 'jane.smith@example.com', '987654321', '456 Maple Avenue, Springfield', '1990-05-15', 'Female', 2),
    ('Alice Johnson', 'alice.johnson@example.com', '555678123', '789 Pine Road, Springfield', '1992-09-10', 'Female', 3),
    ('Robert Brown', 'robert.brown@example.com', '321654987', '101 Oak Lane, Springfield', '1980-01-25', 'Male', 1),
    ('Emma Wilson', 'emma.wilson@example.com', '444555666', '202 Birch Way, Springfield', '1995-03-30', 'Female', 2);

