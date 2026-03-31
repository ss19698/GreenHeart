import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../lib/firebase";
import { createUserProfile, getUserProfile } from "../lib/firestore";
import { sendWelcomeEmail } from "../lib/email";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // SIGNUP
  async function signup(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(cred.user, { displayName });

    await createUserProfile(cred.user.uid, {
      email,
      displayName,
      photoURL: null,
    });

    // send welcome email
    sendWelcomeEmail(cred.user.uid, email, displayName).catch(() => {});

    return cred;
  }

  // LOGIN
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred;
  }

  // GOOGLE LOGIN
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);

    const existing = await getUserProfile(cred.user.uid);

    if (!existing) {
      await createUserProfile(cred.user.uid, {
        email: cred.user.email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
      });

      sendWelcomeEmail(
        cred.user.uid,
        cred.user.email,
        cred.user.displayName
      ).catch(() => {});
    }

    return cred;
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  async function refreshUserProfile() {
    if (currentUser) {
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        refreshUserProfile,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}