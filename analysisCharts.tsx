import React from 'react';
import { SimResult, BlockType } from '../types';
import { AreaChart, TrendingDown, HelpCircle, BarChart3, LineChart, Tag } from 'lucide-react';

interface AnalysisChartsProps {
  blockResults: SimResult[];
}

export function AnalysisCharts({ blockResults }: AnalysisChartsProps) {
  // ----------------------------------------------------
  // 1. COMPUTE LEAST-SQUARES LINEAR REGRESSION
  // ----------------------------------------------------
  // We want to correlate simGreenCover (X) with simEUI (Y)
  const N = blockResults.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  blockResults.forEach(b => {
    sumX += b.simGreenCover;
    sumY += b.simEUI;
    sumXY += b.simGreenCover * b.simEUI;
    sumXX += b.simGreenCover * b.simGreenCover;
  });

  const denominator = (N * sumXX) - (sumX * sumX);
  const slope = denominator !== 0 ? ((N * sumXY) - (sumX * sumY)) / denominator : -1.8;
  const intercept = denominator !== 0 ? (sumY - (slope * sumX)) / N : 180;

  // ----------------------------------------------------
  // 2. COMPUTE CATEGORICAL AGGREGATE LOADS FOR BAR CHART
  // ----------------------------------------------------
  const categories: BlockType[] = ['Commercial', 'Industrial', 'Residential', 'Park'];
  
  const categoryData = categories.map(cat => {
    const blocksInCat = blockResults.filter(b => b.type === cat);
    const count = blocksInCat.length;
    const baseCoolingSum = blocksInCat.reduce((sum, b) => sum + b.baseCoolingLoadMWh, 0);
    const simCoolingSum = blocksInCat.reduce((sum, b) => sum + b.simCoolingLoadMWh, 0);
    
    return {
      category: cat,
      count,
      baseMWh: baseCoolingSum,
      simMWh: simCoolingSum,
      savedMWh: Math.max(0, baseCoolingSum - simCoolingSum),
      pctReduced: baseCoolingSum > 0 ? ((baseCoolingSum - simCoolingSum) / baseCoolingSum) * 100 : 0
    };
  });

  const maxBarValue = Math.max(...categoryData.map(c => Math.max(c.baseMWh, c.simMWh)), 10);

  // ----------------------------------------------------
  // SCATTER PLOT GRID CALCULATIONS
  // ----------------------------------------------------
  // X: 0% to 100%
  // Y: 0 to 300 EUI
  const paddingX = 40;
  const paddingY = 30;
  const width = 420;
  const height = 220;

  const mapXToSvg = (xVal: number) => paddingX + (xVal / 100) * (width - paddingX - 15);
  const mapYToSvg = (yVal: number) => height - paddingY - (yVal / 320) * (height - paddingY - 15);

  // Regression points
  const regX1 = 0;
  const regY1 = slope * regX1 + intercept;
  const regX2 = 100;
  const regY2 = slope * regX2 + intercept;

  const regSvgX1 = mapXToSvg(regX1);
  const regSvgY1 = mapYToSvg(Math.max(0, Math.min(320, regY1)));
  const regSvgX2 = mapXToSvg(regX2);
  const regSvgY2 = mapYToSvg(Math.max(0, Math.min(320, regY2)));

  const blockColors: Record<BlockType, { fill: string, border: string }> = {
    Commercial: { fill: 'bg-amber-400', border: 'border-amber-600' },
    Industrial: { fill: 'bg-purple-400', border: 'border-purple-600' },
    Residential: { fill: 'bg-sky-400', border: 'border-sky-600' },
    Park: { fill: 'bg-emerald-400', border: 'border-emerald-600' }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* 1. SCATTER PLOT WITH REGRESSION LINE */}
      <div className="bg-[#1e293b] rounded-xl border border-slate-700 p-5 shadow-lg text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <LineChart className="w-4 h-4 text-emerald-400" />
            LST Correlation: Green Cover vs. Building EUI
          </h3>
          <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 font-mono py-0.5 px-2 rounded-full font-semibold">
            y = {slope.toFixed(2)}x + {intercept.toFixed(1)}
          </span>
        </div>

        <div className="relative">
          {/* Scatter plot SVG canvas */}
          <svg className="w-full h-auto text-slate-400" viewBox={`0 0 ${width} ${height}`}>
            {/* Grid Lines */}
            {[50, 100, 150, 200, 250, 300].map(y => {
              const svgY = mapYToSvg(y);
              return (
                <g key={y}>
                  <line x1={paddingX} y1={svgY} x2={width - 15} y2={svgY} stroke="#334155" strokeWidth="1" />
                  <text x={paddingX - 8} y={svgY + 3} className="text-[9px] font-mono fill-slate-400 text-right text-anchor-end">
                    {y}
                  </text>
                </g>
              );
            })}

            {[20, 40, 60, 80, 100].map(x => {
              const svgX = mapXToSvg(x);
              return (
                <g key={x}>
                  <line x1={svgX} y1={10} x2={svgX} y2={height - paddingY} stroke="#334155" strokeWidth="1" />
                  <text x={svgX} y={height - paddingY + 12} className="text-[9px] font-mono fill-slate-400 text-center text-anchor-middle">
                    {x}%
                  </text>
                </g>
              );
            })}

            {/* Zero axes */}
            <line x1={paddingX} y1={height - paddingY} x2={width - 15} y2={height - paddingY} stroke="#475569" strokeWidth="1.5" />
            <line x1={paddingX} y1={10} x2={paddingX} y2={height - paddingY} stroke="#475569" strokeWidth="1.5" />

            {/* Axis Titles */}
            <text x={width / 2 + 10} y={height - 2} className="text-[10px] font-mono font-bold fill-slate-300 text-anchor-middle">
              Green Infrastructure Cover (%)
            </text>
            <text x={10} y={15} className="text-[10px] font-mono font-bold fill-slate-300 text-anchor-start select-none" transform={`rotate(-90 10 15)`} dy="-10">
              EUI (kWh/m²-yr)
            </text>

            {/* Regression Line */}
            <line
              x1={regSvgX1}
              y1={regSvgY1}
              x2={regSvgX2}
              y2={regSvgY2}
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              className="opacity-75"
            />

            {/* Dot markers representing individual blocks */}
            {blockResults.map(block => {
              const cx = mapXToSvg(block.simGreenCover);
              const cy = mapYToSvg(block.simEUI);
              
              let color = '#38bdf8'; // sky
              if (block.type === 'Commercial') color = '#fbbf24';       // gold
              else if (block.type === 'Industrial') color = '#c084fc';   // purple
              else if (block.type === 'Park') color = '#34d399';         // emerald

              return (
                <circle
                  key={block.blockId}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill={color}
                  stroke="#0f172a"
                  strokeWidth="0.5"
                  className="transition-all cursor-pointer hover:r-[6.5] active:r-[8]"
                >
                  <title>{`${block.blockId} (${block.type}): Green Cover: ${block.simGreenCover.toFixed(1)}%, EUI: ${Math.round(block.simEUI)}`}</title>
                </circle>
              );
            })}
          </svg>

          {/* Color coding legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2.5 pt-2.5 border-t border-slate-700/60">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500 inline-block"></span>
              <span>Commercial</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 border border-purple-500 inline-block"></span>
              <span>Industrial</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-sky-500 inline-block"></span>
              <span>Residential</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-500 inline-block"></span>
              <span>Park & Water</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BAR CHART COMPARE: CURRENT VS PREDICTED PEAK POWER */}
      <div className="bg-[#1e293b] rounded-xl border border-slate-700 p-5 shadow-lg text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Peak Demands: Baseline vs. Predicted Cooling (MWh)
          </h3>
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5 font-bold">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> Zone Power Relief
          </span>
        </div>

        <div className="space-y-4 pt-1.5">
          {categoryData.map(cat => {
            const hasBase = cat.baseMWh > 0.05;
            const basePct = (cat.baseMWh / maxBarValue) * 100;
            const simPct = (cat.simMWh / maxBarValue) * 100;

            let catMarkerColor = "bg-sky-500";
            if (cat.category === "Commercial") catMarkerColor = "bg-amber-500";
            else if (cat.category === "Industrial") catMarkerColor = "bg-purple-500";
            else if (cat.category === "Park") catMarkerColor = "bg-emerald-500";

            return (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1 text-slate-200">
                    <span className={`w-2 h-2 rounded-full ${catMarkerColor} inline-block`}></span>
                    {cat.category} <span className="font-mono text-[9px] text-slate-400 font-normal">({cat.count} blocks)</span>
                  </span>
                  <div className="font-mono text-[10px] space-x-1.5">
                    <span className="text-slate-450 font-semibold">{cat.baseMWh.toFixed(1)} MWh</span>
                    <span className="text-slate-500 font-normal">➔</span>
                    <span className="text-emerald-400 font-extrabold">{cat.simMWh.toFixed(1)} MWh</span>
                    {cat.savedMWh > 0.1 && (
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 font-bold text-emerald-400 px-1.5 py-0.2 rounded-full ml-1">
                        -{cat.pctReduced.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Simulated Double Progress Bar comparison */}
                {hasBase ? (
                  <div className="h-6 w-full bg-slate-900 border border-slate-800 rounded-md relative overflow-hidden flex flex-col justify-center px-1.5 gap-0.5">
                    {/* Baseline Bar */}
                    <div
                      style={{ width: `${basePct}%` }}
                      className="h-2 bg-slate-700 hover:bg-slate-600 opacity-90 rounded transition-all duration-300"
                    ></div>

                    {/* Simulation Bar */}
                    <div
                      style={{ width: `${simPct}%` }}
                      className="h-2 bg-indigo-500 hover:bg-indigo-400 rounded transition-all duration-300"
                    ></div>
                  </div>
                ) : (
                  <div className="h-6 w-full flex items-center text-[10px] text-slate-400 italic font-mono pl-4">
                    Zero baseline cooling load in conservation blocks.
                  </div>
                )}
              </div>
            );
          })}

          {/* Double Bar legend indicator */}
          <div className="flex items-center justify-end gap-5 text-[9px] font-mono border-t border-slate-700/60 pt-3 text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-2 bg-slate-700 rounded block"></span>
              <span>Baseline Power Demand</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-2 bg-indigo-500 rounded block"></span>
              <span>Simulated Shaded Demand</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
