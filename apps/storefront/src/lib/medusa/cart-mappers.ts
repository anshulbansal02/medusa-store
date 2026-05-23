import type {
  MedusaAddress,
  MedusaCart,
  MedusaShippingOption,
  StorefrontCart,
  StorefrontShippingOption,
} from "@/lib/medusa/cart-types";
import { formatStorePrice } from "@/lib/medusa/client";

function toStorefrontAddress(address?: MedusaAddress | null) {
  if (!address?.address_1) {
    return null;
  }

  return {
    firstName: address.first_name ?? "",
    lastName: address.last_name ?? "",
    phone: address.phone ?? "",
    address1: address.address_1,
    address2: address.address_2 ?? "",
    city: address.city ?? "",
    province: address.province ?? "",
    postalCode: address.postal_code ?? "",
  };
}

export function toStorefrontCart(cart: MedusaCart): StorefrontCart {
  const currencyCode = cart.currency_code ?? "inr";
  const items =
    cart.items?.map((item) => {
      const quantity = item.quantity ?? 0;
      const unitAmount = item.unit_price ?? 0;
      const totalAmount = item.total ?? unitAmount * quantity;
      const handle = item.product_handle ?? "";

      return {
        id: item.id,
        variantId: item.variant_id ?? "",
        name: item.product_title ?? "Product",
        href: handle ? `/shop/${handle}` : "/shop",
        variant: item.variant_title ?? "",
        quantity,
        unitPrice: formatStorePrice(unitAmount, currencyCode) ?? "",
        total: formatStorePrice(totalAmount, currencyCode) ?? "",
        image: item.thumbnail ?? null,
      };
    }) ?? [];

  return {
    id: cart.id,
    email: cart.email ?? "",
    total: formatStorePrice(cart.total ?? 0, currencyCode) ?? "",
    subtotal:
      formatStorePrice(cart.item_total ?? cart.subtotal ?? 0, currencyCode) ??
      "",
    shippingTotal:
      formatStorePrice(cart.shipping_total ?? 0, currencyCode) ?? "",
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    items,
    shippingAddress: toStorefrontAddress(cart.shipping_address),
    selectedShippingOptionId:
      cart.shipping_methods?.[0]?.shipping_option_id ?? null,
  };
}

export function toShippingOption(
  option: MedusaShippingOption,
  currencyCode = "inr",
): StorefrontShippingOption {
  const amount =
    option.calculated_price?.calculated_amount ?? option.amount ?? 0;
  const priceCurrency = option.calculated_price?.currency_code ?? currencyCode;

  return {
    id: option.id,
    name: option.name,
    description: option.type?.description ?? "",
    price: formatStorePrice(amount, priceCurrency) ?? "",
  };
}
