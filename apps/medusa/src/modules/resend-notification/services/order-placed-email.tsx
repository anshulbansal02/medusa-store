import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Text,
  render,
  toPlainText,
} from "react-email";
import type { ReactNode } from "react";

type OrderEmailItem = {
  title?: string | null;
  subtitle?: string | null;
  product_title?: string | null;
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
};

const colors = {
  background: "#f8f4f1",
  panel: "#fbf8f6",
  border: "#e7e0dd",
  text: "#27201e",
  muted: "#7f706a",
  accent: "#a22b35",
};

const bodyStyle = {
  margin: 0,
  background: colors.background,
  color: colors.text,
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "640px",
  margin: "0 auto",
  padding: "32px 18px",
};

const panelStyle = {
  background: colors.panel,
  border: `1px solid ${colors.border}`,
  padding: "28px",
};

const eyebrowStyle = {
  margin: "0 0 18px",
  color: colors.accent,
  fontSize: "13px",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const headingStyle = {
  margin: 0,
  color: colors.text,
  fontFamily: "Georgia, serif",
  fontSize: "34px",
  fontWeight: 400,
  lineHeight: "1.05",
};

const mutedTextStyle = {
  color: colors.muted,
  fontSize: "14px",
  lineHeight: "1.6",
};

const rowStyle = {
  borderBottom: `1px solid ${colors.border}`,
};

const itemTitleStyle = {
  margin: 0,
  color: colors.text,
  fontWeight: 600,
};

const itemMetaStyle = {
  margin: "4px 0 0",
  color: colors.muted,
  fontSize: "14px",
};

const totalLabelStyle = {
  margin: 0,
  color: colors.muted,
  fontSize: "14px",
};

const totalValueStyle = {
  margin: 0,
  color: colors.text,
  fontSize: "14px",
  textAlign: "right" as const,
};

const finalTotalStyle = {
  margin: "8px 0 0",
  color: colors.text,
  fontWeight: 700,
};

function formatPrice(amount?: number | null, currencyCode = "inr") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

function getOrderNumber(order: OrderPlacedEmailData) {
  return order.display_id ? `#${order.display_id}` : order.id;
}

function getItemTitle(item: OrderEmailItem) {
  return item.product_title ?? item.subtitle ?? item.title ?? "Product";
}

function OrderItems({
  order,
  currencyCode,
}: {
  order: OrderPlacedEmailData;
  currencyCode: string;
}) {
  return (
    <Section style={{ marginTop: "28px" }}>
      {order.items?.map((item, index) => (
        <Row key={`${getItemTitle(item)}-${index}`} style={rowStyle}>
          <Column style={{ padding: "14px 0" }}>
            <Text style={itemTitleStyle}>{getItemTitle(item)}</Text>
            <Text style={itemMetaStyle}>Qty {item.quantity ?? 0}</Text>
          </Column>
          <Column style={{ padding: "14px 0", textAlign: "right" }}>
            <Text style={{ margin: 0, color: colors.text }}>
              {formatPrice(item.total, currencyCode)}
            </Text>
          </Column>
        </Row>
      ))}
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
    <Section style={{ marginTop: "22px" }}>
      <Row>
        <Column>
          <Text style={totalLabelStyle}>Subtotal</Text>
        </Column>
        <Column>
          <Text style={totalValueStyle}>
            {formatPrice(order.subtotal, currencyCode)}
          </Text>
        </Column>
      </Row>
      <Row>
        <Column>
          <Text style={totalLabelStyle}>Shipping</Text>
        </Column>
        <Column>
          <Text style={totalValueStyle}>
            {formatPrice(order.shipping_total, currencyCode)}
          </Text>
        </Column>
      </Row>
      <Row>
        <Column>
          <Text style={totalLabelStyle}>Tax</Text>
        </Column>
        <Column>
          <Text style={totalValueStyle}>
            {formatPrice(order.tax_total, currencyCode)}
          </Text>
        </Column>
      </Row>
      <Row>
        <Column>
          <Text style={finalTotalStyle}>Total</Text>
        </Column>
        <Column>
          <Text style={{ ...finalTotalStyle, textAlign: "right" }}>
            {formatPrice(order.total, currencyCode)}
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

export function CustomerOrderPlacedEmail({ order }: OrderPlacedEmailProps) {
  const currencyCode = order.currency_code ?? "inr";
  const orderNumber = getOrderNumber(order);
  const preview = `Thank you for your order${orderNumber ? ` ${orderNumber}` : ""}.`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={panelStyle}>
            <Text style={eyebrowStyle}>The Label</Text>
            <Heading as="h1" style={headingStyle}>
              Order confirmed
            </Heading>
            <Text style={{ ...mutedTextStyle, margin: "16px 0 0" }}>
              We have received your order{orderNumber ? ` ${orderNumber}` : ""}.
              You will get another update when it ships.
            </Text>

            <OrderItems order={order} currencyCode={currencyCode} />
            <Totals order={order} currencyCode={currencyCode} />

            <Text style={{ ...mutedTextStyle, margin: "28px 0 0" }}>
              For support, reply to this email with your order number.
            </Text>
          </Section>
        </Container>
      </Body>
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
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={{ ...panelStyle, padding: "26px" }}>
            <Text style={eyebrowStyle}>The Label Admin</Text>
            <Heading as="h1" style={{ ...headingStyle, fontSize: "30px" }}>
              New order received
            </Heading>
            <Text style={{ ...mutedTextStyle, margin: "16px 0 0" }}>
              Order{orderNumber ? ` ${orderNumber}` : ""} was placed by{" "}
              {order.email ?? "guest customer"}.
            </Text>
            <Text
              style={{
                margin: "16px 0 0",
                color: colors.text,
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              {formatPrice(order.total, currencyCode)}
            </Text>

            <Section style={{ marginTop: "18px" }}>
              {order.items?.map((item, index) => (
                <Text
                  key={`${getItemTitle(item)}-${index}`}
                  style={{ margin: "0 0 8px", color: colors.text }}
                >
                  {getItemTitle(item)} x {item.quantity ?? 0}
                </Text>
              ))}
            </Section>

            <Text style={{ ...mutedTextStyle, margin: "24px 0 0" }}>
              Open Medusa Admin to capture, fulfill, and add tracking updates.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

async function renderEmail(node: ReactNode) {
  const html = await render(node);

  return {
    html,
    text: toPlainText(html),
  };
}

export async function buildOrderPlacedEmail(order: OrderPlacedEmailData) {
  const currencyCode = order.currency_code ?? "inr";
  const orderNumber = getOrderNumber(order);
  const subject = orderNumber
    ? `Your The Label order ${orderNumber} is confirmed`
    : "Your The Label order is confirmed";
  const { html, text } = await renderEmail(
    <CustomerOrderPlacedEmail order={order} />,
  );

  return {
    subject,
    html,
    text:
      text ||
      `Thank you for your order${orderNumber ? ` ${orderNumber}` : ""}. Total: ${formatPrice(order.total, currencyCode)}.`,
  };
}

export async function buildOwnerOrderPlacedEmail(order: OrderPlacedEmailData) {
  const currencyCode = order.currency_code ?? "inr";
  const orderNumber = getOrderNumber(order);
  const subject = orderNumber
    ? `New The Label order ${orderNumber}`
    : "New The Label order";
  const { html, text } = await renderEmail(
    <OwnerOrderPlacedEmail order={order} />,
  );

  return {
    subject,
    html,
    text:
      text ||
      `New order${orderNumber ? ` ${orderNumber}` : ""} for ${formatPrice(order.total, currencyCode)} from ${order.email ?? "guest customer"}.`,
  };
}
