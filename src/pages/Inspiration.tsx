import dbApi from '../utils/dbApi';
import { Link } from 'react-router-dom';
import { useState, useEffect, ChangeEvent } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { addAllBrands } from '../app/infoSlice';
import { db } from '../services/firebase';
import { collection, doc, getDoc, getDocs, query, where, DocumentData } from 'firebase/firestore';
import Button from '../components/Button';
import { Star_10, Line_8, Shine_4, Sun_16 } from '../images/star_10';
import { StarIcon as SolidStar } from '@heroicons/react/24/solid';
import { HandRaisedIcon, FaceFrownIcon } from '@heroicons/react/24/outline';
import Shaker from '../images/shaker.gif';

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
  // const [showBrands, setShowBrands] = useState(true);
  // const [showRatings, setShowRatings] = useState(true);
  const [randomItem, setRandomItem] = useState<RandomItem | null>();
  const [noItemMessage, setNoItemMessage] = useState<string>();
  const [isFinding, setIsFinding] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number }>();
  const [showMap, setShowMap] = useState(true);

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
    !foundItem && setNoItemMessage('no item ☹ try another brand or lower the rating');
    setIsFinding(false);
  };

  return (
    <main
      className='relative z-0 min-h-[calc(100vh-64px)] bg-fixed p-10'
      style={{
        backgroundImage:
          'linear-gradient(#BEEFCE 1px, transparent 1px), linear-gradient(to right, #BEEFCE 1px, #F6F6F9 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <h1 className='mb-10 text-center text-7xl'>In the mood for something new?</h1>
      <div className='mx-auto max-w-[960px]'>
        <span className='mb-3 mr-3 inline-block before:mr-2 before:content-["✦"]'>filter some brands if you want</span>
        <span
          className={`cursor-pointer text-sm text-gray-400 ${selectedBrands.length > 0 ? 'inline-block' : 'hidden'}`}
          onClick={() => setSelectedBrands([])}
        >
          clear all brands
        </span>
        <div className='mb-10 flex flex-wrap items-center justify-start gap-3'>
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
              <span>{allBrandsInfo[key].name}</span>
            </label>
          ))}
        </div>
        <span className='mb-3 mr-3 inline-block before:mr-2 before:content-["✦"]'>
          set the rating lower bound if you wish
        </span>
        <span
          className={`cursor-pointer text-sm text-gray-400 ${selectedRating ? 'inline-block' : 'hidden'}`}
          onClick={() => setSelectedRating(undefined)}
        >
          clear rating
        </span>
        <div className={`mb-4 flex gap-3 `}>
          {[1, 2, 3, 4].map((num) => (
            <label
              key={num}
              className={`button cursor-pointer rounded-full border-2 border-solid border-neutral-900 px-2 pt-1 transition-all duration-100 hover:bg-amber-400 ${
                selectedRating === num ? ' bg-amber-400 ' : 'bg-transparent'
              } ${selectedRating !== undefined && selectedRating !== num && 'opacity-40'}`}
            >
              <input
                className='hidden'
                type='radio'
                name='rating'
                value={num}
                checked={selectedRating === num}
                onChange={handleRatingChange}
              />
              <span className='flex items-center gap-1'>
                <SolidStar className='mb-1 w-5 text-neutral-900' />
                {num}+
              </span>
            </label>
          ))}
        </div>
        {/*<button
          className='mx-auto h-48 w-48 rounded-full bg-gradient-to-r from-green-400 to-sky-300 bg-clip-text px-2 text-3xl text-transparent hover:animate-arrow hover:border-solid hover:border-none hover:bg-clip-border hover:text-white'
          // style={{ WebkitTextFillColor: 'transparent' }}
          onClick={() => getRandomItem(selectedBrands, selectedRating)}
        >*/}
        <div className='flex w-full justify-center'>
          <button
            className='mx-auto h-40 w-40 rounded-full bg-gradient-to-r from-green-400 to-sky-300 px-2 text-2xl  text-white transition-all duration-300 hover:rotate-45 hover:from-violet-500 hover:to-fuchsia-500 '
            // style={{ WebkitTextFillColor: 'transparent' }}
            onClick={() => getRandomItem(selectedBrands, selectedRating)}
          >
            I'm feeling lucky :)
          </button>
        </div>
      </div>
      {isFinding && (
        <div>
          {/*<img src={Shaker} alt='' />*/}
          loading...
        </div>
      )}
      {!isFinding && randomItem && (
        <div className='mt-10 flex flex-col items-center '>
          <div className='mb-10 flex w-full justify-center'>
            <HandRaisedIcon className='w-32 rotate-[225deg] ' />
            <div
              className='flex w-1/3 flex-col items-center justify-center bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC]'
              style={{
                WebkitMask:
                  'conic-gradient(from 45deg at left,#0000,#000 1deg 89deg,#0000 90deg) left/51% 84.00px repeat-y, conic-gradient(from -135deg at right,#0000,#000 1deg 89deg,#0000 90deg) right/51% 84.00px repeat-y',
              }}
            >
              <span>we picked </span>
              <div className='flex items-end'>
                <Link to={`/catalogue/${randomItem.brandId}`}>
                  <span className='text-2xl'>{randomItem.brand}</span>
                </Link>
                <span className='mr-2 text-2xl'>'s</span>
                <Link to={`/catalogue/${randomItem.brandId}/${randomItem.itemId}`}>
                  <span className='mr-1 text-2xl'>{randomItem.name}</span>
                </Link>
                {randomItem.averageRating && (
                  <div className='flex items-center'>
                    <SolidStar className='mb-1 w-5 text-amber-400' />
                    <span className=''>
                      &nbsp;{randomItem.averageRating} ({randomItem.numRatings})
                    </span>
                  </div>
                )}
              </div>
              <span> for you!</span>
              <div className='flex items-center gap-3'>
                {randomItem.price &&
                  Object.entries(randomItem.price).map((p) => (
                    <div key={p[0]} className='inline-block flex items-center justify-start gap-1'>
                      <div className='flex h-6 w-6 items-center justify-center rounded-full border-2 border-solid border-neutral-900 bg-green-400 pt-1 text-sm'>
                        {p[0]}
                      </div>
                      <span className='mt-1 before:content-["$"]'>{p[1] as number}</span>
                    </div>
                  ))}
              </div>
            </div>
            <HandRaisedIcon className='w-32 rotate-[135deg] -scale-x-100 ' />
          </div>
          <div
            className={`flex h-10 w-full max-w-[960px] items-center justify-between gap-2 rounded-t-md border-4 border-solid border-neutral-900 bg-[#F5F3EA] px-5 ${
              !showMap && 'rounded-b-md'
            }`}
          >
            <div className=''>Check out the stores near you</div>
            <span
              onClick={() => {
                setShowMap((prev) => !prev);
              }}
              className={`cursor-pointer ${showMap && 'rotate-180'} transition-all duration-200`}
            >
              ▲
            </span>
          </div>
          <iframe
            className={`h-[480px] h-full w-full max-w-[960px] rounded-b-md border-4 border-t-0 border-solid border-neutral-900 ${
              !showMap && 'hidden'
            }`}
            // style={{ border: 0, marginBottom: 5 }}
            loading='lazy'
            allowFullScreen
            referrerPolicy='no-referrer-when-downgrade'
            src={`https://www.google.com/maps/embed/v1/search?key=AIzaSyAyK3jgOTFT1B6-Vt85wxc_2aaGLUlU738
                &q=${randomItem.brand}+nearby&language=en&center=${Number(currentLocation?.latitude)},${Number(
              currentLocation?.longitude
            )}&zoom=13`}
          ></iframe>
          <div className='absolute bottom-[200px] left-40 -z-10'>
            <Line_8 />
          </div>
          <div className='absolute bottom-[500px] right-60 -z-10'>
            <Shine_4 />
          </div>
          <div className='absolute left-80 top-[200px] -z-10'>
            <Sun_16 />
          </div>
        </div>
      )}
      {!isFinding && noItemMessage && <div className='mt-10 w-full text-center text-lg'>{noItemMessage}</div>}

      {/*<Star_10 />
      <Line_8 />
      <Shine_4 />*/}
    </main>
  );
}

export default Inspiration;
