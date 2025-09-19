import { auth } from '../../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export class AuthService {
  async signUp(email, password, displayName, username) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      // Firestore에 추가 사용자 정보 저장
      if (username) {
        await this.saveUserToFirestore(userCredential.user.uid, {
          email: email,
          displayName: displayName,
          username: username,
          createdAt: new Date().toISOString()
        });
      }
      
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  async updateUserProfile(displayName, photoURL) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    try {
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async saveUserToFirestore(uid, userData) {
    try {
      await setDoc(doc(db, 'users', uid), userData);
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
      throw new Error('Failed to save user data');
    }
  }
}