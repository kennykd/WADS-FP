import { z } from 'zod';
import { TASK_STATUSES } from '../../types/index';

export const createTaskSchema = z.object({
  title: z.string()
  .min(1, 'Title is required'),
  deadline: z.string()
  .refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Invalid deadline value',
  }),
  status: z.enum(TASK_STATUSES),
  description: z.string()
  .optional(),
  priority: z.number()
  .min(0.5).max(5)
  .optional(),
  attachments: z.array(z.string())
  .optional(),
});

export const updateTaskSchema = z.object({
  title: z.string()
  .min(1)
  .optional(),
  deadline: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: 'Invalid deadline value',
    })
    .optional(),
  status: z.enum(TASK_STATUSES)
  .optional(),
  description: z.string()
  .optional(),
  priority: z.number()
  .min(0.5).max(5)
  .optional(),
  attachments: z.array(z.string())
  .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
