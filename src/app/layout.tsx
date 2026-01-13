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
                // Get user ID from cookie or localStorage
                const getCookie = (name) => {
                  const value = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
                  return value ? value.pop() : '';
                };
                
                const token = getCookie('access_token');
                
                if (token) {
                  // User is authenticated, check their personal theme preference
                  const userId = localStorage.getItem('current_user_id');
                  const userTheme = userId ? localStorage.getItem('theme_' + userId) : null;
                  
                  if (userTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } else {
                  // User is not authenticated, always use light mode
                  document.documentElement.classList.remove('dark');
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
