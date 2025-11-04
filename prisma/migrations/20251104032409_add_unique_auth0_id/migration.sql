/*
  Warnings:

  - A unique constraint covering the columns `[auth0Id]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auth0Id` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Users] ADD [auth0Id] NVARCHAR(1000) NOT NULL;

-- CreateIndex
ALTER TABLE [dbo].[Users] ADD CONSTRAINT [Users_auth0Id_key] UNIQUE NONCLUSTERED ([auth0Id]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
