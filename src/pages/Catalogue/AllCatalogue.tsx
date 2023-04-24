import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../services/firebase';
import dbApi from '../../utils/dbApi';
import { doc, getDoc, collection, query, where, getDocs, orderBy, QuerySnapshot } from 'firebase/firestore';
import BrandCard from '../../components/BrandCard';
import { Brand } from '../../interfaces/interfaces';

interface Props {
  brands: Brand[];
}

const AllCatalogue: React.FC<Props> = ({ brands }) => {
  return (
    <div className='w-full '>
      <h1 className='mb-10 text-center text-7xl'>Discover peoples' favorites!</h1>
      <h2 className='mb-28 text-center text-3xl'>(almost) all chain hand-shake drink store in Taiwan listed</h2>
      <div className='grid w-full gap-10 ' style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))' }}>
        {brands.map((brand, index) => (
          <BrandCard brand={brand} key={index} />
        ))}
      </div>
      <div className='mt-10 text-center text-3xl'>...and more to come!</div>
    </div>
  );
};

export default AllCatalogue;