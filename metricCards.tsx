import React from 'react';
import { ZoneSummary } from '../types';
import { Thermometer, Zap, Leaf, DollarSign, ArrowDown, ArrowUp, CalendarRange } from 'lucide-react';

interface MetricCardsProps {
  summary: ZoneSummary;
}

export function MetricCards({ summary }: MetricCardsProps) {
  const {
    avgBaseLST,
    avgSimLST,
    avgLstDiff,
    totalBaseCoolingMWh,
    totalSimCoolingMWh,
    coolingLoadSavedMWh,
    pctCoolingLoadSaved,
    avgBaseGreenCover,
    avgSimGreenCover,
    totalAnnualSavingsUsd,
    totalInvestmentCost,
    paybackPeriodYears,
  } = summary;

  const tempReduced = avgLstDiff < 0;
  const loadReduced = coolingLoadSavedMWh > 0;
  const greenIncreased = avgSimGreenCover > avgBaseGreenCover;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Zone Temperature Card */}
      <div id="metric-temp" className="bg-[#1e293b] rounded-xl border border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between text-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Avg Surface Temp</span>
          <div className={`p-2 rounded-lg ${tempReduced ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-700/50 text-slate-300'}`}>
            <Thermometer className="w-5 h-5" />
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">
            {avgSimLST.toFixed(1)}°C
          </span>
          <span className="text-xs text-slate-500 font-mono line-through">
            {avgBaseLST.toFixed(1)}°C
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">Peak Thermal Delta</span>
          {tempReduced ? (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowDown className="w-3.5 h-3.5" />
              {Math.abs(avgLstDiff).toFixed(2)}°C
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              Unchanged
            </span>
          )}
        </div>
      </div>

      {/* 2. Peak Cooling Load Card */}
      <div id="metric-cooling" className="bg-[#1e293b] rounded-xl border border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between text-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Cooling Load Demand</span>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">
            {totalSimCoolingMWh.toFixed(1)} <span className="text-sm font-normal text-slate-400">MWh</span>
          </span>
          <span className="text-xs text-slate-500 font-mono line-through">
            {totalBaseCoolingMWh.toFixed(1)} MWh
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">Cooling Load Saved</span>
          {loadReduced ? (
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowDown className="w-3.5 h-3.5" />
              {pctCoolingLoadSaved.toFixed(1)}% ({coolingLoadSavedMWh.toFixed(1)} MWh)
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              0% Reduction
            </span>
          )}
        </div>
      </div>

      {/* 3. Combined Green Cover Card */}
      <div id="metric-green" className="bg-[#1e293b] rounded-xl border border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between text-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Urban Green Cover</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Leaf className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">
            {avgSimGreenCover.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-500 font-mono">
            base: {avgBaseGreenCover.toFixed(1)}%
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">Total Ecological Expansion</span>
          {greenIncreased ? (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUp className="w-3.5 h-3.5" />
              +{ (avgSimGreenCover - avgBaseGreenCover).toFixed(1) }%
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              Baseline
            </span>
          )}
        </div>
      </div>

      {/* 4. Financial Optimization Card */}
      <div id="metric-finance" className="bg-[#1e293b] rounded-xl border border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between text-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Annual Grid Savings</span>
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 animate-pulse">
          <span className="text-2xl font-bold tracking-tight text-emerald-400">
            ${totalAnnualSavingsUsd.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            / yr
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <CalendarRange className="w-3 h-3 text-slate-500" /> Payback Period
          </span>
          {totalInvestmentCost > 0 && totalAnnualSavingsUsd > 0 ? (
            <span className="text-xs font-semibold text-emerald-300 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full">
              {paybackPeriodYears !== null ? `${paybackPeriodYears} Years` : 'N/A'}
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded-full">
              No Investment
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
