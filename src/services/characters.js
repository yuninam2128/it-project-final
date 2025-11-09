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
    
    // merge 옵션을 사용하여 기존 데이터를 보존하면서 업데이트
    // getDoc을 호출하지 않아서 불필요한 읽기 작업 방지
    const updatedCharacterData = {
      selectedCharacter: characterData.selectedCharacter !== undefined ? characterData.selectedCharacter : null,
      unlockedCharacters: characterData.unlockedCharacters !== undefined ? characterData.unlockedCharacters : [],
      nickname: characterData.nickname !== undefined ? characterData.nickname : '내이름은뿌꾸',
      updatedAt: serverTimestamp()
    };
    
    // userMoney가 제공된 경우에만 업데이트
    if (characterData.userMoney !== undefined) {
      updatedCharacterData.userMoney = characterData.userMoney;
    }
    
    // merge 옵션을 사용하여 기존 데이터를 보존하면서 업데이트
    // 문서가 없으면 자동으로 생성됨
    await updateDoc(userRef, {
      characterData: updatedCharacterData
    }).catch(async (error) => {
      // 문서가 존재하지 않으면 setDoc으로 생성
      if (error.code === 'not-found' || error.code === 'permission-denied') {
        await setDoc(userRef, {
          characterData: updatedCharacterData
        }, { merge: true });
      } else {
        throw error;
      }
    });
    
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
