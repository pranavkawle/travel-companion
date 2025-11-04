'use client';

import { useRegistration } from '@/hooks/useRegistration';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const { redirectToSignup } = useRegistration();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Join Travel Companion AU
        </h1>
        
        <p className="mb-6 text-center text-gray-600">
          Connect with fellow travelers for language assistance
        </p>

        <Button
          onClick={redirectToSignup}
          className="w-full"
        >
          Sign Up with Email
        </Button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline">
            Log In
          </a>
        </p>

        <p className="mt-6 text-xs text-gray-500 text-center">
          We'll ask for your mobile number during registration for security purposes.
          Your number will never be shared publicly.
        </p>
      </div>
    </div>
  );
}