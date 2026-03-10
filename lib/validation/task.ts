import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string()
  .min(1, 'Title is required')
  .max(100, 'Title cannot exceed 100 characters'),
  description: z.string()
  .optional(),
  deadline: z.coerce.date()
  .refine((date) => date >= new Date(),
    { message: "Deadline must be in the future" }
  ),
  status: z.enum(["todo", "in-progress", "done"]),
  priority: z.coerce.number()
  .min(0.5).max(5)
  .optional(),
  attachments: z.array(z.string())
  .optional(),
  reminder: z.enum(["daily", "every-3-days", "weekly", "none"])
  .optional()
});

export const updateTaskSchema = z.object({
  title: z.string()
  .min(1, 'Title is required')
  .max(100, 'Title cannot exceed 100 characters')
  .optional(),
  deadline: z.coerce.date()
  .refine((date) => date >= new Date(),
    { message: "Deadline must be in the future" }
  )
  .optional(),
  status: z.enum(["todo", "in-progress", "done"])
  .optional(),
  description: z.string()
  .optional(),
  priority: z.coerce.number()
  .min(0.5).max(5)
  .optional(),
  attachments: z.array(z.string())
  .optional(),
  reminder: z.enum(["daily", "every-3-days", "weekly", "none"])
  .optional()
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
