import { OwnerOrderPlacedEmail } from "../src/email/templates/order-placed";
import { previewOrder } from "./preview-data";

export default function OwnerOrderPlacedPreview() {
  return <OwnerOrderPlacedEmail order={previewOrder} />;
}
