import type { Logger, NotificationTypes } from "@medusajs/framework/types";
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils";
import { Resend } from "resend";

import {
  renderTransactionalEmail,
  type TransactionalEmailContent,
} from "../../../email/transactional-email";

type ResendNotificationProviderOptions = {
  api_key: string;
  from: string;
};

type InjectedDependencies = {
  logger: Logger;
};

const providerIdentifier = "resend";

function getIdempotencyKey(data: Record<string, unknown> | null | undefined) {
  return typeof data?.email_idempotency_key === "string"
    ? data.email_idempotency_key
    : undefined;
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
    let rendered: TransactionalEmailContent | null = null;

    if (!subject || !html) {
      rendered = await renderTransactionalEmail({
        template: notification.template,
        data: notification.data,
      });

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

    const { data, error } = await this.resend_.emails.send(
      {
        from,
        to: notification.to,
        subject,
        html,
        text,
        headers: rendered?.headers,
        replyTo: rendered?.replyTo,
        tags: rendered?.tags,
      },
      {
        idempotencyKey: getIdempotencyKey(notification.data),
      },
    );

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
