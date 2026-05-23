import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  pixelBasedPreset,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "react-email";
import type { ReactNode } from "react";

export type OrderEmailItem = {
  title?: string | null;
  subtitle?: string | null;
  product_title?: string | null;
  thumbnail?: string | null;
  quantity?: number | null;
  total?: number | null;
};

export type OrderPlacedEmailData = {
  id?: string | null;
  display_id?: string | number | null;
  email?: string | null;
  currency_code?: string | null;
  total?: number | null;
  subtotal?: number | null;
  shipping_total?: number | null;
  tax_total?: number | null;
  discount_total?: number | null;
  items?: OrderEmailItem[] | null;
};

type OrderPlacedEmailProps = {
  order: OrderPlacedEmailData;
  orderUrl?: string | null;
};

const emailTailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        email: {
          accent: "#9f2d3d",
          accentDark: "#7f2431",
          background: "#f7f1ee",
          border: "#e6d8d1",
          faint: "#9a8a83",
          inset: "#f3ebe6",
          panel: "#fffaf7",
          text: "#2a211e",
          muted: "#776760",
        },
      },
      fontFamily: {
        body: ["Arial", "sans-serif"],
        heading: ["Georgia", "serif"],
      },
      fontSize: {
        emailMicro: "11px",
        emailTiny: "12px",
        emailSmall: "13px",
        emailBase: "14px",
        emailBody: "15px",
        emailTotal: "16px",
        emailOwnerTitle: "30px",
        emailTitle: "36px",
      },
      letterSpacing: {
        emailLabel: "1.3px",
        emailBrand: "2.2px",
      },
      lineHeight: {
        emailBody: "22px",
        emailButton: "44px",
        emailOwnerTitle: "32px",
        emailTitle: "38px",
      },
    },
  },
};

function formatPrice(amount?: number | null, currencyCode = "inr") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

export function getOrderNumber(order: OrderPlacedEmailData) {
  return order.display_id ? `#${order.display_id}` : order.id;
}

function getItemTitle(item: OrderEmailItem) {
  return item.product_title ?? item.subtitle ?? item.title ?? "Product";
}

function Summary({
  order,
  currencyCode,
}: {
  order: OrderPlacedEmailData;
  currencyCode: string;
}) {
  return (
    <Section className="mt-6 border border-email-border bg-email-inset p-4">
      <Row>
        <Column>
          <Text className="m-0 mb-1 font-bold text-emailMicro text-email-faint uppercase tracking-emailLabel">
            Order
          </Text>
          <Text className="m-0 font-bold text-emailBody text-email-text">
            {getOrderNumber(order)}
          </Text>
        </Column>
        <Column>
          <Text className="m-0 mb-1 font-bold text-emailMicro text-email-faint uppercase tracking-emailLabel">
            Total
          </Text>
          <Text className="m-0 font-bold text-emailBody text-email-text">
            {formatPrice(order.total, currencyCode)}
          </Text>
        </Column>
        <Column>
          <Text className="m-0 mb-1 font-bold text-emailMicro text-email-faint uppercase tracking-emailLabel">
            Payment
          </Text>
          <Text className="m-0 font-bold text-emailBody text-email-text">
            Prepaid
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text className="m-0 mb-[14px] font-bold text-emailSmall text-email-text uppercase tracking-emailLabel">
      {children}
    </Text>
  );
}

function OrderItems({
  order,
  currencyCode,
}: {
  order: OrderPlacedEmailData;
  currencyCode: string;
}) {
  return (
    <Section className="mt-[30px]">
      <SectionTitle>Your pieces</SectionTitle>
      {order.items?.map((item, index) => {
        const title = getItemTitle(item);

        return (
          <Row
            key={`${title}-${index}`}
            className="border-email-border border-b"
          >
            <Column className="w-14 py-[14px] pr-[14px]">
              {item.thumbnail ? (
                <Img
                  src={item.thumbnail}
                  alt={title}
                  width="56"
                  height="70"
                  className="block object-cover"
                />
              ) : (
                <Section className="h-[70px] w-14 border border-email-border bg-email-inset" />
              )}
            </Column>
            <Column className="py-[14px]">
              <Text className="m-0 font-bold text-emailBody text-email-text">
                {title}
              </Text>
              <Text className="m-0 mt-1 text-emailSmall text-email-muted">
                Qty {item.quantity ?? 0}
              </Text>
            </Column>
            <Column className="py-[14px] text-right">
              <Text className="m-0 text-email-text">
                {formatPrice(item.total, currencyCode)}
              </Text>
            </Column>
          </Row>
        );
      })}
    </Section>
  );
}

function Totals({
  order,
  currencyCode,
}: {
  order: OrderPlacedEmailData;
  currencyCode: string;
}) {
  return (
    <Section className="mt-5">
      <TotalRow
        label="Subtotal"
        value={formatPrice(order.subtotal, currencyCode)}
      />
      <TotalRow
        label="Shipping"
        value={formatPrice(order.shipping_total, currencyCode)}
      />
      <TotalRow label="Tax" value={formatPrice(order.tax_total, currencyCode)} />
      <Row>
        <Column>
          <Text className="m-0 mt-2 font-bold text-emailTotal text-email-text">
            Total
          </Text>
        </Column>
        <Column>
          <Text className="m-0 mt-2 text-right font-bold text-emailTotal text-email-text">
            {formatPrice(order.total, currencyCode)}
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <Row>
      <Column>
        <Text className="m-0 text-emailBase text-email-muted">{label}</Text>
      </Column>
      <Column>
        <Text className="m-0 text-right text-emailBase text-email-text">
          {value}
        </Text>
      </Column>
    </Row>
  );
}

function NextSteps() {
  return (
    <Section className="mt-7">
      <SectionTitle>What happens next</SectionTitle>
      <Text className="m-0 mb-2 text-emailBase leading-emailBody text-email-muted">
        The store team will review your order, prepare your pieces, and email
        you again when dispatch is ready.
      </Text>
      <Text className="m-0 text-emailBase leading-emailBody text-email-muted">
        Keep this email for your order number if you need help with sizing,
        shipping, or returns.
      </Text>
    </Section>
  );
}

export function CustomerOrderPlacedEmail({
  order,
  orderUrl,
}: OrderPlacedEmailProps) {
  const currencyCode = order.currency_code ?? "inr";
  const orderNumber = getOrderNumber(order);
  const preview = `Order ${orderNumber ?? ""} confirmed. Total ${formatPrice(order.total, currencyCode)}.`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind config={emailTailwindConfig}>
        <Body className="m-0 bg-email-background font-body text-email-text">
          <Container className="mx-auto max-w-[640px] px-4 py-7">
            <Section className="border border-email-border bg-email-panel p-[30px]">
              <Text className="m-0 mb-[18px] font-bold text-emailTiny text-email-accent uppercase tracking-emailBrand">
                The Label
              </Text>
              <Heading
                as="h1"
                className="m-0 font-heading font-normal text-emailTitle leading-emailTitle text-email-text"
              >
                Order confirmed
              </Heading>
              <Text className="m-0 mt-4 text-emailBase leading-emailBody text-email-muted">
                We have received your order
                {orderNumber ? ` ${orderNumber}` : ""}. Here is your receipt
                and what happens next.
              </Text>

              <Summary order={order} currencyCode={currencyCode} />

              {orderUrl ? (
                <Section className="mt-[22px]">
                  <Button
                    href={orderUrl}
                    className="inline-block bg-email-accentDark px-[22px] font-bold text-emailBase leading-emailButton text-white no-underline"
                  >
                    View order
                  </Button>
                </Section>
              ) : null}

              <OrderItems order={order} currencyCode={currencyCode} />
              <Totals order={order} currencyCode={currencyCode} />
              <Hr className="my-7 border-email-border" />
              <NextSteps />

              <Text className="m-0 mt-7 text-emailBase leading-emailBody text-email-muted">
                For support, reply to this email with your order number.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export function OwnerOrderPlacedEmail({ order }: OrderPlacedEmailProps) {
  const currencyCode = order.currency_code ?? "inr";
  const orderNumber = getOrderNumber(order);
  const preview = `New order${orderNumber ? ` ${orderNumber}` : ""} from ${order.email ?? "guest customer"}.`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind config={emailTailwindConfig}>
        <Body className="m-0 bg-email-background font-body text-email-text">
          <Container className="mx-auto max-w-[640px] px-4 py-7">
            <Section className="border border-email-border bg-email-panel p-7">
              <Text className="m-0 mb-[18px] font-bold text-emailTiny text-email-accent uppercase tracking-emailBrand">
                The Label Admin
              </Text>
              <Heading
                as="h1"
                className="m-0 font-heading font-normal text-emailOwnerTitle leading-emailOwnerTitle text-email-text"
              >
                New order received
              </Heading>
              <Text className="m-0 mt-4 text-emailBase leading-emailBody text-email-muted">
                Order{orderNumber ? ` ${orderNumber}` : ""} was placed by{" "}
                {order.email ?? "guest customer"}.
              </Text>

              <Summary order={order} currencyCode={currencyCode} />

              <Section className="mt-6">
                <SectionTitle>Items</SectionTitle>
                {order.items?.map((item, index) => (
                  <Text
                    key={`${getItemTitle(item)}-${index}`}
                    className="m-0 mb-2 text-email-text"
                  >
                    {getItemTitle(item)} x {item.quantity ?? 0}
                  </Text>
                ))}
              </Section>

              <Text className="m-0 mt-6 text-emailBase leading-emailBody text-email-muted">
                Open the order dashboard to capture payment, fulfill items, and
                add tracking updates.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
