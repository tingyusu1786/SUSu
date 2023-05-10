import { Link } from 'react-router-dom';

function PageNotFound() {
  return (
    <main className='bg-boxes relative min-h-[calc(100vh-64px)] bg-fixed px-10 py-20 text-center'>
      <div className='mb-6 bg-gradient-to-r text-7xl '>
        <span className='relative inline-block before:absolute before:-inset-1 before:mb-4 before:block before:skew-y-3 before:bg-gradient-to-br before:from-violet-500 before:to-red-500'>
          <span className='relative text-white'>404</span>
        </span>
        <span> Page not found ☹</span>
      </div>
      <div className='text-3xl'>
        <span>Got lost? </span>
        <Link to='/drinkipedia' className='decoration-2 underline-offset-4 hover:underline'>
          Go to drinkipedia
        </Link>
        <span> to find your way</span>
      </div>
    </main>
  );
}

export default PageNotFound;
