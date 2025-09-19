import React, { useState, useEffect, createContext, useContext } from 'react';
import { subscribeAuth, signIn, signOut, signUp } from '../../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setUser(user);
      setIsLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await signIn(email, password);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email, password, displayName) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await signUp(email, password, displayName);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signOut();
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Legacy hook for backward compatibility
export const useAuthLegacy = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setUser(user);
      setIsLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await signIn(email, password);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email, password, displayName) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await signUp(email, password, displayName);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signOut();
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    isAuthenticated: !!user
  };
};