import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateProjectTaskSchema } from '../../../../../lib/validation/project';
import { projects } from '../../route';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    for (const project of projects) {
      const taskIndex = project.tasks.findIndex((task) => task.id === id);

      if (taskIndex !== -1) {
        project.tasks.splice(taskIndex, 1);
        return NextResponse.json({ message: 'Project task deleted successfully' }, { status: 200 });
      }
    }

    return NextResponse.json({ message: 'Project task not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting project task', error }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    let projectIndex = -1;
    let taskIndex = -1;

    for (let i = 0; i < projects.length; i++) {
      const idx = projects[i].tasks.findIndex((task) => task.id === id);

      if (idx !== -1) {
        projectIndex = i;
        taskIndex = idx;
        break;
      }
    }

    if (projectIndex === -1 || taskIndex === -1) {
      return NextResponse.json({ message: 'Project task not found' }, { status: 404 });
    };

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    };

    const parsed = updateProjectTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: z.flattenError(parsed.error).fieldErrors },
        { status: 400 },
      );
    };

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ message: 'No fields provided for update' }, { status: 400 });
    };

    const { ...rest } = parsed.data;

    projects[projectIndex].tasks[taskIndex] = {
      ...projects[projectIndex].tasks[taskIndex],
      ...rest,
      id: projects[projectIndex].tasks[taskIndex].id,
    };

    return NextResponse.json(
      { message: 'Project task updated successfully', task: projects[projectIndex].tasks[taskIndex] },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error updating project task', error }, { status: 500 });
  }
}
