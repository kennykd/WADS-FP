import { NextResponse } from 'next/server';
import { z } from 'zod';
import { addProjectMemberSchema } from '../../../../../lib/validation/project';
import { projects } from '../../route';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const projectIndex = projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    };

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = addProjectMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: z.flattenError(parsed.error).fieldErrors },
        { status: 400 },
      );
    }

    const { id: memberId, name, handle, role } = parsed.data;

    const alreadyMember = projects[projectIndex].members.some((m) => m.id === memberId);

    if (alreadyMember) {
      return NextResponse.json({ message: 'Member already in project' }, { status: 409 });
    };

    const newMember = { id: memberId, name, handle, role };

    projects[projectIndex].members.push(newMember);

    return NextResponse.json(
      { message: 'Member added successfully', member: newMember },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error adding member', error }, { status: 500 });
  }
}
