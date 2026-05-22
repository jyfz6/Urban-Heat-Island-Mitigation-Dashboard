import React from 'react';
import { CityZoneID } from '../types';
import { Leaf, Thermometer, Building2, AppWindow, Globe, Compass } from 'lucide-react';

interface HeaderProps {
  currentZoneId: CityZoneID;
  onZoneChange: (zoneId: CityZoneID) => void;
  zoneName: string;
  zoneDesc: string;
}

export function Header({ currentZoneId, onZoneChange, zoneName, zoneDesc }: HeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white p-5 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400 shadow-inner">
            <Leaf className="w-6 h-6 absolute animate-pulse opacity-40 text-teal-500" />
            <Thermometer className="w-5 h-5 z-10 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">PRD SPEC COMPLIANT</span>
              <span className="text-xs font-mono text-slate-400">v1.2.0</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              UrbanCool<span className="text-emerald-400 font-normal">::Mitigation</span>
              <span className="text-slate-400 font-normal text-sm hidden sm:inline">| Urban Heat & Energy Simulator</span>
            </h1>
          </div>
        </div>

        {/* Sector Selection Control */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-slate-400" />
            <label htmlFor="zoneSelect" className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              Target District:
            </label>
          </div>
          <div className="relative">
            <select
              id="zoneSelect"
              value={currentZoneId}
              onChange={(e) => onZoneChange(e.target.value as CityZoneID)}
              className="appearance-none bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg py-2 pl-4 pr-10 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer shadow-lg min-w-[240px]"
            >
              <option value="zone-a">🌆 Zone A (Downtown Core)</option>
              <option value="zone-b">🏭 Zone B (Industrial District)</option>
              <option value="zone-c">🏡 Zone C (Residential Suburbs)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Selected District Subtitle description */}
      <div className="max-w-7xl mx-auto mt-4 px-4 py-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-start gap-2.5">
        <div className="mt-0.5 text-teal-400">
          <Building2 className="w-4 h-4" />
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          <strong className="text-slate-200">{zoneName}: </strong>
          {zoneDesc}
        </p>
      </div>
    </header>
  );
}
