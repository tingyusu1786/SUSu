import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';

interface BreadcrumProps {
  catalogueBrandId: string | undefined;
  catalogueItemId: string | undefined;
  catalogueBrandName: string | undefined;
  catalogueItemName: string | undefined;
}

const BreadcrumbNav: React.FC<BreadcrumProps> = ({
  catalogueBrandId,
  catalogueItemId,
  catalogueBrandName,
  catalogueItemName,
}) => {
  return (
    <nav className=''>
      <ol className='flex sm:flex-wrap'>
        <li className=''>
          <Link to='/drinkipedia' className='text-neutral-500 hover:text-neutral-700'>
            All Brands
          </Link>
        </li>
        {catalogueBrandId && (
          <li className=''>
            <ArrowRight size={22} color='#737373' weight='regular' className='mx-1 -mt-1 inline-block' />
            <Link to={`/drinkipedia/${catalogueBrandId}`} className='text-neutral-500 hover:text-neutral-700'>
              {catalogueBrandName}
            </Link>
          </li>
        )}
        {catalogueItemId && (
          <li className=''>
            <ArrowRight size={22} color='#737373' weight='regular' className='mx-1 -mt-1 inline-block' />
            <span className='text-neutral-500'>{catalogueItemName}</span>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;
