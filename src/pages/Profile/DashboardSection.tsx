/* eslint-disable no-prototype-builtins */
import React, { useState, useEffect } from 'react';
import CalendarHeatmapComponent from './CalendarHeatmapComponent';
import Badges from './Badges/Badges';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { addAllBrands } from '../../app/infoSlice';
import dbApi from '../../utils/dbApi';
import { ReactComponent as Streak } from '../../assets/Streak.svg';
import { ReactComponent as Store } from '../../assets/Store.svg';
import { ReactComponent as Expense } from '../../assets/Expense.svg';
import { db } from '../../services/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  QuerySnapshot,
  and,
  Timestamp,
} from 'firebase/firestore';
import { getStatisticsFromPosts, timestampToDate } from './helper';

interface AllPostsProps {
  profileUserId: string | undefined;
  currentUserId: string;
}

const DashboardSection: React.FC<AllPostsProps> = ({ profileUserId, currentUserId }) => {
  const dispatch = useAppDispatch();
  const allBrandsInfo = useAppSelector((state) => state.info.brands);
  const [priceStatistic, setPriceStatistic] = useState({ overall: 0, year: 0, month: 0, week: 0, day: 0 });
  const [drankBrands, setDrankBrands] = useState<Record<string, { brandName: string; times: number }>>();
  const [drankItems, setDrankItems] = useState<Record<string, { times: number }>>();
  const [streaks, setStreaks] = useState<{ current: number; longest: number }>({ current: 0, longest: 0 });
  const [numMonthBefore, setNumMonthBefore] = useState(6);
  const [profileUserPosts, setProfileUserPosts] = useState<any[]>([]);
  const [values, setValues] = useState<{ date: Date; count: number }[]>();

  useEffect(() => {
    if (!profileUserId) return;
    const fetchProfileUserPosts = async (profileUserId: string) => {
      const posts = await dbApi.getProfileUserPosts(profileUserId, currentUserId);
      setProfileUserPosts(posts.reverse());
    };
    fetchProfileUserPosts(profileUserId);
  }, [profileUserId]);

  useEffect(() => {
    if (profileUserPosts.length === 0) {
      return;
    }
    const { drankBrandsStatistic, drankItemsStatistic, drankDatesValues, priceStatistic, streaks } =
      getStatisticsFromPosts(profileUserPosts, allBrandsInfo);

    setDrankBrands(drankBrandsStatistic);
    setDrankItems(drankItemsStatistic);
    setValues(drankDatesValues);
    setPriceStatistic(priceStatistic);
    setStreaks(streaks);
  }, [profileUserPosts]);

  const getMostDrankBrand = () => {
    if (!drankBrands) return;
    const maxTimesBrandId = Object.keys(drankBrands).reduce((a, b) =>
      drankBrands[a].times > drankBrands[b].times ? a : b
    );

    return drankBrands[maxTimesBrandId].brandName;
  };

  return (
    <div className='flex w-full flex-col items-center gap-10'>
      <div className='grid w-full max-w-[900px] grid-cols-2 items-center items-stretch gap-x-5 gap-y-5'>
        <div className='col-span-2 ml-3 text-xl before:mr-2 before:content-["✦"]'>statistics</div>
        {getMostDrankBrand() && (
          <div className='col-span-2 grid grid-cols-[50px_1fr] items-center rounded-xl border-2 border-solid border-neutral-900 bg-neutral-100 px-10 py-5 shadow-[3px_3px_#171717] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[3px_6px_#171717]'>
            <Store className='row-span-2' />
            <div className='text-xl'>{getMostDrankBrand()}</div>
            <div className='text-neutral-500'>most frequently drank</div>
          </div>
        )}
        {Object.entries(streaks).map((streak) => (
          <div
            className='grid grid-cols-[50px_1fr] items-center rounded-xl border-2 border-solid border-neutral-900 bg-neutral-100 px-10 py-5 shadow-[3px_3px_#171717] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[3px_6px_#171717] sm:grid-cols-[38px_auto] sm:justify-evenly sm:px-3'
            key={streak[0]}
          >
            <Streak className='row-span-2' />
            <div className='text-xl sm:pl-2'>{streak[1]}</div>
            <div className='text-neutral-500 sm:pl-2'>{streak[0]} streak days</div>
          </div>
        ))}

        {getMostDrankBrand() && (
          <>
            <div className=' col-span-full row-start-4 flex gap-1 text-neutral-500 lg:pr-2'>
              <div
                className={`z-10 flex h-10 w-72 items-center justify-center rounded-t-xl border-x-2 border-t-2 border-neutral-900 border-b-neutral-100 bg-neutral-100 px-3 pt-1 sm:min-w-[148px] sm:px-1 sm:text-sm`}
              >
                drink-contributions
              </div>
              {[
                ['full year', 12],
                ['6 months', 6],
                ['3 months', 3],
              ].map((num, index) => (
                <button
                  className={`mt-2 h-8 w-36 rounded-t-3xl border-x-2 border-t-2 border-neutral-900 px-3 pt-1 text-sm transition-all duration-200 hover:mt-1 hover:h-9 ${
                    numMonthBefore === num[1] && 'bg-neutral-400 text-white'
                  }`}
                  onClick={() => setNumMonthBefore(num[1] as number)}
                  key={index}
                >
                  <span className='sm:hidden'>{num[0]}</span>
                  <span className='hidden sm:inline-block'>{num[1]}</span>
                </button>
              ))}
            </div>
            <div className='container col-span-2 -mt-[22px] max-w-[900px] rounded-xl rounded-tl-none border-2 border-solid border-neutral-900 bg-neutral-100 px-10 py-5 shadow-[3px_3px_#171717] transition-all transition-all duration-200 duration-200 sm:p-2'>
              <CalendarHeatmapComponent values={values || []} numMonthBefore={numMonthBefore} />
            </div>
          </>
        )}
      </div>

      <div className='grid w-full max-w-[900px] grid-cols-5 items-center gap-x-5 gap-y-5 sm:grid-cols-3'>
        <div className='col-span-full ml-3 text-xl before:mr-2 before:content-["✦"]'>expenses</div>
        {Object.entries(priceStatistic)
          .reverse()
          .map((expense) => (
            <div
              className='grid grid-cols-[50px_1fr] items-center rounded-xl border-2 border-solid border-neutral-900 bg-neutral-100 px-5 py-3 shadow-[3px_3px_#171717] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[3px_6px_#171717] lg:grid-cols-[40px_1fr] md:grid-cols-1 md:justify-items-center'
              key={expense[0]}
            >
              <Expense className='row-span-2 md:mb-3' />
              <div className='text-xl before:content-["$"]'>{expense[1]}</div>
              <div className='text-neutral-500'>{expense[0]}</div>
            </div>
          ))}
      </div>
      <div className='flex w-full max-w-[900px] flex-col items-start '>
        <div className='mb-3 ml-3 text-xl before:mr-2 before:content-["✦"]'>badges</div>
        <div
          className='grid w-full justify-center justify-items-center gap-8 rounded-xl border-2 border-neutral-900 bg-neutral-100 p-10 shadow-[3px_3px_#171717] sm:gap-5 sm:p-5'
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(6rem, 1fr))' }}
        >
          <Badges
            drankBrands={drankBrands}
            drankItems={drankItems}
            numPosts={profileUserPosts.length}
            streaks={streaks}
          />
        </div>
      </div>
      <div className='grid w-full max-w-[900px] grid-cols-4 items-stretch gap-x-5 gap-y-5 lg:grid-cols-3 sm:grid-cols-2'>
        <div className='col-span-full ml-3 text-xl before:mr-2 before:content-["✦"]'>drank brands</div>
        {drankBrands
          ? Object.entries(drankBrands).map((brand) =>
              brand[1].times !== 0 ? (
                <div
                  key={brand[0]}
                  className='relative flex flex-col items-center rounded-xl border-2 border-solid border-neutral-900 bg-neutral-50 px-5 py-2 shadow-[3px_3px_#171717] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[3px_6px_#171717]'
                >
                  <div className='flex h-3/4 items-center justify-center'>
                    <img src={allBrandsInfo[brand[0]]?.photoURL} alt='' className='w-20' />
                  </div>
                  <div className='mt-auto pt-3'>
                    <span className='text-sm sm:text-base'>{brand[1].brandName}</span>
                    <span className='text-sm text-neutral-600 sm:hidden'>&nbsp;x&nbsp;{brand[1].times}</span>
                  </div>
                </div>
              ) : (
                <div
                  key={brand[0]}
                  className='relative flex flex-col items-center rounded-xl border-2 border-solid border-neutral-300 bg-gray-50 px-5 py-2'
                >
                  <div className='flex h-3/4 items-center justify-center'>
                    <img src={allBrandsInfo[brand[0]]?.photoURL} alt='' className='w-20 opacity-30 grayscale' />
                  </div>
                  <div className='mt-auto pt-3 text-sm text-neutral-300'>{brand[1].brandName}</div>
                </div>
              )
            )
          : Object.entries(allBrandsInfo).map((brand) => (
              <div
                key={brand[1].name}
                className='relative flex flex-col items-center rounded-xl border-2 border-solid border-neutral-300 bg-gray-50 px-5 py-2'
              >
                <div className='flex h-3/4 items-center justify-center'>
                  <img src={brand[1].photoURL} alt='' className='w-20 opacity-30 grayscale' />
                </div>
                <div className='mt-auto pt-3 text-sm text-neutral-300'>{brand[1].name}</div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default DashboardSection;
