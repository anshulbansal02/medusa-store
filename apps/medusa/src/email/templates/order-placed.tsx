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

import { emailContent } from "../email-content";

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
          buttonText: "#ffffff",
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
  return (
    item.product_title ??
    item.subtitle ??
    item.title ??
    emailContent.orderPlaced.items.fallbackTitle
  );
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
            {emailContent.orderPlaced.summary.order}
          </Text>
          <Text className="m-0 font-bold text-emailBody text-email-text">
            {getOrderNumber(order)}
          </Text>
        </Column>
        <Column>
          <Text className="m-0 mb-1 font-bold text-emailMicro text-email-faint uppercase tracking-emailLabel">
            {emailContent.orderPlaced.summary.total}
          </Text>
          <Text className="m-0 font-bold text-emailBody text-email-text">
            {formatPrice(order.total, currencyCode)}
          </Text>
        </Column>
        <Column>
          <Text className="m-0 mb-1 font-bold text-emailMicro text-email-faint uppercase tracking-emailLabel">
            {emailContent.orderPlaced.summary.payment}
          </Text>
          <Text className="m-0 font-bold text-emailBody text-email-text">
            {emailContent.orderPlaced.summary.paymentValue}
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
      <SectionTitle>{emailContent.orderPlaced.items.customerTitle}</SectionTitle>
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
                {emailContent.orderPlaced.items.quantityPrefix}{" "}
                {item.quantity ?? 0}
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
        label={emailContent.orderPlaced.totals.subtotal}
        value={formatPrice(order.subtotal, currencyCode)}
      />
      <TotalRow
        label={emailContent.orderPlaced.totals.shipping}
        value={formatPrice(order.shipping_total, currencyCode)}
      />
      <TotalRow
        label={emailContent.orderPlaced.totals.tax}
        value={formatPrice(order.tax_total, currencyCode)}
      />
      <Row>
        <Column>
          <Text className="m-0 mt-2 font-bold text-emailTotal text-email-text">
            {emailContent.orderPlaced.totals.total}
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
      <SectionTitle>{emailContent.orderPlaced.nextSteps.title}</SectionTitle>
      {emailContent.orderPlaced.nextSteps.body.map((paragraph, index) => (
        <Text
          key={paragraph}
          className={
            index === 0
              ? "m-0 mb-2 text-emailBase leading-emailBody text-email-muted"
              : "m-0 text-emailBase leading-emailBody text-email-muted"
          }
        >
          {paragraph}
        </Text>
      ))}
    </Section>
  );
}

export function CustomerOrderPlacedEmail({
  order,
  orderUrl,
}: OrderPlacedEmailProps) {
  const currencyCode = order.currency_code ?? "inr";
  const orderNumber = getOrderNumber(order);
  const preview = `Order ${orderNumber ?? ""} ${
    emailContent.orderPlaced.customer.previewPrefix
  } ${formatPrice(order.total, currencyCode)}.`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind config={emailTailwindConfig}>
        <Body className="m-0 bg-email-background font-body text-email-text">
          <Container className="mx-auto max-w-[640px] px-4 py-7">
            <Section className="border border-email-border bg-email-panel p-[30px]">
              <Text className="m-0 mb-[18px] font-bold text-emailTiny text-email-accent uppercase tracking-emailBrand">
                {emailContent.brand.name}
              </Text>
              <Heading
                as="h1"
                className="m-0 font-heading font-normal text-emailTitle leading-emailTitle text-email-text"
              >
                {emailContent.orderPlaced.customer.heading}
              </Heading>
              <Text className="m-0 mt-4 text-emailBase leading-emailBody text-email-muted">
                {emailContent.orderPlaced.customer.introPrefix}
                {orderNumber ? ` ${orderNumber}` : ""}.{" "}
                {emailContent.orderPlaced.customer.introSuffix}
              </Text>

              <Summary order={order} currencyCode={currencyCode} />

              {orderUrl ? (
                <Section className="mt-[22px]">
                  <Button
                    href={orderUrl}
                    className="inline-block bg-email-accentDark px-[22px] font-bold text-emailBase text-email-buttonText leading-emailButton no-underline"
                  >
                    {emailContent.orderPlaced.customer.action}
                  </Button>
                </Section>
              ) : null}

              <OrderItems order={order} currencyCode={currencyCode} />
              <Totals order={order} currencyCode={currencyCode} />
              <Hr className="my-7 border-email-border" />
              <NextSteps />

              <Text className="m-0 mt-7 text-emailBase leading-emailBody text-email-muted">
                {emailContent.orderPlaced.customer.support}
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
  const preview = `${emailContent.orderPlaced.owner.previewPrefix}${
    orderNumber ? ` ${orderNumber}` : ""
  } ${emailContent.orderPlaced.owner.previewFrom} ${
    order.email ?? emailContent.orderPlaced.owner.guestCustomer
  }.`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind config={emailTailwindConfig}>
        <Body className="m-0 bg-email-background font-body text-email-text">
          <Container className="mx-auto max-w-[640px] px-4 py-7">
            <Section className="border border-email-border bg-email-panel p-7">
              <Text className="m-0 mb-[18px] font-bold text-emailTiny text-email-accent uppercase tracking-emailBrand">
                {emailContent.brand.adminName}
              </Text>
              <Heading
                as="h1"
                className="m-0 font-heading font-normal text-emailOwnerTitle leading-emailOwnerTitle text-email-text"
              >
                {emailContent.orderPlaced.owner.heading}
              </Heading>
              <Text className="m-0 mt-4 text-emailBase leading-emailBody text-email-muted">
                {emailContent.orderPlaced.owner.introPrefix}
                {orderNumber ? ` ${orderNumber}` : ""}{" "}
                {emailContent.orderPlaced.owner.introSuffix}{" "}
                {order.email ?? emailContent.orderPlaced.owner.guestCustomer}.
              </Text>

              <Summary order={order} currencyCode={currencyCode} />

              <Section className="mt-6">
                <SectionTitle>{emailContent.orderPlaced.items.ownerTitle}</SectionTitle>
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
                {emailContent.orderPlaced.owner.dashboardPrompt}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
