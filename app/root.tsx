import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import rainbowStylesUrl from "@rainbow-me/rainbowkit/styles.css";
import tailwindHref from "~/styles/tailwind.css";
import { WalletProvider } from "~/lib/wallet";
import { Header } from "~/components/header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  {
    rel: "preload stylesheet",
    as: "style",
    crossOrigin: "anonymous" as any,
    href: tailwindHref,
  },
  {
    rel: "preload stylesheet",
    as: "style",
    crossOrigin: "anonymous" as any,
    href: rainbowStylesUrl,
  },
];

const queryClient = new QueryClient();

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />

        <Meta />
        <Links />
      </head>
      <body>
        <WalletProvider>
          <QueryClientProvider client={queryClient}>
            <Header />
            <Outlet />
          </QueryClientProvider>
        </WalletProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
