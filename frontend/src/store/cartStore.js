import { create } from 'zustand'
import { persist } from 'zustand/middleware'
// One basket across the mall. Each entry retains its shop for separate fulfilment.
const useCartStore = create(persist((set,get) => ({
  items: [],
  addItem: (service,business,quantity=1) => {
    if (!service.is_available || service.stock_quantity === 0 || service.service_type !== 'product') return { unavailable:true }
    const existing = get().items.find(i=>i.service.id===service.id)
    const nextQuantity = (existing?.quantity||0)+Math.max(1,Math.min(99,Number(quantity)||1))
    if (nextQuantity>99 || (service.stock_quantity!==null && service.stock_quantity!==undefined && nextQuantity>service.stock_quantity)) return { unavailable:true }
    set({ items: existing ? get().items.map(i=>i.service.id===service.id?{service,business,quantity:nextQuantity}:i) : [...get().items,{service,business,quantity:nextQuantity}] })
    return { conflict:false }
  },
  removeItem: id => set({items:get().items.filter(i=>i.service.id!==id)}),
  updateQuantity: (id,n) => { if(n<1){get().removeItem(id);return}set({items:get().items.map(i=>i.service.id===id?{...i,quantity:Math.min(99,Math.max(1,Math.floor(n)))}:i)}) },
  clearCart: () => set({items:[]}),
  clearShop: id => set({items:get().items.filter(i=>i.business.id!==id)}),
  total: () => get().items.reduce((sum,i)=>sum+i.service.price*i.quantity,0),
  count: () => get().items.reduce((sum,i)=>sum+i.quantity,0),
}),{name:'loxionmart-cart',version:1,migrate:state=>({items:(state.items||[]).map(i=>({...i,business:i.business||{id:state.businessId,name:state.businessName}})).filter(i=>i.business?.id)}),partialize:state=>({items:state.items})}))
export default useCartStore
