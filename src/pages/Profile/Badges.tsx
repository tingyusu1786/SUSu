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
      {badgeCategories.map((category, index) => (
        <div key={index}>
          <h3>{category.name}</h3>
          <div className='flex gap-3'>
            {category.goals.map(
              (goal, index) =>
                goal !== 0 && (
                  <div key={index}>
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
      <svg
        className='5 duration-400
        transition-all hover:rotate-45'
        width='100'
        height='100'
        viewBox='0 0 200 200'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <g clip-path='url(#clip0_103_15)'>
          {' '}
          <path
            d='M93.6797 5.15479C97.359 2.15401 102.641 2.15401 106.32 5.15479L114.253 11.625C116.75 13.6608 120.074 14.3696 123.183 13.5291L133.039 10.8652C137.616 9.62811 142.432 11.775 144.572 16.0058L149.229 25.2154C150.679 28.0814 153.416 30.0768 156.588 30.5793L166.717 32.184C171.384 32.9234 174.897 36.829 175.139 41.5483L175.672 51.9384C175.836 55.133 177.519 58.0565 180.199 59.8033L188.865 65.452C192.811 68.0247 194.427 73.0033 192.743 77.4035L189.015 87.1465C187.874 90.1271 188.225 93.4731 189.958 96.1526L195.618 104.899C198.175 108.852 197.629 114.053 194.306 117.389L186.976 124.748C184.722 127.011 183.684 130.214 184.184 133.369L185.815 143.668C186.552 148.327 183.933 152.868 179.531 154.564L169.921 158.264C166.93 159.416 164.672 161.931 163.849 165.029L161.188 175.047C159.973 179.623 155.716 182.719 150.989 182.466L140.78 181.92C137.567 181.748 134.468 183.132 132.452 185.639L126.014 193.647C123.04 197.346 117.876 198.445 113.653 196.277L104.567 191.612C101.7 190.141 98.2999 190.141 95.4331 191.612L86.3465 196.277C82.1243 198.445 76.9601 197.346 73.9862 193.647L67.548 185.639C65.5321 183.132 62.433 181.748 59.2203 181.92L49.0111 182.466C44.284 182.719 40.0271 179.623 38.8119 175.047L36.1507 165.029C35.3279 161.931 33.0702 159.416 30.0792 158.264L20.4691 154.564C16.0666 152.868 13.4477 148.327 14.1855 143.668L15.8162 133.369C16.3157 130.214 15.2781 127.011 13.024 124.748L5.69367 117.389C2.37113 114.053 1.82509 108.852 4.38248 104.899L10.0415 96.1526C11.7752 93.4731 12.1257 90.1271 10.9851 87.1465L7.25661 77.4035C5.57276 73.0033 7.18856 68.0247 11.1354 65.452L19.8014 59.8033C22.4812 58.0565 24.1636 55.133 24.3275 51.9384L24.8607 41.5483C25.1029 36.829 28.6155 32.9234 33.2828 32.184L43.4118 30.5793C46.5838 30.0768 49.3214 28.0814 50.7708 25.2154L55.4283 16.0058C57.5679 11.775 62.3844 9.6281 66.9613 10.8652L76.8169 13.5291C79.9264 14.3696 83.2504 13.6608 85.7465 11.625L93.6797 5.15479Z'
            fill='url(#paint0_linear_103_15)'
          />{' '}
        </g>{' '}
        <defs>
          {' '}
          <linearGradient
            id='paint0_linear_103_15'
            x1='177'
            y1='-9.23648e-06'
            x2='39.5'
            y2='152.5'
            gradientUnits='userSpaceOnUse'
          >
            {' '}
            <stop stop-color='#fde68a' /> <stop offset='1' stop-color='#fbbf24' />{' '}
          </linearGradient>{' '}
          <clipPath id='clip0_103_15'>
            {' '}
            <rect width='200' height='200' fill='white' />{' '}
          </clipPath>{' '}
        </defs>{' '}
      </svg>
    </div>
  );
};

export default Badges;
