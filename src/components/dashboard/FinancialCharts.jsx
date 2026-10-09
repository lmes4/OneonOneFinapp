import React, { useState } from 'react';
import { buildEvolutionData } from '../../utils/evolution';

// Dynamic SVG Donut Chart with hover effect and active slice highlight
export function DonutChart({ categoryData = [], totalAmount = 0, formatMoney, isDesktop = false }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Compute percentages dynamically
  const safeTotal = Math.max(0, Number(totalAmount) || 0);

  const items = categoryData.length > 0 ? categoryData.map(c => ({
    ...c,
    percent: safeTotal > 0 ? Math.round((c.amount / safeTotal) * 100) : 0
  })) : [
    { label: 'Sin gastos registrados', amount: 0, percent: 100, color: '#94a3b8' }
  ];

  const size = isDesktop ? 220 : 180;
  const strokeWidth = isDesktop ? 26 : 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        {/* Slices */}
        {items.map((item, idx) => {
          const slicePct = Math.min(100, Math.max(0, item.percent));
          const strokeDasharray = `${(slicePct / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -((cumulativePercent / 100) * circumference);
          cumulativePercent += slicePct;

          const isHovered = hoveredIndex === idx;

          return (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={item.color || '#10b981'}
              strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
        {hoveredIndex !== null && items[hoveredIndex] ? (
          <div className="animate-fadeIn">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block truncate max-w-[120px]">
              {items[hoveredIndex].label}
            </span>
            <span className="text-base font-bold text-slate-800">
              {formatMoney(items[hoveredIndex].amount)}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {items[hoveredIndex].percent}%
            </span>
          </div>
        ) : isDesktop ? (
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
              TOTAL GASTADO
            </span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatMoney(safeTotal)}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 block mt-0.5">
              {items.filter(i => i.amount > 0).length} categorías activas
            </span>
          </div>
        ) : (
          <div>
            <span className="text-2xl font-bold text-slate-800 leading-none">
              {items.filter(i => i.amount > 0).length || 0}
            </span>
            <span className="text-xs font-medium text-slate-400 block mt-1">Rubros</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Dynamic Income vs Expenses Evolution Bar Chart
export function EvolutionChart({ transactions = [], formatMoney, period = 'Mes' }) {
  const data = buildEvolutionData(transactions, period);
  const maxVal = Math.max(1, ...data.map(item => Math.max(item.income, item.expense))) * 1.15;
  const chartHeight = 150;

  return (
    <div className="w-full">
      <div className="relative pt-6 pb-2">
        {/* Background grid lines */}
        <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-dashed border-slate-200 w-full"></div>
          <div className="border-b border-dashed border-slate-200 w-full"></div>
          <div className="border-b border-dashed border-slate-200 w-full"></div>
        </div>

        {/* Bars Display */}
        <div className="relative flex items-end justify-between gap-2 h-44 px-2">
          {data.map((item) => {
            const incomeH = (item.income / maxVal) * chartHeight;
            const expenseH = (item.expense / maxVal) * chartHeight;
            return (
              <div
                key={item.key}
                data-testid={`evolution-bar-${item.key}`}
                aria-label={`${item.label}: ingresos ${formatMoney(item.income)}, gastos ${formatMoney(item.expense)}`}
                className={`flex-1 flex flex-col items-center transition-all rounded-xl py-2 group ${
                  item.isCurrent
                    ? 'bg-emerald-50/70 border border-emerald-100/80 shadow-xs'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Bars group */}
                <div className="flex items-end gap-1.5 h-36 justify-center w-full px-1">
                  {/* Income Bar (Green) */}
                  <div className="w-2.5 sm:w-3.5 flex flex-col items-center">
                    <div
                      style={{ height: `${incomeH}px` }}
                      className="w-full bg-emerald-600 rounded-t-full transition-all duration-500 group-hover:bg-emerald-500 shadow-xs"
                      title={`Ingresos: ${formatMoney(item.income)}`}
                    />
                  </div>

                  {/* Expense Bar (Navy) */}
                  <div className="w-2.5 sm:w-3.5 flex flex-col items-center">
                    <div
                      style={{ height: `${expenseH}px` }}
                      className="w-full bg-[#334155] rounded-t-full transition-all duration-500 group-hover:bg-slate-600 shadow-xs"
                      title={`Gastos: ${formatMoney(item.expense)}`}
                    />
                  </div>
                </div>

                {/* Month label */}
                <span
                  className={`mt-2 text-[10px] sm:text-xs font-semibold transition-colors ${
                    item.isCurrent
                      ? 'text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-bold'
                      : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
