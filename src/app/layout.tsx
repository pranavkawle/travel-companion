'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { auth0Config, isAuth0Configured } from '@/lib/auth0';
import { queryClient } from '@/lib/queryClient';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if Auth0 is properly configured
  const auth0Ready = isAuth0Configured();
  
  if (!auth0Ready) {
    console.error('Auth0 is not properly configured. Please check environment variables.');
  }

  return (
    <html lang="en">
      <body>
        {auth0Ready ? (
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
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-red-50">
            <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
              <p className="text-gray-700 mb-4">
                The application is not properly configured. Please check that all required 
                environment variables are set.
              </p>
              <div className="bg-gray-100 p-4 rounded text-sm font-mono">
                <p className="font-bold mb-2">Required:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>NEXT_PUBLIC_AUTH0_DOMAIN</li>
                  <li>NEXT_PUBLIC_AUTH0_CLIENT_ID</li>
                </ul>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <p className="mt-4 text-sm text-gray-600">
                  💡 Copy <code className="bg-gray-200 px-1 rounded">.env.local.template</code> to{' '}
                  <code className="bg-gray-200 px-1 rounded">.env.local</code> and fill in your values.
                </p>
              )}
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
