import React, { useState, useEffect } from 'react';
import CalendarHeatmapComponent from './CalendarHeatmapComponent';
import { Timestamp } from 'firebase/firestore';

interface CalendarHeatmapProps {
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

const DashboardSection: React.FC<CalendarHeatmapProps> = ({ profileUserPosts }) => {
  const [priceStatistic, setPriceStatistic] = useState({ overall: 0, year: 0, month: 0, week: 0, day: 0 });
  const [values, setValues] = useState<{ date: Date; count: number }[]>();
  const [drankBrands, setDrankBrands] = useState<Record<string, number>>();

  useEffect(() => {
    const drankBrandsStatistic: Record<string, number> = profileUserPosts.reduce((allBrands, post) => {
      allBrands[post.brandName]
        ? (allBrands[post.brandName] = allBrands[post.brandName] + 1)
        : (allBrands[post.brandName] = 1);
      return allBrands;
    }, {});

    setDrankBrands(drankBrandsStatistic);

    // values for calendar
    // const drankDates: Record<string, number> = profileUserPosts.reduce((allDates, post) => {
    //   const dateString = timestampToDate(post.timeCreated);
    //   allDates[dateString] ? (allDates[dateString] = allDates[dateString] + 1) : (allDates[dateString] = 1);
    //   return allDates;
    // }, {});

    const drankDatesValues: { date: Date; count: number }[] = profileUserPosts.reduce((allDates, post) => {
      const dateString = timestampToDate(post.timeCreated);
      const newDate = new Date(dateString);
      if (
        allDates.findIndex((element: { date: Date; count: number }) => element.date.getTime() === newDate.getTime()) ===
        -1
      ) {
        allDates = [...allDates, { date: new Date(dateString), count: 1 }];
      } else {
        allDates[
          allDates.findIndex((element: { date: Date; count: number }) => element.date.getTime() === newDate.getTime())
        ].count += 1;
      }
      return allDates;
    }, []);
    setValues(drankDatesValues);

    // calculate / set priceStatistic
    const calculateTotalPrice = (posts: any, startDate: Date, endDate: Date) => {
      return posts.reduce((accumulator: number, item: any) => {
        const itemDate = new Date(item.timeCreated.seconds * 1000);
        if (itemDate >= startDate && itemDate <= endDate && item.price) {
          return accumulator + item.price;
        }
        return accumulator;
      }, 0);
    };

    const currentDate = new Date();
    const intervals = [
      { label: 'year', value: currentDate.getFullYear() - 1 },
      { label: 'month', value: currentDate.getMonth() - 1 },
      { label: 'week', value: currentDate.getDate() - 7 },
      { label: 'day', value: currentDate.getDate() - 1 },
    ];

    const allPriceStatistic: PriceStatistic = {
      overall: profileUserPosts.reduce((a, c) => (c.price ? a + c.price : a), 0),
      year: 0,
      month: 0,
      week: 0,
      day: 0,
    };

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
      allPriceStatistic[label] = calculateTotalPrice(profileUserPosts, startDate, currentDate);
    });

    setPriceStatistic(allPriceStatistic);

    console.log('drankBrands', drankBrands);
    // console.log('mostDrankBrand', mostDrankBrand);
    // console.log(drankDates, 'drankDates');
    console.log('drankDatesValues', drankDatesValues);
  }, [profileUserPosts]);

  function timestampToDate(timestamp: Timestamp) {
    const dateObj = timestamp.toDate();
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  const endDate = new Date();
  // const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1); //month
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);
  if (values === undefined) {
    return <div>loading...</div>;
  }

  const getMostDrankBrand = () => {
    if (!drankBrands) return;
    const mostDrankBrand = Object.entries(drankBrands).reduce(
      (a, [key, value]) => (value > drankBrands[a] ? key : a),
      Object.keys(drankBrands)[0]
    );
    return mostDrankBrand;
  };

  return (
    <div className=''>
      <CalendarHeatmapComponent startDate={startDate} endDate={endDate} values={values} />
      <div>總共花ㄌ${priceStatistic.overall}</div>
      <div>今年花ㄌ${priceStatistic.year}</div>
      <div>這個月花ㄌ${priceStatistic.month}</div>
      <div>這禮拜花ㄌ${priceStatistic.week}</div>
      <div>今天花ㄌ${priceStatistic.day}</div>
      <div>最常喝的是{getMostDrankBrand()}</div>
      <div>
        <h3>drank brands</h3>
      </div>
      <div>
        <h3>badges</h3>
      </div>
    </div>
  );
};

export default DashboardSection;
