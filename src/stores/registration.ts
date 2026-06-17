import { reactive } from 'vue'
import type { AddonSelection } from 'src/schemas/Step3Addons'

/**
 * Mutable form state used during wizard editing.
 * All text fields default to empty string; ticketId defaults to empty string
 * (treated as "not yet selected") and validated as a proper TicketId at submit time.
 */
interface RegistrationState {
  ticketId: string
  fullName: string
  email: string
  phone: string
  company: string
  jobTitle: string
  shippingAddress: string
  selectedSessionIds: string[]
  selectedAddons: AddonSelection[]
}

const state = reactive<RegistrationState>({
  ticketId: '',
  fullName: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  shippingAddress: '',
  selectedSessionIds: [],
  selectedAddons: [],
})

/**
 * Returns the shared reactive registration state.
 * Used across all wizard steps for cross-step data access.
 */
export function useRegistration() {
  return state
}
