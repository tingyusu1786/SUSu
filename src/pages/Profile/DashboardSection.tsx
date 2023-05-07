import React, { useState, useEffect } from 'react';
import CalendarHeatmapComponent from './CalendarHeatmapComponent';
import Badges from './Badges';
import { Timestamp } from 'firebase/firestore';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { addAllBrands } from '../../app/infoSlice';
import dbApi from '../../utils/dbApi';
import { ReactComponent as Streak } from '../../images/Streak.svg';
import { ReactComponent as Store } from '../../images/Store.svg';
import { ReactComponent as Expense } from '../../images/Expense.svg';

interface AllPostsProps {
  profileUserPosts: any[];
  profileUserId: string | undefined;
}

interface PriceStatistic {
  overall: number;
  year: number;
  month: number;
  week: number;
  day: number;
  [key: string]: number; // add index signature
}

const DashboardSection: React.FC<AllPostsProps> = ({ profileUserPosts, profileUserId }) => {
  const dispatch = useAppDispatch();
  const allBrandsInfo = useAppSelector((state) => state.info.brands);
  const [priceStatistic, setPriceStatistic] = useState({ overall: 0, year: 0, month: 0, week: 0, day: 0 });
  const [drankBrands, setDrankBrands] = useState<Record<string, { brandName: string; times: number }>>();
  const [drankItems, setDrankItems] = useState<Record<string, { times: number }>>();
  const [streaks, setStreaks] = useState<{ current: number; longest: number }>({ current: 0, longest: 0 });
  const [numMonthBefore, setNumMonthBefore] = useState(6);

  // for heatmap
  const [values, setValues] = useState<{ date: Date; count: number }[]>();

  useEffect(() => {
    if (Object.keys(allBrandsInfo).length > 0) return;
    fetchAllBrandsInfo();
  }, []);

  const reversedProfileUserPosts = profileUserPosts.reverse();

  useEffect(() => {
    if (profileUserPosts.length === 0) {
      return;
    }
    const { drankBrandsStatistic, drankItemsStatistic, drankDatesValues, priceStatistic, streaks, prevDate } =
      reversedProfileUserPosts.reduce(
        (accumulator, post) => {
          // drank brands
          const { drankBrandsStatistic } = accumulator;
          drankBrandsStatistic[post.brandId]
            ? (drankBrandsStatistic[post.brandId].times = drankBrandsStatistic[post.brandId].times + 1)
            : (drankBrandsStatistic[post.brandId] = { times: 1, brandName: post.brandName });

          // drank items
          const { drankItemsStatistic } = accumulator;
          drankItemsStatistic[post.itemId]
            ? (drankItemsStatistic[post.itemId].times = drankItemsStatistic[post.itemId].times + 1)
            : (drankItemsStatistic[post.itemId] = { times: 1 });

          // drank dates
          const { drankDatesValues } = accumulator;
          const dateString = timestampToDate(post.timeCreated);
          const newDate = new Date(dateString);
          const index = drankDatesValues.findIndex((element: any) => element.date.getTime() === newDate.getTime());
          if (index === -1) {
            drankDatesValues.push({ date: newDate, count: 1 });
          } else {
            drankDatesValues[index].count += 1;
          }

          // streaks
          const { streaks } = accumulator;
          let { prevDate } = accumulator;
          const currentDate = new Date(dateString);

          if (prevDate.getTime() !== currentDate.getTime()) {
            // console.log(currentDate);
            const areConsecutive = currentDate.getTime() - prevDate.getTime() === 86400000;
            if (areConsecutive) {
              streaks.current += 1;
            } else {
              streaks.current = 1;
            }
            if (streaks.current > streaks.longest) {
              streaks.longest = streaks.current;
            }
            accumulator.prevDate = currentDate;
          }
          // console.log('prevDate', prevDate, 'currentDate', currentDate, 'streak', streaks);

          // price statistic
          const { priceStatistic } = accumulator;
          if (post.price) {
            const currentDate = new Date();
            const intervals = [
              { label: 'year', value: currentDate.getFullYear() - 1 },
              { label: 'month', value: currentDate.getMonth() - 1 },
              { label: 'week', value: currentDate.getDate() - 7 },
              { label: 'day', value: currentDate.getDate() - 1 },
            ];
            intervals.forEach(({ label, value }) => {
              const startDate = new Date();
              switch (label) {
                case 'year':
                  startDate.setFullYear(value);
                  break;
                case 'month':
                  startDate.setMonth(value);
                  break;
                case 'week':
                  startDate.setDate(value);
                  break;
                case 'day':
                  startDate.setDate(value);
                  break;
              }
              const postDate = new Date(post.timeCreated.seconds * 1000);
              if (postDate >= startDate && postDate <= currentDate) {
                priceStatistic[label] += Number(post.price);
              }
            });
            priceStatistic.overall += Number(post.price);
          }

          return accumulator;
        },
        {
          drankBrandsStatistic: {},
          drankItemsStatistic: {},
          drankDatesValues: [],
          priceStatistic: { overall: 0, year: 0, month: 0, week: 0, day: 0 },
          streaks: { current: 0, longest: 0 },
          prevDate: new Date('1900/01/01'),
        }
      );

    const oneDayBeforeToday = new Date();
    oneDayBeforeToday.setDate(oneDayBeforeToday.getDate() - 1);
    oneDayBeforeToday.setHours(0, 0, 0, 0);

    if (prevDate.getTime() < oneDayBeforeToday.getTime()) {
      // The given date is earlier than or equal to one day before today 00:00 AM
      streaks.current = 0;
    }

    // Add missing brands to drankBrandsStatistic
    for (const key in allBrandsInfo) {
      if (allBrandsInfo.hasOwnProperty(key) && !drankBrandsStatistic.hasOwnProperty(key)) {
        drankBrandsStatistic[key] = { brandName: allBrandsInfo[key].name, times: 0 };
      }
    }

    setDrankBrands(drankBrandsStatistic);
    setDrankItems(drankItemsStatistic);
    setValues(drankDatesValues);
    setPriceStatistic(priceStatistic);
    setStreaks(streaks);
  }, [profileUserPosts, allBrandsInfo]);

  const fetchAllBrandsInfo = async () => {
    const allBrands = await dbApi.getAllBrandsInfo();
    dispatch(addAllBrands({ allBrands }));
  };

  function timestampToDate(timestamp: Timestamp) {
    if (typeof timestamp === 'number') {
      timestamp = Timestamp.fromMillis(timestamp);
    }
    const dateObj = timestamp.toDate();
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  const getMostDrankBrand = () => {
    if (!drankBrands) return;
    const maxTimesBrandName = Object.keys(drankBrands).reduce((a, b) =>
      drankBrands[a].times > drankBrands[b].times ? a : b
    );

    return { name: drankBrands[maxTimesBrandName].brandName, times: drankBrands[maxTimesBrandName].times };
  };

  return (
    <div className='flex w-full flex-col items-center gap-10'>
      <div className='grid w-full max-w-[900px] grid-cols-2 items-center items-stretch gap-x-5 gap-y-5'>
        <div className='col-span-2 ml-3 text-xl before:mr-2 before:content-["✦"]'>statistics</div>
        {getMostDrankBrand() && (
          <div className='col-span-2 grid grid-cols-[50px_1fr] items-center rounded-xl border-2 border-solid border-neutral-900 bg-neutral-100 px-10 py-5 shadow-[3px_3px_#171717] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[3px_6px_#171717]'>
            <Store className='row-span-2' />
            <div className='text-xl'>{getMostDrankBrand()?.name}</div>
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
          ? Object.entries(drankBrands).map((brand, index) =>
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
          : Object.entries(allBrandsInfo).map((brand, index) => (
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
