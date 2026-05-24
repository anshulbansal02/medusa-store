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
          accent: "#9f2d3d",
          accentDark: "#7f2431",
          background: "#f7f1ee",
          border: "#e6d8d1",
          buttonText: "#ffffff",
          faint: "#9a8a83",
          panel: "#fffaf7",
          text: "#2a211e",
          muted: "#776760",
        },
      },
      fontFamily: {
        body: ["Arial", "sans-serif"],
        heading: ["Georgia", "serif"],
      },
      fontSize: {
        emailTiny: "12px",
        emailBase: "14px",
        emailBody: "15px",
        emailTitle: "34px",
      },
      letterSpacing: {
        emailBrand: "2.2px",
      },
      lineHeight: {
        emailBody: "22px",
        emailButton: "44px",
        emailTitle: "38px",
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
          <Container className="mx-auto max-w-[600px] px-4 py-7">
            <Section className="border border-email-border bg-email-panel p-[30px]">
              <Text className="m-0 mb-[18px] font-bold text-emailTiny text-email-accent uppercase tracking-emailBrand">
                {emailContent.brand.adminName}
              </Text>
              <Heading
                as="h1"
                className="m-0 font-heading font-normal text-emailTitle leading-emailTitle text-email-text"
              >
                {emailContent.userInvited.heading}
              </Heading>
              <Text className="m-0 mt-4 text-emailBase leading-emailBody text-email-muted">
                {emailContent.userInvited.introPrefix}{" "}
                {emailContent.brand.name} {emailContent.userInvited.introSuffix}
              </Text>
              {email ? (
                <Text className="m-0 mt-3 text-emailBase leading-emailBody text-email-muted">
                  This invite was sent to {email}.
                </Text>
              ) : null}

              <Section className="mt-[24px]">
                <Button
                  href={inviteUrl}
                  className="inline-block bg-email-accentDark px-[22px] font-bold text-emailBase text-email-buttonText leading-emailButton no-underline"
                >
                  {emailContent.userInvited.action}
                </Button>
              </Section>

              <Text className="m-0 mt-5 text-emailBase leading-emailBody text-email-muted">
                {emailContent.userInvited.expiry}
              </Text>

              <Hr className="my-7 border-email-border" />

              <Text className="m-0 text-emailBase leading-emailBody text-email-muted">
                {emailContent.userInvited.support}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
