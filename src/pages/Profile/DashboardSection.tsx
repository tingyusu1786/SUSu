import React, { useState, useEffect } from 'react';
import CalendarHeatmapComponent from './CalendarHeatmapComponent';
import Badges from './Badges';
import { Timestamp } from 'firebase/firestore';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { addAllBrands } from '../../app/infoSlice';
import dbApi from '../../utils/dbApi';

interface AllPostsProps {
  profileUserPosts: any[];
}

interface PriceStatistic {
  overall: number;
  year: number;
  month: number;
  week: number;
  day: number;
  [key: string]: number; // add index signature
}

const DashboardSection: React.FC<AllPostsProps> = ({ profileUserPosts }) => {
  const dispatch = useAppDispatch();
  const allBrandsInfo = useAppSelector((state) => state.info.brands);
  const [priceStatistic, setPriceStatistic] = useState({ overall: 0, year: 0, month: 0, week: 0, day: 0 });
  const [drankBrands, setDrankBrands] = useState<Record<string, { brandName: string; times: number }>>();
  const [drankItems, setDrankItems] = useState<Record<string, { times: number }>>();
  const [streaks, setStreaks] = useState<{ current: number; longest: number }>({ current: 0, longest: 0 });

  // for heatmap
  const [values, setValues] = useState<{ date: Date; count: number }[]>();
  const endDate = new Date();
  const startDate = new Date(endDate.getTime());
  startDate.setMonth(startDate.getMonth() - 6);

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
          // console.log('author:', post.authorId);
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
                priceStatistic[label] += post.price;
              }
            });
            priceStatistic.overall += post.price;
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

  useEffect(() => {}, [values]);

  const fetchAllBrandsInfo = async () => {
    const allBrands = await dbApi.getAllBrandsInfo();
    dispatch(addAllBrands({ allBrands }));
  };

  function timestampToDate(timestamp: Timestamp) {
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
    <div className=''>
      <div>current streak {streaks.current}天</div>
      <div>longest streak {streaks.longest}天</div>
      <div>總共花ㄌ${priceStatistic.overall}</div>
      <div>今年花ㄌ${priceStatistic.year}</div>
      <div>這個月花ㄌ${priceStatistic.month}</div>
      <div>這禮拜花ㄌ${priceStatistic.week}</div>
      <div>今天花ㄌ${priceStatistic.day}</div>
      <div>
        最常喝的是{getMostDrankBrand()?.name} ({getMostDrankBrand()?.times})
      </div>
      <div>
        <h3>drank brands</h3>
        <div className='flex w-[900px] flex-wrap gap-3'>
          {drankBrands &&
            Object.entries(drankBrands).map((brand, index) => (
              <div
                key={brand[0]}
                className={`h-24 w-24 rounded bg-lime-${brand[1].times === 0 ? '100' : '300'} order-${
                  brand[1].times
                } hover:grow`}
              >
                {<img src={allBrandsInfo[brand[0]]?.photoURL} alt='' />}
                <span>{brand[1].brandName}</span>
                {brand[1].times !== 0 && (
                  <div className='h-6 w-6 rounded-full bg-lime-800 text-center text-white'>{brand[1].times}</div>
                )}
              </div>
            ))}
        </div>
      </div>
      <div>
        {drankBrands && drankItems && (
          <Badges
            drankBrands={drankBrands}
            drankItems={drankItems}
            numPosts={profileUserPosts.length}
            streaks={streaks}
          />
        )}
      </div>
      {values && <CalendarHeatmapComponent startDate={startDate} endDate={endDate} values={values} />}
    </div>
  );
};

export default DashboardSection;
