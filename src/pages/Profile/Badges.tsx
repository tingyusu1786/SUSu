import React, { useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import '../../index.css';
import { Tooltip } from 'react-tooltip';
import { Badge, BadgeBack } from '../../images/star_10';

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
    { name: 'number of drink logs', num: numPosts, goals: [0, 10, 50, 100, 500, 1000] },
    { name: 'number of brands drank', num: numDrankBrands, goals: [0, 3, 5, 10, 25, 50] },
    { name: 'number of items drank', num: numDrankItems, goals: [0, 10, 25, 50, 100, 200] },
    { name: 'longest streak drinking', num: streaks.longest, goals: [0, 3, 7, 30, 90, 365] },
  ];

  return (
    <div className='flex flex-col gap-10'>
      {badgeCategories.map((category, index) => (
        <div key={index}>
          <h3>{category.name}</h3>
          <div className='flex gap-5'>
            {category.goals.map(
              (goal, index) =>
                goal !== 0 && (
                  <div key={index} className='relative'>
                    <div
                      className={`relative flex h-24 w-24 items-center justify-center rounded-full drop-shadow ${
                        category.num >= goal ? 'duration-400 transition-all hover:rotate-12' : 'opacity-60 grayscale'
                      }`}
                    >
                      <div className=''>
                        <Badge />
                      </div>
                      <div className='absolute'>
                        <BadgeBack />
                      </div>

                      <span className='absolute'>{goal}</span>
                    </div>
                    {category.num > category.goals[index - 1] && category.num < goal && (
                      <div className='absolute -bottom-6 w-full rounded-full bg-gray-200'>
                        <div
                          className={`rounded-full bg-green-400 p-0.5 text-right text-xs leading-none text-white`}
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
