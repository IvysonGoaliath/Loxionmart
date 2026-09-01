import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],       // [{ service, quantity }]
      businessId: null,
      businessName: '',

      addItem: (service, business) => {
        const { items, businessId } = get()

        // Cart only supports one business at a time
        if (businessId && businessId !== business.id) {
          return { conflict: true, businessName: get().businessName }
        }

        const existing = items.find(i => i.service.id === service.id)
        if (existing) {
          set({ items: items.map(i =>
            i.service.id === service.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )})
        } else {
          set({
            items: [...items, { service, quantity: 1 }],
            businessId: business.id,
            businessName: business.name,
          })
        }
        return { conflict: false }
      },

      removeItem: (serviceId) => {
        const items = get().items.filter(i => i.service.id !== serviceId)
        set({
          items,
          businessId: items.length ? get().businessId : null,
          businessName: items.length ? get().businessName : '',
        })
      },

      updateQuantity: (serviceId, quantity) => {
        if (quantity < 1) { get().removeItem(serviceId); return }
        set({ items: get().items.map(i =>
          i.service.id === serviceId ? { ...i, quantity } : i
        )})
      },

      clearCart: () => set({ items: [], businessId: null, businessName: '' }),

      total: () => get().items.reduce((sum, i) => sum + i.service.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'loxionmart-cart' }
  )
)

export default useCartStore
