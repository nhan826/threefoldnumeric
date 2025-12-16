import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Preconnect for Google Fonts and load Inter with swap for good performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#0f172a" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
