-- Mock Data for FPT University Hòa Lạc Area
-- Location: 21.012879, 105.527632

BEGIN TRANSACTION;

-- Insert Mock Store Owners
INSERT INTO [Users] ([FullName], [Email], [PasswordHash], [Role], [PhoneNumber], [Address], [Latitude], [Longitude])
VALUES 
(N'Nguyễn Văn A', 'owner1@example.com', 'AQAAAAEAACcQAAAAEFgM...', 'StoreOwner', '0912345671', N'Thạch Hòa, Thạch Thất, Hà Nội', 21.013500, 105.526000),
(N'Trần Thị B', 'owner2@example.com', 'AQAAAAEAACcQAAAAEFgM...', 'StoreOwner', '0912345672', N'Tân Xã, Thạch Thất, Hà Nội', 21.012000, 105.528000),
(N'Lê Văn C', 'owner3@example.com', 'AQAAAAEAACcQAAAAEFgM...', 'StoreOwner', '0912345673', N'Hạ Bằng, Thạch Thất, Hà Nội', 21.014000, 105.530000),
(N'Phạm Thị D', 'owner4@example.com', 'AQAAAAEAACcQAAAAEFgM...', 'StoreOwner', '0912345674', N'Bình Yên, Thạch Thất, Hà Nội', 21.011000, 105.525000),
(N'Hoàng Văn E', 'owner5@example.com', 'AQAAAAEAACcQAAAAEFgM...', 'StoreOwner', '0912345675', N'Thạch Hòa, Thạch Thất, Hà Nội', 21.015000, 105.527000);

-- Get the inserted User IDs (assuming sequential identity)
DECLARE @Owner1ID INT = (SELECT UserID FROM Users WHERE Email = 'owner1@example.com');
DECLARE @Owner2ID INT = (SELECT UserID FROM Users WHERE Email = 'owner2@example.com');
DECLARE @Owner3ID INT = (SELECT UserID FROM Users WHERE Email = 'owner3@example.com');
DECLARE @Owner4ID INT = (SELECT UserID FROM Users WHERE Email = 'owner4@example.com');
DECLARE @Owner5ID INT = (SELECT UserID FROM Users WHERE Email = 'owner5@example.com');

-- Insert Mock Stores
INSERT INTO [Store] ([UserID], [StoreName], [Description], [StoreEmail], [StorePhone], [ImageUrl], [Address], [Latitude], [Longitude], [IsApproved])
VALUES 
(@Owner1ID, N'Cơm Gà Hòa Lạc', N'Chuyên cơm gà xối mỡ, ngon bổ rẻ cho sinh viên.', 'comga.hoalac@example.com', '0241234561', 'https://images.unsplash.com/photo-1562967914-6cbb241c2b3f', N'Số 10, Thạch Hòa, gần cổng sổ 1 FPTU', 21.013500, 105.526000, 1),
(@Owner2ID, N'Trà Sữa Mixue Hòa Lạc', N'Đồ uống giải khát, kem và trà sữa.', 'mixue.hoalac@example.com', '0241234562', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699', N'Ngã 4 Tân Xã, Thạch Thất, Hà Nội', 21.012000, 105.528000, 1),
(@Owner3ID, N'Bún Chả Hòa Lạc', N'Bún chả gia truyền, đậm đà hương vị Hà Thành.', 'buncha.hoalac@example.com', '0241234563', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43', N'Đường 84, Hạ Bằng, Thạch Thất', 21.014000, 105.530000, 1),
(@Owner4ID, N'Tiệm Bánh Mì Sinh Viên', N'Bánh mì nóng giòn, đa dạng nhân.', 'banhmi.sv@example.com', '0241234564', 'https://images.unsplash.com/photo-1509890267022-44239b568de3', N'Cổng phụ FPT University Hòa Lạc', 21.011000, 105.525000, 1),
(@Owner5ID, N'Café Công Nghệ', N'Không gian yên tĩnh để học tập và code.', 'itcafe@example.com', '0241234565', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb', N'Khu công nghệ cao Hòa Lạc', 21.015000, 105.527000, 1);

COMMIT;
