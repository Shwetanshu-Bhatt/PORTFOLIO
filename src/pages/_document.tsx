import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google Site Verification - Required for Google Search Console */}
        <meta name="google-site-verification" content="-7CmmqA5HUGFJBOuY7O9rZHejRSJzszfoVCd1YT4R0o" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
