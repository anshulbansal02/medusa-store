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
  Preview,
  Row,
  Section,
  Text,
} from "react-email";

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

const colors = {
  background: "#f7f1ee",
  panel: "#fffaf7",
  inset: "#f3ebe6",
  border: "#e6d8d1",
  text: "#2a211e",
  muted: "#776760",
  faint: "#9a8a83",
  accent: "#9f2d3d",
  accentDark: "#7f2431",
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
  padding: "28px 16px",
};

const panelStyle = {
  background: colors.panel,
  border: `1px solid ${colors.border}`,
  padding: "30px",
};

const eyebrowStyle = {
  margin: "0 0 18px",
  color: colors.accent,
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
};

const headingStyle = {
  margin: 0,
  color: colors.text,
  fontFamily: "Georgia, serif",
  fontSize: "36px",
  fontWeight: 400,
  lineHeight: "1.05",
};

const mutedTextStyle = {
  color: colors.muted,
  fontSize: "14px",
  lineHeight: "1.6",
};

const summaryBoxStyle = {
  marginTop: "24px",
  background: colors.inset,
  border: `1px solid ${colors.border}`,
  padding: "16px",
};

const summaryLabelStyle = {
  margin: "0 0 4px",
  color: colors.faint,
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const summaryValueStyle = {
  margin: 0,
  color: colors.text,
  fontSize: "15px",
  fontWeight: 700,
};

const sectionTitleStyle = {
  margin: "0 0 14px",
  color: colors.text,
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const itemRowStyle = {
  borderBottom: `1px solid ${colors.border}`,
};

const itemImageWrapStyle = {
  width: "56px",
  padding: "14px 14px 14px 0",
};

const imageFallbackStyle = {
  width: "56px",
  height: "70px",
  background: colors.inset,
  border: `1px solid ${colors.border}`,
};

const itemTitleStyle = {
  margin: 0,
  color: colors.text,
  fontSize: "15px",
  fontWeight: 700,
};

const itemMetaStyle = {
  margin: "4px 0 0",
  color: colors.muted,
  fontSize: "13px",
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
  fontSize: "16px",
  fontWeight: 700,
};

const buttonStyle = {
  display: "inline-block",
  background: colors.accentDark,
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 700,
  lineHeight: "44px",
  padding: "0 22px",
  textDecoration: "none",
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
    <Section style={summaryBoxStyle}>
      <Row>
        <Column>
          <Text style={summaryLabelStyle}>Order</Text>
          <Text style={summaryValueStyle}>{getOrderNumber(order)}</Text>
        </Column>
        <Column>
          <Text style={summaryLabelStyle}>Total</Text>
          <Text style={summaryValueStyle}>
            {formatPrice(order.total, currencyCode)}
          </Text>
        </Column>
        <Column>
          <Text style={summaryLabelStyle}>Payment</Text>
          <Text style={summaryValueStyle}>Prepaid</Text>
        </Column>
      </Row>
    </Section>
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
    <Section style={{ marginTop: "30px" }}>
      <Text style={sectionTitleStyle}>Your pieces</Text>
      {order.items?.map((item, index) => {
        const title = getItemTitle(item);

        return (
          <Row key={`${title}-${index}`} style={itemRowStyle}>
            <Column style={itemImageWrapStyle}>
              {item.thumbnail ? (
                <Img
                  src={item.thumbnail}
                  alt={title}
                  width="56"
                  height="70"
                  style={{ display: "block", objectFit: "cover" }}
                />
              ) : (
                <Section style={imageFallbackStyle} />
              )}
            </Column>
            <Column style={{ padding: "14px 0" }}>
              <Text style={itemTitleStyle}>{title}</Text>
              <Text style={itemMetaStyle}>Qty {item.quantity ?? 0}</Text>
            </Column>
            <Column style={{ padding: "14px 0", textAlign: "right" }}>
              <Text style={{ margin: 0, color: colors.text }}>
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
    <Section style={{ marginTop: "20px" }}>
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

function NextSteps() {
  return (
    <Section style={{ marginTop: "28px" }}>
      <Text style={sectionTitleStyle}>What happens next</Text>
      <Text style={{ ...mutedTextStyle, margin: "0 0 8px" }}>
        The store team will review your order, prepare your pieces, and email
        you again when dispatch is ready.
      </Text>
      <Text style={{ ...mutedTextStyle, margin: 0 }}>
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
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={panelStyle}>
            <Text style={eyebrowStyle}>The Label</Text>
            <Heading as="h1" style={headingStyle}>
              Order confirmed
            </Heading>
            <Text style={{ ...mutedTextStyle, margin: "16px 0 0" }}>
              We have received your order{orderNumber ? ` ${orderNumber}` : ""}.
              Here is your receipt and what happens next.
            </Text>

            <Summary order={order} currencyCode={currencyCode} />

            {orderUrl ? (
              <Section style={{ marginTop: "22px" }}>
                <Button href={orderUrl} style={buttonStyle}>
                  View order
                </Button>
              </Section>
            ) : null}

            <OrderItems order={order} currencyCode={currencyCode} />
            <Totals order={order} currencyCode={currencyCode} />
            <Hr style={{ borderColor: colors.border, margin: "28px 0" }} />
            <NextSteps />

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
          <Section style={{ ...panelStyle, padding: "28px" }}>
            <Text style={eyebrowStyle}>The Label Admin</Text>
            <Heading as="h1" style={{ ...headingStyle, fontSize: "30px" }}>
              New order received
            </Heading>
            <Text style={{ ...mutedTextStyle, margin: "16px 0 0" }}>
              Order{orderNumber ? ` ${orderNumber}` : ""} was placed by{" "}
              {order.email ?? "guest customer"}.
            </Text>

            <Summary order={order} currencyCode={currencyCode} />

            <Section style={{ marginTop: "24px" }}>
              <Text style={sectionTitleStyle}>Items</Text>
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
