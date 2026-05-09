/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `WebhookEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `WebhookEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WebhookEvent" ADD COLUMN     "eventId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_eventId_key" ON "WebhookEvent"("eventId");
