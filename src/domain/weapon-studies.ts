import { z } from 'zod';
import raw from '../../public/weapons3d/catalog.json';
const filename = z.string().regex(/^[a-z0-9-]+\.(js|svg)$/);
export const weaponStudiesSchema = z
  .array(
    z
      .object({
        entityId: z.string().regex(/^weapon-[a-z0-9-]+$/),
        name: z.string(),
        file: filename,
        profile: filename,
        preview: filename,
      })
      .strict(),
  )
  .length(24)
  .superRefine((rows, ctx) => {
    if (new Set(rows.map((row) => row.entityId)).size !== 24)
      ctx.addIssue({ code: 'custom', message: 'Estudios repetidos' });
  });
export const weaponStudies = weaponStudiesSchema.parse(raw);
export const weaponStudyFor = (id: string) => weaponStudies.find((study) => study.entityId === id);
export interface WeaponViewerController {
  setSpin: (value: boolean) => void;
  profile: () => void;
  reset: () => void;
  setVisible: (value: boolean) => void;
  dispose: () => void;
}
export interface WeaponViewerModule {
  createWeaponViewer: (
    host: HTMLElement,
    design: unknown,
    callbacks: { onReady: () => void; onFallback: () => void; onSpin: (value: boolean) => void },
  ) => WeaponViewerController | null;
}
