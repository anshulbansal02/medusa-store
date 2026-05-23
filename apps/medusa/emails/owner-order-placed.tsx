import { OwnerOrderPlacedEmail } from "../src/modules/resend-notification/services/order-placed-email";
import { previewOrder } from "./preview-data";

export default function OwnerOrderPlacedPreview() {
  return <OwnerOrderPlacedEmail order={previewOrder} />;
}
