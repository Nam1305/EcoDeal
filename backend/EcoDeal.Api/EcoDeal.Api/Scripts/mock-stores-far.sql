-- Mock Data for Stores 3-5km from FPT University Hòa Lạc
-- FPTU Location: 21.012879, 105.527632

BEGIN TRANSACTION;

-- Insert Mock Store Owners
INSERT INTO [Users] ([FullName], [Email], [PasswordHash], [Role], [PhoneNumber], [Address], [Latitude], [Longitude])
VALUES 
(N'Lý Gia Thành', 'owner6@example.com', 'AQAAAAEAACcQAAAAEFgM...', 'StoreOwner', '0912345676', N'Đại lộ Thăng Long, Thạch Thất, Hà Nội', 21.045000, 105.525000),
(N'Vương Đình Huệ', 'owner7@example.com', 'AQAAAAEAACcQAAAAEFgM...', 'StoreOwner', '0912345677', N'Quốc lộ 21, Thạch Thất, Hà Nội', 20.980000, 105.535000),
(N'Trần Cẩm Tú', 'owner8@example.com', 'AQAAAAEAACcQAAAAEFgM...', 'StoreOwner', '0912345678', N'Thôn Phú Cát, Quốc Oai, Hà Nội', 21.010000, 105.575000);

-- Get the inserted User IDs
DECLARE @Owner6ID INT = (SELECT UserID FROM Users WHERE Email = 'owner6@example.com');
DECLARE @Owner7ID INT = (SELECT UserID FROM Users WHERE Email = 'owner7@example.com');
DECLARE @Owner8ID INT = (SELECT UserID FROM Users WHERE Email = 'owner8@example.com');

-- Insert Mock Stores
INSERT INTO [Store] ([UserID], [StoreName], [Description], [StoreEmail], [StorePhone], [ImageUrl], [Address], [Latitude], [Longitude], [IsApproved])
VALUES 
(@Owner6ID, N'Siêu thị Viettel Hòa Lạc', N'Trung tâm mua sắm thiết bị công nghệ tầm xa.', 'viettel@example.com', '0241234566', 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0', N'Đại lộ Thăng Long (cách 4km)', 21.045000, 105.525000, 1),
(@Owner7ID, N'Nhà Hàng Sen Vàng', N'Ẩm thực đồng quê đặc sắc.', 'senvang@example.com', '0241234567', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', N'Quốc lộ 21 (cách 3.5km)', 20.980000, 105.535000, 1),
(@Owner8ID, N'Eco Mart Phú Cát', N'Thực phẩm sạch tại khu vực Quốc Oai.', 'ecomart@example.com', '0241234568', 'https://images.unsplash.com/photo-1542838132-92c53300491e', N'Phú Cát, Quốc Oai (cách 5km)', 21.010000, 105.575000, 1);

COMMIT;
