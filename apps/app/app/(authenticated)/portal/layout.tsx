import { env } from "@/env";
import { DesignSystemProvider } from "@repo/design-system";
import { fonts } from "@repo/design-system/lib/fonts";
import type { ReactNode } from "react";

type PortalLayoutProperties = {
  readonly children: ReactNode;
};

const PortalLayout = ({ children }: PortalLayoutProperties) => (
  <html lang="en" className={fonts} suppressHydrationWarning>
    <body>
      <DesignSystemProvider
        privacyUrl={new URL(
          "/legal/privacy",
          env.NEXT_PUBLIC_WEB_URL
        ).toString()}
        termsUrl={new URL("/legal/terms", env.NEXT_PUBLIC_WEB_URL).toString()}
        helpUrl={env.NEXT_PUBLIC_DOCS_URL}
      >
        {children}
      </DesignSystemProvider>
    </body>
  </html>
);

export default PortalLayout;
