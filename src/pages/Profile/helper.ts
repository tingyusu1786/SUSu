import { Timestamp } from 'firebase/firestore';
import { Brand, Post } from '../../interfaces/interfaces';

export const getStatisticsFromPosts = (
  posts: Omit<Post, 'commentsShown'>[],
  allBrandsInfo: {
    [brandId: string]: Brand;
  }
) => {
  const {
    drankBrandsStatistic,
    drankItemsStatistic,
    drankDatesValues,
    priceStatistic,
    streaks,
    prevDate,
  } = posts.reduce(
    (
      accumulator: {
        drankBrandsStatistic: Record<
          string,
          { brandName: string; times: number }
        >;
        drankItemsStatistic: Record<string, { times: number }>;
        drankDatesValues: { date: Date; count: number }[];
        priceStatistic: {
          overall: number;
          year: number;
          month: number;
          week: number;
          day: number;
          [key: string]: number;
        };
        streaks: {
          current: number;
          longest: number;
        };
        prevDate: Date;
      },
      post: any
    ) => {
      // drank brands
      const { drankBrandsStatistic } = accumulator;
      drankBrandsStatistic[post.brandId]
        ? (drankBrandsStatistic[post.brandId].times =
            drankBrandsStatistic[post.brandId].times + 1)
        : (drankBrandsStatistic[post.brandId] = {
            times: 1,
            brandName: post.brandName,
          });

      // drank items
      const { drankItemsStatistic } = accumulator;
      drankItemsStatistic[post.itemId]
        ? (drankItemsStatistic[post.itemId].times =
            drankItemsStatistic[post.itemId].times + 1)
        : (drankItemsStatistic[post.itemId] = { times: 1 });

      // drank dates
      const { drankDatesValues } = accumulator;
      const dateString = timestampToDate(post.timeCreated);
      const newDate = new Date(dateString);
      const index = drankDatesValues.findIndex(
        (element: any) => element.date.getTime() === newDate.getTime()
      );
      if (index === -1) {
        drankDatesValues.push({ date: newDate, count: 1 });
      } else {
        drankDatesValues[index].count += 1;
      }

      // streaks
      const { streaks } = accumulator;
      const { prevDate } = accumulator;
      const currentDate = new Date(dateString);

      if (prevDate.getTime() !== currentDate.getTime()) {
        const areConsecutive =
          currentDate.getTime() - prevDate.getTime() === 86400000;
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
    if (
      allBrandsInfo.hasOwnProperty(key) &&
      !drankBrandsStatistic.hasOwnProperty(key)
    ) {
      drankBrandsStatistic[key] = {
        brandName: allBrandsInfo[key].name,
        times: 0,
      };
    }
  }
  return {
    drankBrandsStatistic,
    drankItemsStatistic,
    drankDatesValues,
    priceStatistic,
    streaks,
  };
};

export const timestampToDate = (timestamp: Timestamp) => {
  if (typeof timestamp === 'number') {
    timestamp = Timestamp.fromMillis(timestamp);
  }
  const dateObj = timestamp.toDate();
  const year = dateObj.getFullYear();
  const month = `0${dateObj.getMonth() + 1}`.slice(-2);
  const day = `0${dateObj.getDate()}`.slice(-2);
  return `${year}-${month}-${day}`;
};
