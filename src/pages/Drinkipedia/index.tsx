import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import dbApi from '../../utils/dbApi';
import AllBrands from './AllBrands';
import SingleBrand from './SingleBrand';
import SingleItem from './SingleItem';
import BreadcrumbNav from './BreadcrumbNav';
import { Item } from '../../interfaces/interfaces';
import swal from '../../utils/swal';

function Drinkipedia() {
  const { pageBrandId } = useParams<{ pageBrandId: string }>();
  const { pageItemId } = useParams<{ pageItemId: string }>();
  const [catalogueItemObj, setCatalogueItemObj] = useState<Item>();
  const [catalogueItemName, setCatalogueItemName] = useState<string>();
  const [categories, setCategories] = useState<string[][]>([]);
  const [itemsOfBrand, setItemsOfBrand] = useState<string[][][]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!pageBrandId) {
        return;
      }
      const categoryInfos = await dbApi.getCategoriesIdAndName(pageBrandId);
      categoryInfos && setCategories(categoryInfos);
    };
    fetchCategories();
    setItemsOfBrand([]);
  }, [pageBrandId]);

  useEffect(() => {
    const fetchItems = async (categoryId: string) => {
      if (!pageBrandId) {
        return;
      }
      const itemInfos = await dbApi.getItemsIdAndName(pageBrandId, categoryId);
      itemInfos && setItemsOfBrand((items) => items.concat([itemInfos]));
    };

    if (categories.length > 0) {
      categories.forEach((category) => {
        fetchItems(category[0]);
      });
    }
  }, [categories]);

  useEffect(() => {
    setCatalogueItemName(undefined);
    const fetchCatalogueItemName = async () => {
      const itemName = await getCatalogueItemName(pageItemId);
      setCatalogueItemName(itemName);
    };
    if (pageItemId) {
      fetchCatalogueItemName();
      getCatalogueItemObj(pageItemId);
    }
  }, [pageItemId]);

  const getCatalogueItemObj = async (itemId: string) => {
    const itemIdArray = itemId.split('-');
    const itemRef = doc(
      db,
      'brands',
      itemIdArray[0],
      'categories',
      `${itemIdArray[0]}-${itemIdArray[1]}`,
      'items',
      itemId
    );
    const itemDoc = await getDoc(itemRef);
    const itemDocData = itemDoc.data();
    itemDocData && setCatalogueItemObj(itemDocData as Item);
  };

  const getCatalogueItemName = async (itemId: string | undefined) => {
    if (itemId !== undefined) {
      const idArray = itemId.split('-');
      const docRef = doc(
        db,
        'brands',
        idArray[0],
        'categories',
        `${idArray[0]}-${idArray[1]}`,
        'items',
        itemId
      );
      if (docRef !== undefined) {
        const itemDoc = await getDoc(docRef);
        if (!itemDoc.exists()) {
          swal.error(
            'Something went wrong when fetching drink catagories...',
            '',
            'ok'
          );
          return '';
        }
        const data = itemDoc.data();
        return data.name;
      }
    }
  };

  const shouldRenderAll = !pageBrandId && !pageItemId;
  const shouldRenderSingleBrand = pageBrandId && !pageItemId;
  const shouldRenderSingleItem = pageBrandId && pageItemId;

  return (
    <main className='bg-boxes relative min-h-[calc(100vh-64px)] bg-fixed p-10 sm:p-5'>
      <BreadcrumbNav
        pageBrandId={pageBrandId}
        pageItemId={pageItemId}
        catalogueItemName={catalogueItemName}
      />
      {shouldRenderAll && <AllBrands />}
      {shouldRenderSingleBrand && (
        <SingleBrand
          pageBrandId={pageBrandId}
          categories={categories}
          itemsOfBrand={itemsOfBrand}
        />
      )}
      {shouldRenderSingleItem && catalogueItemObj && (
        <SingleItem
          pageItemId={pageItemId}
          catalogueItemName={catalogueItemName}
          catalogueItemObj={catalogueItemObj}
        />
      )}
    </main>
  );
}

export default Drinkipedia;
