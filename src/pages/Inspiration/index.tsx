import { useState, useRef, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';

import { MapTrifold, Star } from '@phosphor-icons/react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  DocumentData,
} from 'firebase/firestore';

import { ReactComponent as ShootingStar } from '../../assets/ShootingStar.svg';
import { useAppSelector } from '../../redux/hooks';
import { db } from '../../services/firebase';

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
  const allBrandsInfo = useAppSelector((state) => state.info.brands);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>();
  const [randomItem, setRandomItem] = useState<RandomItem | null>();
  const [noItemMessage, setNoItemMessage] = useState<string>();
  const [isFinding, setIsFinding] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  }>();
  const [showMap, setShowMap] = useState(false);
  const [locationErrorMessage, setLocationErrorMessage] = useState<string>();
  const mapRef = useRef<HTMLIFrameElement | null>(null);

  const getUserPosition = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
      },
      (error) => {
        const errorMessage: { [key: string]: string } = {
          '0': 'Unknown error occured, try again later',
          '1': 'User location permission denied. Please go to browser setting to grant permission  to see stores near you.',
          '2': 'User position unavailable (error response from location provider), try again later',
          '3': 'Timed out, try again later',
        };
        setLocationErrorMessage(errorMessage[error.code]);
      }
    );
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

  const scrollToMapEnd = () => {
    mapRef?.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  };

  const handleClickMapBar = () => {
    setShowMap((prev) => !prev);
    setTimeout(() => scrollToMapEnd(), 200);
  };

  const getRandomItem = async (
    filterBrands: string[],
    filterRating: number | undefined
  ) => {
    setRandomItem(undefined);
    setNoItemMessage(undefined);
    setIsFinding(true);

    let randomItemFromDb: DocumentData | RandomItem | undefined = undefined;

    if (filterBrands.length === 0) {
      filterBrands = Object.keys(allBrandsInfo);
    }
    let foundItem = false;
    const indexQueue = Array(filterBrands.length)
      .fill('')
      .map((_, index) => index);
    brandLoop: while (indexQueue.length > 0) {
      // 從user選的裡面選一個brand
      const randomQueueIndex = Math.floor(Math.random() * indexQueue.length);
      const randomBrandId = filterBrands[indexQueue[randomQueueIndex]];
      // 把選到的剔除
      indexQueue.splice(randomQueueIndex, 1);

      // 拿出這個brand的所有categories
      const categoriesRef = collection(
        db,
        'brands',
        randomBrandId,
        'categories'
      );
      const categoriesSnapshot = await getDocs(categoriesRef);
      const categoriesIds = categoriesSnapshot.docs.map((c) => c.id);

      while (categoriesIds.length > 0) {
        // 隨機選一個category
        const randomCategoryIndex = Math.floor(
          Math.random() * categoriesIds.length
        );
        const randomCategoryId = categoriesIds[randomCategoryIndex];
        // 把選到的剔除
        categoriesIds.splice(randomCategoryIndex, 1);

        let itemsRef;

        // 拿出這個category的所有item
        if (filterRating) {
          // 有選rating的話變成拿出這個category的大於n分的所有item
          itemsRef = query(
            collection(
              db,
              'brands',
              randomBrandId,
              'categories',
              randomCategoryId,
              'items'
            ),
            where('averageRating', '>=', filterRating)
          );
        } else {
          itemsRef = query(
            collection(
              db,
              'brands',
              randomBrandId,
              'categories',
              randomCategoryId,
              'items'
            )
          );
        }

        const itemsSnapshot = await getDocs(itemsRef);
        if (itemsSnapshot.size === 0) {
          // 跳過這個loop去下個loop
          continue;
        }

        // 隨機選一個item
        const itemsIds = itemsSnapshot.docs.map((i) => i.id);
        const randomItemId =
          itemsIds[Math.floor(Math.random() * itemsIds.length)];

        // 拿出這個item
        const itemRef = doc(
          db,
          'brands',
          randomBrandId,
          'categories',
          randomCategoryId,
          'items',
          randomItemId
        );
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
        setTimeout(() => setIsFinding(false), 1500);
        foundItem = true;
        break brandLoop;
      }
    }
    setTimeout(() => setIsFinding(false), 1500);
    !foundItem &&
      setNoItemMessage('no item ☹ try another brand or lower the rating');
  };

  return (
    <main className='bg-boxes relative z-0 min-h-[calc(100vh-64px)] bg-fixed p-10 sm:p-5'>
      <h1 className='pageTitle mb-5'>Can&rsquo;t decide? Leave it to us!</h1>
      <div className='mx-auto max-w-[960px]'>
        <span className='mb-3 mr-3 inline-block before:mr-2 before:content-["✦"]'>
          filter some brands
        </span>
        <span
          className={`cursor-pointer text-sm text-gray-400 ${
            selectedBrands.length > 0 ? 'inline-block' : 'hidden'
          }`}
          onClick={() => setSelectedBrands([])}
        >
          clear all brands
        </span>
        <div className='mb-6 flex flex-wrap items-center justify-start gap-3'>
          {Object.keys(allBrandsInfo).map((key) => (
            <label
              key={key}
              className={`button cursor-pointer rounded-full border-2 border-solid border-neutral-900 px-2 pt-1 transition-all duration-100 hover:bg-amber-400 ${
                selectedBrands.includes(key) ? 'bg-amber-400' : 'bg-transparent'
              } ${
                selectedBrands.length !== 0 &&
                !selectedBrands.includes(key) &&
                'opacity-40'
              }`}
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
          set the rating lower bound
        </span>
        <span
          className={`cursor-pointer text-sm text-gray-400 ${
            selectedRating ? 'inline-block' : 'hidden'
          }`}
          onClick={() => setSelectedRating(undefined)}
        >
          clear rating
        </span>
        <div className={`mb-2 flex gap-3 md:mb-10`}>
          {[1, 2, 3, 4].map((num) => (
            <label
              key={num}
              className={`button cursor-pointer rounded-full border-2 border-solid border-neutral-900 px-2 pt-1 transition-all duration-100 hover:bg-amber-400 ${
                selectedRating === num ? ' bg-amber-400 ' : 'bg-transparent'
              } ${
                selectedRating !== undefined &&
                selectedRating !== num &&
                'opacity-40'
              }`}
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
                <Star
                  size={18}
                  color='#171717'
                  weight='fill'
                  className='mb-1'
                />
                {num}+
              </span>
            </label>
          ))}
        </div>
        <div className='flex w-full justify-center'>
          <button
            className={`mx-auto h-40 w-40 rounded-full bg-gradient-to-r from-green-400 to-sky-300 px-2 text-2xl text-white transition-all duration-300 hover:rotate-45 hover:from-violet-500 hover:to-fuchsia-500 ${
              isFinding && 'animate-shrinkSpin'
            }`}
            onClick={() => {
              getRandomItem(selectedBrands, selectedRating);
              getUserPosition();
            }}
          >
            I&rsquo;m feeling lucky :)
          </button>
        </div>
      </div>
      {!isFinding && randomItem && (
        <div className='animate__zoomInDown animate__animated mt-8 flex flex-col items-center'>
          <div className='mb-10 flex w-full items-center justify-center gap-10 transition-all duration-1000 md:gap-3'>
            <ShootingStar className='w-20 animate-upDown' />
            <div className='text-center'>
              <div className='mb-3 text-lg'>↓ we picked this for you! ↓</div>
              <div className='flex flex-col items-center gap-2 '>
                <Link to={`/drinkipedia/${randomItem.brandId}`}>
                  <div className=' text-4xl transition-all duration-200 hover:-translate-y-1'>
                    {randomItem.brand}
                  </div>
                </Link>
                <Link
                  to={`/drinkipedia/${randomItem.brandId}/${randomItem.itemId}`}
                >
                  <div className='ransition-all mr-1 text-5xl duration-200 hover:-translate-y-1'>
                    {randomItem.name}
                  </div>
                </Link>
              </div>
              {randomItem.averageRating && (
                <div className='flex items-center justify-center'>
                  <Star
                    size={18}
                    color='#fbbf24'
                    weight='fill'
                    className='mb-1'
                  />
                  <span>
                    &nbsp;{randomItem.averageRating} ({randomItem.numRatings})
                  </span>
                </div>
              )}
              <div className='flex items-center justify-center gap-3'>
                {randomItem.price &&
                  Object.entries(randomItem.price).map((p) => (
                    <div
                      key={p[0]}
                      className='inline-block flex items-center justify-start gap-1'
                    >
                      <div className='flex h-6 w-6 items-center justify-center rounded-full border-2 border-solid border-neutral-900 bg-green-400 pt-1 text-sm'>
                        {p[0]}
                      </div>
                      <span className='mt-1 before:content-["$"]'>
                        {p[1] as number}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <ShootingStar className='w-20 -scale-x-100 animate-upDownOp' />
          </div>
          <div
            className={`flex w-full max-w-[960px] flex-col items-center justify-center rounded-md border-4 border-neutral-900 ${
              showMap && 'mb-20 sm:mb-10'
            }`}
          >
            <div
              className={`flex h-10 w-full max-w-[960px] cursor-pointer items-center justify-center gap-3 rounded-t-md bg-[#F5F3EA] px-5 ${
                showMap ? '' : 'rounded-b-md'
              }`}
              onClick={handleClickMapBar}
            >
              <MapTrifold
                size={26}
                color='#171717'
                weight='light'
                className={`${
                  showMap && '-rotate-180'
                }  transition-all duration-500`}
              />
              <div>Check out the stores nearby</div>
            </div>
            <div
              className={`absolute w-1/3 px-5 text-[0px] transition-all duration-500 ${
                showMap && locationErrorMessage && ' text-[20px]'
              }`}
            >
              <div className='text-center'>{locationErrorMessage}</div>
            </div>
            <iframe
              ref={mapRef}
              className={`h-0 w-full max-w-[960px] scroll-mb-20 transition-[height] duration-200 ${
                showMap &&
                'h-[480px] rounded-b-md border-t-4 border-neutral-900 sm:scroll-mb-10'
              }`}
              loading='lazy'
              title='Stores Nearby'
              allowFullScreen
              referrerPolicy='no-referrer-when-downgrade'
              src={
                currentLocation &&
                `https://www.google.com/maps/embed/v1/search?key=${
                  process.env.REACT_APP_GOOGLEMAPS_KEY
                }
                            &q=${
                              randomItem.brand
                            }+nearby&language=en&center=${Number(
                  currentLocation.latitude
                )},${Number(currentLocation.longitude)}&zoom=13`
              }
            />
          </div>
        </div>
      )}
      {!isFinding && noItemMessage && (
        <div className='mt-10 w-full text-center text-lg'>{noItemMessage}</div>
      )}
    </main>
  );
}

export default Inspiration;
