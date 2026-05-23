import { CustomerOrderPlacedEmail } from "../src/email/templates/order-placed";
import { previewOrder } from "./preview-data";

export default function OrderPlacedPreview() {
  return (
    <CustomerOrderPlacedEmail
      order={previewOrder}
      orderUrl="https://example.com"
    />
  );
}
