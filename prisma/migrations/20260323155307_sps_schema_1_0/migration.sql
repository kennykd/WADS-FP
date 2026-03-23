/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Todo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Verification` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('active', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "ProjectUserRole" AS ENUM ('owner', 'moderator', 'member');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('Completed', 'In Progress', 'Pending');

-- CreateEnum
CREATE TYPE "SessionTimerStatus" AS ENUM ('idle', 'running', 'paused', 'completed');

-- CreateEnum
CREATE TYPE "ReminderIntervalType" AS ENUM ('hours', 'days', 'weeks', 'fixed', 'custom');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('reminder', 'deadline-approaching', 'timer-complete');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "Todo" DROP CONSTRAINT "Todo_userId_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "Todo";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Verification";

-- CreateTable
CREATE TABLE "user" (
    "user_id" TEXT NOT NULL,
    "analytics_id" INTEGER,
    "user_name" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "avatar_url" TEXT,
    "user_role" "UserRole" NOT NULL DEFAULT 'user',
    "user_last_login" TIMESTAMP(3) NOT NULL,
    "user_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "project" (
    "project_id" SERIAL NOT NULL,
    "project_name" TEXT NOT NULL,
    "project_description" TEXT,
    "project_deadline" TIMESTAMP(3) NOT NULL,
    "project_status" "ProjectStatus" NOT NULL DEFAULT 'active',
    "project_priority" DECIMAL(2,1) NOT NULL,
    "project_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "project_user" (
    "project_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "project_user_role" "ProjectUserRole" NOT NULL,

    CONSTRAINT "project_user_pkey" PRIMARY KEY ("project_id","user_id")
);

-- CreateTable
CREATE TABLE "task" (
    "task_id" SERIAL NOT NULL,
    "project_id" INTEGER,
    "task_name" TEXT NOT NULL,
    "task_description" TEXT,
    "task_deadline" TIMESTAMP(3) NOT NULL,
    "task_priority" DECIMAL(2,1) NOT NULL,
    "task_status" "TaskStatus" NOT NULL DEFAULT 'Pending',
    "task_completed_at" TIMESTAMP(3),
    "task_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE "task_user" (
    "task_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_user_pkey" PRIMARY KEY ("task_id","user_id")
);

-- CreateTable
CREATE TABLE "attachment" (
    "attachment_id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "attachment_uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateTable
CREATE TABLE "study_session" (
    "study_session_id" SERIAL NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 25,
    "break_duration" INTEGER NOT NULL DEFAULT 5,
    "study_session_scheduled_at" TIMESTAMP(3) NOT NULL,
    "study_session_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checklist_json" JSONB NOT NULL,

    CONSTRAINT "study_session_pkey" PRIMARY KEY ("study_session_id")
);

-- CreateTable
CREATE TABLE "session_timer" (
    "session_timer_id" SERIAL NOT NULL,
    "study_session_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,
    "attachment_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_timer_pkey" PRIMARY KEY ("session_timer_id")
);

-- CreateTable
CREATE TABLE "session_timer_user" (
    "study_session_id" INTEGER NOT NULL,
    "session_timer_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL,
    "current_time" INTEGER NOT NULL DEFAULT 0,
    "status" "SessionTimerStatus" NOT NULL DEFAULT 'idle',
    "completed_at" TIMESTAMP(3),
    "actual_duration" INTEGER,

    CONSTRAINT "session_timer_user_pkey" PRIMARY KEY ("study_session_id","session_timer_id","user_id")
);

-- CreateTable
CREATE TABLE "study_session_reminder" (
    "reminder_id" SERIAL NOT NULL,
    "session_timer_id" INTEGER NOT NULL,
    "interval_type" "ReminderIntervalType" NOT NULL,
    "interval_value" INTEGER,
    "remind_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "reminder_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_session_reminder_pkey" PRIMARY KEY ("reminder_id")
);

-- CreateTable
CREATE TABLE "task_reminder" (
    "reminder_id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "interval_type" "ReminderIntervalType" NOT NULL,
    "interval_value" INTEGER,
    "remind_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "reminder_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_reminder_pkey" PRIMARY KEY ("reminder_id")
);

-- CreateTable
CREATE TABLE "alert" (
    "alert_id" SERIAL NOT NULL,
    "study_session_reminder_id" INTEGER,
    "task_reminder_id" INTEGER,
    "alert_type" "AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "message_deadline" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_pkey" PRIMARY KEY ("alert_id")
);

-- CreateTable
CREATE TABLE "analytics" (
    "analytics_id" SERIAL NOT NULL,
    "tasks_completed_early" INTEGER NOT NULL DEFAULT 0,
    "tasks_completed_on_time" INTEGER NOT NULL DEFAULT 0,
    "tasks_completed_late" INTEGER NOT NULL DEFAULT 0,
    "tasks_pending" INTEGER NOT NULL DEFAULT 0,
    "total_focus_minutes" INTEGER NOT NULL DEFAULT 0,
    "total_tasks_completed" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("analytics_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_analytics_id_key" ON "user"("analytics_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_user_email_key" ON "user"("user_email");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_analytics_id_fkey" FOREIGN KEY ("analytics_id") REFERENCES "analytics"("analytics_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_user" ADD CONSTRAINT "project_user_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_user" ADD CONSTRAINT "project_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_user" ADD CONSTRAINT "task_user_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_user" ADD CONSTRAINT "task_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_timer" ADD CONSTRAINT "session_timer_study_session_id_fkey" FOREIGN KEY ("study_session_id") REFERENCES "study_session"("study_session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_timer" ADD CONSTRAINT "session_timer_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_timer" ADD CONSTRAINT "session_timer_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachment"("attachment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_timer_user" ADD CONSTRAINT "session_timer_user_study_session_id_fkey" FOREIGN KEY ("study_session_id") REFERENCES "study_session"("study_session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_timer_user" ADD CONSTRAINT "session_timer_user_session_timer_id_fkey" FOREIGN KEY ("session_timer_id") REFERENCES "session_timer"("session_timer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_timer_user" ADD CONSTRAINT "session_timer_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_session_reminder" ADD CONSTRAINT "study_session_reminder_session_timer_id_fkey" FOREIGN KEY ("session_timer_id") REFERENCES "session_timer"("session_timer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_reminder" ADD CONSTRAINT "task_reminder_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_study_session_reminder_id_fkey" FOREIGN KEY ("study_session_reminder_id") REFERENCES "study_session_reminder"("reminder_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_task_reminder_id_fkey" FOREIGN KEY ("task_reminder_id") REFERENCES "task_reminder"("reminder_id") ON DELETE SET NULL ON UPDATE CASCADE;
