import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../services/firebase';
import dbApi from '../../utils/dbApi';
import PostsFeed from '../../components/postsFeed/PostsFeed';
import { doc, getDoc, collection, query, where, getDocs, orderBy, QuerySnapshot } from 'firebase/firestore';
import { StarIcon } from '@heroicons/react/24/solid';

interface CatalogueProps {
  catalogueBrandId: string | undefined;
  catalogueItemId: string | undefined;
  catalogueItemObj: any;
  catalogueBrandName?: string | undefined;
  catalogueItemName: string | undefined;
  categories?: string[][];
  itemsOfBrand?: any;
}

const ItemCatalogue: React.FC<CatalogueProps> = ({ catalogueItemId, catalogueItemObj, catalogueItemName }) => {
  return (
    <div className='mx-auto mt-5 max-w-[960px]'>
      <div className='flex items-baseline gap-5'>
        <h1 className='mb-3 inline-block text-6xl'>{catalogueItemName}</h1>
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
        <StarIcon className='mb-1 inline h-5 w-5 text-amber-400' />
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
