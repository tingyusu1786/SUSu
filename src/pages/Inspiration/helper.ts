import {
  DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { RandomItem } from '.';
import { Brand } from '../../interfaces/interfaces';
import { db } from '../../services/firebase';

export function getUserPosition(
  setCurrentLocation: (location: {
    latitude: number;
    longitude: number;
  }) => void,
  setLocationErrorMessage: (value: string) => void
) {
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
}

export async function handleClickRandom(
  filterBrands: string[],
  filterRating: number | undefined,
  allBrandsInfo: {
    [brandId: string]: Brand;
  },
  setRandomItem: (arg0: RandomItem | undefined | null) => void,
  setNoItemMessage: (arg0: string | undefined) => void,
  setIsFinding: (arg0: boolean) => void
) {
  setRandomItem(undefined);
  setNoItemMessage(undefined);
  setIsFinding(true);

  let randomItemFromDb: DocumentData | RandomItem | undefined = undefined;

  if (filterBrands.length === 0) {
    filterBrands = Object.keys(allBrandsInfo);
  }
  let isItemFound = false;
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
    const categoriesRef = collection(db, 'brands', randomBrandId, 'categories');
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
      isItemFound = true;
      break brandLoop;
    }
  }
  setTimeout(() => setIsFinding(false), 1500);
  !isItemFound &&
    setNoItemMessage('no item ☹ try another brand or lower the rating');
}
