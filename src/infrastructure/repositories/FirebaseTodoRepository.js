import { TodoRepository } from '../../domain';
import { Todo } from '../../domain';
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
  orderBy
} from 'firebase/firestore';

export class FirebaseTodoRepository extends TodoRepository {
  constructor() {
    super();
    this.collection = collection(db, 'todos');
  }

  async create(todo) {
    const data = {
      ...todo.toJSON(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const ref = await addDoc(this.collection, data);
    return new Todo({ 
      ...todo.toJSON(), 
      id: ref.id 
    });
  }

  async getById(id) {
    const snap = await getDoc(doc(db, 'todos', id));
    if (!snap.exists()) {
      return null;
    }
    
    return new Todo({ 
      id: snap.id, 
      ...snap.data() 
    });
  }

  async getByProjectId(projectId) {
    const q = query(
      this.collection, 
      where('projectId', '==', projectId), 
      orderBy('createdAt', 'desc')
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(d => new Todo({ 
      id: d.id, 
      ...d.data() 
    }));
  }

  async update(id, updates) {
    await updateDoc(doc(db, 'todos', id), { 
      ...updates, 
      updatedAt: serverTimestamp() 
    });
  }

  async delete(id) {
    await deleteDoc(doc(db, 'todos', id));
  }
}