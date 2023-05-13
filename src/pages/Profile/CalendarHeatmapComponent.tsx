import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import '../../index.css';

interface CalendarHeatmapProps {
  values: { date: Date; count: number }[];
  numMonthBefore: number;
}

const CalendarHeatmapComponent: React.FC<CalendarHeatmapProps> = ({
  values,
  numMonthBefore,
}) => {
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
        titleForValue={(value) =>
          value?.date
            ? `${value?.count} drink on ${value?.date
                .toLocaleDateString('chinese', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                })
                .replace(/\//g, '/')}`
            : "didn't drink on this day"
        }
        classForValue={(value) => {
          if (!value) {
            return 'color-gitlab-0';
          }
          return `color-gitlab-${value.count}`;
        }}
      />
    </div>
  );
};

export default CalendarHeatmapComponent;
