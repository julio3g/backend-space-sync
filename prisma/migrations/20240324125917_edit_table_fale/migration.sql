-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_messageId_fkey";

-- AlterTable
ALTER TABLE "files" ALTER COLUMN "messageId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
