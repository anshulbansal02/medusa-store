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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

export function buildOrderPlacedEmail(order: OrderPlacedEmailData) {
  const currencyCode = order.currency_code ?? "inr";
  const orderNumber = getOrderNumber(order);
  const itemRows =
    order.items
      ?.map((item) => {
        const title = escapeHtml(
          item.product_title ?? item.subtitle ?? item.title ?? "Product",
        );
        const quantity = item.quantity ?? 0;
        const total = formatPrice(item.total ?? 0, currencyCode);

        return `<tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #e7e0dd;">
            <div style="font-weight: 600; color: #27201e;">${title}</div>
            <div style="margin-top: 4px; color: #7f706a; font-size: 14px;">Qty ${quantity}</div>
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #e7e0dd; text-align: right; color: #27201e;">${total}</td>
        </tr>`;
      })
      .join("") ?? "";

  const subject = orderNumber
    ? `Your The Label order ${orderNumber} is confirmed`
    : "Your The Label order is confirmed";
  const text = `Thank you for your order${orderNumber ? ` ${orderNumber}` : ""}. Total: ${formatPrice(order.total, currencyCode)}.`;
  const html = `<!doctype html>
    <html>
      <body style="margin: 0; background: #f8f4f1; color: #27201e; font-family: Arial, sans-serif;">
        <div style="max-width: 640px; margin: 0 auto; padding: 32px 18px;">
          <div style="background: #fbf8f6; border: 1px solid #e7e0dd; padding: 28px;">
            <p style="margin: 0 0 18px; color: #a22b35; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;">The Label</p>
            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 34px; line-height: 1.05; font-weight: 400;">Order confirmed</h1>
            <p style="margin: 16px 0 0; color: #7f706a; line-height: 1.6;">We have received your order${orderNumber ? ` ${escapeHtml(String(orderNumber))}` : ""}. You will get another update when it ships.</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 28px;">
              <tbody>${itemRows}</tbody>
            </table>

            <table style="width: 100%; border-collapse: collapse; margin-top: 22px; color: #27201e;">
              <tbody>
                <tr>
                  <td style="padding: 6px 0; color: #7f706a;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right;">${formatPrice(order.subtotal, currencyCode)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #7f706a;">Shipping</td>
                  <td style="padding: 6px 0; text-align: right;">${formatPrice(order.shipping_total, currencyCode)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #7f706a;">Tax</td>
                  <td style="padding: 6px 0; text-align: right;">${formatPrice(order.tax_total, currencyCode)}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 0 0; font-weight: 700;">Total</td>
                  <td style="padding: 14px 0 0; text-align: right; font-weight: 700;">${formatPrice(order.total, currencyCode)}</td>
                </tr>
              </tbody>
            </table>

            <p style="margin: 28px 0 0; color: #7f706a; font-size: 14px; line-height: 1.6;">For support, reply to this email with your order number.</p>
          </div>
        </div>
      </body>
    </html>`;

  return { subject, html, text };
}

export function buildOwnerOrderPlacedEmail(order: OrderPlacedEmailData) {
  const currencyCode = order.currency_code ?? "inr";
  const orderNumber = getOrderNumber(order);
  const subject = orderNumber
    ? `New The Label order ${orderNumber}`
    : "New The Label order";
  const text = `New order${orderNumber ? ` ${orderNumber}` : ""} for ${formatPrice(order.total, currencyCode)} from ${order.email ?? "guest customer"}.`;
  const itemRows =
    order.items
      ?.map((item) => {
        const title = escapeHtml(
          item.product_title ?? item.subtitle ?? item.title ?? "Product",
        );

        return `<li>${title} x ${item.quantity ?? 0}</li>`;
      })
      .join("") ?? "";
  const html = `<!doctype html>
    <html>
      <body style="margin: 0; background: #f8f4f1; color: #27201e; font-family: Arial, sans-serif;">
        <div style="max-width: 640px; margin: 0 auto; padding: 28px 18px;">
          <div style="background: #fbf8f6; border: 1px solid #e7e0dd; padding: 26px;">
            <p style="margin: 0 0 14px; color: #a22b35; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;">The Label Admin</p>
            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 30px; line-height: 1.1; font-weight: 400;">New order received</h1>
            <p style="margin: 16px 0 0; color: #7f706a; line-height: 1.6;">Order${orderNumber ? ` ${escapeHtml(String(orderNumber))}` : ""} was placed by ${escapeHtml(order.email ?? "guest customer")}.</p>
            <p style="margin: 16px 0 0; font-size: 20px; font-weight: 700;">${formatPrice(order.total, currencyCode)}</p>
            <ul style="margin: 18px 0 0; padding-left: 20px; color: #27201e; line-height: 1.7;">${itemRows}</ul>
            <p style="margin: 24px 0 0; color: #7f706a; font-size: 14px; line-height: 1.6;">Open Medusa Admin to capture, fulfill, and add tracking updates.</p>
          </div>
        </div>
      </body>
    </html>`;

  return { subject, html, text };
}
