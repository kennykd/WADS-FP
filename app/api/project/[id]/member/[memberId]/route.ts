import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateProjectMemberSchema } from '../../../../../../lib/validation/project';
import { projects } from '../../../route';

type RouteContext = {
  params: Promise<{
    id: string;
    memberId: string;
  }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id, memberId } = await context.params;

    const projectIndex = projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    };

    const memberIndex = projects[projectIndex].members.findIndex((m) => m.id === memberId);

    if (memberIndex === -1) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    };

    const member = projects[projectIndex].members[memberIndex];

    if (member.role === 'owner') {
      return NextResponse.json({ message: 'Cannot remove the project owner' }, { status: 403 });
    };

    projects[projectIndex].members.splice(memberIndex, 1);

    return NextResponse.json({ message: 'Member removed successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error removing member', error }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id, memberId } = await context.params;

    const projectIndex = projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    };

    const memberIndex = projects[projectIndex].members.findIndex((m) => m.id === memberId);

    if (memberIndex === -1) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    };

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    };

    const parsed = updateProjectMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: z.flattenError(parsed.error).fieldErrors },
        { status: 400 },
      );
    };

    projects[projectIndex].members[memberIndex] = {
      ...projects[projectIndex].members[memberIndex],
      role: parsed.data.role,
    };

    return NextResponse.json(
      { message: 'Member updated successfully', member: projects[projectIndex].members[memberIndex] },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error updating member', error }, { status: 500 });
  }
}
