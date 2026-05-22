import React from 'react';
import { SimResult } from '../types';
import { ShieldAlert, TrendingDown, Leaf, ArrowDownCircle, Percent, AlertCircle } from 'lucide-react';

interface PrioritizedPlannerProps {
  blockResults: SimResult[];
  onSelectBlock: (blockId: string) => void;
}

export function PrioritizedPlanner({ blockResults, onSelectBlock }: PrioritizedPlannerProps) {
  // Sort blocks by baseline temperatura descending to locate top critical heat islands.
  // We exclude parks because parks are cool already.
  const eligibleHotspots = blockResults
    .filter(b => b.type !== 'Park')
    .sort((a, b) => b.baseLST - a.baseLST);

  const topHotspots = eligibleHotspots.slice(0, 4);

  return (
    <div className="bg-[#1e293b] rounded-xl border border-slate-700 p-5 shadow-lg mt-6 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <ShieldAlert className="w-4.5 h-4.5 text-orange-500" />
            Strategic Capital Hotspots: Prioritized Allocation
          </h2>
          <p className="text-xs text-slate-400">
            These four blocks represent the highest local thermal heat island risks. Targeting these first maximizes municipal ROI.
          </p>
        </div>
        <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 font-mono py-0.5 px-2 rounded-full font-bold uppercase flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Critical Grid Risk
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topHotspots.map((block, idx) => {
          const thermalDiffAbs = Math.abs(block.lstDiff);
          const hasSavings = block.annualSavingsUsd > 0;

          let rankColor = "bg-red-600 text-white";
          let borderHighlight = "border-red-500 bg-red-950/20 hover:border-red-400 text-slate-100 shadow-md";
          if (idx === 1) { 
            rankColor = "bg-orange-600 text-white"; 
            borderHighlight = "border-orange-500 bg-orange-950/15 hover:border-orange-400 text-slate-100"; 
          }
          else if (idx === 2) { 
            rankColor = "bg-yellow-600 text-slate-950 font-bold"; 
            borderHighlight = "border-yellow-600 bg-yellow-950/10 hover:border-yellow-500 text-slate-100"; 
          }
          else { 
            rankColor = "bg-slate-700 text-slate-300 font-bold"; 
            borderHighlight = "border-slate-700 bg-slate-900/40 hover:border-slate-600 text-slate-100"; 
          }

          return (
            <div
              key={block.blockId}
              onClick={() => onSelectBlock(block.blockId)}
              className={`p-4 rounded-xl border hover:shadow-md cursor-pointer transition-all ${borderHighlight}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${rankColor}`}>
                    #{idx + 1}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-400 hover:text-white">
                    {block.blockId}
                  </span>
                </div>
                <span className="text-[9px] font-mono font-semibold bg-slate-950 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase">
                  {block.type}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white leading-snug truncate mb-2" title={block.name}>
                {block.name}
              </h4>

              <div className="space-y-1.5 pt-2 border-t border-slate-700/60 text-[11px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Base Surface Temp:</span>
                  <span className="text-orange-400 font-bold">{block.baseLST.toFixed(1)}°C</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Mitigated Temp:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                    {block.simLST.toFixed(1)}°C
                  </span>
                </div>

                <div className="flex justify-between text-slate-400 mt-1">
                  <span>Sim Temp DeltaLST:</span>
                  <span className="text-emerald-450 font-bold flex items-center gap-0.5">
                    <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-400" />
                    -{thermalDiffAbs.toFixed(2)}°C
                  </span>
                </div>

                {hasSavings && (
                  <div className="flex justify-between text-teal-400 bg-teal-500/10 border border-teal-500/20 p-1.5 rounded text-[10px] font-bold mt-2">
                    <span>Power Savings:</span>
                    <span>${block.annualSavingsUsd.toLocaleString()}/yr</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
