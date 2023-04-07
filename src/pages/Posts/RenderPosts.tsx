import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../utils/firebase';
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
} from 'firebase/firestore';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { showNotice, closeNotice } from '../../features/notice/noticeSlice';

interface Post {
  postId: string;
  audience?: string;
  authorId?: string;
  authorName?: string;
  authorPhoto?: string;
  brandId?: string;
  brandName?: string;
  commentInput?: string;
  comments?: any[]; //todo: object??
  commentsShown: boolean;
  hashtags?: string[];
  ice?: string;
  itemId?: string;
  itemName?: string;
  likes?: any[]; //todo: object??
  orderNum?: string;
  price?: string;
  rating?: string;
  selfComment?: string;
  sugar?: string;
  size?: string;
  timeCreated?: Timestamp;
}

function RenderPosts() {
  const dispatch = useAppDispatch();

  const userId = useAppSelector((state) => state.auth.userId);
  const userName = useAppSelector((state) => state.auth.userName);
  const userPhotoURL = useAppSelector((state) => state.auth.photoURL);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);

  const [posts, setPosts] = useState<Post[]>([]);
  const [hashtagFilter, setHashtagFilter] = useState<string | undefined>();

  const [authorData, setAuthorData] = useState<Record<string, any>>({});
  const [lastKey, setLastKey] = useState<Timestamp>();
  const [bottomMessage, setBottomMessage] = useState('');
  const initSnap = useRef(true);

  useEffect(() => {
    fetchPosts(lastKey, hashtagFilter);
  }, [hashtagFilter]);

  // add listener for newly added post
  useEffect(() => {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('timeCreated', 'desc'));

    const unsubscribe = onSnapshot(q, async (querySnapshot: QuerySnapshot) => {
      const newPosts: Post[] = [];
      querySnapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const postData = change.doc.data();
          const postInfo = await getPostInfo(postData);
          const newPost = {
            ...postInfo,
            postId: change.doc.id,
            commentsShown: false,
            commentInput: '',
          };
          newPosts.push(newPost);
        }
        // if (change.type === 'modified') {
        //   const modifiedDocLikes = change.doc.data().likes;
        //   console.log('modifiedDocLikes', modifiedDocLikes);
        //   console.log('change.doc.id', change.doc.id);
        //   const previousDocLikes = posts.find(post => post.postId === change.doc.id)?.likes || [];
        //   console.log('previousDocLikes', previousDocLikes);

        //   if (modifiedDocLikes.length > previousDocLikes.length) {
        //     console.log(`new likes:`, modifiedDocLikes[modifiedDocLikes.length - 1]);
        //   }
        //   // if (modifiedDoc.data().likes !== previousDoc.likes) {
        //   //   console.log(`likes:`,modifiedDoc.data().likes);
        //   // }

        //   // if (modifiedDoc.data().comments !== previousDoc.comments) {
        //   //   modifiedDoc.data().comments.forEach((comment:any) => console.log(`comment:`, comment))
        //   //   ;
        //   // }

        // }
      });

      // const newPosts = querySnapshot
      //   .docChanges()
      //   .filter((change) => change.type === 'added')
      //   .map(async (change) => {
      //     const postData = change.doc.data();
      //     return {
      //       ...(await getPostInfo(postData)),
      //       postId: change.doc.id,
      //       commentsShown: false,
      //       commentInput: '',
      //     };
      //   });

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

  useEffect(() => {
    if (posts.length == 0) return;
    let lastTimestamp = posts[posts.length - 1].timeCreated;
    setLastKey(lastTimestamp);
  }, [posts]);

  useEffect(() => {
    const handleScroll = () => {
      const isBottom = window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
      if (isBottom) {
        fetchPosts(lastKey, hashtagFilter);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastKey, hashtagFilter]);

  const fetchPosts = async (lastKey: Timestamp | undefined, hashtag: string | undefined) => {
    const postsRef = collection(db, 'posts');

    let q: Query<DocumentData>;

    if (lastKey) {
      if (hashtag) {
        q = query(
          postsRef,
          where('hashtags', 'array-contains', hashtag),
          orderBy('timeCreated', 'desc'),
          startAfter(lastKey),
          limit(5)
        );
      } else {
        q = query(postsRef, orderBy('timeCreated', 'desc'), startAfter(lastKey), limit(5));
      }
    } else {
      if (hashtag) {
        q = query(postsRef, where('hashtags', 'array-contains', hashtag), orderBy('timeCreated', 'desc'), limit(5));
      } else {
        q = query(postsRef, orderBy('timeCreated', 'desc'), limit(5));
      }
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
      console.log('set from fetchPosts');
      // console.log('lastKey', lastKey);
      // console.log('hashtag', hashtag);
      const newPosts = lastKey ? [...posts, ...postsWithQueriedInfos] : postsWithQueriedInfos;
      const lastTimestamp = newPosts[newPosts.length - 1].timeCreated;
      setLastKey(lastTimestamp);
      return newPosts;
    });
  };

  const getPostInfo = async (postData: any) => {
    const brandName: string = await getInfo(postData?.brandId, 'brand', 'name');
    const itemName: string = await getInfo(postData?.itemId, 'item', 'name');
    const authorName: string = await getInfo(postData?.authorId, 'user', 'name');
    const authorPhoto: string = await getInfo(postData?.authorId, 'user', 'photoURL');

    if (postData.comments) {
      const comments: any = await Promise.all(
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

  // const handleCommentSubmit = async (
  //   event: React.KeyboardEvent<HTMLInputElement>,
  //   post: Post,
  //   userId: string,
  //   index: number
  // ) => {
  //   if (post.commentInput !== '') {
  //     const postRef = doc(db, 'posts', post.postId);
  //     const curretTime = new Date();
  //     const timestamp = Timestamp.fromDate(curretTime);
  //     const newComment = {
  //       authorId: userId,
  //       content: post.commentInput,
  //       timeCreated: timestamp,
  //       authorName: userName,
  //       authorPhoto: userPhotoURL, //todo: 這邊會是舊的照片&名字
  //     };
  //     const updatedComments = post.comments ? [...post.comments, newComment] : [newComment];
  //     await updateDoc(postRef, {
  //       comments: updatedComments,
  //     });
  //     setPosts((prev) => {
  //       const newPosts = [...prev];
  //       newPosts[index].comments = updatedComments;
  //       newPosts[index].commentInput = '';
  //       return newPosts;
  //     });
  //   }
  //   return;
  // };

  // const handleLike = async (post: Post, userId: string, index: number) => {
  //   const postRef = doc(db, 'posts', post.postId);
  //   const curretTime = new Date();
  //   const timestamp = Timestamp.fromDate(curretTime);
  //   const newLike = {
  //     authorId: userId,
  //     timeCreated: timestamp,
  //     authorName: userName,
  //     authorPhoto: userPhotoURL, //todo: 這邊會是舊的照片&名字
  //   };
  //   const updatedLikes = post.likes
  //     ? post.likes.some((like) => like.authorId === userId)
  //       ? post.likes.filter((like) => like.authorId !== userId)
  //       : [...post.likes, newLike]
  //     : [newLike];
  //   await updateDoc(postRef, {
  //     likes: updatedLikes,
  //   });
  //   setPosts((prev) => {
  //     const newPosts = [...prev];
  //     newPosts[index].likes = updatedLikes;
  //     return newPosts;
  //   });
  // };
  const handleUpdatePost = async (post: Post, userId: string, index: number, type: 'like' | 'comment') => {
    const postRef = doc(db, 'posts', post.postId);
    const curretTime = new Date();
    const timestamp = Timestamp.fromDate(curretTime);
    const isComment = type === 'comment';
    const newContent = isComment
      ? {
          content: post.commentInput,
          authorName: userName,
          authorPhoto: userPhotoURL,
        }
      : {
          authorName: userName,
          authorPhoto: userPhotoURL,
        };
    const newEntry = {
      authorId: userId,
      timeCreated: timestamp,
      ...newContent,
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
      type === 'comment' ? (newPosts[index].comments = updatedArray) : (newPosts[index].likes = updatedArray);
      // newPosts[index][type + 's'] = updatedArray;
      newPosts[index].commentInput = '';
      return newPosts;
    });

    !hasLiked && notifyOtherUser(post.authorId as string, newEntry, type);
  };

  const notifyOtherUser = async (postAuthorId: string, content: any, type: 'like'|'comment') => {
    const userRef = doc(db, 'users', postAuthorId);
    const contentWithType = {...content, type}

    await updateDoc(userRef, {
      notification: arrayUnion(contentWithType),
    });
  };

  const handleCommentSubmit = async (
    event: React.KeyboardEvent<HTMLInputElement>,
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
      alert(`post deleted: was ${post.postId}`);

      setPosts((prev) => {
        const newPosts = prev.filter((keptPost) => keptPost.postId !== post.postId);
        return newPosts;
      });
    } else {
      return;
    }
  };

  const fireNotice = () => {
    dispatch(showNotice({ type: 'success', content: 'hihi' }));
    setTimeout(() => dispatch(closeNotice()), 10000);
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <button onClick={fireNotice}>notice</button>
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
              {/*<div>{`post id: ${post.postId}`}</div>*/}
              {post.authorId === userId && (
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
                    userId && handleLike(post, userId, index);
                  }}
                  className={`rounded border-2 border-solid border-gray-400 ${
                    userId && post.likes?.some((like) => like.authorId === userId) && 'bg-gray-800 text-white'
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
                  {post.comments?.map((comment, index) => {
                    return (
                      <div className='rounded-lg bg-white p-1' key={index}>
                        <Link to={`/profile/${comment.authorId}`}>
                          <img
                            src={comment.authorPhoto}
                            alt='123'
                            className='mr-1 inline-block h-6 w-6 rounded-full object-cover'
                          />
                        </Link>
                        <div className='inline-block'>
                          <Link to={`/profile/${comment.authorId}`}>
                            <div>{comment.authorName}</div>
                          </Link>
                          {<div>{comment.timeCreated.toDate().toLocaleString()}</div>}
                          <div>{comment.content}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div className='rounded-lg p-1'>
                    {isSignedIn && (
                      <Link to={`/profile/${userId}`}>
                        <img
                          src={userPhotoURL}
                          alt=''
                          className='mr-1 inline-block h-6 w-6 rounded-full object-cover'
                        />
                      </Link>
                    )}
                    <div className='inline-block'>
                      <Link to={`/profile/${userId}`}>
                        <div>{userName}</div>
                      </Link>
                      <input
                        type='text'
                        placeholder={
                          isSignedIn
                            ? post.comments
                              ? 'write a comment'
                              : 'be the first to comment!'
                            : 'sign in to comment'
                        }
                        className='bg-transparent'
                        disabled={!isSignedIn}
                        value={post.commentInput}
                        onChange={(e) => handleCommentInput(e, index)}
                        onKeyPress={(e) => e.key === 'Enter' && userId && handleCommentSubmit(e, post, userId, index)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <h1 className='font-heal text-3xl'>({posts.length})</h1>
        <button
          onClick={() => {
            fetchPosts(lastKey, hashtagFilter);
          }}
        >
          fetch 5 more
        </button>
        <span>{bottomMessage}</span>
      </div>
    </div>
  );
}

export default RenderPosts;
