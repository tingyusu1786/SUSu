import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../services/firebase';
import dbApi from '../../utils/dbApi';
import { doc, getDoc, collection, query, where, getDocs, orderBy, QuerySnapshot } from 'firebase/firestore';
import BrandCard from '../../components/BrandCard';
import { Brand } from '../../interfaces/interfaces';
import { ReactComponent as SmileyWink } from '../../images/SmileyWink.svg';

interface Props {
  brands: Brand[];
}

const AllCatalogue: React.FC<Props> = ({ brands }) => {
  return (
    <div className='w-full '>
      <h1 className='mb-10 text-center text-7xl selection:bg-green-400'>Discover peoples' favorites!</h1>
      <h2 className='mb-28 text-center text-3xl'>(almost) all chain hand-shake drink store in Taiwan listed</h2>
      {brands.length === 0 && <SmileyWink className='mx-auto my-10 animate-bounce' />}
      <div
        className='grid w-full grid-cols-6 gap-10 transition-all duration-200 xl2:grid-cols-4 lg:grid-cols-2 sm:grid-cols-1 sm:gap-y-14'
        // style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))' }}
      >
        {brands.map((brand, index) => (
          <BrandCard brand={brand} key={index} />
        ))}
      </div>
      <div className='mt-10 text-center text-3xl'>...and more to come!</div>
    </div>
  );
};

export default AllCatalogue;
