import { NextResponse } from 'next/server';
import { z } from 'zod';
import { addProjectMemberSchema } from '../../../../../lib/validation/project';
import { projects } from '../../route';

/**
 * @swagger
 * /api/project/{id}/member:
 *   post:
 *     summary: Add a member to a project
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique ID of the project
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - role
 *             properties:
 *               id:
 *                 type: string
 *                 minLength: 1
 *                 description: The member's user ID
 *                 example: "member-008"
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 example: "Jordan Blake"
 *               handle:
 *                 type: string
 *                 example: "jordan@scholar.plot"
 *               role:
 *                 type: string
 *                 enum: [owner, moderator, member]
 *                 example: member
 *     responses:
 *       201:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Member added successfully
 *                 member:
 *                   $ref: '#/components/schemas/ProjectMember'
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
 *       409:
 *         description: Member already in project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Member already in project
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error adding member
 */

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
