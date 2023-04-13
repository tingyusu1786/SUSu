import dbApi from '../utils/dbApi';
import { Link } from 'react-router-dom';
import { useState, useEffect, ChangeEvent } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { addAllBrands } from '../app/infoSlice';
import { db } from '../services/firebase';
import {
  collection,
  doc,
  DocumentSnapshot,
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
} from 'firebase/firestore';

function Inspiration() {
  type RandomItem = {
    brand: string;
    brandId: string;
    itemId: string;
    name: string;
    price: Record<string, number>;
    numRatings?: number;
    averageRating?: number;
  };
  const dispatch = useAppDispatch();
  const allBrandsInfo = useAppSelector((state) => state.info.brands);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>();
  const [showBrands, setShowBrands] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  const [randomItem, setRandomItem] = useState<RandomItem>();
  const [isFinding, setIsFinding] = useState(false);

  useEffect(() => {
    if (Object.keys(allBrandsInfo).length > 0) return;
    fetchAllBrandsInfo();
  }, []);

  const fetchAllBrandsInfo = async () => {
    const allBrands = await dbApi.getAllBrandsInfo();
    dispatch(addAllBrands({ allBrands }));
  };

  const handleBrandsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isSelected = selectedBrands.includes(e.target.name);
    const updatedSelectedBrands = isSelected
      ? selectedBrands.filter((b) => b !== e.target.name)
      : [...selectedBrands, e.target.name];
    setSelectedBrands(updatedSelectedBrands);
  };

  const handleRatingChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedRating(+e.target.value);
  };

  const getRandomItem = async (selectedBrands: string[], selectedRating: number | undefined) => {
    setIsFinding(true);
    if (selectedBrands.length > 0 && selectedRating) {
      // selected both
      // todo
      // 設where, 如果真的沒有就說沒有

      let randomItemFromDb: DocumentData | RandomItem | undefined = undefined;
      while (
        !randomItemFromDb ||
        !randomItemFromDb?.averageRating ||
        (randomItemFromDb.averageRating && randomItemFromDb.averageRating < selectedRating)
      ) {
        // 從user選的裡面選一個brand
        const randomIndex = selectedBrands.length === 1 ? 0 : Math.floor(Math.random() * selectedBrands.length);
        const randomBrandId = selectedBrands[randomIndex];

        // 拿出這個brand的所有categories
        const categoriesRef = collection(db, 'brands', randomBrandId, 'categories');
        const categoriesSnapshot = await getDocs(categoriesRef);

        // 隨機選一個category
        const categoriesIds = categoriesSnapshot.docs.map((c) => c.id);
        const randomCategoryId = categoriesIds[Math.floor(Math.random() * categoriesIds.length)];

        // 拿出這個category的所有item
        const itemsRef = collection(db, 'brands', randomBrandId, 'categories', randomCategoryId, 'items');
        const itemsSnapshot = await getDocs(itemsRef);

        // 隨機選一個item
        const itemsIds = itemsSnapshot.docs.map((i) => i.id);
        const randomItemId = itemsIds[Math.floor(Math.random() * itemsIds.length)];

        // 拿出這個item
        const itemRef = doc(db, 'brands', randomBrandId, 'categories', randomCategoryId, 'items', randomItemId);
        const randomItemDoc = await getDoc(itemRef);
        randomItemFromDb = await randomItemDoc.data();
        // 加上brand資訊
        randomItemFromDb = {
          ...randomItemFromDb,
          itemId: randomItemDoc.id,
          brand: allBrandsInfo[randomBrandId].name,
          brandId: randomBrandId,
        };
        // console.log(n);
        console.log(randomItemFromDb);
        if (randomItemFromDb.averageRating > selectedRating) {
          setRandomItem(randomItemFromDb as RandomItem);
          setIsFinding(false);
        }
      }
    } else if (selectedBrands.length === 0 && selectedRating) {
      // selected rating
      let randomItemFromDb: DocumentData | RandomItem | undefined = undefined;
      while (
        !randomItemFromDb ||
        !randomItemFromDb?.averageRating ||
        (randomItemFromDb.averageRating && randomItemFromDb.averageRating < selectedRating)
      ) {
        // 隨機選一個brand
        const randomBrandId = Object.keys(allBrandsInfo)[Math.floor(Math.random() * Object.keys(allBrandsInfo).length)];
        // if (!randomBrandId) return;
        // const randomBrandId = '1';

        // 拿出這個brand的所有categories
        const categoriesRef = collection(db, 'brands', randomBrandId, 'categories');
        const categoriesSnapshot = await getDocs(categoriesRef);

        // 隨機選一個category
        const categoriesIds = categoriesSnapshot.docs.map((c) => c.id);
        const randomCategoryId = categoriesIds[Math.floor(Math.random() * categoriesIds.length)];

        // 拿出這個category的所有item
        const itemsRef = collection(db, 'brands', randomBrandId, 'categories', randomCategoryId, 'items');
        const itemsSnapshot = await getDocs(itemsRef);

        // 隨機選一個item
        const itemsIds = itemsSnapshot.docs.map((i) => i.id);
        const randomItemId = itemsIds[Math.floor(Math.random() * itemsIds.length)];

        // 拿出這個item
        const itemRef = doc(db, 'brands', randomBrandId, 'categories', randomCategoryId, 'items', randomItemId);
        const randomItemDoc = await getDoc(itemRef);
        randomItemFromDb = await randomItemDoc.data();
        // 加上brand資訊
        randomItemFromDb = {
          ...randomItemFromDb,
          itemId: randomItemDoc.id,
          brand: allBrandsInfo[randomBrandId].name,
          brandId: randomBrandId,
        };
        // console.log(n);
        console.log(randomItemFromDb);
        if (randomItemFromDb.averageRating > selectedRating) {
          setRandomItem(randomItemFromDb as RandomItem);
          setIsFinding(false);
        }
      }
    } else if (selectedBrands.length > 0 && !selectedRating) {
      // selected brand
      // 從user選的裡面選一個brand
      const randomIndex = selectedBrands.length === 1 ? 0 : Math.floor(Math.random() * selectedBrands.length);
      // randomBrandId = selectedBrands[randomIndex];
      const randomBrandId = selectedBrands[randomIndex];

      if (!randomBrandId) return;
      // 拿出這個brand的所有categories
      const categoriesRef = collection(db, 'brands', randomBrandId, 'categories');
      const categoriesSnapshot = await getDocs(categoriesRef);

      // 隨機選一個category
      const categoriesIds = categoriesSnapshot.docs.map((c) => c.id);
      const randomCategoryId = categoriesIds[Math.floor(Math.random() * categoriesIds.length)];

      // 拿出這個category的所有item
      const itemsRef = collection(db, 'brands', randomBrandId, 'categories', randomCategoryId, 'items');
      const itemsSnapshot = await getDocs(itemsRef);

      // 隨機選一個item
      const itemsIds = itemsSnapshot.docs.map((i) => i.id);
      const randomItemId = itemsIds[Math.floor(Math.random() * itemsIds.length)];

      // 拿出這個item
      const itemRef = doc(db, 'brands', randomBrandId, 'categories', randomCategoryId, 'items', randomItemId);
      const randomItemDoc = await getDoc(itemRef);
      let randomItemFromDb = await randomItemDoc.data();
      // 加上brand資訊
      randomItemFromDb = {
        ...randomItemFromDb,
        itemId: randomItemDoc.id,
        brand: allBrandsInfo[randomBrandId].name,
        brandId: randomBrandId,
      };
      console.log(randomItemFromDb);
      setRandomItem(randomItemFromDb as RandomItem);
      setIsFinding(false);
    } else {
      // selected none
      // 隨機選一個brand
      const randomBrandId = Object.keys(allBrandsInfo)[Math.floor(Math.random() * Object.keys(allBrandsInfo).length)];

      if (!randomBrandId) return;
      // 拿出這個brand的所有categories
      const categoriesRef = collection(db, 'brands', randomBrandId, 'categories');
      const categoriesSnapshot = await getDocs(categoriesRef);

      // 隨機選一個category
      const categoriesIds = categoriesSnapshot.docs.map((c) => c.id);
      const randomCategoryId = categoriesIds[Math.floor(Math.random() * categoriesIds.length)];

      // 拿出這個category的所有item
      const itemsRef = collection(db, 'brands', randomBrandId, 'categories', randomCategoryId, 'items');
      const itemsSnapshot = await getDocs(itemsRef);

      // 隨機選一個item
      const itemsIds = itemsSnapshot.docs.map((i) => i.id);
      const randomItemId = itemsIds[Math.floor(Math.random() * itemsIds.length)];

      // 拿出這個item
      const itemRef = doc(db, 'brands', randomBrandId, 'categories', randomCategoryId, 'items', randomItemId);
      const randomItemDoc = await getDoc(itemRef);
      let randomItemFromDb = await randomItemDoc.data();
      // 加上brand資訊
      randomItemFromDb = {
        ...randomItemFromDb,
        itemId: randomItemDoc.id,
        brand: allBrandsInfo[randomBrandId].name,
        brandId: randomBrandId,
      };
      console.log(randomItemFromDb);
      setRandomItem(randomItemFromDb as RandomItem);
      setIsFinding(false);
    }

    // return randomItem;
  };

  return (
    <div className='flex flex-col items-center justify-center gap-5'>
      <div className='text-center font-heal text-3xl'>what to drink today?</div>
      <div className='flex flex-col items-center justify-center'>
        <button
          className='font-bold'
          onClick={() => {
            selectedBrands.length === 0 && setShowBrands((prev) => !prev);
          }}
        >
          篩選店家
        </button>
        <div className={`flex gap-3 ${showBrands === false && 'hidden'}`}>
          <button className='text-sm text-gray-400' onClick={() => setSelectedBrands([])}>
            清除
          </button>
          {Object.keys(allBrandsInfo).map((key) => (
            <label key={key}>
              <input type='checkbox' name={key} checked={selectedBrands.includes(key)} onChange={handleBrandsChange} />
              <span>{allBrandsInfo[key].name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className='flex flex-col items-center justify-center'>
        <button
          className='font-bold'
          onClick={() => {
            !selectedRating && setShowRatings((prev) => !prev);
          }}
        >
          (篩選評分)
        </button>
        <div className={`flex gap-3 ${showRatings === false && 'hidden'}`}>
          <button className='text-sm text-gray-400' onClick={() => setSelectedRating(undefined)}>
            清除
          </button>
          {[1, 2, 3, 4].map((num) => (
            <label key={num}>
              <input
                type='radio'
                name='rating'
                value={num}
                checked={selectedRating === num}
                onChange={handleRatingChange}
              />
              <span>
                {Array(num)
                  .fill(0)
                  .map((n) => '⭐️')}
                +
              </span>
            </label>
          ))}
        </div>
      </div>
      <button
        className='rounded bg-lime-300 px-2 font-heal'
        onClick={() => getRandomItem(selectedBrands, selectedRating)}
      >
        GO!
      </button>
      {isFinding && <div>choosing drinks for you~~~</div>}
      {randomItem && (
        <div className='flex flex-col items-center justify-center'>
          <p>推薦你喝</p>
          <Link to={`/catalogue/${randomItem.brandId}`}>
            <p className='text-xl'>{randomItem.brand}</p>
          </Link>
          <span>的</span>
          <Link to={`/catalogue/${randomItem.brandId}/${randomItem.itemId}`}>
            <h1 className='text-3xl'>\ {randomItem.name} /</h1>
          </Link>
          {randomItem.averageRating && (
            <p>
              {randomItem.averageRating} / {randomItem.numRatings}
            </p>
          )}
          {Object.entries(randomItem.price).map((p) => (
            <p key={p[0]}>
              {p[0]}: ${p[1]}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default Inspiration;
