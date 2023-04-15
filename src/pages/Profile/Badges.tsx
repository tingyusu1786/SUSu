import React, { useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import '../../index.css';
import { Tooltip } from 'react-tooltip';

interface BadgesProps {}

const Badges: React.FC<BadgesProps> = ({}) => {
  const badgeCategories = [
    { name: '喝po的總數', num: 103, goals: [10, 50, 100, 500, 1000] },
    { name: '喝過的家數', num: 4, goals: [3, 5, 10, 25, 50] },
    { name: '喝過的品項數', num: 1, goals: [10, 25, 50, 100, 200] },
    { name: '喝的連續天數', num: 7, goals: [3, 7, 30, 90, 365] },
  ];

  return (
    <div className=''>
      {badgeCategories.map((category) => (
        <div>
          <h3>{category.name}</h3>
          <div className='flex gap-1'>
            {category.goals.map((goal) => (
              <div
                className={` flex h-24 w-24 items-center justify-center rounded-full ${
                  category.num >= goal ? 'bg-amber-500' : 'bg-amber-100'
                }`}
              >
                {goal}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Badges;
