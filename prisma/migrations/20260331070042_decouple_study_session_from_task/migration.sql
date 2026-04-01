-- DropForeignKey
ALTER TABLE "session_timer" DROP CONSTRAINT "session_timer_task_id_fkey";

-- AlterTable
ALTER TABLE "session_timer" ALTER COLUMN "task_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "session_timer" ADD CONSTRAINT "session_timer_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("task_id") ON DELETE SET NULL ON UPDATE CASCADE;
