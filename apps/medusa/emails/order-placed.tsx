import { CustomerOrderPlacedEmail } from "../src/modules/resend-notification/services/order-placed-email";
import { previewOrder } from "./preview-data";

export default function OrderPlacedPreview() {
  return <CustomerOrderPlacedEmail order={previewOrder} />;
}
