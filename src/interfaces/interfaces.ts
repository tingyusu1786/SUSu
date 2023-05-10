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

export interface Notification {
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  timeCreated: Timestamp;
  content?: string;
  type: 'like' | 'comment' | 'follow';
  postId?: string;
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
  comments?: any[]; //todo
  commentsShown: boolean;
  hashtags?: string[];
  ice?: string;
  itemId?: string;
  itemName?: string;
  likes?: Like[];
  orderNum?: string;
  price?: number | string; //手調之後就會變string
  rating?: 0 | string; //手調之後就會變string
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
  story: any;
  photoURL?: string;
}

export interface BrandsInfo {
  [brandId: string]: Brand;
}
