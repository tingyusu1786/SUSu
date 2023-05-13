/* eslint-disable */

import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import { db } from '../../services/firebase';
import dbApi from '../../utils/dbApi';
import {
  collection,
  doc,
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
  DocumentData,
  deleteDoc,
  startAfter,
  arrayUnion,
  arrayRemove,
  or,
  and,
} from 'firebase/firestore';
import { showAuth } from '../../app/popUpSlice';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { Post } from '../../interfaces/interfaces';
import PostCard from './PostCard';
import { v4 as uuidv4 } from 'uuid';
import swal from '../../utils/swal';
import { SmileyWink } from '@phosphor-icons/react';

interface PostsProps {
  onlySeeFollowing?: boolean;
  currentPage: 'posts' | 'profile' | 'brand' | 'item' | 'log';
  logId?: string;
  profileUserId?: string;
  pageBrandId?: string;
  pageItemId?: string;
}

const PostsFeed: React.FC<PostsProps> = ({
  onlySeeFollowing = false,
  currentPage,
  logId,
  profileUserId,
  pageBrandId,
  pageItemId,
}) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);

  const [posts, setPosts] = useState<Post[]>([]);
  const [hashtagFilter, setHashtagFilter] = useState<string | undefined>();

  const [lastKey, setLastKey] = useState<Timestamp>();
  const [bottomMessage, setBottomMessage] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const initSnap = useRef(true);
  const isFetching = useRef(false);
  const hashtagRef = useRef<null | HTMLDivElement>(null);

  // add listener for newly added post
  useEffect(() => {
    if (
      onlySeeFollowing &&
      (currentUser.following === undefined ||
        currentUser.following?.length === 0 ||
        !currentUserId)
    ) {
      return;
    }

    if (currentPage === 'log') {
      return;
    }

    let q: Query<DocumentData> = query(collection(db, 'posts'));
    if (currentPage === 'posts') {
      if (onlySeeFollowing) {
        q = query(
          collection(db, 'posts'),
          and(
            where('authorId', 'in', currentUser.following),
            or(
              where('audience', '==', 'public'),
              where('authorId', '==', currentUserId)
            )
          ),
          orderBy('timeCreated', 'desc')
        );
      } else {
        q = query(
          collection(db, 'posts'),
          or(
            where('audience', '==', 'public'),
            where('authorId', '==', currentUserId)
          ),
          orderBy('timeCreated', 'desc')
        );
      }
    } else if (currentPage === 'profile') {
      if (profileUserId === currentUserId) {
        q = query(
          collection(db, 'posts'),
          where('authorId', '==', profileUserId),
          orderBy('timeCreated', 'desc')
        );
      } else {
        q = query(
          collection(db, 'posts'),
          and(
            where('audience', '==', 'public'),
            where('authorId', '==', profileUserId)
          ),
          orderBy('timeCreated', 'desc')
        );
      }
    } else if (currentPage === 'brand') {
      q = query(
        collection(db, 'posts'),
        and(
          where('brandId', '==', pageBrandId),
          or(
            where('audience', '==', 'public'),
            where('authorId', '==', currentUserId)
          )
        ),
        orderBy('timeCreated', 'desc')
      );
    } else if (currentPage === 'item') {
      q = query(
        collection(db, 'posts'),
        and(
          where('itemId', '==', pageItemId),
          or(
            where('audience', '==', 'public'),
            where('authorId', '==', currentUserId)
          )
        ),
        orderBy('timeCreated', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, async (querySnapshot: QuerySnapshot) => {
      const addedChanges = querySnapshot
        .docChanges()
        .filter((change) => change.type === 'added');

      const newPosts: Post[] = await Promise.all(
        addedChanges.map(async (change) => {
          const postData = change.doc.data();
          const postInfo = await dbApi.getPostInfo(postData);
          const newPost = {
            ...postInfo,
            postId: change.doc.id,
            commentsShown: false,
            commentInput: '',
          };
          return newPost;
        })
      );

      const postsWithQueriedInfos = await Promise.all(newPosts);

      !initSnap.current &&
        setPosts((posts) => {
          const newPosts = [...postsWithQueriedInfos, ...posts];
          return newPosts;
        });
      initSnap.current = false;
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchFivePosts(undefined, hashtagFilter);
  }, [onlySeeFollowing]);

  useEffect(() => {
    fetchFivePosts(lastKey, hashtagFilter);
  }, [hashtagFilter, logId]);

  // 有新文之後設下一個key
  useEffect(() => {
    if (posts.length === 0) return;
    let lastTimestamp = posts[posts.length - 1].timeCreated;
    setLastKey(lastTimestamp);
  }, [posts]);

  // scroll listener
  useEffect(() => {
    if (currentPage === 'log') {
      return;
    }
    const handleScroll = () => {
      const bufferHeight = 200;
      const isBottom =
        window.innerHeight + window.scrollY + bufferHeight >=
        document.body.offsetHeight;
      if (isBottom) {
        if (isFetching.current) return;
        fetchFivePosts(lastKey, hashtagFilter);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastKey, hashtagFilter]);

  const fetchFivePosts = async (
    lastKey: Timestamp | undefined,
    hashtag: string | undefined
  ) => {
    isFetching.current = true;
    if (
      onlySeeFollowing &&
      (currentUser.following === undefined ||
        currentUser.following?.length === 0 ||
        !currentUserId)
    ) {
      isFetching.current = false;
      return;
    }
    let q: Query<DocumentData> = query(collection(db, 'posts'));
    if (currentPage === 'posts') {
      if (lastKey && hashtag) {
        if (onlySeeFollowing) {
          q = query(
            collection(db, 'posts'),
            and(
              where('authorId', 'in', currentUser.following),
              where('hashtags', 'array-contains', hashtag),
              or(
                where('audience', '==', 'public'),
                where('authorId', '==', currentUserId)
              )
            ),
            orderBy('timeCreated', 'desc'),
            startAfter(lastKey),
            limit(5)
          );
        } else {
          q = query(
            collection(db, 'posts'),
            and(
              where('hashtags', 'array-contains', hashtag),
              or(
                where('audience', '==', 'public'),
                where('authorId', '==', currentUserId)
              )
            ),
            orderBy('timeCreated', 'desc'),
            startAfter(lastKey),
            limit(5)
          );
        }
      } else if (lastKey) {
        if (onlySeeFollowing) {
          q = query(
            collection(db, 'posts'),
            and(
              where('authorId', 'in', currentUser.following),
              or(
                where('audience', '==', 'public'),
                where('authorId', '==', currentUserId)
              )
            ),
            orderBy('timeCreated', 'desc'),
            startAfter(lastKey),
            limit(5)
          );
        } else {
          q = query(
            collection(db, 'posts'),
            or(
              where('audience', '==', 'public'),
              where('authorId', '==', currentUserId)
            ),
            orderBy('timeCreated', 'desc'),
            startAfter(lastKey),
            limit(5)
          );
        }
      } else if (hashtag) {
        if (onlySeeFollowing) {
          q = query(
            collection(db, 'posts'),
            and(
              where('authorId', 'in', currentUser.following),
              where('hashtags', 'array-contains', hashtag),
              or(
                where('audience', '==', 'public'),
                where('authorId', '==', currentUserId)
              )
            ),
            orderBy('timeCreated', 'desc'),
            limit(5)
          );
        } else {
          q = query(
            collection(db, 'posts'),
            and(
              where('hashtags', 'array-contains', hashtag),
              or(
                where('audience', '==', 'public'),
                where('authorId', '==', currentUserId)
              )
            ),
            orderBy('timeCreated', 'desc'),
            limit(5)
          );
        }
      } else {
        if (onlySeeFollowing) {
          q = query(
            collection(db, 'posts'),
            and(
              where('authorId', 'in', currentUser.following),
              or(
                where('audience', '==', 'public'),
                where('authorId', '==', currentUserId)
              )
            ),
            orderBy('timeCreated', 'desc'),
            limit(5)
          );
        } else {
          q = query(
            collection(db, 'posts'),
            or(
              where('audience', '==', 'public'),
              where('authorId', '==', currentUserId)
            ),
            orderBy('timeCreated', 'desc'),
            limit(5)
          );
        }
      }
    } else if (currentPage === 'profile') {
      if (lastKey && hashtag) {
        if (profileUserId === currentUserId) {
          q = query(
            collection(db, 'posts'),
            and(
              where('authorId', '==', profileUserId),
              where('hashtags', 'array-contains', hashtag)
            ),
            orderBy('timeCreated', 'desc'),
            startAfter(lastKey),
            limit(5)
          );
        } else {
          q = query(
            collection(db, 'posts'),
            and(
              where('audience', '==', 'public'),
              where('authorId', '==', profileUserId),
              where('hashtags', 'array-contains', hashtag)
            ),
            orderBy('timeCreated', 'desc'),
            startAfter(lastKey),
            limit(5)
          );
        }
      } else if (lastKey) {
        if (profileUserId === currentUserId) {
          q = query(
            collection(db, 'posts'),
            where('authorId', '==', profileUserId),
            orderBy('timeCreated', 'desc'),
            startAfter(lastKey),
            limit(5)
          );
        } else {
          q = query(
            collection(db, 'posts'),
            and(
              where('audience', '==', 'public'),
              where('authorId', '==', profileUserId)
            ),
            orderBy('timeCreated', 'desc'),
            startAfter(lastKey),
            limit(5)
          );
        }
      } else if (hashtag) {
        if (profileUserId === currentUserId) {
          q = query(
            collection(db, 'posts'),
            and(
              where('authorId', '==', profileUserId),
              where('hashtags', 'array-contains', hashtag)
            ),
            orderBy('timeCreated', 'desc'),
            limit(5)
          );
        } else {
          q = query(
            collection(db, 'posts'),
            and(
              where('audience', '==', 'public'),
              where('authorId', '==', profileUserId),
              where('hashtags', 'array-contains', hashtag)
            ),
            orderBy('timeCreated', 'desc'),
            limit(5)
          );
        }
      } else {
        if (profileUserId === currentUserId) {
          q = query(
            collection(db, 'posts'),
            where('authorId', '==', profileUserId),
            orderBy('timeCreated', 'desc'),
            limit(5)
          );
        } else {
          q = query(
            collection(db, 'posts'),
            and(
              where('audience', '==', 'public'),
              where('authorId', '==', profileUserId)
            ),
            orderBy('timeCreated', 'desc'),
            limit(5)
          );
        }
      }
    } else if (currentPage === 'brand') {
      if (lastKey && hashtag) {
        q = query(
          collection(db, 'posts'),
          and(
            where('brandId', '==', pageBrandId),
            where('hashtags', 'array-contains', hashtag),
            or(
              where('audience', '==', 'public'),
              where('authorId', '==', currentUserId)
            )
          ),
          orderBy('timeCreated', 'desc'),
          startAfter(lastKey),
          limit(5)
        );
      } else if (lastKey) {
        q = query(
          collection(db, 'posts'),
          and(
            where('brandId', '==', pageBrandId),
            or(
              where('audience', '==', 'public'),
              where('authorId', '==', currentUserId)
            )
          ),
          orderBy('timeCreated', 'desc'),
          startAfter(lastKey),
          limit(5)
        );
      } else if (hashtag) {
        q = query(
          collection(db, 'posts'),
          and(
            where('brandId', '==', pageBrandId),
            where('hashtags', 'array-contains', hashtag),
            or(
              where('audience', '==', 'public'),
              where('authorId', '==', currentUserId)
            )
          ),
          orderBy('timeCreated', 'desc'),
          limit(5)
        );
      } else {
        q = query(
          collection(db, 'posts'),
          and(
            where('brandId', '==', pageBrandId),
            or(
              where('audience', '==', 'public'),
              where('authorId', '==', currentUserId)
            )
          ),
          orderBy('timeCreated', 'desc'),
          limit(5)
        );
      }
    } else if (currentPage === 'item') {
      if (lastKey && hashtag) {
        q = query(
          collection(db, 'posts'),
          and(
            where('itemId', '==', pageItemId),
            where('hashtags', 'array-contains', hashtag),
            or(
              where('audience', '==', 'public'),
              where('authorId', '==', currentUserId)
            )
          ),
          orderBy('timeCreated', 'desc'),
          startAfter(lastKey),
          limit(5)
        );
      } else if (lastKey) {
        q = query(
          collection(db, 'posts'),
          and(
            where('itemId', '==', pageItemId),
            or(
              where('audience', '==', 'public'),
              where('authorId', '==', currentUserId)
            )
          ),
          orderBy('timeCreated', 'desc'),
          startAfter(lastKey),
          limit(5)
        );
      } else if (hashtag) {
        q = query(
          collection(db, 'posts'),
          and(
            where('itemId', '==', pageItemId),
            where('hashtags', 'array-contains', hashtag),
            or(
              where('audience', '==', 'public'),
              where('authorId', '==', currentUserId)
            )
          ),
          orderBy('timeCreated', 'desc'),
          limit(5)
        );
      } else {
        q = query(
          collection(db, 'posts'),
          and(
            where('itemId', '==', pageItemId),
            or(
              where('audience', '==', 'public'),
              where('authorId', '==', currentUserId)
            )
          ),
          orderBy('timeCreated', 'desc'),
          limit(5)
        );
      }
    } else if (currentPage === 'log') {
      if (logId) {
        const logDocRef = doc(db, 'posts', logId);
        const logDoc = await getDoc(logDocRef);
        if (logDoc.exists()) {
          const logDocData = logDoc.data();
          const logWithQueriedInfos = await dbApi.getPostInfo(logDocData);
          setPosts([
            {
              ...logWithQueriedInfos,
              postId: logId,
              commentsShown: true,
              commentInput: '',
            },
          ]);
        } else {
          setPosts([]);
          setBottomMessage('Log not found');
        }
      } else {
        setPosts([]);
      }
      isFetching.current = false;
      setHasMore(false);
      return;
    }

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

    if (querySnapshot.docs.length === 0) {
      if (posts.length === 0) {
        currentPage === 'profile'
          ? setBottomMessage('no logs yet!')
          : setBottomMessage('no logs yet, go explore other pages!');
      } else {
        setBottomMessage('no more logs');
      }
      isFetching.current = false;
      setHasMore(false);
      return;
    }

    const postsArray = querySnapshot.docs.map(async (change) => {
      const postData = change.data();
      return {
        ...(await dbApi.getPostInfo(postData)),
        postId: change.id,
        commentsShown: false,
        commentInput: '',
      };
    });
    const postsWithQueriedInfos = await Promise.all(postsArray);
    setPosts((posts) => {
      const newPosts = lastKey
        ? [...posts, ...postsWithQueriedInfos]
        : postsWithQueriedInfos;
      return newPosts;
    });
  };

  useEffect(() => {
    isFetching.current = false;
  }, [posts.length]);

  const handleCommentsShown = (index: number) => {
    setPosts((prev) => {
      const newPosts = [...prev];
      newPosts[index].commentsShown = !newPosts[index].commentsShown;
      return newPosts;
    });
  };

  const handleCommentInput = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    setPosts((prev) => {
      const newPosts = [...prev];
      newPosts[index].commentInput = event.target.value;
      return newPosts;
    });
  };

  const handleCommentSubmit = async (
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    post: Post,
    userId: string,
    index: number
  ) => {
    if (post.commentInput !== '') {
      await handleUpdatePost(post, userId, index, 'comment');
    }
    return;
  };

  const handleDeleteComment = async (
    post: Post,
    postIndex: number,
    commentIndex: number,
    commentId: string
  ) => {
    if (!post.comments || post.comments.length === 0) return;
    const result = await swal.warning(
      'delete this comment?',
      'this cannot be undone!',
      'yes'
    );

    if (result.isConfirmed) {
      const postRef = doc(db, 'posts', post.postId);
      const updatedComments = post.comments.filter(
        (_, index) => index !== commentIndex
      );
      await updateDoc(postRef, { comments: updatedComments });

      setPosts((prev) => {
        const newPosts = [...prev];
        newPosts[postIndex].comments = updatedComments;
        return newPosts;
      });

      post.authorId &&
        unnotifyOtherUser(post.postId, post.authorId, 'comment', commentId);
    } else {
      return;
    }
  };

  const handleUpdatePost = async (
    post: Post,
    userId: string,
    postIndex: number,
    type: 'like' | 'comment'
  ) => {
    const postRef = doc(db, 'posts', post.postId);
    const curretTime = new Date();
    const timestamp = Timestamp.fromDate(curretTime);
    const isComment = type === 'comment';
    const newEntry = {
      authorId: userId,
      authorName: currentUser.name,
      authorPhoto: currentUser.photoURL,
      timeCreated: timestamp,
      ...(isComment
        ? {
            content: post.commentInput?.replace(/\n/g, '<br>'),
            commentId: uuidv4(),
          }
        : {}),
    };
    const targetArray = isComment ? post.comments : post.likes;
    const hasLiked = isComment
      ? undefined
      : targetArray?.some((like) => like.authorId === userId);
    const updatedArray = targetArray
      ? hasLiked
        ? targetArray.filter((entry) => entry.authorId !== userId)
        : [...targetArray, newEntry]
      : [newEntry];
    await updateDoc(postRef, {
      [type + 's']: updatedArray,
    });
    setPosts((prev) => {
      const newPosts = [...prev];
      if (type === 'comment') {
        newPosts[postIndex].comments = updatedArray;
      }
      if (type === 'like') {
        newPosts[postIndex].likes = updatedArray;
      }
      newPosts[postIndex].commentInput = '';
      return newPosts;
    });

    !hasLiked &&
      notifyOtherUser(post.postId, post.authorId as string, newEntry, type);
    hasLiked && unnotifyOtherUser(post.postId, post.authorId as string, type);
  };

  const unnotifyOtherUser = async (
    postId: string,
    postAuthorId: string,
    type: 'like' | 'comment',
    commentId?: string
  ) => {
    const userRef = doc(db, 'users', postAuthorId);
    if (!userRef) return;
    const userData = await getDoc(userRef);
    const originNotifications = userData.data()?.notifications;
    if (!originNotifications) return;
    let notificationToRemove;
    if (type === 'like') {
      notificationToRemove = originNotifications.find(
        (notification: any) =>
          notification.postId === postId &&
          notification.authorId === currentUserId &&
          notification.type === 'like'
      );
    } else {
      notificationToRemove = originNotifications.find(
        (notification: any) => notification.commentId === commentId
      );
    }

    await updateDoc(userRef, {
      notifications: arrayRemove(notificationToRemove),
    });
  };

  const notifyOtherUser = async (
    postId: string,
    postAuthorId: string,
    content: any,
    type: 'like' | 'comment'
  ) => {
    const userRef = doc(db, 'users', postAuthorId);
    if (!userRef) return;
    const contentWithType = { ...content, type, postId, unread: true };

    await updateDoc(userRef, {
      notifications: arrayUnion(contentWithType),
    });
  };

  const handleLike = async (post: Post, userId: string, index: number) => {
    await handleUpdatePost(post, userId, index, 'like');
  };

  const handleDeletePost = async (post: Post, index: number) => {
    const result = await swal.warning(
      'Delete this log?',
      'this cannot be undone!',
      'yes'
    );

    if (result.isConfirmed) {
      const postRef = doc(db, 'posts', post.postId);
      setPosts((prev) => {
        const newPosts = prev.filter(
          (keptPost) => keptPost.postId !== post.postId
        );
        return newPosts;
      });
      await deleteDoc(postRef);
      swal.success('Log deleted!', '', 'ok');
    } else {
      return;
    }
  };

  const scrollToHashtag = () => {
    hashtagRef!.current!.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const handleClickHashtag = (hashtag: string) => {
    scrollToHashtag();
    setHashtagFilter(hashtag);
    setLastKey(undefined);
  };

  if (onlySeeFollowing && !currentUserId) {
    return (
      <div className='relative mx-auto mt-10 flex w-full max-w-3xl items-center justify-center rounded-md border-[3px] border-solid border-neutral-900 bg-neutral-100 '>
        <div
          className='group hover:cursor-pointer'
          onClick={() => dispatch(showAuth())}
        >
          <span className='decoration-2 group-hover:underline'>sign in</span>
          &nbsp;to see logs from people you follow
        </div>
        <SmileyWink
          className='ml-2'
          size={28}
          color='#171717'
          weight='regular'
        />
      </div>
    );
  }

  if (
    onlySeeFollowing &&
    (currentUser.following === undefined || currentUser.following?.length === 0)
  ) {
    return (
      <div className='relative mx-auto mt-10 flex w-full max-w-3xl items-center justify-center rounded-md border-[3px] border-solid border-neutral-900 bg-neutral-100 '>
        follow some users to see their posts
      </div>
    );
  }

  if (posts === undefined) {
    return <div>undefineddd</div>;
  }

  return (
    <div
      className='justify-top flex scroll-mt-36 flex-col items-center gap-3'
      ref={hashtagRef}
    >
      {hashtagFilter && (
        <div>
          <div className='mr-2 inline-block bg-gradient-to-l from-sky-500 to-green-500 bg-clip-text text-transparent before:mr-px before:content-["#"]'>
            {hashtagFilter}
          </div>
          <button
            onClick={() => {
              setHashtagFilter(undefined);
              setLastKey(undefined);
              isFetching.current = false;
            }}
          >
            &nbsp;&times;
          </button>
        </div>
      )}
      {posts.map((post, index) => (
        <PostCard
          key={post.postId + index}
          post={post}
          index={index}
          handleDeletePost={handleDeletePost}
          handleDeleteComment={handleDeleteComment}
          handleLike={handleLike}
          handleCommentsShown={handleCommentsShown}
          handleCommentInput={handleCommentInput}
          handleCommentSubmit={handleCommentSubmit}
          handleUpdatePost={handleUpdatePost}
          handleClickHashtag={handleClickHashtag}
        />
      ))}
      {hasMore && (
        <SmileyWink
          size={28}
          color='#171717'
          weight='regular'
          className='mx-auto my-10 animate-bounce'
        />
      )}
      <span>{bottomMessage}</span>
    </div>
  );
};

export default PostsFeed;
