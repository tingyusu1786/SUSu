import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../services/firebase';
import dbApi from '../../utils/dbApi';
import PostsFeed from '../../components/postsFeed/PostsFeed';
import { doc, getDoc, collection, query, where, getDocs, orderBy, QuerySnapshot } from 'firebase/firestore';

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
    <div>
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
      {Object.entries(catalogueItemObj.price).map((p) => (
        <div key={p[0]}>
          <span>{p[0]}</span>
          <span>: $</span>
          <span>{p[1] as number}</span>
        </div>
      ))}
      <div className='my-5 flex w-full items-baseline justify-around gap-3 px-6'>
        <div className='grow border-b-4 border-solid border-neutral-900'></div>
        <span className=''>RELATED LOGS</span>
        <div className='grow border-b-4 border-solid border-neutral-900'></div>
      </div>
      <PostsFeed currentPage='item' catalogueItemId={catalogueItemId} />
    </div>
  );
};

export default ItemCatalogue;
