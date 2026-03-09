import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Task } from '../../../types/index';
import { mockTasks } from '../../../lib/mock-data';
import { createTaskSchema } from '../../../lib/validation/task';

export const tasks: Task[] = mockTasks;

export async function GET() {
  try {
    return NextResponse.json(
      { message: 'Tasks retrieved successfully', tasks },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving tasks', error }, { status: 500 });
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

    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: z.flattenError(parsed.error).fieldErrors },
        { status: 400 },
      );
    }

    const { title, description, deadline, status, priority, attachments } = parsed.data;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description: description ?? '',
      deadline: new Date(deadline),
      status: status ?? 'todo',
      priority: priority ?? 3,
      attachments: attachments ?? [],
      createdAt: new Date(),
    };

    tasks.push(newTask);

    return NextResponse.json(
      { message: 'Task created successfully', task: newTask },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error creating task', error }, { status: 500 });
  }
}