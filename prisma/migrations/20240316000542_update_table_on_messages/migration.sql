/*
  Warnings:

  - Changed the type of `dateTime` on the `messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `delayTime` on the `messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "messages" DROP COLUMN "dateTime",
ADD COLUMN     "dateTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "delayTime",
ADD COLUMN     "delayTime" BIGINT NOT NULL;
