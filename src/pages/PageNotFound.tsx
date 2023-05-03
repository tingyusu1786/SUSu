import { Link } from 'react-router-dom';

function PageNotFound() {
  return (
    <main className='bg-boxes relative min-h-[calc(100vh-64px)] bg-fixed px-10 py-20 text-center'>
      <div className='mb-6 bg-gradient-to-r text-7xl '>
        <span className='relative inline-block before:absolute before:-inset-1 before:mb-4 before:block before:skew-y-3 before:bg-gradient-to-r before:from-violet-500 before:to-fuchsia-500'>
          <span className='relative text-white'>404</span>
        </span>{' '}
        Page not found ☹
      </div>
      <div className='text-3xl'>
        Got lost?{' '}
        <Link to='/drinkipedia' className='decoration-2 underline-offset-4 hover:underline'>
          Go to drinkipedia
        </Link>{' '}
        to find your way
      </div>
    </main>
  );
}

export default PageNotFound;
