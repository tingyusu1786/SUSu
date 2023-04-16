import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import { db } from '../../services/firebase';
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
  DocumentReference,
  DocumentData,
  deleteDoc,
  startAfter,
  arrayUnion,
  arrayRemove,
  or,
  and,
} from 'firebase/firestore';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { showNotification, closeNotification } from '../../components/notification/notificationSlice';
import { Post, Comment } from '../../interfaces/interfaces';
import PostCard from './PostCard';

const PostsFeed = () => {
  const dispatch = useAppDispatch();

  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const currentUserName = useAppSelector((state) => state.auth.currentUserName);
  const currentUserPhotoURL = useAppSelector((state) => state.auth.currentUserPhotoURL);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);

  const [posts, setPosts] = useState<Post[]>([]);
  const [hashtagFilter, setHashtagFilter] = useState<string | undefined>();

  // const [authorData, setAuthorData] = useState<Record<string, any>>({});
  const [lastKey, setLastKey] = useState<Timestamp>();
  const [bottomMessage, setBottomMessage] = useState('');
  const initSnap = useRef(true);

  useEffect(() => {
    fetchFivePosts(lastKey, hashtagFilter);
    // console.log('hashtagFilter', hashtagFilter);
  }, [hashtagFilter]);

  // add listener for newly added post
  useEffect(() => {
    const postsCollection = collection(db, 'posts');
    // todo
    const q = query(
      postsCollection,
      or(where('audience', '==', 'public'), where('authorId', '==', currentUserId)),
      orderBy('timeCreated', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot: QuerySnapshot) => {
      const addedChanges = querySnapshot.docChanges().filter((change) => change.type === 'added');

      const newPosts: Post[] = await Promise.all(
        addedChanges.map(async (change) => {
          const postData = change.doc.data();
          const postInfo = await getPostInfo(postData);
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
      // console.log('postsWithQueriedInfos', postsWithQueriedInfos);

      !initSnap.current &&
        setPosts((posts) => {
          console.log('set from snapshot');
          const newPosts = [...postsWithQueriedInfos, ...posts];
          return newPosts;
        });
      initSnap.current = false;
    });

    return unsubscribe;
  }, []);

  // 有新文之後設下一個key
  useEffect(() => {
    if (posts.length === 0) return;
    let lastTimestamp = posts[posts.length - 1].timeCreated;
    setLastKey(lastTimestamp);
  }, [posts]);

  // scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const isBottom = window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
      if (isBottom) {
        fetchFivePosts(lastKey, hashtagFilter);
        // console.log('isBottom');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastKey, hashtagFilter]);

  const fetchFivePosts = async (lastKey: Timestamp | undefined, hashtag: string | undefined) => {
    const postsRef = collection(db, 'posts');

    let q: Query<DocumentData>;

    if (lastKey && hashtag) {
      q = query(
        postsRef,
        and(
          where('hashtags', 'array-contains', hashtag),
          or(where('audience', '==', 'public'), where('authorId', '==', currentUserId))
        ),
        orderBy('timeCreated', 'desc'),
        startAfter(lastKey),
        limit(5)
      );
    } else if (lastKey) {
      q = query(
        postsRef,
        or(where('audience', '==', 'public'), where('authorId', '==', currentUserId)),
        orderBy('timeCreated', 'desc'),
        startAfter(lastKey),
        limit(5)
      );
    } else if (hashtag) {
      q = query(
        postsRef,
        and(
          where('hashtags', 'array-contains', hashtag),
          or(where('audience', '==', 'public'), where('authorId', '==', currentUserId))
        ),
        orderBy('timeCreated', 'desc'),
        limit(5)
      );
    } else {
      q = query(
        postsRef,
        or(where('audience', '==', 'public'), where('authorId', '==', currentUserId)),
        orderBy('timeCreated', 'desc'),
        limit(5)
      );
    }

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    if (querySnapshot.docs.length === 0) {
      setBottomMessage('no more posts');
      // console.log('no more posts');
      return;
    }
    const postsArray = querySnapshot.docs.map(async (change) => {
      const postData = change.data();
      return {
        ...(await getPostInfo(postData)),
        postId: change.id,
        commentsShown: false,
        commentInput: '',
      };
    });
    const postsWithQueriedInfos = await Promise.all(postsArray);
    setPosts((posts) => {
      const newPosts = lastKey ? [...posts, ...postsWithQueriedInfos] : postsWithQueriedInfos;
      console.log(`set from fetchFivePosts,${currentUserId}`, newPosts);
      return newPosts;
    });
  };

  const getPostInfo = async (postData: any) => {
    const brandName: string = await getInfo(postData?.brandId, 'brand', 'name');
    const itemName: string = await getInfo(postData?.itemId, 'item', 'name');
    const authorName: string = await getInfo(postData?.authorId, 'user', 'name');
    const authorPhoto: string = await getInfo(postData?.authorId, 'user', 'photoURL');

    if (postData.comments) {
      const comments: Comment[] = await Promise.all(
        postData.comments.map(async (comment: any) => {
          const commentAuthorName: string = await getInfo(comment.authorId, 'user', 'name');
          const commentAuthorPhoto: string = await getInfo(comment.authorId, 'user', 'photoURL');
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
  };

  const getInfo = async (id: string | undefined, type: string, field: string) => {
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
  };

  const handleCommentsShown = (index: number) => {
    setPosts((prev) => {
      const newPosts = [...prev];
      newPosts[index].commentsShown = !newPosts[index].commentsShown;
      return newPosts;
    });
  };

  const handleCommentInput = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    setPosts((prev) => {
      const newPosts = [...prev];
      newPosts[index].commentInput = event.target.value;
      return newPosts;
    });
  };

  const handleUpdatePost = async (post: Post, userId: string, index: number, type: 'like' | 'comment') => {
    const postRef = doc(db, 'posts', post.postId);
    const curretTime = new Date();
    const timestamp = Timestamp.fromDate(curretTime);
    const isComment = type === 'comment';
    const newEntry = {
      authorId: userId,
      authorName: currentUserName,
      authorPhoto: currentUserPhotoURL,
      timeCreated: timestamp,
      ...(isComment ? { content: post.commentInput } : {}),
    };
    const targetArray = isComment ? post.comments : post.likes;
    const hasLiked = isComment ? undefined : targetArray?.some((like) => like.authorId === userId);
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
        newPosts[index].comments = updatedArray;
      }
      if (type === 'like') {
        newPosts[index].likes = updatedArray;
      }
      newPosts[index].commentInput = '';
      return newPosts;
    });

    !hasLiked && notifyOtherUser(post.postId, post.authorId as string, newEntry, type);
    hasLiked && unnotifyOtherUser(post.postId, post.authorId as string, newEntry, type);
  };

  const unnotifyOtherUser = async (postId: string, postAuthorId: string, content: any, type: 'like' | 'comment') => {
    const userRef = doc(db, 'users', postAuthorId);
    if (!userRef) return;
    const userData = await getDoc(userRef);
    const originNotifications = userData.data()?.notifications;
    if (!originNotifications) return;
    const notificationToRemove = originNotifications.find(
      (notification: any) =>
        notification.postId === postId && notification.authorId === currentUserId && notification.type === 'like'
    );

    await updateDoc(userRef, {
      notifications: arrayRemove(notificationToRemove),
    });
  };

  const notifyOtherUser = async (postId: string, postAuthorId: string, content: any, type: 'like' | 'comment') => {
    const userRef = doc(db, 'users', postAuthorId);
    if (!userRef) return;
    const contentWithType = { ...content, type, postId, unread: true };

    await updateDoc(userRef, {
      notifications: arrayUnion(contentWithType),
    });
  };

  const handleCommentSubmit = async (
    event: KeyboardEvent<HTMLInputElement>,
    post: Post,
    userId: string,
    index: number
  ) => {
    if (post.commentInput !== '') {
      await handleUpdatePost(post, userId, index, 'comment');
    }
    return;
  };

  const handleLike = async (post: Post, userId: string, index: number) => {
    await handleUpdatePost(post, userId, index, 'like');
  };

  const handleDeletePost = async (post: Post, index: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (confirmed) {
      const postRef = doc(db, 'posts', post.postId);
      await deleteDoc(postRef);
      // alert(`post deleted: was ${post.postId}`);

      setPosts((prev) => {
        const newPosts = prev.filter((keptPost) => keptPost.postId !== post.postId);
        return newPosts;
      });
    } else {
      return;
    }
  };

  const handleClickHashtag = (hashtag: string) => {
    setHashtagFilter(hashtag);
    setLastKey(undefined);
  };

  const fireNotification = () => {
    dispatch(showNotification({ type: 'success', content: 'hihi' }));
    setTimeout(() => dispatch(closeNotification()), 5000);
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      {hashtagFilter && (
        <div>
          <span className='before:content-["#"]'>{hashtagFilter}</span>
          <button
            onClick={() => {
              setHashtagFilter(undefined);
              setLastKey(undefined);
            }}
          >
            &nbsp;&times;
          </button>
        </div>
      )}
      <div className='flex flex-col items-center justify-center gap-3'>
        {posts.map((post, index) => (
          <PostCard
            post={post}
            index={index}
            handleDeletePost={handleDeletePost}
            handleLike={handleLike}
            handleCommentsShown={handleCommentsShown}
            handleCommentInput={handleCommentInput}
            handleCommentSubmit={handleCommentSubmit}
            handleUpdatePost={handleUpdatePost}
            handleClickHashtag={handleClickHashtag}
          />
        ))}
        <h1 className='font-heal text-3xl'>({posts.length})</h1>
        <span>{bottomMessage}</span>
      </div>
    </div>
  );
};

export default PostsFeed;
