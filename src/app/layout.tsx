import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.novaerabelenzinho.org.br"),
  title: {
    default: "Centro Espírita Nova Era – Belenzinho",
    template: "%s | Centro Espírita Nova Era",
  },
  description:
    "Casa de apoio e esclarecimento físico e espiritual, sem fins lucrativos, no Belenzinho, Zona Leste de São Paulo. Desde 1947.",
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Centro Espírita Nova Era",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${lora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <JsonLd />
      </body>
    </html>
  );
}
