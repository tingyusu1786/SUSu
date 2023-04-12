import dbApi from '../utils/dbApi';
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
  const dispatch = useAppDispatch();
  const allBrandsInfo = useAppSelector((state) => state.info.brands);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>();
  const [showBrands, setShowBrands] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  const [randomItem, setRandomItem] = useState<Record<string,string>>();

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

  const getRandomItem = async (selectedBrands: string[], selectedRating: number|undefined) => {
    if (selectedBrands.length > 0 && selectedRating) {
      // selected both

    } else if (selectedBrands.length > 0 && !selectedRating) {
      // selected brand
      const randomIndex = Math.floor(Math.random() * selectedBrands.length);

    } else if (selectedBrands.length === 0 && selectedRating) {
      // selected rating

    } else {
      // selected none
      // 隨機選一個brand
      const randomBrandId = Math.floor(Math.random() * Object.keys(allBrandsInfo).length) + 1;

      // 拿出這個brand的所有categories
      const categoriesRef = collection(db, 'brands', randomBrandId.toString(), 'categories');
      const categoriesSnapshot = await getDocs(categoriesRef);

      // 隨機選一個category
      const randomCategoryId = Math.floor(Math.random() * categoriesSnapshot.size) + 1;

      // 拿出這個category的所有item
      const itemsRef = collection(db, 'brands', randomBrandId.toString(), 'categories', randomBrandId+'-'+randomCategoryId, 'items');
      const itemsSnapshot = await getDocs(itemsRef);

      // 隨機選一個item
      const randomItemId = Math.floor(Math.random() * itemsSnapshot.size) + 1;

      // 拿出這個item
      const itemRef = doc(db, 'brands', randomBrandId.toString(), 'categories', randomBrandId + '-' + randomCategoryId, 'items', randomBrandId + '-' + randomCategoryId + '-' + randomItemId);
      const randomItemDoc = await getDoc(itemRef);
      let randomItem = await randomItemDoc.data();
      // 加上brand資訊
      randomItem = { ...randomItem, id: randomItemDoc.id, brand: allBrandsInfo[randomBrandId.toString()].name };
      console.log(randomItem);
      return randomItem;
    }
  }

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
            <label>
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
          篩選評分
        </button>
        <div className={`flex gap-3 ${showRatings === false && 'hidden'}`}>
          <button className='text-sm text-gray-400' onClick={() => setSelectedRating(undefined)}>
            清除
          </button>
          {[1, 2, 3, 4].map((num) => (
            <label>
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
      <button className='rounded bg-lime-300 px-2 font-heal' onClick={() => getRandomItem(selectedBrands, selectedRating)}>GO!</button>
    </div>
  );
}

export default Inspiration;
