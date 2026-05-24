import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

import { emailContent } from "../email-content";

export type UserInvitedEmailData = {
  email?: string | null;
  invite_url?: string | null;
};

type UserInvitedEmailProps = {
  inviteUrl: string;
  email?: string | null;
};

const inviteEmailTailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        email: {
          accent: "#111111",
          background: "#ffffff",
          border: "#dedede",
          buttonText: "#ffffff",
          faint: "#767676",
          panel: "#ffffff",
          text: "#171717",
          muted: "#555555",
          subtle: "#f6f6f6",
        },
      },
      fontFamily: {
        body: ["Helvetica", "Arial", "sans-serif"],
        heading: ["Helvetica", "Arial", "sans-serif"],
      },
      fontSize: {
        emailTiny: "12px",
        emailBase: "14px",
        emailBody: "15px",
        emailTitle: "28px",
      },
      letterSpacing: {
        emailBrand: "1.8px",
      },
      lineHeight: {
        emailBody: "22px",
        emailButton: "44px",
        emailTitle: "34px",
      },
    },
  },
};

export function UserInvitedEmail({ inviteUrl, email }: UserInvitedEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{emailContent.userInvited.preview}</Preview>
      <Tailwind config={inviteEmailTailwindConfig}>
        <Body className="m-0 bg-email-background font-body text-email-text">
          <Container className="mx-auto max-w-[600px] px-4 py-8">
            <Section className="border border-email-border bg-email-panel p-[32px]">
              <Text className="m-0 mb-[22px] font-bold text-emailTiny text-email-accent uppercase tracking-emailBrand">
                {emailContent.brand.adminName}
              </Text>
              <Heading
                as="h1"
                className="m-0 font-heading font-bold text-emailTitle leading-emailTitle text-email-text"
              >
                {emailContent.userInvited.heading}
              </Heading>
              <Text className="m-0 mt-5 text-emailBody leading-emailBody text-email-muted">
                {emailContent.userInvited.introPrefix}{" "}
                {emailContent.brand.name} {emailContent.userInvited.introSuffix}
              </Text>
              {email ? (
                <Text className="m-0 mt-4 border border-email-border bg-email-subtle px-4 py-3 text-emailBase leading-emailBody text-email-muted">
                  This invite was sent to {email}.
                </Text>
              ) : null}

              <Section className="mt-[28px]">
                <Button
                  href={inviteUrl}
                  className="inline-block bg-email-accent px-[22px] font-bold text-emailBase text-email-buttonText leading-emailButton no-underline"
                >
                  {emailContent.userInvited.action}
                </Button>
              </Section>

              <Text className="m-0 mt-6 text-emailBase leading-emailBody text-email-muted">
                {emailContent.userInvited.expiry}
              </Text>

              <Hr className="my-7 border-email-border" />

              <Text className="m-0 text-emailTiny leading-emailBody text-email-faint">
                {emailContent.userInvited.support}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
