import React from 'react';
import { Link } from 'react-router-dom';
import PostsFeed from '../../components/postsFeed/PostsFeed';
import { StarIcon, BuildingStorefrontIcon } from '@heroicons/react/24/solid';

interface CatalogueProps {
  catalogueBrandId: string | undefined;
  catalogueItemId?: string | undefined;
  catalogueBrandName?: string | undefined;
  catalogueItemName?: string | undefined;
  catalogueBrandObj: any;
  categories?: string[][];
  itemsOfBrand?: any;
}

const BrandCatalogue: React.FC<CatalogueProps> = ({
  catalogueBrandObj,
  categories,
  itemsOfBrand,
  catalogueBrandId,
}) => {
  return (
    <div className='mx-auto mt-5 max-w-[960px] '>
      <div className='flex items-center gap-5'>
        <h1 className='inline-block text-6xl selection:bg-green-400'>{catalogueBrandObj?.name}</h1>
        <img src={catalogueBrandObj?.photoURL} alt='' className='-mt-3 inline-block h-20' />
      </div>
      <div className='mb-5 flex items-center justify-start gap-1 text-lg'>
        <BuildingStorefrontIcon className='mb-1 inline h-5 w-5 text-sky-400' />
        <span className='mr-5'>{catalogueBrandObj?.numStore || '?'}</span>
        <StarIcon className='mb-1 inline h-5 w-5 text-amber-400' />
        <span>{catalogueBrandObj?.averageRating || '-'}</span>
        <span>({catalogueBrandObj?.numRatings || 0})</span>
      </div>
      <div className='flex items-center justify-start gap-1 text-lg'></div>
      <div className='relative before:absolute before:-left-3 before:-top-3 before:font-heal before:text-5xl before:opacity-20 before:content-[open-quote]  '>
        {catalogueBrandObj?.story}
      </div>

      <div className='mt-8 flex flex-col gap-10'>
        {itemsOfBrand.length !== 0 &&
          categories &&
          categories.length !== 0 &&
          itemsOfBrand.map((itemsOfCategory: [], index: number) => (
            <div key={index} className='flex justify-start gap-3'>
              <div
                className='self-start rounded-md border-2 border-solid border-neutral-900 bg-green-700 pb-5 pl-2 pr-3 pt-6 text-xl tracking-[10px] text-white'
                style={{ writingMode: 'vertical-lr' }}
              >
                {categories[index]?.[1]}
              </div>
              <div className='flex flex-wrap content-start gap-3'>
                {itemsOfCategory.length !== 0 &&
                  itemsOfCategory.map((item: any) => (
                    <Link to={`/drinkipedia/${catalogueBrandId}/${item[0]}`}>
                      <div
                        key={item[0]}
                        className='flex h-16 min-w-min items-center justify-center rounded-md border-2 border-solid border-neutral-900 bg-gray-100 px-3 shadow-[4px_4px_#171717] transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_8px_#171717]'
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
      <PostsFeed currentPage='brand' catalogueBrandId={catalogueBrandId} />
    </div>
  );
};

export default BrandCatalogue;
