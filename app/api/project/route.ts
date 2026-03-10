import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Project } from '../../../types/index';
import { mockProjects } from '../../../lib/mock-data';
import { createProjectSchema } from '../../../lib/validation/project';

export const projects: Project[] = mockProjects;

export async function GET() {
  try {
    return NextResponse.json(
      { message: 'Projects retrieved successfully', projects },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error retrieving projects', error }, { status: 500 });
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

    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: z.flattenError(parsed.error).fieldErrors },
        { status: 400 },
      );
    }

    const { name, description, ownerId, members } = parsed.data;

    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      ownerId,
      members: members ?? [],
      tasks: [],
      createdAt: new Date(),
    };

    projects.push(newProject);

    return NextResponse.json(
      { message: 'Project created successfully', project: newProject },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error creating project', error }, { status: 500 });
  }
}
