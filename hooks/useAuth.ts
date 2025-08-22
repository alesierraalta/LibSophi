import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    let previousUser: User | null = null;

    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      previousUser = user;
      setUser(user);
      setLoading(false);
      setInitialAuthCheckComplete(true);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUser = session?.user ?? null;
        
        setUser(newUser);
        setLoading(false);

        // Only redirect on actual auth state changes, not on session refresh/validation
        if (event === 'SIGNED_IN') {
          // Only redirect if this is a genuine sign-in (user was previously null)
          // or if we're on a login/register page (intentional sign-in)
          const currentPath = window.location.pathname;
          const isOnAuthPage = currentPath === '/login' || currentPath === '/register';
          
          if (!previousUser || isOnAuthPage) {
            // User signed in, redirect to main or intended page
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTo = urlParams.get('redirect') || '/main';
            router.push(redirectTo);
          }
          // If user was already signed in and not on auth page, don't redirect
        } else if (event === 'SIGNED_OUT') {
          // User signed out, redirect to login
          router.push('/login');
        }

        // Update previous user for next iteration
        previousUser = newUser;
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]); // Removed user from dependencies to prevent infinite loop

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    initialAuthCheckComplete,
    signOut,
    isAuthenticated: !!user
  };
}
