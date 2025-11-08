// Temporary compatibility layer for projects service
// TODO: Migrate to Clean Architecture

import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  query,
  where
} from 'firebase/firestore';

const projectsCol = collection(db, 'projects');

export const createProject = async (projectData) => {
  try{
    const nowFields = {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

        // deadline을 Firestore Timestamp로 변환
    let deadlineTimestamp = null;
    if (projectData.deadline) {
      if (projectData.deadline instanceof Date) {
        // Date 객체인 경우 Timestamp로 변환
        deadlineTimestamp = Timestamp.fromDate(projectData.deadline);
      } else if (projectData.deadline.toDate && typeof projectData.deadline.toDate === 'function') {
        // 이미 Timestamp인 경우 그대로 사용
        deadlineTimestamp = projectData.deadline;
      } else {
        // 문자열이나 다른 형식인 경우 Date로 변환 후 Timestamp로 변환
        deadlineTimestamp = Timestamp.fromDate(new Date(projectData.deadline));
      }
    }

  const data = {
    title: projectData.title,
    description: projectData.description ?? '',
    priority: projectData.priority ?? '중',
    progress: Number(projectData.progress ?? 0),
    deadline: projectData.deadline ?? null,
    ownerId: projectData.ownerId,
    position: projectData.position ?? null,
    subtasks: projectData.subtasks ?? [],
    ...nowFields
  };

    console.log('Firestore에 저장할 데이터:', data);
    const ref = await addDoc(projectsCol, data);
    console.log('프로젝트 생성 성공, ID:', ref.id);
    return { id: ref.id, ...data };
  } catch (error) {
    console.error('createProject 함수에서 오류 발생:', error);
    console.error('오류 상세:', error.message, error.code, error.stack);
    throw error; // 에러를 다시 던져서 상위에서 처리할 수 있도록
  }
};

export const updateProject = async (projectId, updates) => {
  const docRef = doc(db, 'projects', projectId);
  //await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
  //const snap = await getDoc(docRef);
  //return snap.exists() ? { id: snap.id, ...snap.data() } : null;
//};

  // deadline이 있으면 Firestore Timestamp로 변환
  const updateData = { ...updates };
  if (updateData.deadline !== undefined) {
    if (updateData.deadline === null) {
      updateData.deadline = null;
    } else if (updateData.deadline instanceof Date) {
      updateData.deadline = Timestamp.fromDate(updateData.deadline);
    } else if (updateData.deadline.toDate && typeof updateData.deadline.toDate === 'function') {
      // 이미 Timestamp인 경우 그대로 사용
      // updateData.deadline은 이미 Timestamp이므로 변경 없음
    } else {
      // 문자열이나 다른 형식인 경우 Date로 변환 후 Timestamp로 변환
      updateData.deadline = Timestamp.fromDate(new Date(updateData.deadline));
    }
  }
  
  await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const deleteProject = async (projectId) => {
  await deleteDoc(doc(db, 'projects', projectId));
};

export const getUserProjects = async (userId) => {
  const snap = await getDocs(projectsCol);
  const projects = [];
  const positions = {};

  snap.docs.forEach(d => {
    const data = d.data();
    if (!userId || data.ownerId === userId) {
      projects.push({ id: d.id, ...data });
      if (data.position) positions[d.id] = data.position;
    }
  });

  return { projects, positions };
};

export const getProject = async (projectId) => {
  const snap = await getDoc(doc(db, 'projects', projectId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateProjectPosition = async (projectId, position) => {
  await updateDoc(doc(db, 'projects', projectId), {
    position: { x: position.x, y: position.y, radius: position.radius },
    updatedAt: serverTimestamp()
  });
};

export const updateMultipleProjectPositions = async (positions) => {
  const ops = Object.entries(positions).map(([projectId, position]) =>
    updateProjectPosition(projectId, position)
  );
  await Promise.all(ops);
};

export const subscribeToUserProjects = (userId, callback) => {
  if (!userId) {
    console.warn('subscribeToUserProjects: userId가 없습니다.');
    callback({ projects: [], positions: {} });
    return () => {};
  }

  // ownerId로 필터링하는 쿼리 생성
  const q = query(projectsCol, where('ownerId', '==', userId));
  
  console.log('프로젝트 실시간 구독 시작 (userId:', userId, ')');
  
  return onSnapshot(q, (querySnapshot) => {
    console.log('프로젝트 데이터 수신:', querySnapshot.size, '개 문서');
    const projects = [];
    const positions = {};
    
    querySnapshot.forEach((d) => {
      const data = d.data();
      console.log('프로젝트 문서:', d.id, {
        title: data.title,
        ownerId: data.ownerId,
        hasPosition: !!data.position,
        position: data.position
      });
      
      projects.push({ id: d.id, ...data });
      if (data.position) {
        positions[d.id] = data.position;
        console.log('위치 정보 추가:', d.id, data.position);
      } else {
        console.warn('프로젝트에 위치 정보가 없습니다:', d.id);
      }
    });
    
    console.log('파싱 완료 - 프로젝트:', projects.length, '개, 위치:', Object.keys(positions).length, '개');
    console.log('프로젝트 목록:', projects.map(p => ({ id: p.id, title: p.title })));
    console.log('위치 정보:', positions);
    
    callback({ projects, positions });
  }, (error) => {
    console.error('프로젝트 실시간 구독 중 오류:', error);
    console.error('오류 코드:', error.code);
    console.error('오류 메시지:', error.message);
    callback({ projects: [], positions: {} });
  });
};

// ===== Project detail (subtasks) helpers =====

export const subscribeToProject = (projectId, callback) => {
  if (!projectId) return () => {};
  const ref = doc(db, 'projects', projectId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({ id: snap.id, ...data });
  }, (error) => {
    console.error('프로젝트 구독 중 오류:', error);
    callback(null);
  });
};

export const addSubtask = async (projectId, subtask) => {
  const ref = doc(db, 'projects', projectId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const prev = Array.isArray(data.subtasks) ? data.subtasks : [];
  const newSubtasks = [...prev, subtask];
  await updateDoc(ref, { subtasks: newSubtasks, updatedAt: serverTimestamp() });
  return newSubtasks;
};

export const updateSubtask = async (projectId, updatedSubtask) => {
  const ref = doc(db, 'projects', projectId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const prev = Array.isArray(data.subtasks) ? data.subtasks : [];
  const newSubtasks = prev.map(st => st.id === updatedSubtask.id ? updatedSubtask : st);
  await updateDoc(ref, { subtasks: newSubtasks, updatedAt: serverTimestamp() });
  return newSubtasks;
};

export const deleteSubtask = async (projectId, subtaskId) => {
  const ref = doc(db, 'projects', projectId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const prev = Array.isArray(data.subtasks) ? data.subtasks : [];
  const newSubtasks = prev.filter(st => st.id !== subtaskId);
  // subtaskPositions에서도 제거
  const nextPositions = { ...(data.subtaskPositions || {}) };
  if (nextPositions[subtaskId]) delete nextPositions[subtaskId];
  await updateDoc(ref, { subtasks: newSubtasks, subtaskPositions: nextPositions, updatedAt: serverTimestamp() });
  return newSubtasks;
};

export const updateSubtaskPosition = async (projectId, subtaskId, position) => {
  const ref = doc(db, 'projects', projectId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const prevPositions = data.subtaskPositions || {};
  const next = {
    ...prevPositions,
    [subtaskId]: { x: position.x, y: position.y, radius: position.radius }
  };
  await updateDoc(ref, { subtaskPositions: next, updatedAt: serverTimestamp() });
  return next;
};

// ===== Subtask Todo helpers =====

export const subscribeToSubtaskTodos = (projectId, subtaskId, callback) => {
  if (!projectId || !subtaskId) return () => callback({});
  const ref = doc(db, 'projects', projectId, 'subtasks', subtaskId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback({});
      return;
    }
    const data = snap.data();
    callback(data.todos || {});
  }, (error) => {
    console.error('서브태스크 할일 구독 중 오류:', error);
    callback({});
  });
};

export const addSubtaskTodo = async (projectId, subtaskId, dateKey, todo) => {
  const ref = doc(db, 'projects', projectId, 'subtasks', subtaskId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const prevTodos = data.todos || {};
  const dateTodos = prevTodos[dateKey] || [];
  const newTodos = [...dateTodos, { ...todo, id: Date.now().toString() }];
  
  const nextTodos = {
    ...prevTodos,
    [dateKey]: newTodos
  };
  
  if (snap.exists()) {
    await updateDoc(ref, { todos: nextTodos, updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, { todos: nextTodos, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
  return nextTodos;
};

export const updateSubtaskTodo = async (projectId, subtaskId, dateKey, todoId, updates) => {
  const ref = doc(db, 'projects', projectId, 'subtasks', subtaskId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const prevTodos = data.todos || {};
  const dateTodos = prevTodos[dateKey] || [];
  const newTodos = dateTodos.map(todo => 
    todo.id === todoId ? { ...todo, ...updates } : todo
  );
  
  const nextTodos = {
    ...prevTodos,
    [dateKey]: newTodos
  };
  
  await updateDoc(ref, { todos: nextTodos, updatedAt: serverTimestamp() });
  return nextTodos;
};

export const deleteSubtaskTodo = async (projectId, subtaskId, dateKey, todoId) => {
  const ref = doc(db, 'projects', projectId, 'subtasks', subtaskId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const prevTodos = data.todos || {};
  const dateTodos = prevTodos[dateKey] || [];
  const newTodos = dateTodos.filter(todo => todo.id !== todoId);
  
  const nextTodos = {
    ...prevTodos,
    [dateKey]: newTodos
  };
  
  await updateDoc(ref, { todos: nextTodos, updatedAt: serverTimestamp() });
  return nextTodos;
};


/*
export const deleteProject = async (projectId) => {
  await deleteDoc(doc(db, 'projects', projectId));
};

export const getUserProjects = async (userId) => {
  const snap = await getDocs(projectsCol);
  const projects = [];
  const positions = {};

  snap.docs.forEach(d => {
    const data = d.data();
    if (!userId || data.ownerId === userId) {
      projects.push({ id: d.id, ...data });
      if (data.position) positions[d.id] = data.position;
    }
  });

  return { projects, positions };
};

export const getProject = async (projectId) => {
  const snap = await getDoc(doc(db, 'projects', projectId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateProjectPosition = async (projectId, position) => {
  await updateDoc(doc(db, 'projects', projectId), {
    position: { x: position.x, y: position.y, radius: position.radius },
    updatedAt: serverTimestamp()
  });
};

export const updateMultipleProjectPositions = async (positions) => {
  const ops = Object.entries(positions).map(([projectId, position]) =>
    updateProjectPosition(projectId, position)
  );
  await Promise.all(ops);
};

export const subscribeToUserProjects = (userId, callback) => {
  return onSnapshot(projectsCol, (querySnapshot) => {
    const projects = [];
    const positions = {};
    querySnapshot.forEach((d) => {
      const data = d.data();
      if (!userId || data.ownerId === userId) {
        projects.push({ id: d.id, ...data });
        if (data.position) positions[d.id] = data.position;
      }
    });
    callback({ projects, positions });
  }, (error) => {
    console.error('프로젝트 실시간 구독 중 오류:', error);
    callback({ projects: [], positions: {} });
  });
};

// ===== Project detail (subtasks) helpers =====

export const subscribeToProject = (projectId, callback) => {
  if (!projectId) return () => {};
  const ref = doc(db, 'projects', projectId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({ id: snap.id, ...data });
  }, (error) => {
    console.error('프로젝트 구독 중 오류:', error);
    callback(null);
  });
};

export const addSubtask = async (projectId, subtask) => {
  const ref = doc(db, 'projects', projectId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const prev = Array.isArray(data.subtasks) ? data.subtasks : [];
  const newSubtasks = [...prev, subtask];
  await updateDoc(ref, { subtasks: newSubtasks, updatedAt: serverTimestamp() });
  return newSubtasks;
};

export const updateSubtask = async (projectId, updatedSubtask) => {
  const ref = doc(db, 'projects', projectId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const prev = Array.isArray(data.subtasks) ? data.subtasks : [];
  const newSubtasks = prev.map(st => st.id === updatedSubtask.id ? updatedSubtask : st);
  await updateDoc(ref, { subtasks: newSubtasks, updatedAt: serverTimestamp() });
  return newSubtasks;
};

export const deleteSubtask = async (projectId, subtaskId) => {
  const ref = doc(db, 'projects', projectId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const prev = Array.isArray(data.subtasks) ? data.subtasks : [];
  const newSubtasks = prev.filter(st => st.id !== subtaskId);
  // subtaskPositions에서도 제거
  const nextPositions = { ...(data.subtaskPositions || {}) };
  if (nextPositions[subtaskId]) delete nextPositions[subtaskId];
  await updateDoc(ref, { subtasks: newSubtasks, subtaskPositions: nextPositions, updatedAt: serverTimestamp() });
  return newSubtasks;
};

export const updateSubtaskPosition = async (projectId, subtaskId, position) => {
  const ref = doc(db, 'projects', projectId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const prevPositions = data.subtaskPositions || {};
  const next = {
    ...prevPositions,
    [subtaskId]: { x: position.x, y: position.y, radius: position.radius }
  };
  await updateDoc(ref, { subtaskPositions: next, updatedAt: serverTimestamp() });
  return next;
};

// ===== Subtask Todo helpers =====

export const subscribeToSubtaskTodos = (projectId, subtaskId, callback) => {
  if (!projectId || !subtaskId) return () => callback({});
  const ref = doc(db, 'projects', projectId, 'subtasks', subtaskId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback({});
      return;
    }
    const data = snap.data();
    callback(data.todos || {});
  }, (error) => {
    console.error('서브태스크 할일 구독 중 오류:', error);
    callback({});
  });
};

export const addSubtaskTodo = async (projectId, subtaskId, dateKey, todo) => {
  const ref = doc(db, 'projects', projectId, 'subtasks', subtaskId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const prevTodos = data.todos || {};
  const dateTodos = prevTodos[dateKey] || [];
  const newTodos = [...dateTodos, { ...todo, id: Date.now().toString() }];
  
  const nextTodos = {
    ...prevTodos,
    [dateKey]: newTodos
  };
  
  if (snap.exists()) {
    await updateDoc(ref, { todos: nextTodos, updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, { todos: nextTodos, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
  return nextTodos;
};

export const updateSubtaskTodo = async (projectId, subtaskId, dateKey, todoId, updates) => {
  const ref = doc(db, 'projects', projectId, 'subtasks', subtaskId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const prevTodos = data.todos || {};
  const dateTodos = prevTodos[dateKey] || [];
  const newTodos = dateTodos.map(todo => 
    todo.id === todoId ? { ...todo, ...updates } : todo
  );
  
  const nextTodos = {
    ...prevTodos,
    [dateKey]: newTodos
  };
  
  await updateDoc(ref, { todos: nextTodos, updatedAt: serverTimestamp() });
  return nextTodos;
};

export const deleteSubtaskTodo = async (projectId, subtaskId, dateKey, todoId) => {
  const ref = doc(db, 'projects', projectId, 'subtasks', subtaskId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const prevTodos = data.todos || {};
  const dateTodos = prevTodos[dateKey] || [];
  const newTodos = dateTodos.filter(todo => todo.id !== todoId);
  
  const nextTodos = {
    ...prevTodos,
    [dateKey]: newTodos
  };
  
  await updateDoc(ref, { todos: nextTodos, updatedAt: serverTimestamp() });
  return nextTodos;
};
*/