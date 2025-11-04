import { useAuth0 } from '@auth0/auth0-react';
import { useMutation } from '@tanstack/react-query';
import { prisma } from '@/lib/prisma';

export const useRegistration = () => {
  const { loginWithRedirect, user } = useAuth0();

  // Redirect to Auth0 Universal Login for signup
  const redirectToSignup = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
        redirect_uri: typeof window !== 'undefined'
          ? `${window.location.origin}/callback`
          : 'http://localhost:3000/callback'
      }
    });
  };

  // Sync Auth0 user to database after successful login
  const syncUserToDatabase = useMutation({
    mutationFn: async (auth0User: any) => {
      if (!auth0User) return;

      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { auth0Id: auth0User.sub }
        });

        if (existingUser) {
          return existingUser;
        }

        // Create new user in database
        const mobileNumber = auth0User.user_metadata?.mobile_number;
        const firstName = auth0User.user_metadata?.first_name || 
                         auth0User.name?.split(' ')[0] || 
                         auth0User.email?.split('@')[0];

        const newUser = await prisma.user.create({
          data: {
            auth0Id: auth0User.sub,
            email: auth0User.email,
            firstName: firstName,
            mobileNumber: mobileNumber,
            mobileVerified: auth0User.user_metadata?.mobile_verified || false,
            accountStatus: 'ACTIVE',
            languages: '[]'
          }
        });

        console.log('User synced to database:', newUser.id);
        return newUser;
      } catch (error) {
        console.error('Failed to sync user to database:', error);
        throw error;
      }
    }
  });

  return {
    redirectToSignup,
    syncUserToDatabase
  };
};