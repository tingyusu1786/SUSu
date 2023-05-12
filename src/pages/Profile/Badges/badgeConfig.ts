import React, { ElementType, ForwardRefExoticComponent } from 'react';
import {
  Browsers,
  Shapes,
  RocketLaunch,
  Storefront,
  IconProps,
  Icon,
} from '@phosphor-icons/react';

export type BadgeConfig = {
  type: string;
  goals: number[];
  icon: any;
  // icon: React.ReactElement;
  // icon: React.Component;
  // icon: SVGRectElement;
  // icon: ElementType;
  // icon: ForwardRefExoticComponent<IconProps>;
  // icon: IconProps;
  // icon: Icon;
  bg: string;
  desc: string[];
};

export const badgeConfig: BadgeConfig[] = [
  {
    type: 'log',
    goals: [0, 3, 10, 50, 100, 500, 1000],
    icon: Browsers,
    bg: 'red',
    desc: ['log', 'times'],
  },
  {
    type: 'brand',
    goals: [0, 3, 5, 10, 25, 50],
    icon: Storefront,
    bg: 'lime',
    desc: ['visit', 'brands'],
  },
  {
    type: 'item',
    goals: [0, 10, 25, 50, 100, 200],
    icon: Shapes,
    bg: 'yellow',
    desc: ['try', 'items'],
  },
  {
    type: 'streak',
    goals: [0, 3, 7, 30, 90, 365],
    icon: RocketLaunch,
    bg: 'indigo',
    desc: ['log consecutive', 'days'],
  },
];
