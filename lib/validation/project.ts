import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string()
  .min(1, 'Project name is required')
  .max(100, 'Project name cannot exceed 100 characters'),
  description: z.string()
  .optional(),
  ownerId: z.string()
  .min(1, 'Owner ID is required'),
  members: z.array(z.object({
    id: z.string(),
    name: z.string()
    .min(1, 'Member name is required'),
    handle: z.string()
    .optional(),
    role: z.enum(['owner', 'moderator', 'member']),
  }))
  .optional(),
});

export const updateProjectSchema = z.object({
  name: z.string()
  .min(1, 'Project name is required')
  .max(100, 'Project name cannot exceed 100 characters')
  .optional(),
  description: z.string()
  .optional(),
  members: z.array(z.object({
    id: z.string(),
    name: z.string()
    .min(1, 'Member name is required'),
    handle: z.string()
    .optional(),
    role: z.enum(['owner', 'moderator', 'member']),
  }))
  .optional(),
});

export const createProjectTaskSchema = z.object({
  projectId: z.string()
  .min(1, 'Project ID is required'),
  title: z.string()
  .min(1, 'Title is required')
  .max(100, 'Title cannot exceed 100 characters'),
  description: z.string()
  .optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['not-done', 'pending', 'done']),
  assignedTo: z.string()
  .optional(),
  attachments: z.array(z.string())
  .optional(),
  reminder: z.enum(['daily', 'every-3-days', 'weekly', 'none'])
  .optional(),
});

export const updateProjectTaskSchema = z.object({
  title: z.string()
  .min(1, 'Title is required')
  .max(100, 'Title cannot exceed 100 characters')
  .optional(),
  description: z.string()
  .optional(),
  priority: z.enum(['low', 'medium', 'high'])
  .optional(),
  status: z.enum(['not-done', 'pending', 'done'])
  .optional(),
  assignedTo: z.string()
  .optional(),
  attachments: z.array(z.string())
  .optional(),
  reminder: z.enum(['daily', 'every-3-days', 'weekly', 'none'])
  .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateProjectTaskInput = z.infer<typeof createProjectTaskSchema>;
export type UpdateProjectTaskInput = z.infer<typeof updateProjectTaskSchema>;
