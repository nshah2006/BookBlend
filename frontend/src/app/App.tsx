import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";
import { router } from "./routes";
import "../styles/fonts.css";
import "../styles/theme.css";
import React from "react";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
