import "@/styles/globals.css";
import "@/styles/motion.css";
import "@/styles/preloader.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { ThemeProvider } from "@/hooks/useTheme";
import MotionController from "@/components/MotionController";
import PortfolioPreloader from "@/components/PortfolioPreloader";

function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const isPrivateRoute = pathname.startsWith("/admin") || pathname.startsWith("/review/");

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Google Site Verification - Required for Google Search Console */}
        <meta name="google-site-verification" content="-7CmmqA5HUGFJBOuY7O9rZHejRSJzszfoVCd1YT4R0o" />
        <meta name="robots" content={isPrivateRoute ? "noindex,nofollow" : "index,follow"} />
      </Head>
      <ThemeProvider>
        <MotionController />
        {!isPrivateRoute && pathname === "/" && <PortfolioPreloader />}
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
