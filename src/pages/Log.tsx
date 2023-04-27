import { useParams } from 'react-router-dom';
// import { auth } from '../services/firebase';
// import { useState, useEffect } from 'react';
// import { useAppSelector, useAppDispatch } from '../app/hooks';
import PostsFeed from '../components/postsFeed/PostsFeed';

function Log() {
  const { logId } = useParams<{ logId: string }>();

  return (
    <main className='bg-boxes-diag relative min-h-[calc(100vh-64px)] bg-fixed p-10'>
      <PostsFeed currentPage='log' logId={logId} />
    </main>
  );
}

export default Log;
