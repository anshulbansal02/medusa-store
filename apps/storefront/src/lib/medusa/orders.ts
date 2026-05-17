import { formatStorePrice, medusaFetch } from "@/lib/medusa/client";

type MedusaOrderItem = {
  id: string;
  title?: string | null;
  quantity?: number;
  unit_price?: number;
  total?: number;
  variant?: {
    title?: string | null;
    product?: {
      handle?: string | null;
      thumbnail?: string | null;
    } | null;
  } | null;
};

type MedusaOrderAddress = {
  first_name?: string | null;
  last_name?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  phone?: string | null;
};

type MedusaOrder = {
  id: string;
  display_id?: number | string | null;
  status?: string | null;
  email?: string | null;
  currency_code?: string | null;
  total?: number | null;
  subtotal?: number | null;
  shipping_total?: number | null;
  tax_total?: number | null;
  discount_total?: number | null;
  created_at?: string | null;
  items?: MedusaOrderItem[];
  shipping_address?: MedusaOrderAddress | null;
};

type MedusaOrderResponse = {
  order?: MedusaOrder;
};

export type StorefrontOrderItem = {
  id: string;
  title: string;
  href: string;
  variant: string;
  quantity: number;
  unitPrice: string;
  total: string;
  image: string | null;
};

export type StorefrontOrderAddress = {
  name: string;
  lines: string[];
  phone: string;
};

export type StorefrontOrder = {
  id: string;
  displayId: string;
  status: string;
  email: string;
  placedAt: string;
  total: string;
  subtotal: string;
  shippingTotal: string;
  taxTotal: string;
  discountAmount: number;
  discountTotal: string;
  items: StorefrontOrderItem[];
  shippingAddress: StorefrontOrderAddress | null;
};

function formatOrderStatus(status?: string | null) {
  if (!status) {
    return "Placed";
  }

  return status
    .split("_")
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function formatOrderDate(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toStorefrontAddress(
  address?: MedusaOrderAddress | null,
): StorefrontOrderAddress | null {
  if (!address?.address_1) {
    return null;
  }

  const name = [address.first_name, address.last_name]
    .filter(Boolean)
    .join(" ");
  const lines = [
    address.address_1,
    address.address_2,
    [address.city, address.province, address.postal_code]
      .filter(Boolean)
      .join(", "),
    address.country_code?.toUpperCase(),
  ].filter((line): line is string => Boolean(line));

  return {
    name,
    lines,
    phone: address.phone ?? "",
  };
}

function toStorefrontOrder(order: MedusaOrder): StorefrontOrder {
  const currencyCode = order.currency_code ?? "inr";
  const items =
    order.items?.map((item) => {
      const quantity = item.quantity ?? 0;
      const unitAmount = item.unit_price ?? 0;
      const totalAmount = item.total ?? unitAmount * quantity;
      const handle = item.variant?.product?.handle ?? "";

      return {
        id: item.id,
        title: item.title ?? "Product",
        href: handle ? `/shop/${handle}` : "/shop",
        variant: item.variant?.title ?? "",
        quantity,
        unitPrice: formatStorePrice(unitAmount, currencyCode) ?? "",
        total: formatStorePrice(totalAmount, currencyCode) ?? "",
        image: item.variant?.product?.thumbnail ?? null,
      };
    }) ?? [];

  return {
    id: order.id,
    displayId: order.display_id ? `#${order.display_id}` : order.id,
    status: formatOrderStatus(order.status),
    email: order.email ?? "",
    placedAt: formatOrderDate(order.created_at),
    total: formatStorePrice(order.total ?? 0, currencyCode) ?? "",
    subtotal: formatStorePrice(order.subtotal ?? 0, currencyCode) ?? "",
    shippingTotal:
      formatStorePrice(order.shipping_total ?? 0, currencyCode) ?? "",
    taxTotal: formatStorePrice(order.tax_total ?? 0, currencyCode) ?? "",
    discountAmount: order.discount_total ?? 0,
    discountTotal:
      formatStorePrice(order.discount_total ?? 0, currencyCode) ?? "",
    items,
    shippingAddress: toStorefrontAddress(order.shipping_address),
  };
}

export async function getOrderById(id: string) {
  const data = await medusaFetch<MedusaOrderResponse>(`/store/orders/${id}`, {
    cache: "no-store",
  });

  return data?.order ? toStorefrontOrder(data.order) : null;
}
