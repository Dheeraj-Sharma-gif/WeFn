"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts";

const dummyData = Array.from({ length: 7 }, (_, i) => ({
  name: `Day ${i + 1}`,
  uv: Math.floor(Math.random() * 4000),
  pv: Math.floor(Math.random() * 4000),
  amt: Math.floor(Math.random() * 2000),
}));

const pieData = [
  { name: "A", value: 400 },
  { name: "B", value: 300 },
  { name: "C", value: 300 },
  { name: "D", value: 200 },
];
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50"];

/**
 * Reusable component with masonry charts and overlay heading
 * @param {string} heading - The heading text for the overlay
 */
export default function ChartMasonryOverlay({ heading }) {
  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-neutral-900 flex items-center justify-center">
      {/* Masonry grid - hidden on <md */}
      <div className="hidden md:block columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 p-6 w-full max-w-7xl">
        {/* Chart 1 - Line */}
        <div className="mb-6 h-64 bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow break-inside-avoid">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dummyData}>
              <XAxis dataKey="name" stroke="#8884d8" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="uv" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2 - Bar */}
        <div className="mb-6 h-80 bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow break-inside-avoid">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dummyData}>
              <XAxis dataKey="name" stroke="#82ca9d" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pv" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3 - Area */}
        <div className="mb-6 h-56 bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow break-inside-avoid">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dummyData}>
              <XAxis dataKey="name" stroke="#ffc658" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="amt" stroke="#ffc658" fill="#ffc658" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 4 - Pie */}
        <div className="mb-6 h-72 bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow break-inside-avoid">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 5 - Radar */}
        <div className="mb-6 h-96 bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow break-inside-avoid">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={dummyData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar dataKey="uv" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 6 - Scatter */}
        <div className="mb-6 h-64 bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow break-inside-avoid">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <XAxis dataKey="uv" />
              <YAxis dataKey="pv" />
              <Tooltip />
              <Scatter data={dummyData} fill="#ff7f50" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 7 - Another Line */}
        <div className="mb-6 h-48 bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow break-inside-avoid">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dummyData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pv" stroke="#ff7f50" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 8 - Double Bar */}
        <div className="mb-6 h-80 bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow break-inside-avoid">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dummyData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="uv" fill="#8884d8" />
              <Bar dataKey="pv" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 9 - Area Gradient */}
        <div className="mb-6 h-64 bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow break-inside-avoid">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dummyData}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="uv" stroke="#82ca9d" fill="url(#colorUv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 10 - Small Pie */}
        <div className="mb-6 h-48 bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow break-inside-avoid">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={60}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full glass overlay (always visible) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full md:w-3/4 md:h-3/4 bg-black/50 dark:bg-white/20 backdrop-blur-lg rounded-none md:rounded-3xl flex items-center justify-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white dark:text-gray-100 text-center px-4">
            {heading}
          </h1>
        </div>
      </div>
    </div>
  );
}
