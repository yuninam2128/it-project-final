import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

const defaultCoins = { 
  fireJelly: 0,    // 불꽃젤리
  lightJelly: 0,   // 빛나는 젤리  
  heartJelly: 0    // 하트젤리
};

export const subscribeUserCoins = (userId, callback) => {
  if (!userId) return () => callback(defaultCoins);
  const ref = doc(db, 'users', userId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(defaultCoins);
      return;
    }
    const data = snap.data();
    callback(data.coins || defaultCoins);
  }, () => {
    callback(defaultCoins);
  });
};

export const getUserCoins = async (userId) => {
  if (!userId) return defaultCoins;
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return defaultCoins;
  const data = snap.data();
  return data.coins || defaultCoins;
};

export const setUserCoins = async (userId, coins) => {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  const payload = {
 coins: {
      fireJelly: Number(coins?.fireJelly ?? defaultCoins.fireJelly),
      lightJelly: Number(coins?.lightJelly ?? defaultCoins.lightJelly),
      heartJelly: Number(coins?.heartJelly ?? defaultCoins.heartJelly)
    },
    updatedAt: serverTimestamp()
  };
  if (snap.exists()) {
    await updateDoc(ref, payload);
  } else {
    await setDoc(ref, { ...payload, createdAt: serverTimestamp() });
  }
};

export const ensureUserCoins = async (userId) => {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { coins: defaultCoins, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  } else {
    const data = snap.data();
    if (!data.coins) {
      await updateDoc(ref, { coins: defaultCoins, updatedAt: serverTimestamp() });
    }
  }
};


