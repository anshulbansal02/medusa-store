"use client";

import { create } from "zustand";

import type { AddedBagItem } from "@/features/cart/actions";
import type { StorefrontCart } from "@/lib/medusa/cart";

type BagState = {
  cart: StorefrontCart | null;
  isOpen: boolean;
  addedItem: AddedBagItem | null;
  setCart: (cart: StorefrontCart | null) => void;
  openBag: () => void;
  closeBag: () => void;
  setBagOpen: (open: boolean) => void;
  showAddedItem: (item: AddedBagItem | null) => void;
  dismissAddedItem: () => void;
};

export const useBagStore = create<BagState>((set) => ({
  cart: null,
  isOpen: false,
  addedItem: null,
  setCart: (cart) => set({ cart }),
  openBag: () => set({ isOpen: true, addedItem: null }),
  closeBag: () => set({ isOpen: false }),
  setBagOpen: (open) => set({ isOpen: open }),
  showAddedItem: (item) => set({ addedItem: item }),
  dismissAddedItem: () => set({ addedItem: null }),
}));
