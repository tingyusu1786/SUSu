import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../utils/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
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

  const [posts, setPosts] = useState<Post[]>([]);
  const [hashtagFilter, setHashtagFilter] = useState<string | undefined>();

  useEffect(() => {
    if(hashtagFilter === undefined) {
      const postsCollection = collection(db, 'posts');
        const postQuery = query(postsCollection, orderBy('timeCreated', 'asc'));
    
        onSnapshot(postQuery, async (querySnapshot: QuerySnapshot) => {
          const newPosts = querySnapshot
            .docChanges()
            .filter((change) => change.type === 'added')
            .map(async (change) => {
              const postData = change.doc.data();
              const brandName: string = await getName(postData.brandId || '', 'brand');
              const itemName: string = await getName(postData.itemId || '', 'item');
              const authorName: string = await getAuthorInfo(postData.authorId || '', 'name');
              const authorPhoto: string = await getAuthorInfo(postData.authorId || '', 'photo');
              return { ...postData, postId: change.doc.id, brandName, itemName, authorName, authorPhoto };
            });
          const postsWithQueriedInfos = await Promise.all(newPosts);
          setPosts((posts) => [...posts, ...postsWithQueriedInfos]);
        });}
  }, [hashtagFilter]);

  const handleHashtagFilter = async (hashtag: string) => {
    setHashtagFilter(hashtag);
    const postsRef = collection(db, 'posts');
    // need to build index in firestore
    const q = query(postsRef, where('hashtags', 'array-contains', hashtag), orderBy('timeCreated', 'asc'));
    const querySnapshot: QuerySnapshot = await getDocs(q);
    const filteredPosts = querySnapshot.docs.map(async (change) => {
      const postData = change.data();
      const brandName: string = await getName(postData.brandId || '', 'brand');
      const itemName: string = await getName(postData.itemId || '', 'item');
      const authorName: string = await getAuthorInfo(postData.authorId || '', 'name');
      const authorPhoto: string = await getAuthorInfo(postData.authorId || '', 'photo');
      return { ...postData, postId: change.id, brandName, itemName, authorName, authorPhoto };
    });

    const postsWithQueriedInfos = await Promise.all(filteredPosts);
    setPosts(postsWithQueriedInfos);
  };

  const getAuthorInfo = async (authorId: string, type: string) => {
    if (authorId !== '') {
      const authorDocRef = doc(db, 'users', authorId);
      const authorDoc = await getDoc(authorDocRef);
      if (!authorDoc.exists()) {
        alert('No such document!');
        return '';
      }
      const authorData = authorDoc.data();
      let info;
      switch (type) {
        case 'name': {
          info = authorData.name;
          break;
        }
        case 'photo': {
          info = authorData.photoURL;
          break;
        }
        default: {
          info = '';
        }
      }
      return info;
    }
  };

  const getName = async (id: string, type: string) => {
    if (id !== '') {
      let docRef;
      switch (type) {
        case 'brand': {
          docRef = doc(db, 'brands', id);
          break;
        }
        case 'item':
          {
            const idArray = id.split('-');
            docRef = doc(db, 'brands', idArray[0], 'categories', idArray[0] + '-' + idArray[1], 'items', id);
            break;
          }
          deafult: return;
      }
      if (docRef !== undefined) {
        const theDoc = await getDoc(docRef);
        if (!theDoc.exists()) {
          alert('No such document!');
          return '';
        }
        const theData = theDoc.data();
        return theData.name;
      }
    }
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
    alert(`liked/unliked! post: ${post.postId}`);
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
                <button className='rounded border-2 border-solid border-gray-400'>comment</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RenderPosts;
