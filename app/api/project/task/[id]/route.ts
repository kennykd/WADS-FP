import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateProjectTaskSchema } from '../../../../../lib/validation/project';
import { projects } from '../../route';

/**
 * @swagger
 * /api/project/task/{id}:
 *   patch:
 *     summary: Update a project task by ID
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique ID of the project task to update
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Finalize project scope (updated)"
 *               description:
 *                 type: string
 *                 example: "Updated task description."
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: medium
 *               status:
 *                 type: string
 *                 enum: [not-done, pending, done]
 *                 example: pending
 *               assignedTo:
 *                 type: string
 *                 example: "member-002"
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["updated-spec.pdf"]
 *               reminder:
 *                 type: string
 *                 enum: [daily, every-3-days, weekly, none]
 *                 example: weekly
 *     responses:
 *       200:
 *         description: Project task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project task updated successfully
 *                 task:
 *                   $ref: '#/components/schemas/ProjectTask'
 *       400:
 *         description: Validation failed, invalid JSON, or no fields provided
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
 *         description: Project task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project task not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating project task
 *   delete:
 *     summary: Delete a project task by ID
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique ID of the project task to delete
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Project task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project task deleted successfully
 *       404:
 *         description: Project task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project task not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error deleting project task
 */

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
