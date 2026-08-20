import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import '@/app/globals.css'; // Adjust path if your CSS is elsewhere

export const metadata: Metadata = {
  title: 'GameStore',
  description: 'Digital Game Store',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0c0f1d] min-h-screen text-slate-100 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}