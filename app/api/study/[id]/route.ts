import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateStudySchema } from '../../../../lib/validation/study';
import { studySessions } from '../route';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const index = studySessions.findIndex((session) => session.id === id);

    if (index === -1) {
      return NextResponse.json({ message: 'Study session not found' }, { status: 404 });
    };

    studySessions.splice(index, 1);

    return NextResponse.json({ message: 'Study session deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting study session', error }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const index = studySessions.findIndex((session) => session.id === id);

    if (index === -1) {
      return NextResponse.json({ message: 'Study session not found' }, { status: 404 });
    };

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    };

    const parsed = updateStudySchema.safeParse(body);

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

    studySessions[index] = {
      ...studySessions[index],
      ...rest,
      id: studySessions[index].id
    };

    return NextResponse.json(
      { message: 'Study session updated successfully', studySession: studySessions[index] },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error updating study session', error }, { status: 500 });
  }
}