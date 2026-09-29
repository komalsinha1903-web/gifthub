import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BagItem {
  id: string;
  productId?: string;
  title: string;
  price: number;
  card_value?: number | null;
  image_url: string;
  quantity: number;
}

interface BagStore {
  items: BagItem[];
  addItem: (item: BagItem) => void;
  removeItem: (idOrProductId: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearBag: () => void;
}

export const useBagStore = create<BagStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const current = get().items;
        const index = current.findIndex(
          (i) => i.id === newItem.id || (i.productId === newItem.productId && i.card_value === newItem.card_value)
        );

        if (index > -1) {
          const updated = [...current];
          updated[index].quantity += newItem.quantity;
          set({ items: updated });
        } else {
          set({ items: [...current, newItem] });
        }
      },
      removeItem: (identifier) => {
        set({
          items: get().items.filter(
            (item) => item.id !== identifier && item.productId !== identifier
          ),
        });
      },
      updateQuantity: (id, delta) => {
        set({
          items: get().items
            .map((item) => {
              if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean) as BagItem[],
        });
      },
      clearBag: () => set({ items: [] }),
    }),
    {
      name: 'gifthub-bag-storage',
    }
  )
);