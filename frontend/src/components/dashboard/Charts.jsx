import React, { useState } from 'react';

/**
 * Circular progress ring using SVG stroke-dasharray
 */
export function ProgressRing({ progress, size = 60, strokeWidth = 5, colorClass = 'stroke-brand-success' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        className="stroke-brand-border/40 dark:stroke-slate-800"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className={`${colorClass} transition-all duration-500 ease-out`}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
}

/**
 * Weekly Learning Activity Bar Chart (Responsive SVG)
 */
export function WeeklyActivityChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  const maxHours = Math.max(...data.map(d => d.hours), 4);
  const barWidth = 24;
  const barSpacing = chartWidth / data.length;

  return (
    <div className="w-full rounded-2xl border border-brand-border/70 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-brand-text-primary dark:text-slate-100">Weekly Learning Activity</h4>
          <p className="text-xs text-brand-text-secondary">Study hours recorded over the last 7 days</p>
        </div>
        <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-[10px] font-semibold text-brand-primary">7 days</span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Y Axis Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            const label = (maxHours * ratio).toFixed(1);
            return (
              <g key={idx} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--brand-border)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-brand-text-secondary text-[10px] font-medium"
                >
                  {label}h
                </text>
              </g>
            );
          })}

          {/* Bar Columns */}
          {data.map((item, idx) => {
            const barHeight = (item.hours / maxHours) * chartHeight;
            const x = paddingLeft + idx * barSpacing + (barSpacing - barWidth) / 2;
            const y = height - paddingBottom - barHeight;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Rounded Top Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 4)}
                  rx={6}
                  ry={6}
                  className={`fill-gradient-to-t transition-colors duration-200 ${
                    hoveredIdx === idx
                      ? 'fill-brand-primary'
                      : 'fill-brand-success'
                  }`}
                  style={{
                    fill: hoveredIdx === idx ? 'var(--brand-primary)' : 'var(--brand-success)'
                  }}
                />

                {/* Day Labels */}
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-brand-text-secondary text-[11px] font-semibold uppercase tracking-wider"
                >
                  {item.day}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating HTML Tooltip */}
        {hoveredIdx !== null && (
          <div
            className="absolute rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-xs font-semibold shadow-card dark:border-slate-800 dark:bg-slate-900"
            style={{
              left: `${(paddingLeft + hoveredIdx * barSpacing + barSpacing / 2) / width * 100}%`,
              top: '15%',
              transform: 'translateX(-50%)',
              pointerEvents: 'none'
            }}
          >
            <p className="text-brand-text-primary dark:text-slate-100">{data[hoveredIdx].hours} hrs</p>
            <p className="text-[10px] text-brand-text-secondary">{data[hoveredIdx].day}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Monthly Learning Hours Line Chart (Responsive SVG)
 */
export function LearningHoursTrendChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxHours = Math.max(...data.map(d => d.hours), 10);
  const points = data.map((item, idx) => {
    const x = paddingLeft + (idx * chartWidth) / (data.length - 1);
    const y = paddingTop + chartHeight * (1 - item.hours / maxHours);
    return { x, y, ...item };
  });

  // Calculate SVG Path for line
  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Calculate SVG Path for gradient area underneath
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z` 
    : '';

  return (
    <div className="w-full rounded-2xl border border-brand-border/70 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-brand-text-primary dark:text-slate-100">Learning Hours Trend</h4>
          <p className="text-xs text-brand-text-secondary">Cumulative monthly tracking details</p>
        </div>
        <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-[10px] font-semibold text-brand-primary">Monthly</span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Y Axis Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            return (
              <g key={idx} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--brand-border)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-brand-text-secondary text-[10px] font-medium"
                >
                  {Math.round(maxHours * ratio)}h
                </text>
              </g>
            );
          })}

          {/* Area under line */}
          {areaD && (
            <path
              d={areaD}
              fill="url(#hoursChartGrad)"
              className="opacity-20"
            />
          )}

          {/* Line Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="var(--brand-primary)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points circles */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 6 : 4}
                className="fill-white stroke-brand-primary transition-all duration-150"
                strokeWidth={3}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'pointer' }}
              />
              <text
                x={p.x}
                y={height - 10}
                textAnchor="middle"
                className="fill-brand-text-secondary text-[11px] font-semibold"
              >
                {p.month}
              </text>
            </g>
          ))}

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="hoursChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--brand-primary)" />
              <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Tooltip */}
        {hoveredIdx !== null && (
          <div
            className="absolute rounded-lg border border-brand-border bg-white px-2.5 py-1.5 text-xs font-semibold shadow-card dark:border-slate-800 dark:bg-slate-900"
            style={{
              left: `${points[hoveredIdx].x / width * 100}%`,
              top: '15%',
              transform: 'translateX(-50%)',
              pointerEvents: 'none'
            }}
          >
            <p className="text-brand-text-primary dark:text-slate-100">{points[hoveredIdx].hours} hrs</p>
            <p className="text-[10px] text-brand-text-secondary">{points[hoveredIdx].month}</p>
          </div>
        )}
      </div>
    </div>
  );
}
