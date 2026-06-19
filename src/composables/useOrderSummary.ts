import { ref, computed, onMounted } from 'vue'
import { fetchEvent } from 'src/api/event'
import { fetchAddons } from 'src/api/addons'
import type { TicketType } from 'src/api/event'
import type { Addon } from 'src/api/addons'
import type { AddonSelection } from 'src/schemas/Step3Addons'
import { useRegistration, isVip } from 'src/stores/registration'

/**
 * Shared order summary calculations used by Step3 (sidebar) and Step4 (pricing review).
 * Fetches ticket types and addons on mount; exposes computed pricing derived from registration state.
 */
export function useOrderSummary() {
  const registration = useRegistration()

  const ticketTypes = ref<TicketType[]>([])
  const addons = ref<Addon[]>([])
  const loading = ref(true)

  onMounted(async () => {
    const [ev, adds] = await Promise.all([fetchEvent(), fetchAddons()])
    ticketTypes.value = ev.ticketTypes
    addons.value = adds
    loading.value = false
  })

  const currentTicket = computed(() =>
    ticketTypes.value.find((t) => t.id === registration.attendeeInfo.ticketId),
  )

  const selectedAddonDetails = computed(() =>
    registration.selectedAddons
      .map((sel) => ({ sel, addon: addons.value.find((a) => a.id === sel.id) }))
      .filter(
        (item): item is { sel: AddonSelection; addon: Addon } => !!item.addon,
      ),
  )

  const timedAddonDiscount = computed(() => {
    if (!isVip.value) return 0
    return selectedAddonDetails.value
      .filter(({ addon }) => addon.date && addon.endDate)
      .reduce((sum, { addon, sel }) => sum + addon.price * sel.quantity * 0.1, 0)
  })

  const orderTotal = computed(() => {
    const ticketPrice = currentTicket.value?.price ?? 0
    const addonsTotal = selectedAddonDetails.value.reduce(
      (sum, { addon, sel }) => sum + addon.price * sel.quantity,
      0,
    )
    return ticketPrice + addonsTotal - timedAddonDiscount.value
  })

  return {
    ticketTypes,
    addons,
    loading,
    currentTicket,
    selectedAddonDetails,
    timedAddonDiscount,
    orderTotal,
  }
}
