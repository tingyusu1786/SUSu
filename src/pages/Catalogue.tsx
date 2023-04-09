import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../services/firebase';
import dbApi from '../utils/dbApi';
import { doc, getDoc, collection, query, where, getDocs, orderBy, QuerySnapshot } from 'firebase/firestore';

function Catalogue() {
  const { catelogueBrandId } = useParams<{ catelogueBrandId: string }>();
  const { catelogueItemId } = useParams<{ catelogueItemId: string }>();
  const [catelogueBrandObj, setCatelogueBrandObj] = useState<any>();
  const [catelogueItemObj, setCatelogueItemObj] = useState<any>();
  const [catelogueBrandName, setCatelogueBrandName] = useState<string>();
  const [catelogueItemName, setCatelogueItemName] = useState<string>();
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
    // console.log("[brands, catelogueBrandId]");
    const currentBrand = brands?.find((brand) => brand[0] === catelogueBrandId);
    const currentBrandName = currentBrand && currentBrand[1];
    // console.log(currentBrandName);
    setCatelogueBrandName(currentBrandName);
    catelogueBrandId && getCatelogueBrandObj(catelogueBrandId);
  }, [brands, catelogueBrandId]);

  useEffect(() => {
    // console.log("[catelogueBrandName]");
    const fetchCategories = async () => {
      if (!catelogueBrandId) {
        return;
      }
      const categoryInfos = await getCategoriesIdAndName(catelogueBrandId);
      setCategories(categoryInfos);
      console.log("setCategories(categoryInfos);", categoryInfos)
    };
    catelogueBrandName && fetchCategories();
    setItemsOfBrand([]);
  }, [catelogueBrandName]);

  useEffect(() => {
    // console.log('[categories]');
    const fetchItems = async (categoryId: string) => {
      if (!catelogueBrandId) {
        return;
      }
      const itemInfos = await getItemsIdAndName(catelogueBrandId, categoryId);
      setItemsOfBrand((itemsOfBrand) => itemsOfBrand.concat([itemInfos]));
    };

    if (categories.length > 0) {
      categories.forEach((category) => {
        fetchItems(category[0]);
      });
    }
  }, [categories]);

  useEffect(() => {
    // console.log('[catelogueItemId]');
    const fetchCatalogueItemName = async () => {
      const itemName = await getCatalogueItemName(catelogueItemId);
      setCatelogueItemName(itemName);
    };
    if (catelogueItemId) {
      fetchCatalogueItemName();
      getCatelogueItemObj(catelogueItemId);
    }
  }, [catelogueItemId]);

  const getCatelogueBrandObj = async (brandId: string) => {
    const brandDocRef = doc(db, 'brands', brandId);
    const brandDoc = await dbApi.getDoc(brandDocRef);
    const brandocdata = brandDoc.data();
    brandocdata && setCatelogueBrandObj(brandocdata);
  };

  const getCatelogueItemObj = async (itemId: string) => {
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
    itemDocData && setCatelogueItemObj(itemDocData);
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
        {catelogueBrandId && (
          <li className='breadcrumb-item'>
            <span className='text-gray-500'>&nbsp;»&nbsp;</span>
            <Link to={`/catalogue/${catelogueBrandId}`} className='text-gray-500 hover:text-gray-700'>
              {catelogueBrandName}
            </Link>
          </li>
        )}
        {catelogueItemId && (
          <li className='breadcrumb-item'>
            <span className='text-gray-500'>&nbsp;»&nbsp;</span>
            <span className='text-gray-500'>{catelogueItemName}</span>
          </li>
        )}
      </ol>
    </nav>
  );

  return (
    <div>
      <div>{breadcrumbNav}</div>
      <div className='flex flex-col items-center'>
        <div className='flex flex-col flex-wrap gap-1'>
          {!catelogueBrandId &&
            !catelogueItemId &&
            brands.map((brand, index) => (
              <Link key={brand[0]} to={`/catalogue/${brand[0]}`}>
                {brand[1]}
              </Link>
            ))}
        </div>
        {catelogueBrandId && <div> brand:{catelogueBrandName}</div>}
        {catelogueBrandId && catelogueBrandObj?.averageRating && (
          <div>
            <span>brand rating: <span className='font-bold font-heal text-2xl'>{catelogueBrandObj?.averageRating}</span></span>
            <span> by <span className='font-bold font-heal'>{catelogueBrandObj?.numRatings}</span> people</span>
          </div>
        )}
        
        <div className='flex gap-1'>
          {catelogueBrandId &&
            !catelogueItemId &&
            itemsOfBrand.length !== 0 &&
            categories.length !== 0 &&
            itemsOfBrand.map((itemsOfCategory, index) => (
              <div key={index}>
                <div className='font-bold'>{categories[index]?.[1]}</div>
                {itemsOfCategory.length !== 0 &&
                  itemsOfCategory.map((item) => (
                    <div key={item[0]}>
                      <Link to={`/catalogue/${catelogueBrandId}/${item[0]}`}>{item[1]}</Link>
                    </div>
                  ))}
              </div>
            ))}
        </div>
        {catelogueItemId && <div> item:{catelogueItemName}</div>}
        {catelogueItemId && catelogueItemObj?.averageRating && (
          <div>
            <span>item rating: <span className='font-bold font-heal text-2xl'>{catelogueItemObj?.averageRating}</span></span>
            <span> by <span className='font-bold font-heal'>{catelogueItemObj?.numRatings}</span> people</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Catalogue;
