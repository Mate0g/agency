import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EPM Agency | Estudios por el Mundo - Medicina en Argentina",
  description: "Asesoría experta para estudiar medicina en Argentina. Garantizamos tu ingreso a la UBA (CBC/UBA XXI) y Universidades Privadas. Gestión de DNI, Convalidación de Título y Residencias Médicas.",
  keywords: [
    "estudios por el mundo",
    "estudiar medicina uba",
    "ingreso uba extranjeros",
    "universidades privadas medicina argentina",
    "barcelo medicina",
    "uai medicina",
    "residencias medicas argentina",
    "convalidación titulo medico",
    "tramite dni argentina estudiantes",
    "epm agency",
    "posgrados medicina buenos aires",
    "especialidades medicas en el extranjero ecuador",
    "medicina en argentina para extranjeros",
    "asesoria ingreso medicina argentina",
    "epm agencia medica",
    "ecuador especialidades medicas argentina"
  ],
  openGraph: {
    title: "EPM Agency | Estudios por el Mundo",
    description: "Gestión integral para estudiantes y profesionales de la salud extranjeros. UBA, Privadas y Especialidades.",
    url: "https://estudiosporelmundo.com",
    type: "website",
    locale: "es_ES",
    siteName: "EPM Agency",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
