
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
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { logEvent } from '@/lib/logger';


// In a real app, this should not be hardcoded in the client.
const ADMIN_EMAIL = 'issakasaddick14@gmail.com';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getOrCreateUserProfile = async (user: FirebaseUser): Promise<UserProfile> => {
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const existingProfile = docSnap.data() as UserProfile;
    const updates: Partial<UserProfile> = { lastSeen: new Date().toISOString() };
    
    // Ensure isAdmin status is correctly set on sign-in
    if (user.email === ADMIN_EMAIL && !existingProfile.isAdmin) {
      updates.isAdmin = true;
    }
    // Ensure active status on successful login for non-deactivated accounts
    if (existingProfile.status !== 'deactivated') {
        updates.status = 'active';
    }

    await updateDoc(userRef, updates);
    return { ...existingProfile, ...updates };
  }
  
  const newUserProfile: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isAdmin: user.email === ADMIN_EMAIL,
    status: 'active',
    subscriptionPlan: 'Free',
    lastSeen: new Date().toISOString(),
    paymentProfileCompleted: false,
    enrolledCourseIds: [],
    followingOrganizationIds: [],
  };
  await setDoc(userRef, newUserProfile);
  logEvent({
    level: 'activity',
    category: 'auth',
    message: 'New user signed up',
    userId: user.uid,
    userEmail: user.email ?? undefined,
    details: { name: user.displayName }
  });
  return newUserProfile;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const auth = getAuth(app);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await getOrCreateUserProfile(firebaseUser);
        if (userProfile.status === 'deactivated') {
          await firebaseSignOut(auth);
          setUser(null);
          toast({
            variant: 'destructive',
            title: "Account Deactivated",
            description: "Your account has been deactivated by an administrator.",
          });
          logEvent({
            level: 'warning',
            category: 'auth',
            message: 'Deactivated user attempted to sign in',
            userId: firebaseUser.uid,
            userEmail: firebaseUser.email ?? undefined
          });
        } else {
          setUser(userProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, toast]);

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userProfile = await getOrCreateUserProfile(result.user);
      if (userProfile.status === 'deactivated') {
        await firebaseSignOut(auth);
        setUser(null);
        toast({
          variant: 'destructive',
          title: "Account Deactivated",
          description: "This account is currently deactivated. Please contact support.",
        });
      } else {
        setUser(userProfile);
        toast({
          title: "Signed In",
          description: "You have successfully signed in.",
        });
        logEvent({
            level: 'activity',
            category: 'auth',
            message: 'User signed in',
            userId: userProfile.uid,
            userEmail: userProfile.email ?? undefined
        });
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast({
        variant: 'destructive',
        title: "Sign In Failed",
        description: "Could not sign in with Google. Please try again.",
      });
      logEvent({
        level: 'error',
        category: 'auth',
        message: 'Google Sign-In failed',
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const userId = user?.uid;
    const userEmail = user?.email;
    try {
      await firebaseSignOut(auth);
      setUser(null);
       toast({
        title: "Signed Out",
        description: "You have successfully signed out.",
      });
      router.push('/home');
      logEvent({
          level: 'activity',
          category: 'auth',
          message: 'User signed out',
          userId,
          userEmail: userEmail ?? undefined
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

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
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
