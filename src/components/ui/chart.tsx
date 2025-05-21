
import React from 'react';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

/**
 * BarChart - A responsive bar chart component using recharts
 * 
 * @param {object} props - Component props
 * @param {Array<object>} props.data - Array of data objects for the chart
 * @param {string} props.xKey - Key to use for x-axis values
 * @param {Array<{key: string, name: string, color: string}>} props.bars - Configuration for each bar
 * @param {string} [props.className] - Optional CSS classes
 * @returns {JSX.Element} Rendered bar chart component
 */
export const BarChart = ({ 
  data = [], 
  xKey, 
  bars = [], 
  className = '' 
}: { 
  data: any[];
  xKey: string;
  bars: Array<{key: string; name: string; color: string}>;
  className?: string;
}) => {
  return (
    <div className={`w-full h-[300px] ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
            }}
          />
          <Legend />
          {bars.map((bar, index) => (
            <Bar key={index} dataKey={bar.key} name={bar.name} fill={bar.color} />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * LineChart - A responsive line chart component using recharts
 * 
 * @param {object} props - Component props
 * @param {Array<object>} props.data - Array of data objects for the chart
 * @param {string} props.xKey - Key to use for x-axis values
 * @param {Array<{key: string, name: string, color: string}>} props.lines - Configuration for each line
 * @param {string} [props.className] - Optional CSS classes
 * @returns {JSX.Element} Rendered line chart component
 */
export const LineChartComponent = ({ 
  data = [], 
  xKey, 
  lines = [], 
  className = '' 
}: { 
  data: any[];
  xKey: string;
  lines: Array<{key: string; name: string; color: string, strokeWidth?: number}>;
  className?: string;
}) => {
  return (
    <div className={`w-full h-[300px] ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
            }}
          />
          <Legend />
          {lines.map((line, index) => (
            <Line 
              key={index} 
              type="monotone" 
              dataKey={line.key} 
              name={line.name} 
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2} 
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * AreaChart - A responsive area chart component using recharts
 * 
 * @param {object} props - Component props
 * @param {Array<object>} props.data - Array of data objects for the chart
 * @param {string} props.xKey - Key to use for x-axis values
 * @param {Array<{key: string, name: string, color: string, fillOpacity?: number}>} props.areas - Configuration for each area
 * @param {string} [props.className] - Optional CSS classes
 * @returns {JSX.Element} Rendered area chart component
 */
export const AreaChartComponent = ({ 
  data = [], 
  xKey, 
  areas = [], 
  className = '' 
}: { 
  data: any[];
  xKey: string;
  areas: Array<{key: string; name: string; color: string; fillOpacity?: number}>;
  className?: string;
}) => {
  return (
    <div className={`w-full h-[300px] ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
            }}
          />
          <Legend />
          {areas.map((area, index) => (
            <Area 
              key={index} 
              type="monotone" 
              dataKey={area.key} 
              name={area.name} 
              stroke={area.color}
              fill={area.color}
              fillOpacity={area.fillOpacity || 0.3} 
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Export all components and individual recharts components
export {
  RechartsBarChart,
  LineChart,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Bar,
  Area
};

export default BarChart;
