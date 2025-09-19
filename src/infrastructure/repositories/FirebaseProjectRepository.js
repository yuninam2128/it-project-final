import { ProjectRepository } from '../../domain';
import { Project } from '../../domain';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

export class FirebaseProjectRepository extends ProjectRepository {
  constructor() {
    super();
    this.collection = collection(db, 'projects');
  }

  async create(project) {
    const data = {
      ...project.toJSON(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const ref = await addDoc(this.collection, data);
    return new Project({ 
      ...project.toJSON(), 
      id: ref.id 
    });
  }

  async getById(id) {
    const snap = await getDoc(doc(db, 'projects', id));
    if (!snap.exists()) {
      return null;
    }
    
    return new Project({ 
      id: snap.id, 
      ...snap.data() 
    });
  }

  async getByUserId(userId) {
    const q = userId
      ? query(this.collection, where('ownerId', '==', userId), orderBy('createdAt', 'desc'))
      : query(this.collection, orderBy('createdAt', 'desc'));
    
    const snap = await getDocs(q);
    const projects = [];
    const positions = {};
    
    snap.docs.forEach(d => {
      const data = d.data();
      const project = new Project({
        id: d.id,
        ...data
      });
      
      projects.push(project);
      
      if (data.position) {
        positions[d.id] = data.position;
      }
    });
    
    return { projects, positions };
  }

  async update(id, updates) {
    await updateDoc(doc(db, 'projects', id), { 
      ...updates, 
      updatedAt: serverTimestamp() 
    });
  }

  async updatePosition(id, position) {
    await updateDoc(doc(db, 'projects', id), {
      position: {
        x: position.x,
        y: position.y,
        radius: position.radius
      },
      updatedAt: serverTimestamp()
    });
  }

  async updateMultiplePositions(positionsUpdate) {
    const updatePromises = Object.entries(positionsUpdate).map(([projectId, position]) =>
      this.updatePosition(projectId, position)
    );
    
    await Promise.all(updatePromises);
  }

  async delete(id) {
    await deleteDoc(doc(db, 'projects', id));
  }

  subscribeToUserProjects(userId, callback) {
    if (!userId) {
      callback({ projects: [], positions: {} });
      return () => {};
    }
    
    const q = query(
      this.collection,
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const projects = [];
      const positions = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        if (data.ownerId !== userId) {
          console.warn('권한이 없는 프로젝트 실시간 데이터:', doc.id);
          return;
        }
        
        const project = new Project({
          id: doc.id,
          ...data
        });
        
        projects.push(project);
        
        if (data.position) {
          positions[doc.id] = data.position;
        }
      });
      
      callback({ projects, positions });
    }, (error) => {
      console.error('프로젝트 실시간 구독 중 오류:', error);
      callback({ projects: [], positions: {} });
    });
  }
}