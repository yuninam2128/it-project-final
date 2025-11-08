import { auth } from '../../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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
      
      // Firestore에 추가 사용자 정보 저장 (젤리 코인 포함)
      if (username) {
        await this.saveUserToFirestore(userCredential.user.uid, {
          email: email,
          displayName: displayName,
          username: username,
          coins: {
            fireJelly: 1000,    // 불꽃젤리
            lightJelly: 3000,   // 빛나는 젤리  
            heartJelly: 2000    // 하트젤리
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async signIn(email, password, keepLoggedIn = false) {
    try {
      // 로그인 유지 옵션에 따라 persistence 설정
      if (keepLoggedIn) {
        await setPersistence(auth, browserLocalPersistence);
      } else {
        await setPersistence(auth, browserSessionPersistence);
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 기존 사용자에게 젤리 코인 데이터가 없으면 생성
      await this.ensureUserCoins(userCredential.user.uid);
      
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async signOut() {
    try {
      // 로그아웃 시 세션 persistence로 변경하여 로그인 유지 해제
      await setPersistence(auth, browserSessionPersistence);
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

  async ensureUserCoins(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (!userData.coins) {
          // 젤리 코인 데이터가 없으면 추가
          await setDoc(userRef, {
            coins: {
              fireJelly: 1000,    // 불꽃젤리
              lightJelly: 3000,   // 빛나는 젤리  
              heartJelly: 2000    // 하트젤리
            },
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      }
    } catch (error) {
      console.error('Error ensuring user coins:', error);
    }
  }
}