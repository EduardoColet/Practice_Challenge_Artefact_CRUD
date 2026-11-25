import type { Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/Provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Next.js 15 + tRPC in-memory task manager.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          <main className="container">{children}</main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
