/* eslint-disable */
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
import { Brand, User } from '../interfaces/interfaces';
import swal from './swal';

// interface dbApi {}

const dbApi = {
  //#
  async getAllBrandsInfo() {
    try {
      const querySnapshot = await getDocs(collection(db, 'brands'));
      const allBrandsInfo: { [brandId: string]: Brand } = {};
      querySnapshot.forEach((doc) => {
        allBrandsInfo[doc.id] = { ...doc.data(), brandId: doc.id } as Brand;
      });
      return allBrandsInfo;
    } catch {
      swal.error('Something went wrong', 'try again later', 'ok');
    }
  },
  //#
  async getCategoriesIdAndName(brandId: string): Promise<string[][] | undefined> {
    try {
      const querySnapshot = await getDocs(collection(db, 'brands', brandId, 'categories'));
      const documents: string[][] = [];
      querySnapshot.forEach((doc) => {
        const docInfo = [];
        docInfo.push(doc.id);
        if (doc.data() && doc.data().name) {
          docInfo.push(doc.data().name);
        }
        documents.push(docInfo);
      });
      return documents;
    } catch {
      swal.error('Something went wrong', 'try again later', 'ok');
    }
  },
  //#
  async getItemsIdAndName(brandId: string, categoryId: string): Promise<string[][] | undefined> {
    try {
      const querySnapshot = await getDocs(collection(db, 'brands', brandId, 'categories', categoryId, 'items'));
      let documents: string[][] = [];
      querySnapshot.forEach((doc) => {
        const docInfo = [doc.id];
        if (doc.data() && doc.data().name) {
          docInfo.push(doc.data().name);
        }
        documents = [...documents, docInfo];
      });
      return documents;
    } catch {
      swal.error('Something went wrong', 'try again later', 'ok');
    }
  },
  //#
  async getUserField(userId: string, field: string): Promise<string | undefined> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        swal.error('Something went wrong (user not found)', 'try agin later', 'ok');
        return undefined;
      }
      const docData = userDoc.data();
      const docField = docData[field];
      return docField;
    } catch {
      swal.error('Something went wrong', 'try again later', 'ok');
    }
  },
  //#
  async getUser(userId: string): Promise<User | undefined> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        swal.error('Something went wrong (user not found)', 'try agin later', 'ok');
        return undefined;
      }
      const docData = userDoc.data();
      return docData as User;
    } catch {
      swal.error('Something went wrong', 'try again later', 'ok');
    }
  },

  // todo: 應該要讓page都不用用到doc, db, ...
  async getDoc(docRef: DocumentReference) {
    const doc = await getDoc(docRef);
    return doc;
  },
  // todo: 應該要讓page都不用用到doc, db, ...
  async getDocField(docRef: DocumentReference, field: string) {
    const doc = await getDoc(docRef);
    if (!doc.exists()) {
      swal.error('Something went wrong', 'try agin later', 'ok');
      return null;
    }
    const docData = doc.data();
    const docField = docData[field];
    return docField;
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
