import { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../utils/firebase';
import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  QuerySnapshot,
  Timestamp,
  updateDoc,
  where,
  DocumentReference,
} from 'firebase/firestore';
import { useAppSelector } from '../../app/hooks';

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
  likes?: string[];
  orderNum?: string;
  price?: string;
  rating?: string;
  selfComment?: string;
  sugar?: string;
  size?: string;
  timeCreated?: Timestamp;
}

function RenderPosts() {
  const userId = useAppSelector((state) => state.auth.userId);
  const userName = useAppSelector((state) => state.auth.userName);
  const userPhotoURL = useAppSelector((state) => state.auth.photoURL);
  const isSignedIn = useAppSelector((state) => state.auth.isSignedIn);

  const [posts, setPosts] = useState<Post[]>([]);
  const [hashtagFilter, setHashtagFilter] = useState<string | undefined>();
  const [authorData, setAuthorData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (hashtagFilter === undefined) {
      const postsCollection = collection(db, 'posts');
      const postQuery = query(postsCollection, orderBy('timeCreated', 'asc'));

      onSnapshot(postQuery, async (querySnapshot: QuerySnapshot) => {
        const newPosts = querySnapshot
          .docChanges()
          .filter((change) => change.type === 'added')
          .map(async (change) => {
            const postData = change.doc.data();
            return {
              ...(await getPostInfo(postData)),
              postId: change.doc.id,
              commentsShown: false,
              commentInput: '',
            };
          });
        const postsWithQueriedInfos = await Promise.all(newPosts);
        setPosts((posts) => [...posts, ...postsWithQueriedInfos]);
      });
    }
  }, [hashtagFilter]);

  const getPostInfo = async (postData: any) => {
    const brandName: string = await getInfo(postData?.brandId, 'brand', 'name');
    const itemName: string = await getInfo(postData?.itemId, 'item', 'name');
    const authorName: string = await getInfo(postData?.authorId, 'user', 'name');
    const authorPhoto: string = await getInfo(postData?.authorId, 'user', 'photoURL');

    return {
      ...postData,
      brandName,
      itemName,
      authorName,
      authorPhoto,
    };
  };

  const handleHashtagFilter = async (hashtag: string) => {
    setHashtagFilter(hashtag);
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('hashtags', 'array-contains', hashtag), orderBy('timeCreated', 'asc'));
    const querySnapshot: QuerySnapshot = await getDocs(q);
    const filteredPosts = querySnapshot.docs.map(async (change) => {
      const postData = change.data();
      return {
        ...(await getPostInfo(postData)),
        postId: change.id,
        commentsShown: false,
        commentInput: '',
      };
    });

    const postsWithQueriedInfos = await Promise.all(filteredPosts);
    setPosts(postsWithQueriedInfos);
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

  const handleCommentSubmit = async (
    event: React.KeyboardEvent<HTMLInputElement>,
    post: Post,
    userId: string,
    index: number
  ) => {
    if (post.commentInput !== '') {
      const postRef = doc(db, 'posts', post.postId);
      const newComment = { authorId: userId, content: post.commentInput, timeCreated: new Date() };
      const updatedComments = post.comments ? [...post.comments, newComment] : [newComment];
      await updateDoc(postRef, {
        comments: updatedComments,
      });
      // alert(`commented! post: ${post.postId}`);
      setPosts((prev) => {
        const newPosts = [...prev];
        newPosts[index].comments = updatedComments;
        newPosts[index].commentInput = '';
        return newPosts;
      });
    }
    return;
  };

  const handleLike = async (post: Post, userId: string, index: number) => {
    const postRef = doc(db, 'posts', post.postId);
    const updatedLikes = post.likes
      ? post.likes.includes(userId)
        ? post.likes.filter((like) => like !== userId)
        : [...post.likes, userId]
      : [userId];
    await updateDoc(postRef, {
      likes: updatedLikes,
    });
    // alert(`liked/unliked! post: ${post.postId}`);
    setPosts((prev) => {
      const newPosts = [...prev];
      newPosts[index].likes = updatedLikes;
      return newPosts;
    });
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <h1 className='text-3xl'>see posts</h1>
      {hashtagFilter && (
        <div>
          <span className='before:content-["#"]'>{hashtagFilter}</span>
          <button onClick={() => setHashtagFilter(undefined)}>&nbsp;&times;</button>
        </div>
      )}
      <div className='flex flex-col-reverse items-center justify-center gap-3'>
        {posts.map((post, index) => {
          return (
            <div className='w-4/5 rounded bg-gray-100 p-3' key={index}>
              {/*<div>{`post id: ${post.postId}`}</div>*/}
              <Link to={`/profile/${post.authorId}`}>
                <img src={post.authorPhoto} alt='' className='h-10 w-10 rounded-full object-cover' />
                <span>{post.authorName}</span>
              </Link>
              <span> 喝了</span>
              <div>
                <span className='text-xl after:content-["の"]'>{post.brandName}</span>
                <span className='text-xl  font-bold'>{post.itemName}</span>
              </div>

              <div>{post.size && `size: ${post.size}`}</div>
              <div>{post.sugar && `sugar: ${post.sugar}`}</div>
              <div>{post.ice && `ice: ${post.ice}`}</div>
              <div>{post.orderNum && `orderNum: ${post.orderNum}`}</div>
              <div>{post.rating && `rating: ${post.rating}`}</div>
              <div>{post.selfComment && `💬 ${post.selfComment}`}</div>
              <div className='flex flex-wrap gap-1'>
                {post.hashtags?.map((hashtag) => (
                  <button
                    className='rounded bg-gray-300 px-2 before:content-["#"]'
                    key={hashtag}
                    onClick={() => handleHashtagFilter(hashtag)}
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
                    userId && post.likes?.includes(userId) && 'bg-gray-800 text-white'
                  }`}
                >
                  likes
                </button>
                <span>{post.likes?.length || 0}</span>
                <button
                  className='rounded border-2 border-solid border-gray-400'
                  onClick={() => handleCommentsShown(index)}
                >
                  view comments
                </button>
                <span>{post.comments?.length || 0}</span>
              </div>
              {post.commentsShown && (
                <div className='mt-2 rounded-lg bg-gray-300 p-1'>
                  {post.comments?.map((comment, index) => (
                    <div className='mt-2 rounded-lg bg-gray-300 p-1' key={index}>
                      <Link to={`/profile/${comment.authorId}`}>
                        <img src='' alt='123' className='mr-1 inline-block h-6 w-6 rounded-full object-cover' />
                      </Link>
                      <div className='inline-block'>
                        <Link to={`/profile/${comment.authorId}`}>
                          <div>name to be inserted</div>
                        </Link>
                        <div>{comment.content}</div>
                      </div>
                    </div>
                  ))}
                  <div className='mt-2 rounded-lg bg-gray-300 p-1'>
                    {isSignedIn && (
                      <img src={userPhotoURL} alt='' className='mr-1 inline-block h-6 w-6 rounded-full object-cover' />
                    )}
                    <div className='inline-block'>
                      <div>{userName}</div>
                      <input
                        type='text'
                        placeholder={isSignedIn ? 'write a comment' : 'sign in to comment'}
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
      </div>
    </div>
  );
}

export default RenderPosts;
