/*
  Warnings:

  - Added the required column `study_session_name` to the `study_session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "project_user" DROP CONSTRAINT "project_user_project_id_fkey";

-- DropForeignKey
ALTER TABLE "session_timer" DROP CONSTRAINT "session_timer_attachment_id_fkey";

-- DropForeignKey
ALTER TABLE "task_user" DROP CONSTRAINT "task_user_task_id_fkey";

-- AlterTable
ALTER TABLE "session_timer" ALTER COLUMN "attachment_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "study_session" ADD COLUMN     "study_session_description" TEXT,
ADD COLUMN     "study_session_name" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "project_user" ADD CONSTRAINT "project_user_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_user" ADD CONSTRAINT "task_user_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_timer" ADD CONSTRAINT "session_timer_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachment"("attachment_id") ON DELETE SET NULL ON UPDATE CASCADE;
