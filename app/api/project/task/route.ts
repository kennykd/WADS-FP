import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ProjectTask } from '../../../../types/index';
import { createProjectTaskSchema } from '../../../../lib/validation/project';
import { projects } from '../route';

/**
 * @swagger
 * /api/project/task:
 *   post:
 *     summary: Create a new task within a project
 *     tags:
 *       - Projects
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - title
 *               - priority
 *               - status
 *             properties:
 *               projectId:
 *                 type: string
 *                 minLength: 1
 *                 description: ID of the project to add the task to
 *                 example: "project-001"
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Finalize project scope"
 *               description:
 *                 type: string
 *                 example: "Lock requirements and success criteria for the MVP."
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: high
 *               status:
 *                 type: string
 *                 enum: [not-done, pending, done]
 *                 example: not-done
 *               assignedTo:
 *                 type: string
 *                 description: Member ID to assign the task to
 *                 example: "member-003"
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["spec.pdf"]
 *               reminder:
 *                 type: string
 *                 enum: [daily, every-3-days, weekly, none]
 *                 example: daily
 *     responses:
 *       201:
 *         description: Project task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project task created successfully
 *                 task:
 *                   $ref: '#/components/schemas/ProjectTask'
 *       400:
 *         description: Validation failed or invalid JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: string
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error creating project task
 */

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
