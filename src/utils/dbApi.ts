/* eslint-disable */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  QuerySnapshot,
  Timestamp,
  updateDoc,
  where,
  and,
  DocumentReference,
  arrayUnion,
  arrayRemove,
  FieldValue,
} from 'firebase/firestore';

import {
  Brand,
  User,
  Notification,
  FilteredUserData,
} from '../interfaces/interfaces';
import { db } from '../services/firebase';
import swal from './swal';

const dbApi = {
  async getAllBrandsInfo() {
    try {
      const querySnapshot = await getDocs(collection(db, 'brands'));
      const allBrandsInfo: { [brandId: string]: Brand } = {};
      querySnapshot.forEach((doc) => {
        allBrandsInfo[doc.id] = { ...doc.data(), brandId: doc.id } as Brand;
      });
      return allBrandsInfo;
    } catch {
      swal.error(
        'Something went wrong when getting brands info',
        'try again later',
        'ok'
      );
    }
  },
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
      const itemPrice = await this.getDocField(itemDocRef, 'price');
      return itemPrice;
    } catch {
      swal.error('Something went wrong', '', 'ok');
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
      swal.error('Something went wrong', '', 'ok');
    }
  },
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
    } catch (error: any) {
      swal.toast(
        'Something went wrong when getting user name' as unknown as JSX.Element
      );
    }
  },
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
  async getProfileUserPosts(
    profileUserId: string,
    currentUserId: string | undefined
  ) {
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
  async handleFollow(
    currentUserId: string | undefined,
    currentUserName: string,
    profileUserId: string,
    isFollowing: boolean | undefined
  ) {
    {
      if (!profileUserId || !currentUserId) {
        return;
      }
      const profileUserRef = doc(db, 'users', profileUserId);
      const currentUserRef = doc(db, 'users', currentUserId);
      const newEntry = {
        authorId: currentUserId,
        authorName: currentUserName,
        timeCreated: new Date(),
        type: 'follow',
        unread: true,
      };
      if (!isFollowing) {
        await updateDoc(profileUserRef, {
          followers: arrayUnion(currentUserId),
        });
        await updateDoc(currentUserRef, {
          following: arrayUnion(profileUserId),
        });
        await updateDoc(profileUserRef, {
          notifications: arrayUnion(newEntry),
        });
      } else {
        await updateDoc(profileUserRef, {
          followers: arrayRemove(currentUserId),
        });
        await updateDoc(currentUserRef, {
          following: arrayRemove(profileUserId),
        });
        const profileUserData = await getDoc(profileUserRef);
        const originNotifications = profileUserData.data()?.notifications;
        if (!originNotifications) return;
        const notificationToRemove = originNotifications.find(
          (notification: Notification) =>
            notification.authorId === currentUserId &&
            notification.type === 'follow'
        );
        await updateDoc(profileUserRef, {
          notifications: arrayRemove(notificationToRemove),
        });
      }
    }
  },
  async getNotifications(userId: string) {
    const userRef = doc(db, 'users', userId);
    if (!userRef) {
      return;
    }
    const currentUserDoc = await getDoc(userRef);
    if (!currentUserDoc.exists()) {
      swal.error(
        'Something went wrong when retrieving your notifications...',
        '',
        'ok'
      );
      return;
    }
    const currentUserData = currentUserDoc.data();
    const currentUserNotifications =
      currentUserData?.notifications
        ?.reverse()
        .filter(
          (notif: { authorId: string | null }) => notif.authorId !== userId
        ) || [];
    return currentUserNotifications;
  },
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
