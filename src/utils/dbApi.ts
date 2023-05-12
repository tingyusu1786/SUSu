/* eslint-disable */
import { db } from '../services/firebase';
import {
  collection,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  setDoc,
  query,
  Query,
  orderBy,
  limit,
  onSnapshot,
  QuerySnapshot,
  Timestamp,
  updateDoc,
  where,
  and,
  DocumentReference,
  DocumentData,
  deleteDoc,
  startAfter,
  arrayUnion,
  arrayRemove,
  FieldValue,
} from 'firebase/firestore';
import { Brand, User } from '../interfaces/interfaces';
import swal from './swal';

// interface dbApi {}
type FilteredUserData = {
  name: string;
  email: string;
  photoURL: string;
  timeCreated: Date;
  status?: string;
  followers?: string[];
  following?: string[];
};

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
  async getCategoriesIdAndName(
    brandId: string
  ): Promise<string[][] | undefined> {
    try {
      const querySnapshot = await getDocs(
        collection(db, 'brands', brandId, 'categories')
      );
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
  async getItemsIdAndName(
    brandId: string,
    categoryId: string
  ): Promise<string[][] | undefined> {
    try {
      const querySnapshot = await getDocs(
        collection(db, 'brands', brandId, 'categories', categoryId, 'items')
      );
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
  async getItemPrice(
    itemId: string
  ): Promise<Record<string, string> | undefined> {
    try {
      const idArray = itemId.split('-');
      const itemDocRef = doc(
        db,
        'brands',
        idArray[0],
        'categories',
        `${idArray[0]}-${idArray[1]}`,
        'items',
        itemId
      );
      const itemPrice = await dbApi.getDocField(itemDocRef, 'price');
      return itemPrice;
    } catch {
      swal.error('something went wrong', '', 'ok');
    }
  },
  async getItem(itemId: string) {
    try {
      const idArray = itemId.split('-');
      const itemDocRef = doc(
        db,
        'brands',
        idArray[0],
        'categories',
        `${idArray[0]}-${idArray[1]}`,
        'items',
        itemId
      );
      const itemInfo = (await getDoc(itemDocRef)).data();
      return itemInfo;
    } catch {
      swal.error('something went wrong', '', 'ok');
    }
  },
  //#
  async getUserField(
    userId: string,
    field: string
  ): Promise<string | undefined> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        swal.error(
          'Something went wrong (user not found)',
          'try agin later',
          'ok'
        );
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
        swal.error(
          'Something went wrong (user not found)',
          'try agin later',
          'ok'
        );
        return undefined;
      }
      const docData = userDoc.data();
      return docData as User;
    } catch {
      swal.error('Something went wrong', 'try again later', 'ok');
    }
  },
  async getFilteredUser(userId: string): Promise<FilteredUserData | undefined> {
    try {
      const userData = await this.getUser(userId);
      if (userData) {
        let filteredUserData: FilteredUserData = Object.keys(userData)
          .filter((key) => key !== 'notifications')
          .reduce((acc: any, key) => {
            acc[key] = userData[key as keyof FilteredUserData];
            if (key === 'timeCreated') {
              acc.timeCreated = String(userData.timeCreated.toDate());
            }
            return acc;
          }, {});
        return filteredUserData;
      }
    } catch {
      swal.error('Something went wrong', 'try again later', 'ok');
    }
  },
  //#
  async updateUserDoc(userId: string, content: Record<string, string>) {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, content);
  },
  async createNewUser(
    userId: string,
    content: Record<string, string | Date | Timestamp | FieldValue>
  ) {
    await setDoc(doc(db, 'users', userId), content);
  },
  //#
  async getPostInfo(postData: any) {
    const brandName: string = await this.getInfo(
      postData?.brandId,
      'brand',
      'name'
    );
    const itemName: string = await this.getInfo(
      postData?.itemId,
      'item',
      'name'
    );
    const authorName: string = await this.getInfo(
      postData?.authorId,
      'user',
      'name'
    );
    const authorPhoto: string = await this.getInfo(
      postData?.authorId,
      'user',
      'photoURL'
    );

    if (postData.comments) {
      const comments: Comment[] = await Promise.all(
        postData.comments.map(async (comment: any) => {
          const commentAuthorName: string = await this.getInfo(
            comment.authorId,
            'user',
            'name'
          );
          const commentAuthorPhoto: string = await this.getInfo(
            comment.authorId,
            'user',
            'photoURL'
          );
          return {
            ...comment,
            authorName: commentAuthorName,
            authorPhoto: commentAuthorPhoto,
          };
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
  //#
  async getInfo(
    id: string | undefined,
    type: 'brand' | 'item' | 'user',
    field: string
  ) {
    if (id !== undefined) {
      let docRef;
      switch (type) {
        case 'brand': {
          docRef = doc(db, 'brands', id);
          break;
        }
        case 'item': {
          const idArray = id.split('-');
          docRef = doc(
            db,
            'brands',
            idArray[0],
            'categories',
            idArray[0] + '-' + idArray[1],
            'items',
            id
          );
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
          swal.error('No such document!', '', 'ok');
          return '';
        }
        const data = doc.data();
        const fieldValue = data[field];
        return fieldValue;
      }
    }
  },
  //#
  async getProfileUserPosts(profileUserId: string, currentUserId: string) {
    const postsRef = collection(db, 'posts');

    let q;
    if (profileUserId === currentUserId) {
      q = query(
        postsRef,
        where('authorId', '==', profileUserId),
        orderBy('timeCreated', 'asc')
      );
    } else {
      q = query(
        postsRef,
        and(
          where('audience', '==', 'public'),
          where('authorId', '==', profileUserId)
        ),
        orderBy('timeCreated', 'asc')
      );
    }

    const querySnapshot: QuerySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(async (change) => {
      const postData = change.data();
      const brandName: string = await this.getInfo(
        postData.brandId || '',
        'brand',
        'name'
      );
      const itemName: string = await this.getInfo(
        postData.itemId || '',
        'item',
        'name'
      );
      return { ...postData, postId: change.id, brandName, itemName };
    });

    const postsWithQueriedInfos = await Promise.all(posts);
    return postsWithQueriedInfos;
  },
  async updateBrandRating(
    brandId: string,
    updatedBrandNumRatings: number,
    updatedBrandAverageRating: number
  ) {
    try {
      const brandRef = doc(db, 'brands', brandId);

      await updateDoc(brandRef, {
        numRatings: updatedBrandNumRatings,
        averageRating: updatedBrandAverageRating,
      });
    } catch {
      swal.error('Something went wrong', 'try agin later', 'ok');
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
};

export default dbApi;
