import { z } from 'zod';
import { createTaskSchema } from './task';
import { createStudySchema } from './study';
import { createProjectSchema } from './project';

export const aiRequestSchema = z.object({
  message: z.string()
  .min(1, 'Message is required')
  .max(5000, 'Message cannot exceed 5000 characters'),
  attachments: z.array(z.string())
  .optional(),
});

export const aiResponseSchema = z.object({
  id: z.uuid(),
  chatResponse: z.string(),
  jsonFormat: createTaskSchema
  .or(createStudySchema)
  .or(createProjectSchema)
  .optional(),
  createdAt: z.coerce.date(),
});

export type AIRequestInput = z.infer<typeof aiRequestSchema>;
export type AIResponseData = z.infer<typeof aiResponseSchema>;
