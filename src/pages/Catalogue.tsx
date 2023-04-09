import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../services/firebase';
import dbApi from '../utils/dbApi';
import { doc, getDoc, collection, query, where, getDocs, orderBy, QuerySnapshot } from 'firebase/firestore';

function Catalogue() {
  const { catalogueBrandId } = useParams<{ catalogueBrandId: string }>();
  const { catalogueItemId } = useParams<{ catalogueItemId: string }>();
  const [catalogueBrandObj, setCatalogueBrandObj] = useState<any>();
  const [catalogueItemObj, setCatalogueItemObj] = useState<any>();
  const [catalogueBrandName, setCatalogueBrandName] = useState<string>();
  const [catalogueItemName, setCatalogueItemName] = useState<string>();
  const [brands, setBrands] = useState<string[][]>([]);
  const [categories, setCategories] = useState<string[][]>([]);
  const [itemsOfBrand, setItemsOfBrand] = useState<string[][][]>([]);
  //todo: refresh fetch twice itemsOfBrand

  useEffect(() => {
    // console.log("[]");
    const fetchBrands = async () => {
      const brandInfos = await getBrandsIdAndName();
      setBrands(brandInfos);
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    // console.log("[brands, catalogueBrandId]");
    const currentBrand = brands?.find((brand) => brand[0] === catalogueBrandId);
    const currentBrandName = currentBrand && currentBrand[1];
    // console.log(currentBrandName);
    setCatalogueBrandName(currentBrandName);
    catalogueBrandId && getCatalogueBrandObj(catalogueBrandId);
  }, [brands, catalogueBrandId]);

  useEffect(() => {
    // console.log("[catalogueBrandName]");
    const fetchCategories = async () => {
      if (!catalogueBrandId) {
        return;
      }
      const categoryInfos = await getCategoriesIdAndName(catalogueBrandId);
      setCategories(categoryInfos);
      console.log('setCategories(categoryInfos);', categoryInfos);
    };
    catalogueBrandName && fetchCategories();
    setItemsOfBrand([]);
  }, [catalogueBrandName]);

  useEffect(() => {
    // console.log('[categories]');
    const fetchItems = async (categoryId: string) => {
      if (!catalogueBrandId) {
        return;
      }
      const itemInfos = await getItemsIdAndName(catalogueBrandId, categoryId);
      setItemsOfBrand((itemsOfBrand) => itemsOfBrand.concat([itemInfos]));
    };

    if (categories.length > 0) {
      categories.forEach((category) => {
        fetchItems(category[0]);
      });
    }
  }, [categories]);

  useEffect(() => {
    // console.log('[catalogueItemId]');
    const fetchCatalogueItemName = async () => {
      const itemName = await getCatalogueItemName(catalogueItemId);
      setCatalogueItemName(itemName);
    };
    if (catalogueItemId) {
      fetchCatalogueItemName();
      getCatalogueItemObj(catalogueItemId);
    }
  }, [catalogueItemId]);

  const getCatalogueBrandObj = async (brandId: string) => {
    const brandDocRef = doc(db, 'brands', brandId);
    const brandDoc = await dbApi.getDoc(brandDocRef);
    const brandocdata = brandDoc.data();
    brandocdata && setCatalogueBrandObj(brandocdata);
  };

  const getCatalogueItemObj = async (itemId: string) => {
    const itemIdArray = itemId.split('-');
    const itemRef = doc(
      db,
      'brands',
      itemIdArray[0],
      'categories',
      itemIdArray[0] + '-' + itemIdArray[1],
      'items',
      itemId
    );
    const itemDoc = await getDoc(itemRef);
    const itemDocData = itemDoc.data();
    itemDocData && setCatalogueItemObj(itemDocData);
  };

  const getBrandsIdAndName = async (): Promise<string[][]> => {
    const querySnapshot = await getDocs(collection(db, 'brands'));
    const documents: string[][] = [];
    querySnapshot.forEach((doc) => {
      const docInfo = [];
      docInfo.push(doc.id);
      if (doc.data() && doc.data().name) {
        docInfo.push(doc.data().name);
      }
      documents.push(docInfo);
    });
    return documents;
  };

  const getCategoriesIdAndName = async (brandId: string): Promise<string[][]> => {
    const querySnapshot = await getDocs(collection(db, 'brands', brandId, 'categories'));
    const documents: string[][] = [];
    querySnapshot.forEach((doc) => {
      const docInfo = [];
      docInfo.push(doc.id);
      if (doc.data() && doc.data().name) {
        docInfo.push(doc.data().name);
      }
      documents.push(docInfo);
    });
    return documents;
  };

  const getItemsIdAndName = async (brandId: string, categoryId: string): Promise<string[][]> => {
    const querySnapshot = await getDocs(collection(db, 'brands', brandId, 'categories', categoryId, 'items'));
    let documents: string[][] = [];
    querySnapshot.forEach((doc) => {
      const docInfo = [doc.id];
      if (doc.data() && doc.data().name) {
        docInfo.push(doc.data().name);
      }
      documents = [...documents, docInfo];
    });
    return documents;
  };

  const getCatalogueItemName = async (itemId: string | undefined) => {
    if (itemId !== undefined) {
      const idArray = itemId.split('-');
      const docRef = doc(db, 'brands', idArray[0], 'categories', idArray[0] + '-' + idArray[1], 'items', itemId);
      if (docRef !== undefined) {
        const itemDoc = await getDoc(docRef);
        if (!itemDoc.exists()) {
          alert('No such document!');
          return '';
        }
        const data = itemDoc.data();
        return data.name;
      }
    }
  };

  const breadcrumbNav = (
    <nav aria-label='breadcrumb'>
      <ol className='breadcrumb flex p-2'>
        <li className='breadcrumb-item'>
          <Link to='/catalogue' className='text-gray-500 hover:text-gray-700'>
            All Brands
          </Link>
        </li>
        {catalogueBrandId && (
          <li className='breadcrumb-item'>
            <span className='text-gray-500'>&nbsp;»&nbsp;</span>
            <Link to={`/catalogue/${catalogueBrandId}`} className='text-gray-500 hover:text-gray-700'>
              {catalogueBrandName}
            </Link>
          </li>
        )}
        {catalogueItemId && (
          <li className='breadcrumb-item'>
            <span className='text-gray-500'>&nbsp;»&nbsp;</span>
            <span className='text-gray-500'>{catalogueItemName}</span>
          </li>
        )}
      </ol>
    </nav>
  );

  return (
    <div>
      <div>{breadcrumbNav}</div>
      <div className='flex flex-col items-center'>
        <div className='grid grid-cols-3 grid-rows-3 gap-4'>
          {!catalogueBrandId &&
            !catalogueItemId &&
            brands.map((brand, index) => (
              <Link key={brand[0]} to={`/catalogue/${brand[0]}`}>
                <div className='h-32 w-32 rounded-2xl bg-lime-100 flex items-center justify-center'>{brand[1]}</div>
              </Link>
            ))}
        </div>
        {catalogueBrandId && <div className='text-3xl'>{catalogueBrandName}</div>}
        {catalogueBrandId && catalogueBrandObj?.averageRating && (
          <div>
            <span>
              brand rating: <span className='font-heal text-2xl font-bold'>{catalogueBrandObj?.averageRating}</span>
            </span>
            <span>
              {' '}
              by <span className='font-heal font-bold'>{catalogueBrandObj?.numRatings}</span> people
            </span>
          </div>
        )}

        <div className='flex gap-1 mt-8'>
          {catalogueBrandId &&
            !catalogueItemId &&
            itemsOfBrand.length !== 0 &&
            categories.length !== 0 &&
            itemsOfBrand.map((itemsOfCategory, index) => (
              <div key={index}>
                <div className='font-bold'>{categories[index]?.[1]}</div>
                {itemsOfCategory.length !== 0 &&
                  itemsOfCategory.map((item) => (
                    <div key={item[0]}>
                      <Link to={`/catalogue/${catalogueBrandId}/${item[0]}`}>{item[1]}</Link>
                    </div>
                  ))}
              </div>
            ))}
        </div>
        {catalogueItemId && <div> item:{catalogueItemName}</div>}
        {catalogueItemId && catalogueItemObj?.averageRating && (
          <div>
            <span>
              item rating: <span className='font-heal text-2xl font-bold'>{catalogueItemObj?.averageRating}</span>
            </span>
            <span>
              {' '}
              by <span className='font-heal font-bold'>{catalogueItemObj?.numRatings}</span> people
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Catalogue;
