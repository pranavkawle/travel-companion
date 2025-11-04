'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();
  const router = useRouter();

  const handleLogin = () => {
    loginWithRedirect({
      appState: { returnTo: '/' }
    });
  };

  const handleLogout = () => {
    logout({ 
      logoutParams: { 
        returnTo: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000' 
      } 
    });
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Travel Companion AU
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          Connect with fellow travelers for language assistance on Australian flights
        </p>

        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-gray-700">
              Welcome, {user?.email || user?.name}!
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleLogout} variant="secondary">
                Log Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button onClick={handleSignUp} className="min-w-[200px]">
              Sign Up
            </Button>
            <Button onClick={handleLogin} variant="secondary" className="min-w-[200px]">
              Log In
            </Button>
          </div>
        )}

        <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 font-semibold text-gray-900">🗣️ Language Help</h3>
            <p className="text-sm text-gray-600">
              Get assistance with language barriers during your flight
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 font-semibold text-gray-900">✈️ Flight Based</h3>
            <p className="text-sm text-gray-600">
              Connect based on your actual flight details
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 font-semibold text-gray-900">🔒 Private</h3>
            <p className="text-sm text-gray-600">
              Your mobile number stays private and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}