'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRegistration } from '@/hooks/useRegistration';
import { Loading } from '@/components/ui/Loading';

export default function CallbackPage() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { syncUserToDatabase } = useRegistration();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      // Sync user to database
      syncUserToDatabase.mutate(user, {
        onSuccess: () => {
          // Redirect to profile page
          router.push('/profile');
        },
        onError: (error) => {
          console.error('Failed to sync user:', error);
          router.push('/error?message=registration-failed');
        }
      });
    } else {
      // Not authenticated, redirect to home
      router.push('/');
    }
  }, [isAuthenticated, user, isLoading]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loading />
        <p className="mt-4 text-gray-600">Completing registration...</p>
      </div>
    </div>
  );
}