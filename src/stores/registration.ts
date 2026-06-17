import { reactive } from 'vue'

interface AttendeeInfo {
  fullName: string
  email: string
  phone: string
  company: string
  jobTitle: string
  shippingAddress: string
}

export interface AddonSelection {
  id: string
  size?: string
  quantity: number
}

interface RegistrationState {
  attendee: AttendeeInfo
  ticketId: string | null
  selectedSessionIds: string[]
  selectedAddons: AddonSelection[]
}

const state = reactive<RegistrationState>({
  attendee: {
    fullName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    shippingAddress: '',
  },
  ticketId: null,
  selectedSessionIds: [],
  selectedAddons: [],
})

export function useRegistration() {
  return state
}
