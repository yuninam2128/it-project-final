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
    
    // 문서 존재 여부 확인
    const userSnap = await getDoc(userRef);
    const existingData = userSnap.exists() ? userSnap.data() : {};
    const existingCharacterData = existingData.characterData || {};
    
    // 기존 데이터와 병합
    const updatedCharacterData = {
      ...existingCharacterData,
      selectedCharacter: characterData.selectedCharacter !== undefined ? characterData.selectedCharacter : existingCharacterData.selectedCharacter,
      unlockedCharacters: characterData.unlockedCharacters !== undefined ? characterData.unlockedCharacters : existingCharacterData.unlockedCharacters,
      nickname: characterData.nickname !== undefined ? characterData.nickname : existingCharacterData.nickname,
      updatedAt: serverTimestamp()
    };
    
    // userMoney가 제공된 경우에만 업데이트
    if (characterData.userMoney !== undefined) {
      updatedCharacterData.userMoney = characterData.userMoney;
    }
    
    // 문서가 없으면 생성, 있으면 업데이트
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        characterData: updatedCharacterData
      });
    } else {
      await setDoc(userRef, {
        characterData: updatedCharacterData
      }, { merge: true });
    }
    
    console.log('캐릭터 데이터 저장 완료:', updatedCharacterData);
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
        fireJelly: 1000,
        lightJelly: 3000,
        heartJelly: 2000
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
