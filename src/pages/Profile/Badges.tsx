import React, { useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import '../../index.css';
import { Tooltip } from 'react-tooltip';
// import { Badge, BadgeBack } from '../../images/star_10';
import { ReactComponent as Badge } from '../../images/badge.svg';
import 'animate.css';

interface BadgesProps {
  drankBrands: Record<string, { brandName: string; times: number }> | undefined;
  drankItems: Record<string, { times: number }> | undefined;
  numPosts: number;
  streaks: { longest: number; current: number };
}

const Badges: React.FC<BadgesProps> = ({ drankBrands, drankItems, numPosts, streaks }) => {
  const numDrankBrands = drankBrands
    ? Object.entries(drankBrands).reduce((a, c) => {
        if (c[1].times > 0) {
          a += 1;
        }
        return a;
      }, 0)
    : 0;

  const numDrankItems = drankItems ? Object.keys(drankItems).length : 0;

  const badgeCategories = [
    {
      name: (
        <span>
          ✧ Drinkaholic <span className='text-sm text-neutral-500'>(number of drink logs)</span>
        </span>
      ),
      num: numPosts,
      goals: [0, 10, 50, 100, 500, 1000],
    },
    {
      name: (
        <span>
          ✧ Brand-Hunter <span className='text-sm text-neutral-500'>(number of brands drank)</span>
        </span>
      ),
      num: numDrankBrands,
      goals: [0, 3, 5, 10, 25, 50],
    },
    {
      name: (
        <span>
          ✧ Adventurer <span className='text-sm text-neutral-500'>(number of items drank)</span>
        </span>
      ),
      num: numDrankItems,
      goals: [0, 10, 25, 50, 100, 200],
    },
    {
      name: (
        <span>
          ✧ Cant-stop-drinking <span className='text-sm text-neutral-500'>(longest streak drinking)</span>
        </span>
      ),
      num: streaks.longest,
      goals: [0, 3, 7, 30, 90, 365],
    },
  ];
  {
    /*<Badge className='h-24 w-24' />*/
  }
  return (
    <>
      {/*<div className='flex flex-col gap-10'>*/}
      {badgeCategories.map((category, index) => (
        <div key={index} className='col-span-full mb-10 w-full'>
          <div className='mb-5 ml-7'>{category.name}</div>
          <div className='grid w-full grid-cols-5 items-center justify-items-center'>
            {category.goals.map(
              (goal, index) =>
                goal !== 0 && (
                  <div key={index} className='relative'>
                    <div
                      className={`group mb-2 flex h-24 w-24 items-center justify-center rounded-full border-2 border-neutral-900 bg-neutral-100 -tracking-[2px] outline outline-4 outline-offset-2 outline-yellow-200 ring-4 ring-neutral-900 ring-offset-4 ${
                        category.num >= goal
                          ? 'duration-400 transition-all '
                          : 'border-neutral-400 text-neutral-500 opacity-40 ring-neutral-500 grayscale'
                      }`}
                    >
                      <span
                        className={`${
                          category.num >= goal ? 'group-hover:rotate-0 group-hover:scale-125' : 'textBorder'
                        } rotate-12 pt-2 text-4xl transition-all duration-200 `}
                      >
                        {goal}
                      </span>
                    </div>
                    {category.num > category.goals[index - 1] && category.num < goal && (
                      <div className='absolute -bottom-6 w-24 rounded-sm border border-neutral-900 bg-neutral-200'>
                        <div
                          className={` border-r border-neutral-900 bg-yellow-200 p-0.5 text-right text-xs leading-none`}
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
      {/*</div>*/}
    </>
  );
};

export default Badges;
