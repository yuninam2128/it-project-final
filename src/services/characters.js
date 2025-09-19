import { db } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// 사용자 캐릭터 데이터 저장
export const saveUserCharacterData = async (userId, characterData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      characterData: {
        selectedCharacter: characterData.selectedCharacter,
        unlockedCharacters: characterData.unlockedCharacters,
        userMoney: characterData.userMoney,
        nickname: characterData.nickname,
        updatedAt: serverTimestamp()
      }
    });
  } catch (error) {
    console.error('Error saving character data:', error);
    throw error;
  }
};

// 사용자 캐릭터 데이터 불러오기
export const getUserCharacterData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.characterData || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting character data:', error);
    throw error;
  }
};

// 사용자 캐릭터 데이터 초기화 (첫 로그인 시)
export const initializeUserCharacterData = async (userId, defaultCharacters) => {
  try {
    const userRef = doc(db, 'users', userId);
    const initialData = {
      selectedCharacter: null,
      unlockedCharacters: defaultCharacters.map(char => ({ ...char, unlocked: char.unlocked })),
      userMoney: {
        A: 3,
        B: 2,
        C: 1,
        D: 1
      },
      nickname: '내이름은뿌꾸',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(userRef, { characterData: initialData }, { merge: true });
    return initialData;
  } catch (error) {
    console.error('Error initializing character data:', error);
    throw error;
  }
};
