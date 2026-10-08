import { z } from 'zod';
import { availabilitySchema, confidenceSchema } from './schema';
import { readAtlasData } from './data-loader';

export const guideSectionSchema = z.enum([
  'missions',
  'equipment',
  'traders',
  'workshop',
  'trials',
  'skills',
  'customization',
  'decks',
  'science',
]);
export type GuideSection = z.infer<typeof guideSectionSchema>;
const wikiUrl = z.url().refine((url) => url.startsWith('https://arcraiders.wiki/'));
export const categoryGuidesSchema = z
  .object({
    checkedAt: z.iso.date(),
    sections: z
      .array(
        z
          .object({
            id: guideSectionSchema,
            title: z.string().min(1),
            subtitle: z.string().min(1),
            intro: z.string().min(1),
            note: z.string().min(1),
            sourceUrl: wikiUrl,
            entries: z
              .array(
                z
                  .object({
                    id: z.string().min(1),
                    title: z.string().min(1),
                    text: z.string().min(1),
                    details: z.array(z.string().min(1)),
                    confidence: confidenceSchema,
                    availability: availabilitySchema,
                    sourceUrl: wikiUrl,
                  })
                  .strict(),
              )
              .min(1),
          })
          .strict(),
      )
      .length(9),
  })
  .strict()
  .superRefine((data, context) => {
    if (new Set(data.sections.map((section) => section.id)).size !== 9)
      context.addIssue({ code: 'custom', message: 'Las nueve secciones deben ser únicas.' });
    for (const section of data.sections)
      if (new Set(section.entries.map((entry) => entry.id)).size !== section.entries.length)
        context.addIssue({ code: 'custom', message: `Entradas repetidas en ${section.id}.` });
  });

export const categoryGuides = categoryGuidesSchema.parse(readAtlasData('category-guides.json'));
