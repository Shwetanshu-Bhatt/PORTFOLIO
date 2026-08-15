import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ThemeProvider } from "@/hooks/useTheme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Google Site Verification - Required for Google Search Console */}
        <meta name="google-site-verification" content="-7CmmqA5HUGFJBOuY7O9rZHejRSJzszfoVCd1YT4R0o" />
        {/* Default robots meta for all pages */}
        <meta name="robots" content="index, follow" />
      </Head>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
