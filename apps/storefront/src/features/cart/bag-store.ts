"use client";

import { create } from "zustand";

import type { AddedBagItem } from "@/features/cart/actions";
import type { StorefrontCart } from "@/lib/medusa/cart";

export type AddedItemToastPlacement = "bottom" | "top";

type BagState = {
  cart: StorefrontCart | null;
  isOpen: boolean;
  addedItem: AddedBagItem | null;
  addedItemToastPlacement: AddedItemToastPlacement;
  setCart: (cart: StorefrontCart | null) => void;
  openBag: () => void;
  closeBag: () => void;
  setBagOpen: (open: boolean) => void;
  showAddedItem: (
    item: AddedBagItem | null,
    placement?: AddedItemToastPlacement,
  ) => void;
  dismissAddedItem: () => void;
};

export const useBagStore = create<BagState>((set) => ({
  cart: null,
  isOpen: false,
  addedItem: null,
  addedItemToastPlacement: "bottom",
  setCart: (cart) => set({ cart }),
  openBag: () => set({ isOpen: true, addedItem: null }),
  closeBag: () => set({ isOpen: false }),
  setBagOpen: (open) => set({ isOpen: open }),
  showAddedItem: (item, placement = "bottom") =>
    set({ addedItem: item, addedItemToastPlacement: placement }),
  dismissAddedItem: () => set({ addedItem: null }),
}));
