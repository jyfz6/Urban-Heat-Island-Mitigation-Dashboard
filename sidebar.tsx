import React from 'react';
import { SimParameters, CityZoneID } from '../types';
import { Settings, Sliders, Play, TrendingDown, DollarSign, Leaf, HelpCircle, Flame, Sparkles } from 'lucide-react';

interface SidebarProps {
  params: SimParameters;
  onParamsChange: (newParams: SimParameters) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
  currentZoneId: CityZoneID;
  onZoneChange: (zoneId: CityZoneID) => void;
}

export function Sidebar({
  params,
  onParamsChange,
  onRunSimulation,
  isSimulating,
  currentZoneId,
  onZoneChange,
}: SidebarProps) {

  // Specific preset multipliers to make testing extremely seamless
  const applyPreset = (roof: number, canopy: number) => {
    onParamsChange({
      ...params,
      greenRoofPct: roof,
      treeCanopyPct: canopy
    });
  };

  const handleSliderChange = (name: keyof SimParameters, val: number) => {
    onParamsChange({
      ...params,
      [name]: val
    });
  };

  return (
    <div className="bg-[#1e293b] text-white rounded-xl border border-slate-700 p-5 shadow-lg flex flex-col gap-6">
      
      {/* Title & Setup section */}
      <div>
        <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2 mb-1">
          <Settings className="w-4 h-4 text-emerald-400 rotate-90" />
          Simulation Parameters
        </h2>
        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
          Configure micro-climactic indicators to test green retrofitting impacts against urban heat island indices.
        </p>
      </div>

      <div className="space-y-4">
        {/* District selector duplicates header dropdown for strict layout parity */}
        <div className="space-y-1.5">
          <label htmlFor="sidebarZone" className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Target City Zone:
          </label>
          <select
            id="sidebarZone"
            value={currentZoneId}
            onChange={(e) => onZoneChange(e.target.value as CityZoneID)}
            className="w-full bg-slate-800 border border-slate-750 hover:border-slate-600 rounded-lg py-2 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="zone-a">🌆 Zone A (Downtown Core)</option>
            <option value="zone-b">🏭 Zone B (Industrial Corridor)</option>
            <option value="zone-c">🏡 Zone C (Residential Suburbs)</option>
          </select>
        </div>

        <hr className="border-slate-850" />

        {/* SLIDER 1: ADD GREEN ROOF COVERAGE */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label htmlFor="greenRoofPct" className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Add Green Roofs (%)
            </label>
            <span className="text-sm font-mono font-bold text-white bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
              {params.greenRoofPct}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal font-sans">
            Convert eligible flat roof surfaces of commercial, industrial, and multi-family structures into insulated vegetation nodes.
          </p>
          <input
            id="greenRoofPct"
            type="range"
            min="0"
            max="100"
            step="5"
            value={params.greenRoofPct}
            onChange={(e) => handleSliderChange('greenRoofPct', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* SLIDER 2: ADD STREET TREE CANOPY */}
        <div className="space-y-2 pt-1.5">
          <div className="flex justify-between items-baseline">
            <label htmlFor="treeCanopyPct" className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wide flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block"></span>
              Add Tree Canopy (%)
            </label>
            <span className="text-sm font-mono font-bold text-white bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
              {params.treeCanopyPct}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal font-sans">
            Plant mature deciduous shade trees along residential corridors, sidewalks, park margins, and street-level parking sectors.
          </p>
          <input
            id="treeCanopyPct"
            type="range"
            min="0"
            max="100"
            step="5"
            value={params.treeCanopyPct}
            onChange={(e) => handleSliderChange('treeCanopyPct', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        <hr className="border-slate-800" />

        {/* FINANCIALS PANEL */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-3">
          <h3 className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-slate-400" /> Financial Constants
          </h3>
          
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-baseline text-slate-300">
              <label htmlFor="energyCost" className="text-[10px] font-mono">Grid Rate ($/kWh):</label>
              <span className="text-[10px] font-mono text-white font-bold">${params.energyCostPerKwh.toFixed(2)}</span>
            </div>
            <input
              id="energyCost"
              type="range"
              min="0.08"
              max="0.32"
              step="0.01"
              value={params.energyCostPerKwh}
              onChange={(e) => handleSliderChange('energyCostPerKwh', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="space-y-1 text-xs font-mono text-[9px] text-slate-400">
            <div className="flex justify-between">
              <span>Roof Install rate:</span>
              <span className="text-slate-300">${params.greenRoofCostSqm}/m²</span>
            </div>
            <div className="flex justify-between">
              <span>Tree Unit cost:</span>
              <span className="text-slate-300">${params.treeCostPerUnit} /tree</span>
            </div>
          </div>
        </div>

        {/* QUICK PRESETS SECTION */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-400" /> Retrofit Standard Initiatives
          </span>
          <div className="grid grid-cols-1 gap-1.5 text-[10px] font-semibold font-mono">
            <button
              onClick={() => applyPreset(40, 0)}
              className="bg-slate-800 hover:bg-slate-700/85 text-slate-200 py-1.5 px-3.5 rounded border border-slate-700 text-left transition-colors truncate"
            >
              🌿 Cool Roof Target (+40% Roofs)
            </button>
            <button
              onClick={() => applyPreset(0, 60)}
              className="bg-slate-800 hover:bg-slate-700/85 text-slate-200 py-1.5 px-3.5 rounded border border-slate-700 text-left transition-colors truncate"
            >
              🌲 Canopy Drive (+60% Trees)
            </button>
            <button
              onClick={() => applyPreset(50, 50)}
              className="bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/20 text-emerald-300 py-1.5 px-3.5 rounded text-left transition-colors truncate"
            >
              🚀 Aggressive Ecological Overhaul (50/50)
            </button>
          </div>
        </div>

        {/* CORE DISCOVERY TRIGGER */}
        <button
          onClick={onRunSimulation}
          disabled={isSimulating}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-700 text-slate-950 font-bold font-mono py-3 px-5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-4 cursor-pointer"
        >
          {isSimulating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950"></div>
              <span>REGRESSION LOADING...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-slate-950" />
              <span>RUN HEAT SIMULATION</span>
            </>
          )}
        </button>

      </div>
      
      {/* Simulation modeling explanation card */}
      <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg mt-auto text-[10px] text-slate-400 space-y-1.5 font-sans">
        <h4 className="font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-500" /> Physical Regression Model
        </h4>
        <p className="leading-relaxed">
          The simulated environment couples local solar radiance and floor area index (FAR). Interventions use the following linear predictors:
        </p>
        <ul className="list-disc pl-3 space-y-1 font-mono text-[9px] text-emerald-400">
          <li>10% general greenery reduces surface temp by 0.5°C</li>
          <li>10% greenery cuts localized EUI HVAC load component by 12%</li>
          <li>Commercial/Industrial flat roofs receive structural insulation modifiers</li>
        </ul>
      </div>

    </div>
  );
}
