// Replace the entire TimeSeriesAnalyzer.jsx file with this updated version

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Play } from 'lucide-react';
import YearSelector from './YearSelector';
import TimeSeriesResults from './TimeSeriesResults';
import ApiService from '../../services/api';
import { UI_CONSTANTS, MAP_CONFIG } from '../../utils/constants';

const TimeSeriesAnalyzer = () => {
  const [selectedYears, setSelectedYears] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  
  // Map-related state from MapSelector
  const [map, setMap] = useState(null);
  const [drawControl, setDrawControl] = useState(null);
  const [drawnItems, setDrawnItems] = useState(null);
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingLayer, setPendingLayer] = useState(null);

  const handleYearsChange = (years) => {
    setSelectedYears(years);
    setResults(null);
    setError('');
  };

  // Map initialization from MapSelector
  useEffect(() => {
    loadLeafletResources();
    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, []);

  const loadLeafletResources = () => {
    if (!window.L) {
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(leafletCSS);

      const drawCSS = document.createElement('link');
      drawCSS.rel = 'stylesheet';
      drawCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css';
      document.head.appendChild(drawCSS);

      const leafletJS = document.createElement('script');
      leafletJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      leafletJS.onload = () => {
        const drawJS = document.createElement('script');
        drawJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js';
        drawJS.onload = initMap;
        document.head.appendChild(drawJS);
      };
      document.head.appendChild(leafletJS);
    } else if (window.L.Control && window.L.Control.Draw) {
      initMap();
    } else {
      const drawCSS = document.createElement('link');
      drawCSS.rel = 'stylesheet';
      drawCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css';
      document.head.appendChild(drawCSS);

      const drawJS = document.createElement('script');
      drawJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js';
      drawJS.onload = initMap;
      document.head.appendChild(drawJS);
    }
  };

  const initMap = () => {
    if (!mapRef.current || map || !window.L || !window.L.Control.Draw) return;

    if (mapRef.current._leaflet_id) {
      return;
    }

    const newMap = window.L.map(mapRef.current).setView(
      MAP_CONFIG.DEFAULT_CENTER.slice().reverse(),
      MAP_CONFIG.DEFAULT_ZOOM
    );

    const osmLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });

    const satelliteLayer = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri'
    });

    osmLayer.addTo(newMap);

    const baseLayers = {
      "OpenStreetMap": osmLayer,
      "Satellite": satelliteLayer
    };
    window.L.control.layers(baseLayers).addTo(newMap);

    const drawnItemsLayer = new window.L.FeatureGroup();
    newMap.addLayer(drawnItemsLayer);

    const drawControl = new window.L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Error:</strong> Shape edges cannot cross!'
          },
          shapeOptions: {
            color: '#97009c'
          }
        },
        rectangle: true,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false
      },
      edit: {
        featureGroup: drawnItemsLayer,
        remove: true
      }
    });

    newMap.addControl(drawControl);

    newMap.on(window.L.Draw.Event.CREATED, (e) => {
      const { layer } = e;
      drawnItemsLayer.clearLayers();
      drawnItemsLayer.addLayer(layer);
      handleLayerCreated(layer);
    });

    newMap.on(window.L.Draw.Event.DELETED, () => {
      clearSelection();
      setShowConfirmation(false);
    });

    newMap.on(window.L.Draw.Event.EDITED, (e) => {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        handleLayerCreated(layer);
      });
    });

    setDrawnItems(drawnItemsLayer);
    setDrawControl(drawControl);
    setMap(newMap);
  };

  const handleLayerCreated = (layer) => {
    setPendingLayer(layer);
    setShowConfirmation(true);
  };

  const handleConfirmSelection = () => {
    if (pendingLayer) {
      processDrawnLayer(pendingLayer);
      setShowConfirmation(false);
      setPendingLayer(null);
    }
  };

  const handleCancelSelection = () => {
    if (drawnItems && pendingLayer) {
      drawnItems.removeLayer(pendingLayer);
    }
    setShowConfirmation(false);
    setPendingLayer(null);
  };

  const processDrawnLayer = async (layer) => {
    setLoading(true);
    try {
      let coords;
      
      if (layer instanceof window.L.Polygon) {
        coords = layer.getLatLngs()[0].map(latLng => [latLng.lng, latLng.lat]);
      } else if (layer instanceof window.L.Rectangle) {
        const bounds = layer.getBounds();
        coords = [
          [bounds.getWest(), bounds.getSouth()],
          [bounds.getEast(), bounds.getSouth()],
          [bounds.getEast(), bounds.getNorth()],
          [bounds.getWest(), bounds.getNorth()]
        ];
      }

      if (coords && coords.length >= 3) {
        const closedCoords = [...coords, coords[0]];
        setCoordinates(closedCoords);

        const areaResult = await ApiService.calculateArea(closedCoords);
        setArea(areaResult);
      }
    } catch (error) {
      console.error('Error processing polygon:', error);
      setError('Error processing polygon: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setCoordinates([]);
    setArea(null);
    setResults(null);
    setError('');
    if (drawnItems) {
      drawnItems.clearLayers();
    }
  };

  const analyzeTimeSeries = async () => {
    if (selectedYears.length === 0) {
      setError('Please select at least one year');
      return;
    }
    if (coordinates.length < 3) {
      setError('Please select an area on the map using the drawing tools');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const data = {
        polygon: { coordinates: coordinates },
        years: selectedYears
      };

      const result = await ApiService.analyzeTimeSeries(data);
      setResults(result);
    } catch (err) {
      setError(err.message || UI_CONSTANTS.ERROR_MESSAGES.TIMESERIES_FAILED);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Time Series Environmental Analysis</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <YearSelector 
              selectedYears={selectedYears} 
              onYearsChange={handleYearsChange} 
            />
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Area
              </label>
              {area && (
                <div className="text-sm text-gray-600 mb-2">
                  Area: {(area.area_sqkm).toFixed(3)} km² ({coordinates.length - 1} points)
                </div>
              )}
              <button
                onClick={clearSelection}
                disabled={coordinates.length === 0}
                className="text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
              >
                Clear Selection
              </button>
            </div>
            
            <button
              onClick={analyzeTimeSeries}
              disabled={isAnalyzing || selectedYears.length === 0 || coordinates.length < 3}
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{UI_CONSTANTS.LOADING_MESSAGES.ANALYZING_TIMESERIES}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Analyze Time Series</span>
                </>
              )}
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Select Analysis Area
            </label>
            <div ref={mapRef} className="h-64 rounded-lg border"></div>
            <p className="text-xs text-gray-500 mt-1">
              Use the drawing tools on the map to select a polygon or rectangle area
            </p>
            {loading && (
              <div className="text-sm text-blue-600 mt-1">Processing area...</div>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
      
      {results && <TimeSeriesResults results={results} />}
      
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Area Selection</h3>
            <p className="text-gray-600 mb-6">Use this area for time series analysis?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelSelection}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSeriesAnalyzer;