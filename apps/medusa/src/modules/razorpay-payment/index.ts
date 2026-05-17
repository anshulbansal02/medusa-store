import { ModuleProvider, Modules } from "@medusajs/framework/utils";

import RazorpayPaymentProviderService from "./services/razorpay-provider";

export default ModuleProvider(Modules.PAYMENT, {
  services: [RazorpayPaymentProviderService],
});

