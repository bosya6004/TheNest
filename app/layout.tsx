import type { Metadata } from "next";
import "./globals.css"; // Ensure this is included
import ClerkProviderWrapper from "./ClerkProviderWrapper";

export const metadata: Metadata = {
  title: "The Nest",
  description: "A habit tracker powered by Clerk and Firestore",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProviderWrapper>{children}</ClerkProviderWrapper>
      </body>
    </html>
  );
}
