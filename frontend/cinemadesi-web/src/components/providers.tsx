"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState, type ReactNode } from "react";

/**
 * Single root provider. Wired into <code>app/layout.tsx</code>.
 *
 * <ul>
 *   <li><b>SessionProvider</b> — NextAuth client-side hooks</li>
 *   <li><b>QueryClientProvider</b> — TanStack Query cache + devtools</li>
 *   <li><b>ThemeProvider</b> — locked to "dark" for now; ready for a toggle</li>
 *   <li><b>Toaster</b> — Sonner, with brand styling</li>
 * </ul>
 */
export function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={qc}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "#161616",
                border: "1px solid #2E2E2E",
                color: "#F0ECE3",
              },
            }}
          />
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
