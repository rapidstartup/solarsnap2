import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const createProfile = useMutation(api.auth.createProfile);

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn?.create({
        identifier: email,
        password
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUp?.create({
        emailAddress: email,
        password
      });
      if (result?.createdUserId) {
        await createProfile({ userId: result.createdUserId, email });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn: handleSignIn,
    signUp: handleSignUp,
    isLoading,
    error
  };
}