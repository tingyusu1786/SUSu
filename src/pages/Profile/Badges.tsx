import React, { useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import '../../index.css';
import { Tooltip } from 'react-tooltip';
// import { Badge, BadgeBack } from '../../images/star_10';
import { ReactComponent as Badge } from '../../images/badge.svg';
import 'animate.css';

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
    { name: 'Drinkaholic: number of drink logs', num: numPosts, goals: [0, 10, 50, 100, 500, 1000] },
    { name: 'Brand-Hunter: number of brands drank', num: numDrankBrands, goals: [0, 3, 5, 10, 25, 50] },
    { name: 'Adventurer: number of items drank', num: numDrankItems, goals: [0, 10, 25, 50, 100, 200] },
    { name: 'Cant-stop-drinking: longest streak drinking', num: streaks.longest, goals: [0, 3, 7, 30, 90, 365] },
  ];
  {
    /*<Badge className='h-24 w-24' />*/
  }
  return (
    <div className='flex flex-col gap-10'>
      {badgeCategories.map((category, index) => (
        <div key={index}>
          <div>{category.name}</div>
          <div className='flex gap-5'>
            {category.goals.map(
              (goal, index) =>
                goal !== 0 && (
                  <div key={index} className='relative'>
                    <div
                      className={`textBorder relative w-32 bg-sky-100 text-6xl -tracking-[5px] drop-shadow ${
                        category.num >= goal
                          ? 'duration-400 transition-all hover:rotate-12'
                          : 'text-neutral-500 opacity-60 grayscale'
                      }`}
                    >
                      {goal}
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
