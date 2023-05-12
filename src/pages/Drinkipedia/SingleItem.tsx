import React from 'react';
import PostsFeed from '../../components/PostsFeed/';
import { Star } from '@phosphor-icons/react';
import { Item }from '../../interfaces/interfaces';

interface CatalogueProps {
  catalogueItemId: string | undefined;
  catalogueItemName: string | undefined;
  catalogueItemObj: Item;
}

const ItemCatalogue: React.FC<CatalogueProps> = ({ catalogueItemId, catalogueItemName, catalogueItemObj }) => {
  return (
    <div className='mx-auto mt-5 max-w-[960px]'>
      <div className='flex items-baseline gap-5 sm:flex-col sm:gap-0'>
        <h1 className='mt-1 mb-3 inline-block text-6xl selection:bg-green-400 sm:text-5xl'>{catalogueItemName}</h1>
        <div className='mb-4 inline-block flex items-center justify-start gap-6 text-lg'>
          {catalogueItemObj?.price &&
            Object.entries(catalogueItemObj?.price).map((p) => (
              <div key={p[0]} className='inline-block flex items-center justify-start gap-1'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-solid border-neutral-900 bg-green-400 pt-1 '>
                  {p[0]}
                </div>
                <span className='before:content-["$"]'>{p[1] as number}</span>
              </div>
            ))}
        </div>
      </div>
      <div className='mb-5 flex items-center justify-start gap-1 text-lg'>
        <Star size={20} color='#fbbf24' weight='fill' className='mb-1 inline' />
        <span>{catalogueItemObj?.averageRating || '-'}</span>
        <span>({catalogueItemObj?.numRatings || 0})</span>
      </div>
      <div className='mt-5 flex w-full items-baseline justify-around gap-3 px-6'>
        <div className='grow border-b-4 border-solid border-neutral-900'></div>
        <span className=''>RELATED LOGS</span>
        <div className='grow border-b-4 border-solid border-neutral-900'></div>
      </div>
      <div className='mb-5 text-center text-sm'>(private logs may not be shown)</div>
      <PostsFeed currentPage='item' catalogueItemId={catalogueItemId} />
    </div>
  );
};

export default ItemCatalogue;
