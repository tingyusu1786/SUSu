import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import { Link } from 'react-router-dom';
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
import { Post, Like, Comment } from '../../interfaces/interfaces';
import { getTimeDiff } from '../../utils/common';
import CommentInputSection from './CommentInputSection';
import CommentDiv from './CommentDiv';

function RenderPosts() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const currentUserName = useAppSelector((state) => state.auth.currentUserName);
  const currentUserPhotoURL = useAppSelector((state) => state.auth.currentUserPhotoURL);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);

  const [posts, setPosts] = useState<Post[]>([]);
  const [hashtagFilter, setHashtagFilter] = useState<string | undefined>();

  const [authorData, setAuthorData] = useState<Record<string, any>>({});
  const [lastKey, setLastKey] = useState<Timestamp>();
  const [bottomMessage, setBottomMessage] = useState('');
  const initSnap = useRef(true);

  useEffect(() => {
    fetchFivePosts(lastKey, hashtagFilter);
    console.log('hashtagFilter', hashtagFilter);
  }, [hashtagFilter]);

  // add listener for newly added post
  useEffect(() => {
    const postsCollection = collection(db, 'posts');
    // todo
    const q = query(postsCollection, orderBy('timeCreated', 'desc'));

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

  // 有新文之後社下一個key
  useEffect(() => {
    if (posts.length == 0) return;
    let lastTimestamp = posts[posts.length - 1].timeCreated;
    setLastKey(lastTimestamp);
  }, [posts]);

  // scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const isBottom = window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
      if (isBottom) {
        fetchFivePosts(lastKey, hashtagFilter);
        console.log('isBottom');
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
      console.log('no more posts');
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

  const getDocField = async (docRef: DocumentReference, field: string) => {
    const doc = await getDoc(docRef);
    if (!doc.exists()) {
      alert('No such document!');
      return '';
    }
    const data = doc.data();
    return data[field];
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
        const fieldValue = await getDocField(docRef, field);
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
      ...(isComment
        ? { content: post.commentInput }
        : {}),
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

  const fireNotification = () => {
    dispatch(showNotification({ type: 'success', content: 'hihi' }));
    setTimeout(() => dispatch(closeNotification()), 5000);
  };

  if (isLoading) {
    return <div>loading...</div>;
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <button onClick={fireNotification}>notification</button>
      <h1 className='font-heal text-3xl'>see posts ({posts.length})</h1>
      <select
        name='audience'
        id=''
        className='w-50 my-1 rounded bg-gray-200'
        // value={inputs.audience}
        // onChange={handleInputChange}
      >
        <option value='all'>（all）</option>
        <option value='friends'>（friends）</option>
      </select>
      {hashtagFilter && (
        <div>
          <span className='before:content-["#"]'>{hashtagFilter}</span>
          <button
            onClick={() => {
              setHashtagFilter(undefined);
              setLastKey(undefined);
              // setRestart(true);
            }}
          >
            &nbsp;&times;
          </button>
        </div>
      )}
      <div className='flex flex-col items-center justify-center gap-3'>
        {posts.map((post, index) => {
          return (
            <div className='relative w-96 rounded bg-gray-100 p-3' key={index}>
              {<div>{`audience: ${post.audience}`}</div>}
              {post.authorId === currentUserId && (
                <button className='absolute right-1 top-1' onClick={() => handleDeletePost(post, index)}>
                  delete post
                </button>
              )}
              <Link to={`/profile/${post.authorId}`}>
                <img src={post.authorPhoto} alt='' className='inline-block h-10 w-10 rounded-full object-cover' />
                <span>{post.authorName}</span>
              </Link>
              <br />
              <span> 喝了</span>
              <div>
                <Link to={`/catalogue/${post.brandId}`}>
                  <span className='text-xl after:content-["の"]'>{post.brandName}</span>
                </Link>
                <Link to={`/catalogue/${post.brandId}/${post.itemId}`}>
                  <span className='text-xl  font-bold'>{post.itemName}</span>
                </Link>
              </div>
              <span>{post.size && `size: ${post.size} / `}</span>
              <span>{post.sugar && `sugar: ${post.sugar} / `}</span>
              <span>{post.ice && `ice: ${post.ice} / `}</span>
              <span>{post.orderNum && `orderNum: ${post.orderNum} / `}</span>
              <span>{post.rating && `rating: ${post.rating} / `}</span>
              <div>{post.selfComment && `💬 ${post.selfComment}`}</div>
              <div className='flex flex-wrap gap-1'>
                {post.hashtags?.map((hashtag) => (
                  <button
                    className='rounded bg-gray-300 px-2 before:content-["#"]'
                    key={hashtag}
                    onClick={() => {
                      setHashtagFilter(hashtag);
                      setLastKey(undefined);
                    }}
                  >
                    {hashtag}
                  </button>
                ))}
              </div>
              <div>{post.timeCreated?.toDate().toLocaleString()}</div>
              <div className='flex gap-3'>
                <button
                  onClick={() => {
                    currentUserId && handleLike(post, currentUserId, index);
                  }}
                  className={`rounded border-2 border-solid border-gray-400 ${
                    currentUserId && post.likes?.some((like) => like.authorId === currentUserId) && 'bg-gray-800 text-white'
                  }`}
                >
                  likes
                </button>

                <span>{post.likes?.length || 0}</span>
                <button
                  className='rounded border-2 border-solid border-gray-400'
                  onClick={() => handleCommentsShown(index)}
                >
                  comments
                </button>
                <span>{post.comments?.length || 0}</span>
              </div>
              {post.commentsShown && (
                <div className='mt-2 flex flex-col gap-1 rounded-lg bg-gray-300 p-1'>
                  {post.comments?.map((comment, index) => (
                    <CommentDiv comment={comment} index={index} />
                  ))}

                  <CommentInputSection
                    post={post}
                    handleCommentInput={handleCommentInput}
                    handleCommentSubmit={handleCommentSubmit}
                    index={index}
                  />
                </div>
              )}
            </div>
          );
        })}

        <h1 className='font-heal text-3xl'>({posts.length})</h1>
        <span>{bottomMessage}</span>
      </div>
    </div>
  );
}

export default RenderPosts;
