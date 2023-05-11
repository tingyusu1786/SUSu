import 'animate.css';
import { badgeConfig } from './badgeConfig';

interface BadgesProps {
  drankBrands: Record<string, { brandName: string; times: number }> | undefined;
  drankItems: Record<string, { times: number }> | undefined;
  numPosts: number;
  streaks: { longest: number; current: number };
}

const Badges: React.FC<BadgesProps> = ({ drankBrands, drankItems, numPosts, streaks }) => {
  const numDrankBrands = drankBrands ? Object.values(drankBrands).filter((brand) => brand.times > 0).length : 0;

  const numDrankItems = drankItems ? Object.keys(drankItems).length : 0;

  const badgeLog = {
    num: numPosts,
    ...badgeConfig.find((config) => config.type === 'log'),
  };

  const badgeBrand = {
    num: numDrankBrands,
    ...badgeConfig.find((config) => config.type === 'brand'),
  };

  const badgeItem = {
    num: numDrankItems,
    ...badgeConfig.find((config) => config.type === 'item'),
  };

  const badgeStreak = {
    num: streaks.longest,
    ...badgeConfig.find((config) => config.type === 'streak'),
  };

  const badgeCategories = [badgeLog, badgeBrand, badgeItem, badgeStreak];

  return (
    <>
      {badgeCategories.map((category) => {
        const { icon: Icon, desc, goals, bg, num } = category;
        return goals?.map((goal, index) => {
          if (goal === 0) {
            return null;
          }
          const prevGoal = goals[index - 1] || 0;
          const isGoalReached = num >= goal;
          const isBetweenGoals = num > prevGoal && num < goal;
          const progressBarWidth = (num / (goals.find((g) => g > num) || 1)) * 100;
          return (
            <div
              key={`${category.type}-${goal}-${index}`}
              className={`${
                isGoalReached
                  ? `bg-${bg}-${index + 1} ring-2 ring-neutral-900 ring-offset-2`
                  : ' bg-neutral-200 opacity-30'
              } group relative flex h-24 w-24 cursor-default items-center justify-center gap-x-2 rounded-full  border-2  border-neutral-900  transition-all duration-100`}
            >
              <Icon size={44} color={'#171717'} weight='light' />
              <div className='delay-50 absolute flex h-full w-full items-center justify-center rounded-full bg-white text-center text-sm opacity-0 transition-all duration-200 group-hover:opacity-100'>{`${
                desc![0]
              } ${goal} ${desc![1]}`}</div>
              {isBetweenGoals && (
                <div className='absolute bottom-0 h-3 w-full rounded-sm border border-neutral-900 bg-neutral-200 opacity-100'>
                  <div
                    className={`h-full border-r border-neutral-900 bg-neutral-800 pr-0.5 text-right text-xs leading-none text-white`}
                    style={{ width: `${progressBarWidth}%` }}
                  >
                    {num}
                  </div>
                </div>
              )}
            </div>
          );
        });
      })}
    </>
  );
};

export default Badges;
