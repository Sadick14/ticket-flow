
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
import { app, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, SubscriptionPlan } from '@/lib/types';

// In a real app, this should not be hardcoded in the client.
const ADMIN_EMAIL = 'issakasaddick14@gmail.com';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateSubscriptionPlan: (plan: SubscriptionPlan) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getOrCreateUserProfile = async (user: FirebaseUser): Promise<UserProfile> => {
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const existingProfile = docSnap.data() as UserProfile;
    // Ensure isAdmin status is correctly set on sign-in
    if (user.email === ADMIN_EMAIL && !existingProfile.isAdmin) {
      const updatedProfile = { ...existingProfile, isAdmin: true };
      await setDoc(userRef, updatedProfile);
      return updatedProfile;
    }
    return existingProfile;
  }
  
  const newUserProfile: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    subscriptionPlan: 'Free',
    isAdmin: user.email === ADMIN_EMAIL,
  };
  await setDoc(userRef, newUserProfile);
  return newUserProfile;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await getOrCreateUserProfile(firebaseUser);
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
      const userProfile = await getOrCreateUserProfile(result.user);
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

  const updateSubscriptionPlan = async (plan: SubscriptionPlan) => {
    if (user) {
      const updatedUser = { ...user, subscriptionPlan: plan };
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, updatedUser, { merge: true });
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
