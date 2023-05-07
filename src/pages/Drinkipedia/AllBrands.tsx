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
      <h1 className='pageTitle mb-10 md:mt-2 sm:my-5 '>Discover peoples' favorites!</h1>
      <h2 className='mb-28 text-center text-3xl transition-all duration-1000 sm:mb-20 sm:text-xl'>
        (almost) all chain hand-shake drink store in Taiwan listed
      </h2>
      {brands.length === 0 && <SmileyWink className='mx-auto my-10 animate-bounce' />}
      <div
        className='grid w-full grid-cols-6 gap-10 px-12 transition-all duration-200 xl2:grid-cols-4 xl2:px-0 lg:grid-cols-2 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-8'
        // style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))' }}
      >
        {brands.map((brand, index) => (
          <BrandCard brand={brand} key={index} />
        ))}
      </div>
      {brands.length !== 0 && <div className='mt-10 text-center text-3xl sm:text-xl'>...and more to come!</div>}
    </div>
  );
};

export default AllCatalogue;
