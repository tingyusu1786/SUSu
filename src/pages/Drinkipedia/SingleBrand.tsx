import React from 'react';
import { Link } from 'react-router-dom';
import PostsFeed from '../../components/PostsFeed/';
import { Star, Storefront } from '@phosphor-icons/react';
import { useAppSelector } from '../../app/hooks';

interface CatalogueProps {
  pageBrandId: string;
  categories: string[][];
  itemsOfBrand: string[][][];
}

const BrandCatalogue: React.FC<CatalogueProps> = ({ pageBrandId, categories, itemsOfBrand }) => {
  const allBrandsInfo = useAppSelector((state) => state.info.brands);
  if (!allBrandsInfo[pageBrandId]) {
    return <div className='mx-auto mt-5 max-w-[960px] text-center text-3xl'>brand not found ☹</div>;
  }
  return (
    <div className='mx-auto mt-5 max-w-[960px] '>
      <div className='flex items-center gap-5'>
        <h1 className='inline-block text-6xl selection:bg-green-400 sm:text-5xl'>{allBrandsInfo[pageBrandId].name}</h1>
        <img src={allBrandsInfo[pageBrandId].photoURL} alt='' className='-mt-3 inline-block h-20' />
      </div>
      <div className='mb-5 flex items-center justify-start gap-1 text-lg'>
        <Storefront size={20} color='#38bdf8' weight='bold' className='mb-1 inline' />
        <span className='mr-5'>{allBrandsInfo[pageBrandId].numStore || '?'}</span>
        <Star size={20} color='#fbbf24' weight='fill' className='mb-1 inline' />
        <span>{allBrandsInfo[pageBrandId].averageRating || '-'}</span>
        <span>({allBrandsInfo[pageBrandId].numRatings || 0})</span>
      </div>
      <div className='flex items-center justify-start gap-1 text-lg'></div>
      <div className='before:font-heal relative before:absolute before:-left-3 before:-top-3 before:text-5xl before:opacity-20 before:content-[open-quote]  '>
        {allBrandsInfo[pageBrandId].story}
      </div>

      <div className='mt-8 flex flex-col gap-10'>
        {itemsOfBrand.length !== 0 &&
          categories &&
          categories.length !== 0 &&
          itemsOfBrand.map((itemsOfCategory, index: number) => (
            <div key={index} className='flex justify-start gap-3 sm:flex-col'>
              <div
                className='self-start rounded-md border-2 border-solid border-neutral-900 bg-green-700 pb-5 pl-2 pr-3 pt-6 text-xl tracking-[10px] text-white sm:hidden'
                style={{ writingMode: 'vertical-lr' }}
              >
                {categories[index]?.[1]}
              </div>
              <div className=' hidden h-12 items-center justify-start self-start rounded-md border-2 border-solid border-neutral-900 bg-green-700 px-3  tracking-widest text-white sm:flex'>
                {categories[index]?.[1]}
              </div>
              <div className='flex flex-wrap content-start gap-3'>
                {itemsOfCategory.length !== 0 &&
                  itemsOfCategory.map((item: string[]) => (
                    <Link to={`/drinkipedia/${allBrandsInfo[pageBrandId].brandId}/${item[0]}`} key={item[0]}>
                      <div
                        key={item[0]}
                        className='flex h-16 min-w-min items-center justify-center rounded-md border-2 border-solid border-neutral-900 bg-gray-100 px-3 shadow-[4px_4px_#171717] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_8px_#171717] sm:h-12'
                      >
                        {item[1]}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
      </div>
      <div className='mt-5 flex w-full items-baseline justify-around gap-3 px-6'>
        <div className='grow border-b-4 border-solid border-neutral-900'></div>
        <span className=''>RELATED LOGS</span>
        <div className='grow border-b-4 border-solid border-neutral-900'></div>
      </div>
      <div className='mb-5 text-center text-sm'>(private logs may not be shown)</div>
      <PostsFeed currentPage='brand' pageBrandId={allBrandsInfo[pageBrandId].brandId} />
    </div>
  );
};

export default BrandCatalogue;
