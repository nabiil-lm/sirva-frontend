import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth.context";
import { ThemeProvider } from "@/contexts/theme.context";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIRVA - Security Assessment Platform",
  description:
    "Streamline security assessments and build trust faster with intelligent validation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <Toaster position="top-center" richColors />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
