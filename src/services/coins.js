import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

const defaultCoins = { A: 0, B: 0, C: 0, D: 0 };

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
      A: Number(coins?.A ?? 0),
      B: Number(coins?.B ?? 0),
      C: Number(coins?.C ?? 0),
      D: Number(coins?.D ?? 0)
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


