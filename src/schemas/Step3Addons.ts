import { z } from 'zod'

export const ADDON_CATEGORIES = ['workshop', 'meal', 'merchandise'] as const
export type AddonCategory = (typeof ADDON_CATEGORIES)[number]

export const addonSelectionSchema = z.object({
  id: z.string(),
  category: z.enum(ADDON_CATEGORIES),
  size: z.string().optional(),
  quantity: z.number().int().min(1),
})

export const step3Schema = z.object({
  selectedAddons: z.array(addonSelectionSchema),
})

export type AddonSelection = z.infer<typeof addonSelectionSchema>
export type Step3Data = z.infer<typeof step3Schema>
