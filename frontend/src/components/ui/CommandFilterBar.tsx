import React, { useState } from 'react';
import { Calendar, Filter, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { FilterOptions } from '../../types';

interface CommandFilterBarProps {
  filters: FilterOptions | null;
  selectedPreset: string;
  onSelectPreset: (presetId: string) => void;
  selectedZones: string[];
  onChangeZones: (zones: string[]) => void;
  selectedBanks: string[];
  onChangeBanks: (banks: string[]) => void;
  selectedManufacturers: string[];
  onChangeManufacturers: (mfg: string[]) => void;
  onReset: () => void;
}

export const CommandFilterBar: React.FC<CommandFilterBarProps> = ({
  filters,
  selectedPreset,
  onSelectPreset,
  selectedZones,
  onChangeZones,
  selectedBanks,
  onChangeBanks,
  selectedManufacturers,
  onChangeManufacturers,
  onReset,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleToggleItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const activeFilterCount =
    (selectedZones.length > 0 ? 1 : 0) +
    (selectedBanks.length > 0 ? 1 : 0) +
    (selectedManufacturers.length > 0 ? 1 : 0);

  return (
    <div className="w-full bg-[#131B2E]/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/20 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-wrap items-center justify-between gap-4">
      {/* Date Presets Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] mr-2">
          <Calendar className="w-4 h-4" />
          <span>WINDOW:</span>
        </div>
        {filters?.presets.map((preset) => {
          const isActive = selectedPreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#D4AF37] text-[#0B0F19] font-bold border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                  : 'bg-[#0B0F19]/60 text-[#94A3B8] border-[#1E293B] hover:border-[#D4AF37]/50 hover:text-[#E2E8F0]'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Drill-Down Filter Popovers */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Zone Filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('zones')}
            className={`flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
              selectedZones.length > 0
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40'
                : 'bg-[#0B0F19]/60 text-[#E2E8F0] border-[#1E293B] hover:border-[#D4AF37]/40'
            }`}
          >
            <span>
              Zones: {selectedZones.length === 0 ? `All (${filters?.zones.length || 0})` : `${selectedZones.length} selected`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>
          {openDropdown === 'zones' && (
            <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#0B0F19] border border-[#D4AF37]/40 shadow-2xl p-2 z-50">
              <div className="text-[11px] font-semibold text-[#D4AF37] px-2 py-1 uppercase tracking-wider">
                Select Floor Zones
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filters?.zones.map((zone) => {
                  const checked = selectedZones.includes(zone);
                  return (
                    <button
                      key={zone}
                      onClick={() => handleToggleItem(selectedZones, zone, onChangeZones)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                        checked ? 'bg-[#10B981]/20 text-[#10B981]' : 'text-[#94A3B8] hover:bg-[#131B2E]'
                      }`}
                    >
                      <span>{zone}</span>
                      {checked && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bank Filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('banks')}
            className={`flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
              selectedBanks.length > 0
                ? 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/40'
                : 'bg-[#0B0F19]/60 text-[#E2E8F0] border-[#1E293B] hover:border-[#D4AF37]/40'
            }`}
          >
            <span>
              Banks: {selectedBanks.length === 0 ? `All (${filters?.banks.length || 0})` : `${selectedBanks.length} selected`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>
          {openDropdown === 'banks' && (
            <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#0B0F19] border border-[#D4AF37]/40 shadow-2xl p-2 z-50">
              <div className="text-[11px] font-semibold text-[#D4AF37] px-2 py-1 uppercase tracking-wider">
                Select Machine Banks
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filters?.banks.map((bank) => {
                  const checked = selectedBanks.includes(bank);
                  return (
                    <button
                      key={bank}
                      onClick={() => handleToggleItem(selectedBanks, bank, onChangeBanks)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                        checked ? 'bg-[#06B6D4]/20 text-[#06B6D4]' : 'text-[#94A3B8] hover:bg-[#131B2E]'
                      }`}
                    >
                      <span>{bank}</span>
                      {checked && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Manufacturer Filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('mfg')}
            className={`flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
              selectedManufacturers.length > 0
                ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40'
                : 'bg-[#0B0F19]/60 text-[#E2E8F0] border-[#1E293B] hover:border-[#D4AF37]/40'
            }`}
          >
            <span>
              Manufacturers:{' '}
              {selectedManufacturers.length === 0
                ? `All (${filters?.manufacturers.length || 0})`
                : `${selectedManufacturers.length} selected`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>
          {openDropdown === 'mfg' && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0B0F19] border border-[#D4AF37]/40 shadow-2xl p-2 z-50">
              <div className="text-[11px] font-semibold text-[#D4AF37] px-2 py-1 uppercase tracking-wider">
                Select Manufacturers
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filters?.manufacturers.map((mfg) => {
                  const checked = selectedManufacturers.includes(mfg);
                  return (
                    <button
                      key={mfg}
                      onClick={() => handleToggleItem(selectedManufacturers, mfg, onChangeManufacturers)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                        checked ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'text-[#94A3B8] hover:bg-[#131B2E]'
                      }`}
                    >
                      <span>{mfg}</span>
                      {checked && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30 hover:bg-[#F43F5E]/25 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

