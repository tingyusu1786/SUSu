import React, { useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import '../../index.css';
import { Tooltip } from 'react-tooltip';

interface BadgesProps {
  drankBrands: Record<string, { brandName: string; times: number }>;
  drankItems: Record<string, { times: number }>;
  numPosts: number;
  streaks: { longest: number; current: number };
}

const Badges: React.FC<BadgesProps> = ({ drankBrands, drankItems, numPosts, streaks }) => {
  const numDrankBrands = Object.entries(drankBrands).reduce((a, c) => {
    if (c[1].times > 0) {
      a += 1;
    }
    return a;
  }, 0);

  const numDrankItems = Object.keys(drankItems).length;

  const badgeCategories = [
    { name: '喝po的總數', num: numPosts, goals: [0, 10, 50, 100, 500, 1000] },
    { name: '喝過的家數', num: numDrankBrands, goals: [0, 3, 5, 10, 25, 50] },
    { name: '喝過的品項數', num: numDrankItems, goals: [0, 10, 25, 50, 100, 200] },
    { name: '喝的連續天數', num: streaks.longest, goals: [0, 3, 7, 30, 90, 365] },
  ];

  return (
    <div className=''>
      {badgeCategories.map((category) => (
        <div>
          <h3>{category.name}</h3>
          <div className='flex gap-3'>
            {category.goals.map(
              (goal, index) =>
                goal !== 0 && (
                  <div>
                    <div
                      className={` flex h-24 w-24 items-center justify-center rounded-full ${
                        category.num >= goal ? 'bg-amber-500 font-bold' : 'bg-amber-100'
                      }`}
                    >
                      {goal}
                    </div>
                    {category.num > category.goals[index - 1] && category.num < goal && (
                      <div className='w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                        <div
                          className='rounded-full bg-lime-600 p-0.5 text-right text-xs font-medium leading-none text-blue-100'
                          style={{ width: (category.num / goal) * 100 }}
                        >
                          {category.num}
                        </div>
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Badges;
