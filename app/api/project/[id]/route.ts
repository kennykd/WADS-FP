import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateProjectSchema } from '../../../../lib/validation/project';
import { projects } from '../route';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const index = projects.findIndex((project) => project.id === id);

    if (index === -1) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    };

    projects.splice(index, 1);

    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting project', error }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const index = projects.findIndex((project) => project.id === id);

    if (index === -1) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    };

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    };

    const parsed = updateProjectSchema.safeParse(body);

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

    projects[index] = {
      ...projects[index],
      ...rest,
      id: projects[index].id,
    };

    return NextResponse.json(
      { message: 'Project updated successfully', project: projects[index] },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error updating project', error }, { status: 500 });
  }
}
