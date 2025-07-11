
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, SubscriptionPlan } from '@/lib/types';

// In a real app, this would be fetched from a database like Firestore.
const userProfilesDB: Record<string, UserProfile> = {};

const getOrCreateUserProfile = (user: FirebaseUser): UserProfile => {
  if (userProfilesDB[user.uid]) {
    return userProfilesDB[user.uid];
  }
  const newUserProfile: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    subscriptionPlan: 'Free',
  };
  userProfilesDB[user.uid] = newUserProfile;
  return newUserProfile;
};


interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateSubscriptionPlan: (plan: SubscriptionPlan) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = getOrCreateUserProfile(firebaseUser);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userProfile = getOrCreateUserProfile(result.user);
      setUser(userProfile);
      toast({
        title: "Signed In",
        description: "You have successfully signed in.",
      });
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast({
        variant: 'destructive',
        title: "Sign In Failed",
        description: "Could not sign in with Google. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
       toast({
        title: "Signed Out",
        description: "You have successfully signed out.",
      });
    } catch (error) {
        console.error("Sign Out Error:", error);
        toast({
            variant: 'destructive',
            title: "Sign Out Failed",
            description: "Could not sign out. Please try again.",
        });
    }
  };

  const updateSubscriptionPlan = (plan: SubscriptionPlan) => {
    if (user) {
      const updatedUser = { ...user, subscriptionPlan: plan };
      userProfilesDB[user.uid] = updatedUser; // Update in our mock DB
      setUser(updatedUser);
      toast({
        title: "Plan Updated!",
        description: `You are now on the ${plan} plan.`,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, updateSubscriptionPlan }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
