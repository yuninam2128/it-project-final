import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, increment } from 'firebase/firestore';

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

// 젤리를 증가시키는 함수 (원자적 연산으로 경쟁 조건 방지)
export const incrementUserCoins = async (userId, coinIncrements) => {
  if (!userId) return;
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  
  const increments = {};
  if (coinIncrements.fireJelly !== undefined) {
    increments['coins.fireJelly'] = increment(Number(coinIncrements.fireJelly));
  }
  if (coinIncrements.lightJelly !== undefined) {
    increments['coins.lightJelly'] = increment(Number(coinIncrements.lightJelly));
  }
  if (coinIncrements.heartJelly !== undefined) {
    increments['coins.heartJelly'] = increment(Number(coinIncrements.heartJelly));
  }
  
  if (Object.keys(increments).length === 0) return;
  
  increments.updatedAt = serverTimestamp();
  
  if (snap.exists()) {
    await updateDoc(ref, increments);
  } else {
    // 문서가 없으면 기본값으로 생성하고 증가
    const defaultData = {
      coins: {
        fireJelly: Number(coinIncrements.fireJelly ?? 0),
        lightJelly: Number(coinIncrements.lightJelly ?? 0),
        heartJelly: Number(coinIncrements.heartJelly ?? 0)
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(ref, defaultData);
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


