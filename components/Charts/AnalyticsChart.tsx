'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

interface AnalyticsChartProps {
  type: 'line' | 'bar' | 'doughnut';
  data: ChartData;
  title?: string;
  height?: number;
  className?: string;
}

export function AnalyticsChart({
  type,
  data,
  title,
  height = 300,
  className = '',
}: AnalyticsChartProps) {
  const commonOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter',
            size: 12,
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: !!title,
        text: title,
        font: {
          family: 'Inter',
          size: 16,
          weight: '600',
        },
        color: '#111827',
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        font: {
          family: 'Inter',
        },
      },
    },
  };

  const lineOptions: ChartOptions<'line'> = {
    ...commonOptions,
    scales: {
      x: {
        grid: {
          color: '#F3F4F6',
          display: true,
        },
        ticks: {
          color: '#6B7280',
          font: {
            family: 'Inter',
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: '#F3F4F6',
          display: true,
        },
        ticks: {
          color: '#6B7280',
          font: {
            family: 'Inter',
            size: 11,
          },
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  const barOptions: ChartOptions<'bar'> = {
    ...commonOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            family: 'Inter',
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: '#F3F4F6',
          display: true,
        },
        ticks: {
          color: '#6B7280',
          font: {
            family: 'Inter',
            size: 11,
          },
        },
        beginAtZero: true,
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false,
      },
    },
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    ...commonOptions,
    cutout: '60%',
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#FFFFFF',
      },
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={lineOptions} />;
      case 'bar':
        return <Bar data={data} options={barOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={doughnutOptions} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}
    >
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </motion.div>
  );
}

// Preset chart components for common use cases
export function ViewsChart({ data, className }: { data: ChartData; className?: string }) {
  const chartData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: '#EF4444',
      borderColor: '#DC2626',
      borderWidth: 2,
    })),
  };

  return (
    <AnalyticsChart
      type="line"
      data={chartData}
      title="Vistas por día"
      className={className}
    />
  );
}

export function GenreChart({ data, className }: { data: ChartData; className?: string }) {
  const colors = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E', 
    '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'
  ];

  const chartData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: colors.slice(0, data.labels.length),
      borderColor: colors.slice(0, data.labels.length).map(color => color),
      borderWidth: 2,
    })),
  };

  return (
    <AnalyticsChart
      type="doughnut"
      data={chartData}
      title="Obras por género"
      className={className}
    />
  );
}

export function LikesChart({ data, className }: { data: ChartData; className?: string }) {
  const chartData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: '#10B981',
      borderColor: '#059669',
      borderWidth: 1,
    })),
  };

  return (
    <AnalyticsChart
      type="bar"
      data={chartData}
      title="Me gusta por obra"
      className={className}
    />
  );
}

export function EngagementChart({ data, className }: { data: ChartData; className?: string }) {
  const chartData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: index === 0 ? '#EF4444' : '#10B981',
      borderColor: index === 0 ? '#DC2626' : '#059669',
      borderWidth: 2,
    })),
  };

  return (
    <AnalyticsChart
      type="line"
      data={chartData}
      title="Engagement por tiempo"
      className={className}
    />
  );
}

export default AnalyticsChart;
