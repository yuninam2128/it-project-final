// Temporary compatibility layer for auth service
// TODO: Migrate to Clean Architecture

import { AuthService } from '../infrastructure/services/AuthService.js';

const authService = new AuthService();

export const subscribeAuth = (callback) => {
  return authService.onAuthStateChanged(callback);
};

export const getCurrentUser = () => {
  return authService.getCurrentUser();
};

export const signIn = async (email, password, keepLoggedIn = false) => {
  return await authService.signIn(email, password, keepLoggedIn);
};

export const signUp = async (email, password, displayName, username) => {
  return await authService.signUp(email, password, displayName, username);
};

export const signOut = async () => {
  return await authService.signOut();
};

export const updateUserProfile = async (displayName, photoURL) => {
  return await authService.updateUserProfile(displayName, photoURL);
};

export const getCurrentUserDisplayName = () => {
  const user = authService.getCurrentUser();
  return user ? user.displayName : null;
};

export const signInWithEmail = async (email, password) => {
  return await authService.signIn(email, password);
};

export const signUpWithEmail = async (email, password, displayName, username) => {
  return await authService.signUp(email, password, displayName, username);
};