import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ThemeProvider } from "@/hooks/useTheme";
import CustomCursor from "@/components/CustomCursor";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <ThemeProvider>
      {!isAdminPage && <CustomCursor />}
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
