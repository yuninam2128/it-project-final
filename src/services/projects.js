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
  onSnapshot
} from 'firebase/firestore';

const projectsCol = collection(db, 'projects');

export const createProject = async (projectData) => {
  const nowFields = {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

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

  const ref = await addDoc(projectsCol, data);
  return { id: ref.id, ...data };
};

export const updateProject = async (projectId, updates) => {
  const docRef = doc(db, 'projects', projectId);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
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