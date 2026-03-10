import { z } from 'zod';

export const createStudySchema = z.object({
  taskId: z.string(),
  taskTitle: z.string()
  .min(1, 'Task title is required')
  .max(100, 'Task title cannot exceed 100 characters'),
  duration: z.coerce.number()
  .min(1, 'Duration must be at least 1 minute'),
  breakDuration: z.coerce.number()
  .min(0, 'Break duration cannot be negative'),
  checklist: z.array(z.object({
    id: z.uuid(),
    text: z.string()
    .min(1, 'Checklist item text is required'),
    completed: z.boolean(),
  })),
  status: z.enum(["pending", "active", "completed"]),
  scheduledAt: z.coerce.date()
  .refine((date) => date >= new Date(),
    { message: "Deadline must be in the future" }
  )
});

export const updateStudySchema = z.object({
  taskId: z.string()
  .optional(),
  taskTitle: z.string()
  .optional(),
  duration: z.coerce.number()
  .min(1, 'Duration must be at least 1 minute')
  .optional(),
  breakDuration: z.coerce.number()
  .min(0, 'Break duration cannot be negative')
  .optional(),
  checklist: z.array(z.object({
    id: z.uuid(),
    text: z.string()
    .min(1, 'Checklist item text is required'),
    completed: z.boolean(),
  }))
  .optional(),
  status: z.enum(["pending", "active", "completed"])
  .optional(),
  scheduledAt: z.coerce.date()
  .refine((date) => date >= new Date(),
    { message: "Deadline must be in the future" }
  )
  .optional()
});

export type CreateStudyInput = z.infer<typeof createStudySchema>;
export type UpdateStudyInput = z.infer<typeof updateStudySchema>;
