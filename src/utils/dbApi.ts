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
  async getInfo(id: string | undefined, type: string, field: string) {
    if (id !== undefined) {
      let docRef;
      switch (type) {
        case 'brand': {
          docRef = doc(db, 'brands', id);
          break;
        }
        case 'item': {
          const idArray = id.split('-');
          docRef = doc(db, 'brands', idArray[0], 'categories', idArray[0] + '-' + idArray[1], 'items', id);
          break;
        }
        case 'user': {
          docRef = doc(db, 'users', id);
          break;
        }
        default: {
          return;
        }
      }
      if (docRef !== undefined) {
        const doc = await getDoc(docRef);
        if (!doc.exists()) {
          alert('No such document!');
          return '';
        }
        const data = doc.data();
        const fieldValue = data[field];
        return fieldValue;
      }
    }
  },

  async getPostInfo(postData: any) {
    const brandName: string = await this.getInfo(postData?.brandId, 'brand', 'name');
    const itemName: string = await this.getInfo(postData?.itemId, 'item', 'name');
    const authorName: string = await this.getInfo(postData?.authorId, 'user', 'name');
    const authorPhoto: string = await this.getInfo(postData?.authorId, 'user', 'photoURL');

    if (postData.comments) {
      const comments: Comment[] = await Promise.all(
        postData.comments.map(async (comment: any) => {
          const commentAuthorName: string = await this.getInfo(comment.authorId, 'user', 'name');
          const commentAuthorPhoto: string = await this.getInfo(comment.authorId, 'user', 'photoURL');
          return { ...comment, authorName: commentAuthorName, authorPhoto: commentAuthorPhoto };
        })
      );

      return {
        ...postData,
        brandName,
        itemName,
        authorName,
        authorPhoto,
        comments,
      };
    }

    return {
      ...postData,
      brandName,
      itemName,
      authorName,
      authorPhoto,
    };
  },
};

export default dbApi;
