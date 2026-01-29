USE master;
GO
-- 1. DROP DATABASE IF EXISTS (Clean Slate)
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'EcoDeal')
BEGIN
    ALTER DATABASE EcoDeal SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE EcoDeal;
END
GO
-- 2. CREATE DATABASE
CREATE DATABASE EcoDeal;
GO
USE EcoDeal;
GO
-- 3. CREATE TABLES
-- Normalized types: float/decimal for money -> decimal(18,2). image -> bit.
CREATE TABLE [Users] (
    UserID int IDENTITY(1,1) NOT NULL,
    FullName nvarchar(255) NULL,
    Email nvarchar(255) NOT NULL UNIQUE,
    PasswordHash nvarchar(255) NULL, -- Renamed from Password for security clarity
    Role nvarchar(50) NULL, -- 'Guest', 'Customer', 'StoreOwner', 'Admin'
    PhoneNumber nvarchar(20) NULL,
    Address nvarchar(255) NULL,
    Latitude decimal(9, 6) NULL, -- Changed from 19,0 to 9,6 for Valid GPS
    Longitude decimal(9, 6) NULL, -- Changed from 19,0 to 9,6 for Valid GPS
    PRIMARY KEY (UserID)
);
GO
CREATE TABLE [Categories] (
    CategoryID int IDENTITY(1,1) NOT NULL,
    CategoryName nvarchar(255) NULL,
    PRIMARY KEY (CategoryID)
);
GO
CREATE TABLE [Store] (
    StoreID int IDENTITY(1,1) NOT NULL,
    UserID int NOT NULL, -- The Owner
    StoreName nvarchar(255) NULL,
    Address nvarchar(255) NULL,
    Latitude decimal(9, 6) NULL,
    Longitude decimal(9, 6) NULL,
    IsApproved bit DEFAULT 0, -- Corrected from 'image' to 'bit'
    PRIMARY KEY (StoreID),
    CONSTRAINT FK_Store_User FOREIGN KEY (UserID) REFERENCES [Users] (UserID)
);
GO
CREATE TABLE [Product] (
    ProductID int IDENTITY(1,1) NOT NULL,
    CategoryID int NOT NULL,
    StoreID int NOT NULL,
    ProductName nvarchar(255) NULL,
    OriginalPrice decimal(18, 2) NULL, -- Corrected from float(10)
    DiscountedPrice decimal(18, 2) NULL, -- Corrected from float(10)
    ExpireDate datetime NULL,
    StockQuantity int NULL,
    ImageUrl nvarchar(MAX) NULL,
    IsActive bit DEFAULT 1, -- Corrected from 'image' to 'bit'
    PRIMARY KEY (ProductID),
    CONSTRAINT FK_Product_Category FOREIGN KEY (CategoryID) REFERENCES [Categories] (CategoryID),
    CONSTRAINT FK_Product_Store FOREIGN KEY (StoreID) REFERENCES [Store] (StoreID)
);
GO
CREATE TABLE [Orders] (
    OrderID int IDENTITY(1,1) NOT NULL,
    UserID int NOT NULL, -- The Customer
    OrderDate datetime DEFAULT GETDATE(),
    TotalAmount decimal(18, 2) NULL,
    Status nvarchar(50) DEFAULT 'Pending', -- 'Pending', 'Paid', 'Completed'
    PaymentStatus nvarchar(50) NULL,
    PaymentMethod nvarchar(50) NULL,
    PRIMARY KEY (OrderID),
    CONSTRAINT FK_Orders_User FOREIGN KEY (UserID) REFERENCES [Users] (UserID)
);
GO
CREATE TABLE [OrderDetails] (
    OrderDetailID int IDENTITY(1,1) NOT NULL,
    OrderID int NOT NULL,
    ProductID int NOT NULL,
    Quantity int DEFAULT 1,
    UnitPrice decimal(18,2) NULL, -- Added to snapshot price at time of purchase
    PRIMARY KEY (OrderDetailID),
    CONSTRAINT FK_OrderDetails_Order FOREIGN KEY (OrderID) REFERENCES [Orders] (OrderID),
    CONSTRAINT FK_OrderDetails_Product FOREIGN KEY (ProductID) REFERENCES [Product] (ProductID)
);
GO
-- 4. INSERT MOCK DATA
-- Users (Password: '123456' hashed is assumed here, using placeholder)
INSERT INTO [Users] (FullName, Email, PasswordHash, Role, PhoneNumber, Address, Latitude, Longitude) VALUES
('System Admin', 'admin@ecodeal.com', 'hashed_pw_1', 'Admin', '0901234567', 'HQ Office', 10.7769, 106.7009),
('Store Owner 1', 'owner1@ecodeal.com', 'hashed_pw_2', 'StoreOwner', '0909998887', '123 Market St', 10.7721, 106.6982),
('John Doe', 'customer@gmail.com', 'hashed_pw_3', 'Customer', '0912345678', '456 Home Ave', 10.8000, 106.7200);
-- Categories
INSERT INTO [Categories] (CategoryName) VALUES ('Bakery'), ('Dairy'), ('Vegetables'), ('Beverages');
-- Store
INSERT INTO [Store] (UserID, StoreName, Address, Latitude, Longitude, IsApproved) VALUES
(2, 'Fresh Bakery D1', '123 Le Loi, District 1', 10.772109, 106.698273, 1); 
-- Products
INSERT INTO [Product] (CategoryID, StoreID, ProductName, OriginalPrice, DiscountedPrice, ExpireDate, StockQuantity, IsActive) VALUES
(1, 1, 'Croissant (Near Expiry)', 25000, 10000, DATEADD(day, 1, GETDATE()), 10, 1),
(1, 1, 'Baguette', 15000, 5000, DATEADD(hour, 6, GETDATE()), 5, 1),
(2, 1, 'Fresh Milk 1L', 35000, 17500, DATEADD(day, 2, GETDATE()), 20, 1);
-- Orders
INSERT INTO [Orders] (UserID, TotalAmount, Status, PaymentStatus, PaymentMethod) VALUES
(3, 25000, 'Pending', 'Unpaid', 'QR_CODE');
-- OrderDetails (Customer bought 2 Croissants, 1 Baguette)
INSERT INTO [OrderDetails] (OrderID, ProductID, Quantity, UnitPrice) VALUES
(1, 1, 2, 10000),
(1, 2, 1, 5000);
GO
-- 5. VERIFY
SELECT * FROM [Users];
SELECT * FROM [Store];
SELECT * FROM [Product];