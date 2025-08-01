import { Pie, PieConfig } from '@ant-design/plots';
import { getTaskStatusColor } from 'modules/Schedule';
import React from 'react';
import capitalize from 'lodash/capitalize';
import { theme } from 'antd';

type Item = { status: string; value: number };

type Props = {
  data: Item[];
  onItemSelected: (item: Item) => void;
};

export function TasksChart({ data, onItemSelected }: Props) {
  const config: PieConfig = {
    data,
    angleField: 'value',
    colorField: 'status',
    radius: 1,
    innerRadius: 0.78,
    autoFit: true,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 400,
      },
      autoRotate: false,
    },
    color: ({ status }) => getTaskStatusColor(status),
    legend: {
      layout: 'vertical',
      position: 'right',
      itemMarginBottom: 20,
      itemName: {
        formatter: (status, _, index) => {
          return `${capitalize(status)} ${data[index].value}`;
        },
        style: {
          fontSize: 14,
          fontFamily: 'sans-serif',
        },
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
      {
        type: 'pie-statistic-active',
      },
    ],
    statistic: {
      title: {
        offsetY: -10,
        formatter: datum => {
          if (!datum) return 'Total tasks';
          return capitalize(datum.status);
        },
        style: {
          color: theme.useToken().token.colorTextBase,
          fontSize: '14px',
        },
      },
      content: {
        offsetY: 0,
        style: {
          color: theme.useToken().token.colorTextBase,
          fontSize: '30px',
        },
      },
    },
    onReady: plot => {
      plot.chart.on('element:click', (evt: { data: { data: Item } }) => {
        onItemSelected(evt.data.data);
      });
    },
  };
  return <Pie {...config} />;
}

export default TasksChart;
