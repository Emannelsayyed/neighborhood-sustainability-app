import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { TIMESERIES_CONFIG } from '../../utils/constants';

const YearSelector = ({ selectedYears, onYearsChange }) => {
  const [selectionMode, setSelectionMode] = useState('multiple');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: currentYear - TIMESERIES_CONFIG.AVAILABLE_YEARS.START + 1 }, 
    (_, i) => currentYear - i
  );

  const handleSingleYearSelect = (year) => {
    onYearsChange([parseInt(year)]);
  };

  const handleMultipleYearToggle = (year) => {
    const yearNum = parseInt(year);
    const newYears = selectedYears.includes(yearNum)
      ? selectedYears.filter(y => y !== yearNum)
      : [...selectedYears, yearNum].sort((a, b) => b - a);
    onYearsChange(newYears);
  };

  const handleRangeSelect = () => {
    if (rangeStart && rangeEnd) {
      const start = parseInt(rangeStart);
      const end = parseInt(rangeEnd);
      const min = Math.min(start, end);
      const max = Math.max(start, end);
      const rangeYears = Array.from({ length: max - min + 1 }, (_, i) => max - i);
      onYearsChange(rangeYears);
    }
  };

  const removeYear = (yearToRemove) => {
    onYearsChange(selectedYears.filter(year => year !== yearToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-4 h-4 text-gray-600" />
        <label className="text-sm font-medium text-gray-700">Select Years for Analysis</label>
      </div>

      <div className="flex space-x-4 mb-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="selectionMode"
            value="single"
            checked={selectionMode === 'single'}
            onChange={(e) => setSelectionMode(e.target.value)}
            className="mr-2"
          />
          <span className="text-sm">Single Year</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="selectionMode"
            value="multiple"
            checked={selectionMode === 'multiple'}
            onChange={(e) => setSelectionMode(e.target.value)}
            className="mr-2"
          />
          <span className="text-sm">Multiple Years</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="selectionMode"
            value="range"
            checked={selectionMode === 'range'}
            onChange={(e) => setSelectionMode(e.target.value)}
            className="mr-2"
          />
          <span className="text-sm">Year Range</span>
        </label>
      </div>

      {selectionMode === 'single' && (
        <select
          onChange={(e) => handleSingleYearSelect(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          defaultValue=""
        >
          <option value="">Select a year</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      )}

      {selectionMode === 'multiple' && (
        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
          {availableYears.map(year => (
            <label key={year} className="flex items-center p-1 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selectedYears.includes(year)}
                onChange={() => handleMultipleYearToggle(year)}
                className="mr-2"
              />
              <span className="text-sm">{year}</span>
            </label>
          ))}
        </div>
      )}

      {selectionMode === 'range' && (
        <div className="flex space-x-2">
          <select
            value={rangeStart}
            onChange={(e) => setRangeStart(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Start Year</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={rangeEnd}
            onChange={(e) => setRangeEnd(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg"
          >
            <option value="">End Year</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={handleRangeSelect}
            disabled={!rangeStart || !rangeEnd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
          >
            Select
          </button>
        </div>
      )}

      {selectedYears.length > 0 && (
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Selected Years ({selectedYears.length}):
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedYears.map(year => (
              <span
                key={year}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {year}
                <button
                  onClick={() => removeYear(year)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YearSelector;