import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

import { getEmailConfig, getResendConfig } from "../config/env";
import { transactionalEmailTemplates } from "../email/template-ids";

type InviteEventData = {
  id: string;
};

type InviteRecord = {
  email?: string | null;
  token?: string | null;
};

function getInviteUrl({
  backendUrl,
  adminPath,
  token,
}: {
  backendUrl?: string;
  adminPath?: string;
  token: string;
}) {
  const baseUrl = backendUrl && backendUrl !== "/" ? backendUrl : "http://localhost:29181";
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedAdminPath = adminPath?.startsWith("/") ? adminPath : "/app";

  return `${normalizedBaseUrl}${normalizedAdminPath}/invite?token=${encodeURIComponent(
    token,
  )}`;
}

export default async function userInvitedHandler({
  event,
  container,
}: SubscriberArgs<InviteEventData>) {
  if (!getResendConfig().isConfigured) {
    return;
  }

  const query = container.resolve("query");
  const notificationModuleService = container.resolve("notification");
  const configModule = container.resolve("configModule");
  const {
    data: [invite],
  } = await query.graph({
    entity: "invite",
    fields: ["email", "token"],
    filters: {
      id: event.data.id,
    },
  });
  const typedInvite = invite as InviteRecord | undefined;

  if (!typedInvite?.email || !typedInvite.token) {
    return;
  }

  const eventName =
    typeof event.name === "string" ? event.name : "invite.created";
  const emailConfig = getEmailConfig();
  const inviteUrl = getInviteUrl({
    backendUrl: configModule.admin?.backendUrl,
    adminPath: configModule.admin?.path,
    token: typedInvite.token,
  });

  await notificationModuleService.createNotifications({
    to: typedInvite.email,
    from: emailConfig.adminInviteFrom,
    template: transactionalEmailTemplates.userInvited,
    channel: "email",
    data: {
      email: typedInvite.email,
      invite_url: inviteUrl,
      email_idempotency_key: `user-invited-${eventName}-${event.data.id}`,
    },
    trigger_type: eventName,
    resource_id: event.data.id,
    resource_type: "invite",
    idempotency_key: `user-invited-${eventName}-${event.data.id}`,
  });
}

export const config: SubscriberConfig = {
  event: ["invite.created", "invite.resent"],
};
