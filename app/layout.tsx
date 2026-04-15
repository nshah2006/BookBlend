import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookBlend - AI-Powered Reading Companion",
  description:
    "BookBlend matches your mood and pacing to book recommendations, keeps your library in sync, and turns progress into quests.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcf0" },
    { media: "(prefers-color-scheme: dark)", color: "#050705" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" expand richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
