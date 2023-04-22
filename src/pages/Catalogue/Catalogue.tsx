import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../services/firebase';
import dbApi from '../../utils/dbApi';
import { doc, getDoc, collection, query, where, getDocs, orderBy, QuerySnapshot, setDoc } from 'firebase/firestore';
import AllCatalogue from './AllCatalogue';
import BrandCatalogue from './BrandCatalogue';
import ItemCatalogue from './ItemCatalogue';
import PostsFeed from '../../components/postsFeed/PostsFeed';
import BrandCard from '../../components/BrandCard';
import { Brand } from '../../interfaces/interfaces';

interface BreadcrumProps {
  catalogueBrandId: string | undefined;
  catalogueItemId: string | undefined;
  catalogueBrandName: string | undefined;
  catalogueItemName: string | undefined;
}

const BreadcrumbNav: React.FC<BreadcrumProps> = ({
  catalogueBrandId,
  catalogueItemId,
  catalogueBrandName,
  catalogueItemName,
}) => {
  return (
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
};

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

  return (
    <main
      className='flex min-h-[calc(100vh-64px)] flex-col items-center bg-fixed px-10 px-36 py-10 sm:px-0'
      style={{
        backgroundImage:
          'linear-gradient(#BEEFCE 1px, transparent 1px), linear-gradient(to right, #BEEFCE 1px, #F6F6F9 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <h1 className='mb-10 text-center text-7xl'>Discover peoples' favorites!</h1>
      <BreadcrumbNav
        catalogueBrandId={catalogueBrandId}
        catalogueItemId={catalogueItemId}
        catalogueBrandName={catalogueBrandName}
        catalogueItemName={catalogueItemName}
      />
      <div className='flex w-full flex-col items-center'>
        {!catalogueBrandId && !catalogueItemId && (
          <AllCatalogue brands={brands} catalogueBrandId={catalogueBrandId} catalogueItemId={catalogueItemId} />
        )}
        {catalogueBrandId && !catalogueItemId && <BrandCatalogue />}
        {catalogueBrandId && catalogueItemId && <ItemCatalogue />}
        {catalogueBrandId && <div className='text-3xl'>{catalogueBrandName}</div>}
        {catalogueBrandId && catalogueBrandObj?.averageRating && (
          <div>
            <span>
              brand rating: <span className='font-heal text-2xl font-bold'>{catalogueBrandObj?.averageRating}</span>
            </span>
            <span>
              by <span className='font-heal font-bold'>{catalogueBrandObj?.numRatings}</span> people
            </span>
          </div>
        )}

        <div className='mt-8 flex gap-1'>
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
          {catalogueBrandId && !catalogueItemId && (
            <PostsFeed currentPage='brand' catalogueBrandId={catalogueBrandId} />
          )}
        </div>
        {catalogueItemId && <div> item:{catalogueItemName}</div>}
        {catalogueItemId && catalogueItemObj?.averageRating && (
          <div>
            <span>
              item rating: <span className='font-heal text-2xl font-bold'>{catalogueItemObj?.averageRating}</span>
            </span>
            <span>
              by <span className='font-heal font-bold'>{catalogueItemObj?.numRatings}</span> people
            </span>
          </div>
        )}
        <div>
          {catalogueItemObj &&
            Object.entries(catalogueItemObj.price).map((p) => (
              <div key={p[0]}>
                <span>{p[0]}</span>
                <span>: $</span>
                <span>{p[1] as number}</span>
              </div>
            ))}
        </div>
        {catalogueItemId && <PostsFeed currentPage='item' catalogueItemId={catalogueItemId} />}
      </div>
    </main>
  );
}

export default Catalogue;
