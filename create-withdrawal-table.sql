USE EcoDeal;
GO

CREATE TABLE [WithdrawalRequests] (
    RequestID       int IDENTITY(1,1) NOT NULL,
    UserID          int NOT NULL,
    Amount          decimal(18,2) NOT NULL,
    BankName        nvarchar(255) NOT NULL,
    AccountNumber   nvarchar(100) NOT NULL,
    AccountHolder   nvarchar(255) NOT NULL,
    Status          nvarchar(50) DEFAULT 'Pending', -- Pending, Approved, Rejected
    AdminNote       nvarchar(500) NULL,
    CreatedAt       datetime DEFAULT GETDATE(),
    ProcessedAt     datetime NULL,
    PRIMARY KEY (RequestID),
    CONSTRAINT FK_WithdrawalRequests_User FOREIGN KEY (UserID) REFERENCES [Users] (UserID)
);
GO
