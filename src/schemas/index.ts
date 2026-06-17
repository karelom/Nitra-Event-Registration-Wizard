import { z } from 'zod'
import { step1Schema } from './Step1AttendeeInfo'
import { step2Schema } from './Step2SessionSelection'
import { step3Schema } from './Step3Addons'

const baseSchema = step1Schema
  .extend(step2Schema.shape)
  .extend(step3Schema.shape)

/**
 * Full registration schema combining all steps.
 * Cross-step rules:
 *   - shippingAddress is required when any merchandise addon is selected
 * Time-conflict validation is handled separately in the submit handler
 * because it requires the sessions catalog at runtime.
 */
export const registrationSchema = baseSchema.superRefine((data, ctx) => {
  const hasMerchandise = data.selectedAddons.some(
    (a) => a.category === 'merchandise',
  )
  if (hasMerchandise && !data.shippingAddress?.trim()) {
    ctx.addIssue({
      code: 'custom',
      message:
        'Shipping address is required when merchandise is selected',
      path: ['shippingAddress'],
    })
  }
})

export type RegistrationData = z.infer<typeof registrationSchema>

export { step1Schema, step2Schema, step3Schema }
