import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../services/firebase';
import dbApi from '../../utils/dbApi';
import { doc, getDoc, collection, query, where, getDocs, orderBy, QuerySnapshot } from 'firebase/firestore';

interface CatalogueProps {
  catalogueBrandId: string | undefined;
  catalogueItemId: string | undefined;
  catalogueBrandName: string | undefined;
  catalogueItemName: string | undefined;
  catalogueBrandObj: any;
  categories: string[];
  itemsOfBrand: any;
}

const BrandCatalogue: React.FC<CatalogueProps> = ({
  catalogueBrandId,
  catalogueItemId,
  catalogueBrandName,
  catalogueItemName,
  catalogueBrandObj,
  categories,
  itemsOfBrand,
}) => {
  return (
    <div>
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

      <div className='mt-8 flex gap-1'>
        {catalogueBrandId &&
          !catalogueItemId &&
          itemsOfBrand.length !== 0 &&
          categories.length !== 0 &&
          itemsOfBrand.map((itemsOfCategory: [], index: number) => (
            <div key={index}>
              <div className='font-bold'>{categories[index]?.[1]}</div>
              {itemsOfCategory.length !== 0 &&
                itemsOfCategory.map((item: any) => (
                  <div key={item[0]}>
                    <Link to={`/catalogue/${catalogueBrandId}/${item[0]}`}>{item[1]}</Link>
                  </div>
                ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default BrandCatalogue;
