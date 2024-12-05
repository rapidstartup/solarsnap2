import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '../convex/_generated/react';
import { useConvexAuth } from 'convex/react';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn: convexSignIn, signUp: convexSignUp } = useConvexAuth();
  const createProfile = useMutation('auth:createProfile');

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await convexSignIn({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = await convexSignUp({ email, password });
      await createProfile({ userId, email });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    isLoading,
    error
  };
}