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

-- Bảng permissions
CREATE TABLE IF NOT EXISTS permissions (
    PermissionID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Tên chức năng, ví dụ: Quản lý người dùng',
    Icon VARCHAR(255) COMMENT 'Biểu tượng liên quan',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/* Insert dữ liệu mẫu vào bảng permissions */
INSERT INTO permissions (Name, Icon)
VALUES
    ('Quản lý người dùng', 'bi-person'),
    ('Quản lý khách hàng', 'bi bi-people'),
    ('Quản lý dự án', 'bi-bar-chart'),
    ('Quản lý sự kiện', 'bi-calendar-event'),
    ('Thông Báo nhắc nhở', 'bi-bell'),
    ('Quản lý thanh toán', 'bi-credit-card'),
    ('Thống kê và báo cáo', 'bi-graph-up-arrow');

-- Bảng user_permissions
CREATE TABLE IF NOT EXISTS user_permissions (
    UserPermissionID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    PermissionID INT NOT NULL,
    AssignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES user(UserID) ON DELETE CASCADE,
    FOREIGN KEY (PermissionID) REFERENCES permissions(PermissionID) ON DELETE CASCADE,
    UNIQUE (UserID, PermissionID)
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
    EventID INT PRIMARY KEY AUTO_INCREMENT, -- ID duy nhất của sự kiện
    EventTypeID INT, -- Loại sự kiện, tham chiếu bảng event_type
    EventDate DATE NOT NULL, -- Ngày diễn ra sự kiện
    Description TEXT, -- Mô tả chi tiết sự kiện
    ReminderDate DATE, -- Ngày nhắc nhở trước khi sự kiện diễn ra
    ReminderSent BOOLEAN DEFAULT FALSE, -- Trạng thái đã gửi nhắc nhở
    Status ENUM('PLANNED', 'COMPLETED', 'CANCELED') DEFAULT 'PLANNED', -- Trạng thái sự kiện
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời gian tạo sự kiện
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Thời gian cập nhật sự kiện
    FOREIGN KEY (EventTypeID) REFERENCES event_type(EventTypeID) ON DELETE SET NULL -- Quan hệ với bảng event_type
);


CREATE TABLE event_users (
    EventUserID INT PRIMARY KEY AUTO_INCREMENT, -- ID duy nhất cho mỗi mối liên kết
    EventID INT NOT NULL, -- ID của sự kiện
    UserID INT NOT NULL, -- ID của người phụ trách
    CustomerID INT NOT NULL, -- ID của khách hàng
    FOREIGN KEY (EventID) REFERENCES event(EventID) ON DELETE CASCADE, -- Khóa ngoại liên kết tới bảng event
    FOREIGN KEY (UserID) REFERENCES user(UserID) ON DELETE CASCADE, -- Khóa ngoại liên kết tới bảng user
    FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID) ON DELETE CASCADE, -- Khóa ngoại liên kết tới bảng customer
    CONSTRAINT unique_event_customer UNIQUE (EventID, CustomerID) -- Ràng buộc duy nhất: EventID và CustomerID
);
-- Bảng lưu lịch sử thông báo (Event Notifications)
CREATE TABLE IF NOT EXISTS event_notifications (
    NotificationID INT PRIMARY KEY AUTO_INCREMENT, -- ID thông báo
    EventUserID INT NOT NULL, -- ID liên kết sự kiện và người phụ trách (event_users)
    Method ENUM('Email', 'SMS', 'PhoneCall') NOT NULL, -- Phương thức thông báo
    Status ENUM('Success', 'Failed', 'Pending') DEFAULT 'Pending', -- Trạng thái thông báo
     sentAt TIMESTAMP NULL DEFAULT NULL, -- Thời gian gửi thông báo (cho phép NULL)
    Message TEXT, -- Nội dung thông báo
    -- AttachmentPath  VARCHAR(255) NULL, -- Thêm cột hình ảnh (Đường dẫn hình ảnh)
    FOREIGN KEY (EventUserID) REFERENCES event_users(EventUserID) ON DELETE CASCADE -- Liên kết đến bảng event_users
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


-- Ví dụ chèn dữ liệu vào bảng event_type
INSERT INTO event_type (EventTypeName) 
VALUES 
    ('Đám cưới'), 
    ('Hội thảo'), 
    ('Tiệc sinh nhật'), 
    ('Sự kiện doanh nghiệp');

-- Ví dụ chèn dữ liệu vào bảng event
INSERT INTO event (EventTypeID, EventDate, Description, ReminderDate, Status) 
VALUES 
    (1, '2024-12-15', 'Sự kiện đám cưới tại bãi biển', '2024-12-10', 'PLANNED'),
    (2, '2024-12-20', 'Hội thảo công nghệ hàng năm tại Hà Nội', '2024-12-18', 'PLANNED'),
    (3, '2024-12-25', 'Tiệc sinh nhật bất ngờ cho một người bạn', '2024-12-23', 'PLANNED'),
    (4, '2024-12-30', 'Sự kiện doanh nghiệp cuối năm', '2024-12-28', 'PLANNED');
