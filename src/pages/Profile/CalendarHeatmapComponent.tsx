import React, { useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import '../../index.css';
import { Tooltip } from 'react-tooltip';

interface CalendarHeatmapProps {
  values: { date: Date; count: number }[];
  numMonthBefore: number;
}

const CalendarHeatmapComponent: React.FC<CalendarHeatmapProps> = ({ values, numMonthBefore }) => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime());
  startDate.setMonth(startDate.getMonth() - numMonthBefore);
  {
    /*<Tooltip id='data-tip' />*/
  }
  return (
    <CalendarHeatmap
      startDate={startDate}
      endDate={endDate}
      values={values}
      showWeekdayLabels={false}
      gutterSize={2}
      onClick={(value) => console.log(value?.date, value?.count, value)}
      onMouseOver={(value) => console.log(value?.date, value?.count, value)}
      titleForValue={(value) =>
        value?.date
          ? `${value?.date
              .toLocaleDateString('chinese', { year: 'numeric', month: 'numeric', day: 'numeric' })
              .replace(/\//g, '/')} 喝了 ${value?.count}杯`
          : '這天沒有喝'
      }
      // tooltipDataAttrs={(value: any) => {
      //   return { 'data-tooltip': 'Tooltip: ' + value?.count };
      // }}
      // classForValue={(value) => {
      //   if (!value) {
      //     return 'color-empty';
      //   }
      //   return `color-github-${value.brand.length}`;
      // }}
      classForValue={(value) => {
        if (!value) {
          return 'color-empty';
        }
        return `color-github-${value.count}`;
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
  );
};

export default CalendarHeatmapComponent;
