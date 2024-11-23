-- Tạo cơ sở dữ liệu CustomerManagementDB
CREATE DATABASE CustomerManagementDB;
USE CustomerManagementDB;

-- Bảng người dùng (User) với vai trò Admin, Staff, Manager
CREATE TABLE user (
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
CREATE TABLE customer_classification (
    ClassificationID INT PRIMARY KEY AUTO_INCREMENT,
    ClassificationName VARCHAR(100) NOT NULL
);

-- Bảng loại dự án (Project Type)
CREATE TABLE project_type (
    ProjectTypeID INT PRIMARY KEY AUTO_INCREMENT,
    TypeName VARCHAR(100) NOT NULL
);

-- Bảng khách hàng (Customer)
CREATE TABLE customer (
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
    FOREIGN KEY (ClassificationID) REFERENCES customer_classification(ClassificationID),
    FOREIGN KEY (UserID) REFERENCES user(UserID)
);

-- Bảng dự án (Project)
CREATE TABLE project (
    ProjectID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT, -- Khách hàng tham gia dự án
    UserID INT,  -- Người phụ trách dự án
    ProjectName VARCHAR(255) NOT NULL,
    Description TEXT,
    StartDate DATE,
    EndDate DATE,
    Status ENUM('Ongoing', 'Completed', 'Accepted_NotPaid', 'Canceled') NOT NULL, -- Trạng thái dự án
    ProjectTypeID INT, -- Loại dự án
    TotalAmount DECIMAL(10, 2),  -- Tổng số tiền của dự án
    PaidAmount DECIMAL(10, 2) DEFAULT 0, -- Số tiền đã thanh toán
    RemainingAmount DECIMAL(10, 2) GENERATED ALWAYS AS (TotalAmount - PaidAmount) STORED, -- Số tiền còn lại
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID) ON DELETE SET NULL,
    FOREIGN KEY (UserID) REFERENCES user(UserID) ON DELETE SET NULL,
    FOREIGN KEY (ProjectTypeID) REFERENCES project_type(ProjectTypeID)
);


-- Bảng thanh toán (Payment)
CREATE TABLE payment (
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT, -- Khách hàng thực hiện thanh toán
    ProjectID INT, -- Dự án liên quan
    InstallmentNumber INT,  -- Số đợt thanh toán
    Amount DECIMAL(10, 2), -- Số tiền thanh toán
    PaymentDate DATE, -- Ngày thanh toán
    PaymentStatus ENUM('Pending', 'Paid', 'Failed'),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID),
    FOREIGN KEY (ProjectID) REFERENCES project(ProjectID)
);


-- Bảng loại sự kiện (Event Type)
CREATE TABLE event_type (
    EventTypeID INT PRIMARY KEY AUTO_INCREMENT,
    EventTypeName VARCHAR(100) NOT NULL -- Tên loại sự kiện
);


-- Bảng quản lý sự kiện (Event)
CREATE TABLE event (
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
/*==================================*/
INSERT INTO customer_classification (ClassificationName)
VALUES
    ('VIP'),
    ('Normal'),
    ('Potential');
/*==================================*/
INSERT INTO project_type (TypeName)
VALUES
    ('Resort'),
    ('High-Rise'),
    ('Luxury Housing'),
    ('Residential Area'),
    ('Factory');
/*==================================*/
INSERT INTO customer (Name, Email, Phone, Address, DateOfBirth, Gender, ClassificationID, UserID)
VALUES
    ('John Doe', 'john.doe@example.com', '123456789', '123 Elm Street, Springfield', '1985-07-20', 'Male', 1, 2), -- VIP, Staff
    ('Jane Smith', 'jane.smith@example.com', '987654321', '456 Maple Avenue, Springfield', '1990-05-15', 'Female', 2, 3), -- Normal, Manager
    ('Alice Johnson', 'alice.johnson@example.com', '555678123', '789 Pine Road, Springfield', '1992-09-10', 'Female', 3, 4), -- Potential, Staff
    ('Robert Brown', 'robert.brown@example.com', '321654987', '101 Oak Lane, Springfield', '1980-01-25', 'Male', 1, 3), -- VIP, Manager
    ('Emma Wilson', 'emma.wilson@example.com', '444555666', '202 Birch Way, Springfield', '1995-03-30', 'Female', 2, 2); -- Normal, Staff
/*==================================*/
INSERT INTO project (CustomerID, UserID, ProjectName, Description, StartDate, EndDate, Status, ProjectTypeID, TotalAmount, PaidAmount)
VALUES
    (1, 3, 'Luxury Resort Project', 'Development of a luxury resort.', '2023-01-01', '2024-01-01', 'Ongoing', 1, 500000.00, 200000.00),
    (2, 2, 'High-Rise Apartment', 'Construction of high-rise apartments.', '2022-06-01', '2023-06-01', 'Completed', 2, 1000000.00, 1000000.00),
    (3, 4, 'Luxury Housing', 'Development of luxury housing.', '2023-03-01', '2024-03-01', 'Ongoing', 3, 800000.00, 300000.00),
    (4, 5, 'Residential Area Project', 'Expansion of residential areas.', '2023-05-01', '2024-05-01', 'Accepted_NotPaid', 4, 600000.00, 0.00),
    (5, 2, 'Factory Development', 'Factory construction and setup.', '2023-08-01', '2024-08-01', 'Canceled', 5, 700000.00, 350000.00);
/*==================================*/
INSERT INTO event_type (EventTypeName)
VALUES
    ('Meeting'),
    ('Contract Signing'),
    ('Payment Due'),
    ('Project Review');
/*==================================*/
INSERT INTO event (CustomerID, ProjectID, UserID, EventTypeID, EventDate, Description, ReminderDate, ReminderSent)
VALUES
    (1, 1, 3, 1, '2023-12-01', 'Meeting with John Doe to discuss project status.', '2023-11-25', FALSE),
    (2, 2, 2, 2, '2023-01-15', 'Contract signing for High-Rise Apartment.', '2023-01-10', TRUE),
    (3, 3, 4, 3, '2023-04-01', 'Payment due for Luxury Housing.', '2023-03-28', FALSE),
    (4, 4, 5, 4, '2023-05-10', 'Project review for Residential Area.', '2023-05-05', TRUE),
    (5, 5, 2, 1, '2023-08-15', 'Meeting with Emma Wilson to discuss Factory project.', '2023-08-10', FALSE);
