import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/hooks/useTheme";
import CustomCursor from "@/components/CustomCursor";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <CustomCursor />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
