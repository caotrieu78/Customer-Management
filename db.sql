-- Tạo cơ sở dữ liệu CustomerManagementDB
CREATE DATABASE CustomerManagementDB;
USE CustomerManagementDB;

-- Bảng người dùng (User) với vai trò Admin và Staff Manager
CREATE TABLE user (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(255) NOT NULL UNIQUE, -- Ràng buộc UNIQUE cho Username
    Password VARCHAR(255) NOT NULL,
    FullName VARCHAR(255),
    Email VARCHAR(255) UNIQUE, -- Ràng buộc UNIQUE cho Email
    Role ENUM('Admin', 'Staff' , 'Manager') NOT NULL, 
    Avatar VARCHAR(255) DEFAULT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng phân loại khách hàng (Customer Classification)
CREATE TABLE customer_classification (
    ClassificationID INT PRIMARY KEY AUTO_INCREMENT,
    ClassificationName VARCHAR(100) NOT NULL
);

-- Thêm các loại phân loại khách hàng 'VIP', 'Normal', 'Potential'
INSERT INTO customer_classification (ClassificationName) 
VALUES ('VIP'), ('Normal'), ('Potential');

-- Bảng loại dự án (Project Type)
CREATE TABLE project_type (
    ProjectTypeID INT PRIMARY KEY AUTO_INCREMENT,
    TypeName VARCHAR(100) NOT NULL
);

-- Thêm các loại dự án (Resort, Nhà cao tầng, Nhà ở cao cấp, Nhà ở dân cư, Nhà xưởng)
INSERT INTO project_type (TypeName)
VALUES ('Resort'), ('High-Rise'), ('Luxury Housing'), ('Residential Area'), ('Factory');

-- Bảng khách hàng (Customer)
CREATE TABLE customer (
    CustomerID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255),
    Phone VARCHAR(50),
    Address VARCHAR(255),
    ClassificationID INT,
    UserID INT, -- Cột để lưu thông tin người phụ trách
    ProjectID INT, -- Cột để lưu thông tin dự án mà khách hàng tham gia
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng dự án (Project)
CREATE TABLE project (
    ProjectID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT,
    UserID INT,  -- Khóa ngoại cho Người dùng
    ProjectName VARCHAR(255) NOT NULL,
    Description TEXT,
    StartDate DATE,
    EndDate DATE,
    Status ENUM('Ongoing', 'Completed', 'Accepted_NotPaid', 'Canceled') NOT NULL, -- Trạng thái dự án
    ProjectTypeID INT,
    TotalAmount DECIMAL(10, 2),  -- Tổng số tiền của dự án
    PaidAmount DECIMAL(10, 2) DEFAULT 0, -- Số tiền đã thanh toán
    RemainingAmount DECIMAL(10, 2) GENERATED ALWAYS AS (TotalAmount - PaidAmount) STORED, -- Số tiền còn lại (tính toán)
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng thanh toán (Payment)
CREATE TABLE payment (
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT,
    ProjectID INT,
    InstallmentNumber INT,  -- Số đợt thanh toán
    Amount DECIMAL(10, 2), -- Số tiền thanh toán trong mỗi đợt
    PaymentDate DATE, -- Ngày thanh toán
    PaymentStatus ENUM('Pending', 'Paid', 'Failed'),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng quản lý sự kiện (Event)
CREATE TABLE event (
    EventID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT,
    ProjectID INT,
    UserID INT,  -- Khóa ngoại cho Người dùng
    EventTypeID INT, -- Tham chiếu đến bảng loại sự kiện
    EventDate DATE NOT NULL, -- Ngày diễn ra sự kiện
    Description TEXT, -- Mô tả chi tiết về sự kiện
    ReminderDate DATE, -- Ngày nhắc nhở trước khi sự kiện diễn ra
    ReminderSent BOOLEAN DEFAULT FALSE, -- Trạng thái đã gửi nhắc nhở
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);






-- Bảng loại sự kiện (Event Type)
CREATE TABLE event_type (
    EventTypeID INT PRIMARY KEY AUTO_INCREMENT,
    EventTypeName VARCHAR(100) NOT NULL -- Tên loại sự kiện
);

-- Thêm các loại sự kiện vào bảng event_type
INSERT INTO event_type (EventTypeName)
VALUES ('Meeting'), ('Contract Signing'), ('Payment Due'), ('Project Review');

-- Thêm các ràng buộc khóa ngoại sau khi tạo bảng

-- Bảng khách hàng (Customer)
ALTER TABLE customer
ADD FOREIGN KEY (ClassificationID) REFERENCES customer_classification(ClassificationID),
ADD FOREIGN KEY (UserID) REFERENCES user(UserID),
ADD FOREIGN KEY (ProjectID) REFERENCES project(ProjectID);

-- Bảng dự án (Project)
ALTER TABLE project
ADD FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID),
ADD FOREIGN KEY (UserID) REFERENCES user(UserID),
ADD FOREIGN KEY (ProjectTypeID) REFERENCES project_type(ProjectTypeID);

-- Bảng thanh toán (Payment)
ALTER TABLE payment
ADD FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID),
ADD FOREIGN KEY (ProjectID) REFERENCES project(ProjectID);

-- Bảng sự kiện (Event)
ALTER TABLE event
ADD FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID),
ADD FOREIGN KEY (ProjectID) REFERENCES project(ProjectID),
ADD FOREIGN KEY (UserID) REFERENCES user(UserID),
ADD FOREIGN KEY (EventTypeID) REFERENCES event_type(EventTypeID);



-- INSERT DỮ LIỆU BẢNG USER


INSERT INTO user (Username, Password, FullName, Email, Role, Avatar)
VALUES
    ('admin', 'admin123', 'Admin User', 'admin@example.com', 'Admin', 'avatar1.png'),
    ('john_doe', 'john123', 'John Doe', 'john.doe@example.com', 'Staff', 'avatar2.png'),
    ('jane_smith', 'jane123', 'Jane Smith', 'jane.smith@example.com', 'Manager', 'avatar3.png'),
    ('staff_user', 'staff123', 'Staff User', 'staff.user@example.com', 'Staff', NULL),
    ('manager_user', 'manager123', 'Manager User', 'manager.user@example.com', 'Manager', NULL);













