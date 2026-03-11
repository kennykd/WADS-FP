import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AIResponse } from '../../../types/index';
import { aiRequestSchema } from '../../../lib/validation/ai';

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = aiRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: z.flattenError(parsed.error).fieldErrors },
        { status: 400 },
      );
    }

    const { message, attachments } = parsed.data;

    const attachmentContext = attachments && attachments.length > 0
      ? ` (with ${attachments.length} attachment${attachments.length > 1 ? 's' : ''}: ${attachments.join(', ')})`
      : '';

    const aiResponse: AIResponse = {
      id: crypto.randomUUID(),
      chatResponse: `I've analyzed your input${attachmentContext}. Here's what I found based on: "${message}"`,
      jsonFormat: undefined,
      createdAt: new Date(),
    };

    return NextResponse.json(
      { message: 'AI response generated successfully', aiResponse },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: 'Error generating AI response', error }, { status: 500 });
  }
}
