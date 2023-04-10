import { Timestamp } from 'firebase/firestore';

export interface Like {
  authorId: string;
  authorName: string;
  authorPhoto: string;
  timeCreated: Timestamp;
}

export interface Comment {
  authorId: string;
  authorName: string;
  authorPhoto: string;
  timeCreated: Timestamp;
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
  likes?: any[]; //todo
  orderNum?: string;
  price?: string;
  rating?: string;
  selfComment?: string;
  sugar?: string;
  size?: string;
  timeCreated?: Timestamp;
}

export interface Notification {
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content?: string;
  timeCreated: Timestamp;
  type: 'like' | 'comment;';
  postId: string;
  unread: boolean;
}
