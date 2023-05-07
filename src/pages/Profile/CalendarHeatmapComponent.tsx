import React, { useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
// import 'react-calendar-heatmap/dist/styles.css';
import '../../index.css';
import Tooltip from 'react-tooltip';

interface CalendarHeatmapProps {
  values: { date: Date; count: number }[];
  numMonthBefore: number;
}

const CalendarHeatmapComponent: React.FC<CalendarHeatmapProps> = ({ values, numMonthBefore }) => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime());
  startDate.setMonth(startDate.getMonth() - numMonthBefore);

  return (
    <div className={`${numMonthBefore === 3 && 'mx-auto max-w-[400px]'}`}>
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={values}
        showWeekdayLabels={false}
        gutterSize={2}
        // onClick={(value) => console.log(value?.date, value?.count, value)}
        // onMouseOver={(event, value) => console.log(value?.date, value?.count, value)}
        titleForValue={(value) =>
          value?.date
            ? `${value?.count} drink on ${value?.date
                .toLocaleDateString('chinese', { year: 'numeric', month: 'numeric', day: 'numeric' })
                .replace(/\//g, '/')}`
            : "didn't drink on this day"
        }
        classForValue={(value) => {
          if (!value) {
            return 'color-gitlab-0';
          }
          return `color-gitlab-${value.count}`;
          // return `color-github-${value.count}`;
        }}
        tooltipDataAttrs={(value: any) => {
          if (!value || !value.date) {
            return null;
          }
          // react-tooltipの構成
          return {
            'data-tip': `${value.date} has count: ${value.count}`,
          };
        }}
      />
      {/*{<Tooltip id='data-tip' />}*/}
    </div>
  );
};

export default CalendarHeatmapComponent;
