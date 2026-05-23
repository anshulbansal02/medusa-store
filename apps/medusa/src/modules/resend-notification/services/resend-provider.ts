import type { Logger, NotificationTypes } from "@medusajs/framework/types";
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils";
import { Resend } from "resend";

import {
  buildOwnerOrderPlacedEmail,
  buildOrderPlacedEmail,
  type OrderPlacedEmailData,
} from "./order-placed-email";

type ResendNotificationProviderOptions = {
  api_key: string;
  from: string;
};

type InjectedDependencies = {
  logger: Logger;
};

const providerIdentifier = "resend";
const orderPlacedTemplate = "order-placed";
const ownerOrderPlacedTemplate = "owner-order-placed";

function isOrderPlacedEmailData(value: unknown): value is OrderPlacedEmailData {
  return Boolean(value) && typeof value === "object";
}

export default class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = providerIdentifier;

  protected readonly resend_: Resend;
  protected readonly from_: string;
  protected readonly logger_: Logger;

  constructor(
    { logger }: InjectedDependencies,
    options: ResendNotificationProviderOptions,
  ) {
    super();

    this.resend_ = new Resend(options.api_key);
    this.from_ = options.from;
    this.logger_ = logger;
  }

  static validateOptions(options: Record<string, unknown>) {
    if (typeof options.api_key !== "string" || options.api_key.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend api_key is required.",
      );
    }

    if (typeof options.from !== "string" || options.from.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend from email is required.",
      );
    }
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO,
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    const from = notification.from?.trim() || this.from_;
    let subject = notification.content?.subject;
    let html = notification.content?.html;
    let text = notification.content?.text;

    if (!subject || !html) {
      const order = notification.data?.order;

      if (!isOrderPlacedEmailData(order)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Unsupported email template: ${notification.template}`,
        );
      }

      const rendered =
        notification.template === ownerOrderPlacedTemplate
          ? await buildOwnerOrderPlacedEmail(order)
          : notification.template === orderPlacedTemplate
            ? await buildOrderPlacedEmail(order)
            : null;

      if (!rendered) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Unsupported email template: ${notification.template}`,
        );
      }

      subject = rendered.subject;
      html = rendered.html;
      text = rendered.text;
    }

    const { data, error } = await this.resend_.emails.send({
      from,
      to: notification.to,
      subject,
      html,
      text,
    });

    if (error) {
      this.logger_.error(`Resend email failed: ${error.message}`);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Resend could not send the email.",
      );
    }

    return {
      id: data?.id,
    };
  }
}
