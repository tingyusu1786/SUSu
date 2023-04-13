import { db } from '../services/firebase';
import {
  collection,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  query,
  Query,
  orderBy,
  limit,
  onSnapshot,
  QuerySnapshot,
  Timestamp,
  updateDoc,
  where,
  DocumentReference,
  DocumentData,
  deleteDoc,
  startAfter,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { BrandsInfo } from '../interfaces/interfaces';

interface dbApi {}

const dbApi = {
  // todo: 應該要讓page都不用用到doc, db, ...
  async getDoc(docRef: DocumentReference) {
    const doc = await getDoc(docRef);
    return doc;
  },
  // todo: 應該要讓page都不用用到doc, db, ...
  async getDocField(docRef: DocumentReference, field: string) {
    const doc = await getDoc(docRef);
    if (!doc.exists()) {
      console.log(`No such document!(${docRef})`);
      return null;
    }
    const docData = doc.data();
    const docField = docData[field];
    return docField;
  },
  async getUserField(userId: string, field: string) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.log(`No such user!(${userId})`);
      return null;
    }
    const docData = userDoc.data();
    const docField = docData[field];
    return docField;
  },
  async getPostsWhere(userId?: string, brandId?: string, itemId?: string) {},

  async getAllBrandsInfo() {
    const querySnapshot = await getDocs(collection(db, 'brands'));
    const allBrandsInfo: BrandsInfo = {};
    querySnapshot.forEach((doc) => {
      if (doc.data() && doc.data().name) {
        allBrandsInfo[doc.id] = { name: doc.data().name, photoURL: doc.data().photoURL };
      }
    });
    return allBrandsInfo;
  },
};

export default dbApi;
