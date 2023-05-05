import 'animate.css';
import { Spinner, Trophy, Browsers, Shapes, RocketLaunch, Storefront } from '@phosphor-icons/react';

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

  const iconColor = '#171717';
  const badgeLog = {
    num: numPosts,
    goals: [0, 3, 10, 50, 100, 500, 1000],
    icon: <Browsers size={44} color={iconColor} weight='light' />,
    bg: 'red',
    desc: ['log', 'times'],
  };
  const badgeBrand = {
    num: numDrankBrands,
    goals: [0, 3, 5, 10, 25, 50],
    icon: <Storefront size={44} color={iconColor} weight='light' />,
    bg: 'lime',
    desc: ['visit', 'brands'],
  };
  const badgeItem = {
    num: numDrankItems,
    goals: [0, 10, 25, 50, 100, 200],
    icon: <Shapes size={44} color={iconColor} weight='light' />,
    bg: 'yellow',
    desc: ['try', 'items'],
  };
  const badgeStreak = {
    num: streaks.longest,
    goals: [0, 3, 7, 30, 90, 365],
    icon: <RocketLaunch size={44} color={iconColor} weight='light' />,
    bg: 'indigo',
    desc: ['log consecutive', 'days'],
  };

  const badgeCategories = [badgeLog, badgeBrand, badgeItem, badgeStreak];

  return (
    <>
      {badgeCategories.map((category) =>
        category.goals.map((goal, index) => {
          if (goal === 0) {
            return;
          }
          return (
            <div
              className={`${
                category.num >= goal
                  ? `bg-${category.bg}-${index + 1} ring-2 ring-neutral-900 ring-offset-2`
                  : ' bg-neutral-200 opacity-30'
              } group relative flex h-24 w-24 cursor-default items-center justify-center gap-x-2 rounded-full  border-2  border-neutral-900  transition-all duration-100`}
            >
              <div className=''>{category.icon}</div>
              <div className='delay-50 absolute flex h-full w-full items-center justify-center rounded-full bg-white text-center text-sm opacity-0 transition-all duration-200 group-hover:opacity-100'>{`${category.desc[0]} ${goal} ${category.desc[1]}`}</div>
              {category.num > category.goals[index - 1] && category.num < goal && (
                <div className='absolute bottom-0 h-3 w-full rounded-sm border border-neutral-900 bg-neutral-200 opacity-100'>
                  <div
                    className={`h-full border-r border-neutral-900 bg-neutral-800 pr-0.5 text-right text-xs leading-none text-white`}
                    style={{ width: `${(category.num / (category.goals.find((g) => g > category.num) || 1)) * 100}%` }}
                  >
                    {category.num}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </>
  );
};

export default Badges;
