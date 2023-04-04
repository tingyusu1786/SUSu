import { useState, useEffect } from 'react';
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
} from 'firebase/firestore';
import { useAppSelector } from '../../app/hooks';

interface Post {
  postId?: string;
  audience?: string;
  authorId?: string;
  brandId?: string;
  brandName?: string;
  hashtags?: string[];
  ice?: string;
  itemId?: string;
  itemName?: string;
  orderNum?: string;
  price?: string;
  rating?: string;
  selfComment?: string;
  sugar?: string;
  timeCreated?: Timestamp;
}

function RenderPosts() {
  const userId = useAppSelector((state) => state.auth.userId);

  const [posts, setPosts] = useState<Post[]>([]);

  // useEffect(() => {
  //   const postsCollection = collection(db, 'posts');
  //   onSnapshot(postsCollection, (querySnapshot) => {
  //     const newPosts = querySnapshot
  //       .docChanges()
  //       .filter((change) => change.type === 'added')
  //       .map((change) => {
  //         return {
  //           postId: change.doc.id, ...change.doc.data(),
  //         };
  //       });
  //     setPosts((posts) => [...posts, ...newPosts]);
  //   });
  // }, []);

  useEffect(() => {
    const postsCollection = collection(db, 'posts');
    const postQuery = query(postsCollection, orderBy('timeCreated', 'asc'));

    onSnapshot(postQuery, async (querySnapshot: QuerySnapshot) => {
      const newPosts = querySnapshot
        .docChanges()
        .filter((change) => change.type === 'added')
        .map(async (change) => {
          const postData = change.doc.data();
          const brandName: string = await getBrandName(postData.brandId || '');
          const itemName: string = await getItemName(postData.itemId || '');
          return { ...postData, postId: change.doc.id, brandName, itemName };
        });
      const postsWithBrandNames = await Promise.all(newPosts);
      setPosts((posts) => [...posts, ...postsWithBrandNames]);
      // console.log(postsWithBrandNames)
    });
  }, []);

  const getBrandName = async (brandId: string) => {
    if (brandId !== '') {
      const brandDocRef = doc(db, 'brands', brandId);
      const brandDoc = await getDoc(brandDocRef);
      if (!brandDoc.exists()) {
        console.log('No such document!');
        return '';
      }
      const brandData = brandDoc.data();
      return brandData.name;
    }
  };

  const getItemName = async (itemId: string) => {
    if (itemId !== '') {
      const idArray = itemId.split('-');
      const itemDocRef = doc(db, 'brands', idArray[0], 'categories', idArray[0] + '-' + idArray[1], 'items', itemId);
      const itemDoc = await getDoc(itemDocRef);
      if (!itemDoc.exists()) {
        console.log('No such document!');
        return '';
      }
      const itemData = itemDoc.data();
      return itemData.name;
    }
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      {/*<button onClick={adddd}>addddd</button>*/}
      <h1 className='text-3xl'>render posts</h1>
      <div className='flex flex-col-reverse items-center justify-center gap-3'>
        {posts.map((post, i) => {
          {
            /*  const unixTimeStamp = post.timeCreated;
          const dateObject = new Date(unixTimeStamp);
          const readableDate = dateObject.toLocaleString();*/
          }
          return (
            <div className='w-4/5 rounded bg-gray-100 p-3' key={i}>
              <div>{`id: ${post.postId}`}</div>
              <div>{post.brandName}</div>
              {/*<div>{`brand: ${post.brandId}`}</div>*/}
              <div>{post.itemName}</div>
              {/*<div>{`item: ${post.itemId}`}</div>*/}
              <div>{`ice: ${post.ice}`}</div>
              <div>{`sugar: ${post.sugar}`}</div>
              <div>{`orderNum: ${post.orderNum}`}</div>
              <div>{`rating: ${post.rating}`}</div>
              <div>{`selfComment: ${post.selfComment}`}</div>
              <div className='flex flex-wrap gap-1'>
                {post.hashtags?.map((hashtag) => (
                  <span className='rounded bg-gray-300 px-2 before:content-["#"]'>{hashtag}</span>
                ))}
              </div>
              <div>{post.timeCreated?.toDate().toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RenderPosts;
