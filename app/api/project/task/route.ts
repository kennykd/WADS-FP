import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ProjectTask } from '../../../../types/index';
import { createProjectTaskSchema } from '../../../../lib/validation/project';
import { projects } from '../route';

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = createProjectTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: z.flattenError(parsed.error).fieldErrors },
        { status: 400 },
      );
    }

    const { projectId, title, description, priority, status, assignedTo, attachments, reminder } = parsed.data;

    const projectIndex = projects.findIndex((p) => p.id === projectId);

    if (projectIndex === -1) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    };

    const newTask: ProjectTask = {
      id: crypto.randomUUID(),
      title,
      description,
      priority,
      status,
      assignedTo,
      attachments,
      reminder,
      createdAt: new Date(),
    };

    projects[projectIndex].tasks.push(newTask);

    return NextResponse.json(
      { message: 'Project task created successfully', task: newTask },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error creating project task', error }, { status: 500 });
  }
}
