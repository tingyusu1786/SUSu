import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import dbApi from '../../utils/dbApi';
import AllBrands from './AllBrands';
import SingleBrand from './SingleBrand';
import SingleItem from './SingleItem';
import BreadcrumbNav from './BreadcrumbNav';
import { Brand } from '../../interfaces/interfaces';

//todo: [catalogueBrandName, setCatalogueBrandName] 從catalogueBrandObj拿？
//todo: [brands, setBrands] 從infoSlice拿

function Catalogue() {
  const { catalogueBrandId } = useParams<{ catalogueBrandId: string }>();
  const { catalogueItemId } = useParams<{ catalogueItemId: string }>();
  const [catalogueBrandObj, setCatalogueBrandObj] = useState<any>();
  const [catalogueItemObj, setCatalogueItemObj] = useState<any>();
  const [catalogueBrandName, setCatalogueBrandName] = useState<string>();
  const [catalogueItemName, setCatalogueItemName] = useState<string>();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<string[][]>([]);
  const [itemsOfBrand, setItemsOfBrand] = useState<string[][][]>([]);

  useEffect(() => {
    const fetchBrands = async () => {
      const brandInfos = await getBrands();
      setBrands(brandInfos);
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const currentBrand = brands?.find((brand) => brand.brandId === catalogueBrandId);
    const currentBrandName = currentBrand && currentBrand.name;
    setCatalogueBrandName(currentBrandName);
    catalogueBrandId && getCatalogueBrandObj(catalogueBrandId);
  }, [brands, catalogueBrandId]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!catalogueBrandId) {
        return;
      }
      const categoryInfos = await getCategoriesIdAndName(catalogueBrandId);
      setCategories(categoryInfos);
    };
    catalogueBrandName && fetchCategories();
    setItemsOfBrand([]);
  }, [catalogueBrandName]);

  useEffect(() => {
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
    setCatalogueItemName(undefined); // to clear out the last state
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

  const getBrands = async (): Promise<Brand[]> => {
    const querySnapshot = await getDocs(collection(db, 'brands'));
    const documents: Brand[] = [];
    querySnapshot.forEach((doc) => {
      const newDoc = { ...doc.data(), brandId: doc.id };
      documents.push(newDoc as Brand);
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

  const shouldRenderAll = !catalogueBrandId && !catalogueItemId;
  const shouldRenderSingleBrand = catalogueBrandId && !catalogueItemId;
  const shouldRenderSingleItem = catalogueBrandId && catalogueItemId;

  return (
    <main className='bg-boxes relative min-h-[calc(100vh-64px)] bg-fixed p-10 sm:p-5'>
      <BreadcrumbNav
        catalogueBrandId={catalogueBrandId}
        catalogueItemId={catalogueItemId}
        catalogueBrandName={catalogueBrandName}
        catalogueItemName={catalogueItemName}
      />
      {shouldRenderAll && <AllBrands brands={brands} />}
      {shouldRenderSingleBrand && (
        <SingleBrand
          catalogueBrandObj={catalogueBrandObj}
          categories={categories}
          itemsOfBrand={itemsOfBrand}
          catalogueBrandId={catalogueBrandId}
        />
      )}
      {shouldRenderSingleItem && (
        <SingleItem
          catalogueBrandId={catalogueBrandId}
          catalogueItemId={catalogueItemId}
          catalogueItemName={catalogueItemName}
          catalogueItemObj={catalogueItemObj}
        />
      )}
    </main>
  );
}

export default Catalogue;
