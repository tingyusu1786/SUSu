import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { Link } from 'react-router-dom';
import dbApi from '../utils/dbApi';
import { Brand } from '../interfaces/interfaces';
import { StarIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/solid';

interface BrandProps {
  brand: Brand;
}

//border-2 border-solid border-neutral-900 bg-[#F5F3EA]

const BrandCard: React.FC<BrandProps> = ({ brand }) => {
  return (
    <div className='group relative h-56 rounded-xl rounded-tl-[60px] border-2 border-solid border-neutral-900 bg-gray-100 shadow-[4px_4px_#171717] even:-translate-y-1/4 '>
      <img
        src={brand.photoURL}
        alt=''
        className='absolute left-1/2 top-1/3 w-2/5 -translate-x-1/2 -translate-y-1/2 drop-shadow-md'
      />
      <div className='absolute bottom-2 left-1/2 flex w-full -translate-x-1/2 flex-col justify-items-center text-center text-xl'>
        <div>{brand.name}</div>

        <div className=' flex w-full items-center justify-center gap-1 text-sm'>
          <StarIcon className='mb-1 inline h-5 w-5 text-amber-400' />
          <span>{brand.averageRating || '-'}</span>
          <span>({brand.numRatings || 0})</span>
        </div>
      </div>
      <Link to={`/catalogue/${brand.brandId}`} className=''>
        <ChevronDoubleRightIcon className='absolute right-5 top-3 hidden w-6 animate-arrow transition-all duration-150 group-hover:block' />
      </Link>
    </div>
  );
};

export default BrandCard;
