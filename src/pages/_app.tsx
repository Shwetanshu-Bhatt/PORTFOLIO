import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { ThemeProvider } from "@/hooks/useTheme";
import CustomCursor from "@/components/CustomCursor";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <>
      <Head>
        {/* Google Site Verification - Required for Google Search Console */}
        <meta name="google-site-verification" content="-7CmmqA5HUGFJBOuY7O9rZHejRSJzszfoVCd1YT4R0o" />
        {/* Default robots meta for all pages */}
        <meta name="robots" content="index, follow" />
      </Head>
      <ThemeProvider>
        {!isAdminPage && <CustomCursor />}
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
