"use client";
import React from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  ScatterChart, Scatter,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
} from "recharts";

export default function Widget({ widget }) {
  const { displayMode, parsedData, config } = widget;

  if (!parsedData || parsedData.length === 0) {
    return <div className="text-sm text-gray-500">No data available</div>;
  }

  const data = parsedData;

  const renderCard = () => (
    <pre className="text-xs text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
      {JSON.stringify(data[0], null, 2)}
    </pre>
  );

  const renderTable = () => {
    const fields = config.selectedFields?.length > 0
      ? config.selectedFields
      : Object.keys(data[0]);

    return (
      <div className="overflow-auto h-full">
        <table className="min-w-full border text-xs">
          <thead>
            <tr>
              {fields.map(f => (
                <th key={f} className="border px-2 py-1">{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 20).map((row, i) => (
              <tr key={i}>
                {fields.map(f => (
                  <td key={f} className="border px-2 py-1">{row[f]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const ChartWrapper = ({ children }) => (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );

  const renderLine = () => (
    <ChartWrapper>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={config.xField} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={config.yField} stroke="#8884d8" />
      </LineChart>
    </ChartWrapper>
  );

  const renderBar = () => (
    <ChartWrapper>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={config.xField} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={config.yField} fill="#82ca9d" />
      </BarChart>
    </ChartWrapper>
  );

  const renderScatter = () => (
    <ChartWrapper>
      <ScatterChart>
        <CartesianGrid />
        <XAxis dataKey={config.xField} />
        <YAxis dataKey={config.yField} />
        <Tooltip />
        <Scatter data={data} fill="#8884d8" />
      </ScatterChart>
    </ChartWrapper>
  );

  const renderPie = () => (
    <ChartWrapper>
      <PieChart>
        <Pie
          data={data}
          dataKey={config.valueField}
          nameKey={config.xField || "timestamp"}
          cx="50%"
          cy="50%"
          outerRadius="80%"
          fill="#8884d8"
          label
        >
          {data.map((_, i) => (
            <Cell key={i} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042"][i % 4]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ChartWrapper>
  );

   const renderHistogram = renderBar;

  const renderers = {
    Card: renderCard,
    Table: renderTable,
    Line: renderLine,
    Bar: renderBar,
    Scatter: renderScatter,
    Pie: renderPie,
    Histogram: renderHistogram
  };

  return (
    <div
      className="bg-white dark:bg-neutral-900 shadow-md rounded-xl p-4 flex flex-col border border-gray-200 dark:border-neutral-700 transition-colors"
      style={{ width: "30vw", height: "30vh" }} 
    >
       <div className="drag-handle cursor-move mb-1 font-semibold text-lg text-gray-800 dark:text-gray-100 select-none">
      {widget.name}
    </div>
    {widget.desc && (
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {widget.desc}
      </div>
    )}
      <div className="flex-1 overflow-auto">
        {renderers[displayMode] ? renderers[displayMode]() : renderCard()}
      </div>
    </div>
  );
}
