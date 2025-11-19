import { z } from 'zod';

// Zod schema for structured 4-step pipeline output
export const DecisionZ = z.object({
  emotion: z.string().min(1),
  hex: z
    .string()
    .regex(/^#?[0-9a-fA-F]{6}$/)
    .transform((s) => (s.startsWith('#') ? s.toUpperCase() : `#${s.toUpperCase()}`)),
  temperature_celsius: z.number().min(-20).max(50),
  humidity_percent: z.number().min(0).max(100),
  music_title: z.string().min(1),
  music_artist: z.string().optional().default(''),
  lighting_mode: z.enum(['RGB', 'TEMP']),
  lighting_r: z.number().int().min(0).max(255).nullable().optional(),
  lighting_g: z.number().int().min(0).max(255).nullable().optional(),
  lighting_b: z.number().int().min(0).max(255).nullable().optional(),
  lighting_temp_k: z.number().int().min(2700).max(6500).nullable().optional(),
  similarity_reason: z.string().optional().default(''),
});

// JSON Schema for OpenAI tool parameters
export function toJsonSchema() {
  return {
    type: 'object',
    properties: {
      emotion: { type: 'string' },
      hex: { type: 'string', pattern: '^#?[0-9a-fA-F]{6}$' },
      temperature_celsius: { type: 'number', minimum: -20, maximum: 50 },
      humidity_percent: { type: 'number', minimum: 0, maximum: 100 },
      music_title: { type: 'string' },
      music_artist: { type: 'string' },
      lighting_mode: { type: 'string', enum: ['RGB', 'TEMP'] },
      lighting_r: { type: ['integer', 'null'], minimum: 0, maximum: 255 },
      lighting_g: { type: ['integer', 'null'], minimum: 0, maximum: 255 },
      lighting_b: { type: ['integer', 'null'], minimum: 0, maximum: 255 },
      lighting_temp_k: { type: ['integer', 'null'], minimum: 2700, maximum: 6500 },
      similarity_reason: { type: 'string' },
    },
    required: [
      'emotion',
      'hex',
      'temperature_celsius',
      'humidity_percent',
      'music_title',
      'lighting_mode',
    ],
    additionalProperties: false,
  };
}

