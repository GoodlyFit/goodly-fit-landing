import "./globals.css";
export const metadata = { title: "Goodly Control", description: "Centro de control de la agencia de Goodly Fit", robots: { index: false, follow: false } };
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" />
        <link rel="stylesheet" href="/centrocontrol/app.css?v=2" />
      </head>
      <body>{children}</body>
    </html>
  );
}
