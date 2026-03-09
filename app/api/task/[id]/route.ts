import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateTaskSchema } from '../../../../lib/validation/task';
import { tasks } from '../route';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const index = tasks.findIndex((task) => task.id === id);

    if (index === -1) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    };

    tasks.splice(index, 1);

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting task', error }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const index = tasks.findIndex((task) => task.id === id);

    if (index === -1) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    };

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    };

    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: z.flattenError(parsed.error).fieldErrors },
        { status: 400 },
      );
    };

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ message: 'No fields provided for update' }, { status: 400 });
    };

    const { deadline, ...rest } = parsed.data;

    tasks[index] = {
      ...tasks[index],
      ...rest,
      ...(deadline ? { deadline: new Date(deadline) } : {}),
      id: tasks[index].id,
    };

    return NextResponse.json(
      { message: 'Task updated successfully', task: tasks[index] },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error updating task', error }, { status: 500 });
  }
}