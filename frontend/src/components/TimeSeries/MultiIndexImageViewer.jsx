import React from 'react';
import { MULTI_INDEX_CONFIG } from '../../utils/constants';

const MultiIndexImageViewer = ({ data, year }) => {
  const imageData = [
    {
      key: 'NDVI',
      url: data.ndvi_image_url,
      config: MULTI_INDEX_CONFIG.INDICES.NDVI
    },
    {
      key: 'WETNESS',
      url: data.wetness_image_url,
      config: MULTI_INDEX_CONFIG.INDICES.WETNESS
    },
    {
      key: 'DRYNESS',
      url: data.dryness_image_url,
      config: MULTI_INDEX_CONFIG.INDICES.DRYNESS
    },
    {
      key: 'HEAT',
      url: data.heat_image_url,
      config: MULTI_INDEX_CONFIG.INDICES.HEAT
    }
  ];

  const handleImageError = (e, url, name) => {
    e.target.style.display = 'none';
    e.target.nextSibling?.remove();
    const fallback = document.createElement('div');
    fallback.className = 'w-full h-24 bg-gray-200 rounded flex items-center justify-center text-gray-500';
    fallback.innerHTML = `<div class="text-center text-xs"><p>${name}</p><p>Loading failed</p><a href="${url}" target="_blank" class="text-blue-600 underline">Open</a></div>`;
    e.target.parentNode.insertBefore(fallback, e.target.nextSibling);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {imageData.map(({ key, url, config }) => (
        <div key={key} className="space-y-1">
          <div className="flex items-center space-x-1">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: config.color }}
            ></div>
            <span className="text-xs font-medium">{config.name}</span>
          </div>
          {url && (
            <img
              src={url}
              alt={`${config.name} for ${year}`}
              className="w-full h-24 object-cover rounded"
              onError={(e) => handleImageError(e, url, config.name)}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          )}
          {!url && (
            <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
              No {config.name} data
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MultiIndexImageViewer;