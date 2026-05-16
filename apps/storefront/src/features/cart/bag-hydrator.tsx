"use client";

import { useEffect } from "react";

import { useBagStore } from "@/features/cart/bag-store";
import type { StorefrontCart } from "@/lib/medusa/cart";

type BagHydratorProps = {
  cart: StorefrontCart | null;
};

export function BagHydrator({ cart }: BagHydratorProps) {
  const setCart = useBagStore((state) => state.setCart);

  useEffect(() => {
    setCart(cart);
  }, [cart, setCart]);

  return null;
}
