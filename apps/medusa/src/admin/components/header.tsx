import { Heading, Text } from "@medusajs/ui";
import type React from "react";

type HeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export const Header = ({ title, subtitle, actions }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-x-4 px-6 py-4">
      <div>
        <Heading level="h2">{title}</Heading>
        {subtitle ? (
          <Text className="text-ui-fg-subtle" size="small">
            {subtitle}
          </Text>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center justify-center gap-x-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
};
