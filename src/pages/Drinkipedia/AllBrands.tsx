import React from 'react';
import BrandCard from './BrandCard';
import { useAppSelector } from '../../redux/hooks';

const AllCatalogue: React.FC = () => {
  const allBrandsInfo = useAppSelector((state) => state.info.brands);
  return (
    <div className='w-full '>
      <h1 className='pageTitle mb-10 md:mt-2 sm:my-5 '>
        Discover peoples&rsquo; favorites!
      </h1>
      <h2 className='mb-28 text-center text-3xl transition-all duration-1000 sm:mb-20 sm:text-xl'>
        (almost) all chain hand-shake drink store in Taiwan listed
      </h2>
      <div className='grid w-full grid-cols-6 gap-10 px-12 transition-all duration-200 xl2:grid-cols-4 xl2:px-0 lg:grid-cols-2 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-8'>
        {Object.entries(allBrandsInfo).map((brand) => (
          <BrandCard key={brand[0]} brand={brand[1]} />
        ))}
      </div>
      <div className='mt-10 text-center text-3xl sm:text-xl'>
        ...and more to come!
      </div>
    </div>
  );
};

export default AllCatalogue;
