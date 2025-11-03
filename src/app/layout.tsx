'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { auth0Config } from '@/lib/auth0';
import { queryClient } from '@/lib/queryClient';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Auth0Provider {...auth0Config}>
          <QueryClientProvider client={queryClient}>
            <div className="min-h-screen flex flex-col">
              <header className="bg-primary text-white p-4">
                <div className="container mx-auto">
                  <h1 className="text-2xl font-bold">Travel Companion AU</h1>
                </div>
              </header>
              
              <main className="flex-1 container mx-auto px-4 py-8">
                {children}
              </main>
              
              <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600">
                <p>&copy; 2025 Travel Companion AU. Privacy-first travel matching.</p>
              </footer>
            </div>
          </QueryClientProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
