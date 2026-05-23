export type MedusaCartLineItem = {
  id: string;
  variant_id?: string | null;
  thumbnail?: string | null;
  product_title?: string | null;
  product_handle?: string | null;
  variant_title?: string | null;
  quantity?: number;
  unit_price?: number;
  total?: number;
};

export type MedusaAddress = {
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

export type MedusaShippingMethod = {
  amount?: number;
  shipping_option_id?: string;
};

export type MedusaCart = {
  id: string;
  email?: string | null;
  currency_code?: string;
  total?: number;
  subtotal?: number;
  item_total?: number;
  shipping_total?: number;
  items?: MedusaCartLineItem[];
  shipping_address?: MedusaAddress | null;
  shipping_methods?: MedusaShippingMethod[];
};

export type MedusaCartResponse = {
  cart?: MedusaCart;
};

export type MedusaCartParentResponse = {
  parent?: MedusaCart;
};

export type MedusaShippingOption = {
  id: string;
  name: string;
  amount?: number;
  calculated_price?: {
    calculated_amount?: number;
    currency_code?: string;
  };
  type?: {
    description?: string | null;
  } | null;
};

export type MedusaShippingOptionsResponse = {
  shipping_options?: MedusaShippingOption[];
};

export type CartItem = {
  id: string;
  variantId: string;
  name: string;
  href: string;
  variant: string;
  quantity: number;
  unitPrice: string;
  total: string;
  image: string | null;
};

export type StorefrontCart = {
  id: string;
  email: string;
  total: string;
  subtotal: string;
  shippingTotal: string;
  itemCount: number;
  items: CartItem[];
  shippingAddress: StorefrontAddress | null;
  selectedShippingOptionId: string | null;
};

export type StorefrontAddress = {
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  postalCode: string;
};

export type StorefrontShippingOption = {
  id: string;
  name: string;
  description: string;
  price: string;
};

export type CheckoutAddressPayload = StorefrontAddress & {
  email: string;
};
