import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { useAppSelector } from '../../app/hooks';

interface BreadcrumProps {
  pageBrandId: string | undefined;
  pageItemId: string | undefined;
  catalogueItemName: string | undefined;
}

const BreadcrumbNav: React.FC<BreadcrumProps> = ({
  pageBrandId,
  pageItemId,
  catalogueItemName,
}) => {
  const allBrandsInfo = useAppSelector((state) => state.info.brands);
  return (
    <nav>
      <ol className='flex sm:flex-wrap'>
        <li>
          <Link
            to='/drinkipedia'
            className='text-neutral-500 hover:text-neutral-700'
          >
            All Brands
          </Link>
        </li>
        {pageBrandId && (
          <li>
            <ArrowRight
              size={22}
              color='#737373'
              weight='regular'
              className='mx-1 -mt-1 inline-block'
            />
            <Link
              to={`/drinkipedia/${pageBrandId}`}
              className='text-neutral-500 hover:text-neutral-700'
            >
              {allBrandsInfo[pageBrandId]?.name || 'oops'}
            </Link>
          </li>
        )}
        {pageItemId && (
          <li>
            <ArrowRight
              size={22}
              color='#737373'
              weight='regular'
              className='mx-1 -mt-1 inline-block'
            />
            <span className='text-neutral-500'>{catalogueItemName}</span>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;
