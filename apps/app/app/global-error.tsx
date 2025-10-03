"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { fonts } from "@repo/design-system/lib/fonts";
import { captureException } from "@sentry/nextjs";
import type NextError from "next/error";
import { useEffect } from "react";

type GlobalErrorProperties = {
  readonly error: NextError & { digest?: string };
  readonly reset: () => void;
};

const GlobalError = ({ error, reset }: GlobalErrorProperties) => {
  useEffect(() => {
    // Enhanced error logging with proper serialization
    const errorObj = error as any;
    const errorDetails = {
      message: errorObj.message || "Unknown error",
      name: errorObj.name || "Error",
      stack: errorObj.stack,
      digest: error.digest,
      cause: (errorObj as any).cause,
      toString: String(error),
      // Additional context
      timestamp: new Date().toISOString(),
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      url: typeof window !== "undefined" ? window.location.href : "Unknown",
    };

    console.error("Global Error Details:", errorDetails);

    // Send to Sentry with enhanced context
    captureException(error, {
      extra: errorDetails,
      tags: {
        errorBoundary: "global",
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <html lang="en" className={fonts}>
      <body>
        <h1>Oops, something went wrong</h1>
        <Button onClick={() => reset()}>Try again</Button>
      </body>
    </html>
  );
};

export default GlobalError;
