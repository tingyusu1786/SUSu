import { Timestamp } from 'firebase/firestore';

export interface User {
  name: string;
  email: string;
  photoURL: string;
  status?: string;
  timeCreated: Timestamp;
  followers?: string[];
  following?: string[];
  notifications?: Notification[];
}

export type FilteredUserData = {
  name: string;
  email: string;
  photoURL: string;
  timeCreated: Date;
  status?: string;
  followers?: string[];
  following?: string[];
};

export interface Notification {
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  timeCreated: Timestamp;
  content?: string;
  type: 'like' | 'comment' | 'follow';
  postId?: string;
  commentId?: string;
  unread: boolean;
}

export interface Like {
  authorId: string;
  authorName: string;
  authorPhoto: string;
  timeCreated: Timestamp;
  type?: 'like';
}

export interface Comment {
  authorId: string;
  authorName: string;
  authorPhoto: string;
  commentId: string;
  timeCreated: Timestamp;
  type?: 'comment';
  content: string;
}

export interface Post {
  postId: string;
  audience?: string;
  authorId?: string;
  authorName?: string;
  authorPhoto?: string;
  brandId?: string;
  brandName?: string;
  commentInput?: string;
  comments?: any[];
  commentsShown: boolean;
  hashtags?: string[];
  ice?: string;
  itemId?: string;
  itemName?: string;
  likes?: Like[];
  orderNum?: string;
  price?: number | string;
  rating?: 0 | string;
  selfComment?: string;
  sugar?: string;
  size?: string;
  timeCreated?: Timestamp;
}

export interface Brand {
  averageRating?: number;
  brandId: string;
  headquarter: string;
  myCupDiscount: number;
  name: string;
  numRatings?: number;
  numStore: number;
  size: { [key: string]: number };
  story: string;
  photoURL?: string;
}

export interface Item {
  averageRating?: number | string;
  name: string;
  numRatings?: number | string;
  price: Record<string, number>;
}

export interface BrandsInfo {
  [brandId: string]: Brand;
}
