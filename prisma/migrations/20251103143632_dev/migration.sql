BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [id] NVARCHAR(1000) NOT NULL,
    [firstName] VARCHAR(50) NOT NULL,
    [languages] NVARCHAR(max) NOT NULL,
    [accountStatus] VARCHAR(20) NOT NULL CONSTRAINT [Users_accountStatus_df] DEFAULT 'ACTIVE',
    [mobileVerified] BIT NOT NULL CONSTRAINT [Users_mobileVerified_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Flights] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [sourceAirport] CHAR(3) NOT NULL,
    [destinationAirport] CHAR(3) NOT NULL,
    [travelDate] DATE NOT NULL,
    [flightNumber] VARCHAR(10),
    [dataSource] VARCHAR(20) NOT NULL CONSTRAINT [Flights_dataSource_df] DEFAULT 'MANUAL',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Flights_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Flights_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Conversations] (
    [id] NVARCHAR(1000) NOT NULL,
    [flightId] NVARCHAR(1000) NOT NULL,
    [participant1Id] NVARCHAR(1000) NOT NULL,
    [participant2Id] NVARCHAR(1000) NOT NULL,
    [status] VARCHAR(20) NOT NULL CONSTRAINT [Conversations_status_df] DEFAULT 'ACTIVE',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Conversations_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [closedAt] DATETIME2,
    CONSTRAINT [Conversations_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Conversations_flightId_participant1Id_participant2Id_key] UNIQUE NONCLUSTERED ([flightId],[participant1Id],[participant2Id])
);

-- CreateTable
CREATE TABLE [dbo].[Messages] (
    [id] NVARCHAR(1000) NOT NULL,
    [conversationId] NVARCHAR(1000) NOT NULL,
    [senderId] NVARCHAR(1000) NOT NULL,
    [recipientId] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [sentAt] DATETIME2 NOT NULL CONSTRAINT [Messages_sentAt_df] DEFAULT CURRENT_TIMESTAMP,
    [readAt] DATETIME2,
    CONSTRAINT [Messages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Ratings] (
    [id] NVARCHAR(1000) NOT NULL,
    [flightId] NVARCHAR(1000) NOT NULL,
    [raterId] NVARCHAR(1000) NOT NULL,
    [rateeId] NVARCHAR(1000) NOT NULL,
    [stars] INT NOT NULL,
    [feedback] NVARCHAR(500),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Ratings_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Ratings_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Ratings_flightId_raterId_rateeId_key] UNIQUE NONCLUSTERED ([flightId],[raterId],[rateeId])
);

-- CreateTable
CREATE TABLE [dbo].[Reports] (
    [id] NVARCHAR(1000) NOT NULL,
    [reporterId] NVARCHAR(1000) NOT NULL,
    [reportedUserId] NVARCHAR(1000) NOT NULL,
    [reportType] VARCHAR(30) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [status] VARCHAR(20) NOT NULL CONSTRAINT [Reports_status_df] DEFAULT 'PENDING',
    [priority] VARCHAR(20) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Reports_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [reviewedAt] DATETIME2,
    [reviewedBy] NVARCHAR(1000),
    CONSTRAINT [Reports_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Blocks] (
    [id] NVARCHAR(1000) NOT NULL,
    [blockerId] NVARCHAR(1000) NOT NULL,
    [blockedId] NVARCHAR(1000) NOT NULL,
    [reason] NVARCHAR(500),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Blocks_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Blocks_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Blocks_blockerId_blockedId_key] UNIQUE NONCLUSTERED ([blockerId],[blockedId])
);

-- CreateTable
CREATE TABLE [dbo].[Administrators] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] VARCHAR(255) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Administrators_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdBy] NVARCHAR(1000),
    CONSTRAINT [Administrators_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Administrators_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Users_accountStatus_idx] ON [dbo].[Users]([accountStatus]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Users_mobileVerified_idx] ON [dbo].[Users]([mobileVerified]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Flights_userId_idx] ON [dbo].[Flights]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Flights_sourceAirport_destinationAirport_travelDate_idx] ON [dbo].[Flights]([sourceAirport], [destinationAirport], [travelDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Flights_travelDate_idx] ON [dbo].[Flights]([travelDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Conversations_participant1Id_participant2Id_idx] ON [dbo].[Conversations]([participant1Id], [participant2Id]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Conversations_status_idx] ON [dbo].[Conversations]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Messages_conversationId_sentAt_idx] ON [dbo].[Messages]([conversationId], [sentAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Messages_recipientId_readAt_idx] ON [dbo].[Messages]([recipientId], [readAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Ratings_rateeId_idx] ON [dbo].[Ratings]([rateeId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Reports_status_priority_createdAt_idx] ON [dbo].[Reports]([status], [priority], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Reports_reportedUserId_idx] ON [dbo].[Reports]([reportedUserId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Blocks_blockedId_idx] ON [dbo].[Blocks]([blockedId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Administrators_email_idx] ON [dbo].[Administrators]([email]);

-- AddForeignKey
ALTER TABLE [dbo].[Flights] ADD CONSTRAINT [Flights_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Conversations] ADD CONSTRAINT [Conversations_flightId_fkey] FOREIGN KEY ([flightId]) REFERENCES [dbo].[Flights]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Conversations] ADD CONSTRAINT [Conversations_participant1Id_fkey] FOREIGN KEY ([participant1Id]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Conversations] ADD CONSTRAINT [Conversations_participant2Id_fkey] FOREIGN KEY ([participant2Id]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Messages] ADD CONSTRAINT [Messages_conversationId_fkey] FOREIGN KEY ([conversationId]) REFERENCES [dbo].[Conversations]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Messages] ADD CONSTRAINT [Messages_senderId_fkey] FOREIGN KEY ([senderId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Messages] ADD CONSTRAINT [Messages_recipientId_fkey] FOREIGN KEY ([recipientId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Ratings] ADD CONSTRAINT [Ratings_flightId_fkey] FOREIGN KEY ([flightId]) REFERENCES [dbo].[Flights]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Ratings] ADD CONSTRAINT [Ratings_raterId_fkey] FOREIGN KEY ([raterId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Ratings] ADD CONSTRAINT [Ratings_rateeId_fkey] FOREIGN KEY ([rateeId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reports] ADD CONSTRAINT [Reports_reporterId_fkey] FOREIGN KEY ([reporterId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reports] ADD CONSTRAINT [Reports_reportedUserId_fkey] FOREIGN KEY ([reportedUserId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Reports] ADD CONSTRAINT [Reports_reviewedBy_fkey] FOREIGN KEY ([reviewedBy]) REFERENCES [dbo].[Administrators]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Blocks] ADD CONSTRAINT [Blocks_blockerId_fkey] FOREIGN KEY ([blockerId]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Blocks] ADD CONSTRAINT [Blocks_blockedId_fkey] FOREIGN KEY ([blockedId]) REFERENCES [dbo].[Users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Administrators] ADD CONSTRAINT [Administrators_createdBy_fkey] FOREIGN KEY ([createdBy]) REFERENCES [dbo].[Administrators]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
