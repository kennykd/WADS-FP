import { NextResponse } from 'next/server';
import { z } from 'zod';
import { StudySession } from '../../../types/index';
import { mockStudySessions } from '../../../lib/mock-data';
import { createStudySchema } from '../../../lib/validation/study';

export const studySessions: StudySession[] = mockStudySessions;

export async function GET() {
  try {
    return NextResponse.json(
      { message: 'Study sessions retrieved successfully', studySessions },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving study sessions', error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = createStudySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: z.flattenError(parsed.error).fieldErrors },
        { status: 400 },
      );
    }

    const { taskId, taskTitle, duration, breakDuration, checklist, status, scheduledAt } = parsed.data;

    const newStudySession: StudySession = {
      id: crypto.randomUUID(),
      taskId,
      taskTitle,
      duration: duration ?? 25,
      breakDuration: breakDuration ?? 5,
      checklist,
      status: status ?? 'pending',
      scheduledAt,
    };

    studySessions.push(newStudySession);

    return NextResponse.json(
      { message: 'Study session created successfully', studySession: newStudySession },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error creating study session', error }, { status: 500 });
  }
}