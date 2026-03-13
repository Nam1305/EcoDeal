-- Add ResetToken and ResetTokenExpires to Users table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'ResetToken')
BEGIN
    ALTER TABLE Users ADD ResetToken NVARCHAR(255) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'ResetTokenExpires')
BEGIN
    ALTER TABLE Users ADD ResetTokenExpires DATETIME NULL;
END
GO
