import dbApi from '../utils/dbApi';
import { Link } from 'react-router-dom';
import { useState, useEffect, ChangeEvent } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { addAllBrands } from '../app/infoSlice';
import { db } from '../services/firebase';
import { collection, doc, getDoc, getDocs, query, where, DocumentData } from 'firebase/firestore';
import Button from '../components/Button';

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
  const [showBrands, setShowBrands] = useState(true);
  const [showRatings, setShowRatings] = useState(true);
  const [randomItem, setRandomItem] = useState<RandomItem | null>();
  const [noItemMessage, setNoItemMessage] = useState<string>();
  const [isFinding, setIsFinding] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number }>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      // console.log('latitude', latitude, 'longitude', longitude);
      setCurrentLocation({ latitude, longitude });
    });
  }, []);

  useEffect(() => {
    if (Object.keys(allBrandsInfo).length > 0) return;
    fetchAllBrandsInfo();
    // eslint-disable-next-line
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
    setRandomItem(undefined);
    setNoItemMessage(undefined);
    setIsFinding(true);

    let randomItemFromDb: DocumentData | RandomItem | undefined = undefined;

    if (selectedBrands.length === 0) {
      selectedBrands = Object.keys(allBrandsInfo);
    }
    let foundItem = false;
    const indexQueue = Array(selectedBrands.length)
      .fill('')
      .map((_, index) => index);
    brandLoop: while (indexQueue.length > 0) {
      // 從user選的裡面選一個brand
      const randomQueueIndex = Math.floor(Math.random() * indexQueue.length);
      const randomBrandId = selectedBrands[indexQueue[randomQueueIndex]];
      // 把選到的剔除
      indexQueue.splice(randomQueueIndex, 1);

      // 拿出這個brand的所有categories
      const categoriesRef = collection(db, 'brands', randomBrandId, 'categories');
      const categoriesSnapshot = await getDocs(categoriesRef);
      const categoriesIds = categoriesSnapshot.docs.map((c) => c.id);

      while (categoriesIds.length > 0) {
        // 隨機選一個category
        const randomCategoryIndex = Math.floor(Math.random() * categoriesIds.length);
        const randomCategoryId = categoriesIds[randomCategoryIndex];
        // 把選到的剔除
        categoriesIds.splice(randomCategoryIndex, 1);

        let itemsRef;

        // 拿出這個category的所有item
        if (!selectedRating) {
          itemsRef = query(collection(db, 'brands', randomBrandId, 'categories', randomCategoryId, 'items'));
        } else {
          // 有選rating的話變成拿出這個category的大於n分的所有item
          itemsRef = query(
            collection(db, 'brands', randomBrandId, 'categories', randomCategoryId, 'items'),
            where('averageRating', '>=', selectedRating)
          );
        }

        const itemsSnapshot = await getDocs(itemsRef);
        if (itemsSnapshot.size === 0) {
          // 跳過這個loop去下個loop
          continue;
        }

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
        setRandomItem(randomItemFromDb as RandomItem);
        setIsFinding(false);
        foundItem = true;
        break brandLoop;
      }
    }
    !foundItem && setNoItemMessage('no item, try another brand or lower the rating');
    setIsFinding(false);
  };

  return (
    <main
      className='flex min-h-[calc(100vh-64px)] flex-col items-center bg-fixed p-10'
      style={{
        backgroundImage:
          'linear-gradient(#BEEFCE 1px, transparent 1px), linear-gradient(to right, #BEEFCE 1px, #F6F6F9 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <h1 className='mb-10 text-center text-7xl'>In the mood for something new?</h1>
      <div className='flex max-w-3xl flex-col content-center'>
        <div className='flex flex-col items-center justify-center'>
          {/*<div
            className='self-start font-bold'
            onClick={() => {
              selectedBrands.length === 0 && setShowBrands((prev) => !prev);
            }}
          >
            篩選店家
          </div>*/}
          <div className={`flex flex-wrap justify-start gap-3 ${showBrands === false && 'hidden'}`}>
            {Object.keys(allBrandsInfo).map((key) => (
              <label
                key={key}
                className={`button cursor-pointer rounded-full border-2 border-solid border-neutral-900 px-2 pt-1 transition-all duration-100 hover:bg-amber-400 ${
                  selectedBrands.includes(key) ? 'bg-amber-400' : 'bg-transparent'
                } ${selectedBrands.length !== 0 && !selectedBrands.includes(key) && 'opacity-40'}`}
              >
                <input
                  type='checkbox'
                  name={key}
                  checked={selectedBrands.includes(key)}
                  onChange={handleBrandsChange}
                  className='hidden'
                />
                <span className={``}>{allBrandsInfo[key].name}</span>
              </label>
            ))}
            <span className='text-sm text-gray-400' onClick={() => setSelectedBrands([])}>
              clear
            </span>
          </div>
        </div>
        <div className='flex flex-col items-center justify-center'>
          {/*<div
            className='font-bold'
            onClick={() => {
              !selectedRating && setShowRatings((prev) => !prev);
            }}
          >
            篩選評分
          </div>*/}
          <div className={`flex gap-3 ${showRatings === false && 'hidden'}`}>
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
            <span className='text-sm text-gray-400' onClick={() => setSelectedRating(undefined)}>
              clear
            </span>
          </div>
        </div>
        <button
          className='rounded bg-lime-300 px-2 font-heal'
          onClick={() => getRandomItem(selectedBrands, selectedRating)}
        >
          GO!
        </button>
        {isFinding && <div>choosing drinks for you~~~</div>}
        {!isFinding && randomItem && (
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
            {randomItem.price &&
              Object.entries(randomItem.price).map((p) => (
                <p key={p[0]}>
                  {p[0]}: ${p[1]}
                </p>
              ))}
            附近的店：
            <iframe
              width='640'
              height='480'
              style={{ border: 0, marginBottom: 5 }}
              loading='lazy'
              allowFullScreen
              referrerPolicy='no-referrer-when-downgrade'
              src={`https://www.google.com/maps/embed/v1/search?key=AIzaSyAyK3jgOTFT1B6-Vt85wxc_2aaGLUlU738
                &q=${randomItem.brand}+nearby&language=zh-TW&center=${Number(currentLocation?.latitude)},${Number(
                currentLocation?.longitude
              )}&zoom=13`}
            ></iframe>
          </div>
        )}
        {!isFinding && noItemMessage && <div>{noItemMessage}</div>}
      </div>
    </main>
  );
}

export default Inspiration;
