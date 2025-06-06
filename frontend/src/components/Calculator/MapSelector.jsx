import React, { useEffect, useRef, useState, useCallback } from 'react';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const MapSelector = ({ onAreaSelected, onAnalyzeArea, analyzing }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawingLayerRef = useRef(null);
  const isInitializingRef = useRef(false);
  
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(true);

  // Memoized cleanup function
  const cleanupMap = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('Error during map cleanup:', e);
      }
      mapInstanceRef.current = null;
    }
    
    if (drawingLayerRef.current) {
      drawingLayerRef.current = null;
    }
    
    isInitializingRef.current = false;
  }, []);

  // Memoized initialization function
  const initializeMap = useCallback(async () => {
    // Prevent multiple initializations
    if (isInitializingRef.current || mapInstanceRef.current) {
      return;
    }
    
    if (!mapContainerRef.current) {
      return;
    }

    isInitializingRef.current = true;

    try {
      // Wait for Leaflet to load
      if (!window.L) {
        await loadLeafletLibraries();
      }

      // Create a clean container by replacing it
      const container = mapContainerRef.current;
      const parent = container.parentNode;
      const newContainer = container.cloneNode(false);
      parent.replaceChild(newContainer, container);
      mapContainerRef.current = newContainer;

      // Initialize map on the clean container
      const mapInstance = window.L.map(newContainer, {
        center: [40.7128, -74.0060], // Default to NYC
        zoom: 13,
        zoomControl: true
      });

      mapInstanceRef.current = mapInstance;

      // Add tile layers
      const osm = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      });

      const satellite = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      });

      const hybrid = window.L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google'
      });

      // Add default layer
      satellite.addTo(mapInstance);

      // Add layer control
      const baseMaps = {
        "Satellite": satellite,
        "Hybrid": hybrid,
        "OpenStreetMap": osm
      };
      
      window.L.control.layers(baseMaps).addTo(mapInstance);

      // Initialize drawing layer
      const drawingLayerInstance = window.L.layerGroup().addTo(mapInstance);
      drawingLayerRef.current = drawingLayerInstance;

      // Add drawing functionality
      enableDrawing(mapInstance, drawingLayerInstance);

      setMapLoaded(true);
      setError(null);

    } catch (err) {
      setError('Failed to load map. Please refresh the page.');
      console.error('Map initialization error:', err);
    } finally {
      isInitializingRef.current = false;
    }
  }, []);

  // Effect for initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeMap();
    }, 100); // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timer);
      cleanupMap();
    };
  }, [initializeMap, cleanupMap]);

  const loadLeafletLibraries = () => {
    return new Promise((resolve, reject) => {
      if (window.L) {
        resolve();
        return;
      }

      // Load Leaflet CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Load Leaflet Draw plugin
        const drawCss = document.createElement('link');
        drawCss.rel = 'stylesheet';
        drawCss.href = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
        document.head.appendChild(drawCss);

        const drawScript = document.createElement('script');
        drawScript.src = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js';
        drawScript.onload = resolve;
        drawScript.onerror = reject;
        document.head.appendChild(drawScript);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const enableDrawing = (mapInstance, layerGroup) => {
    // Create feature group for editable layers
    const editableLayers = new window.L.FeatureGroup();
    mapInstance.addLayer(editableLayers);

    // Initialize draw control
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
            color: '#ff0000',
            fillColor: '#ff0000',
            fillOpacity: 0.3,
            weight: 2
          }
        },
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false
      },
      edit: {
        featureGroup: editableLayers,
        remove: true
      }
    });

    mapInstance.addControl(drawControl);

    // Handle draw events
    mapInstance.on(window.L.Draw.Event.CREATED, (event) => {
      const layer = event.layer;
      
      // Clear previous polygon
      editableLayers.clearLayers();
      layerGroup.clearLayers();
      
      // Add new polygon
      editableLayers.addLayer(layer);
      layerGroup.addLayer(layer);
      setCurrentPolygon(layer);
      
      // Extract coordinates
      if (layer instanceof window.L.Polygon) {
        const latLngs = layer.getLatLngs()[0]; // Get outer ring
        const coords = latLngs.map(latLng => ({
          lat: latLng.lat,
          lng: latLng.lng
        }));
        
        setCoordinates(coords);
        onAreaSelected(coords);
        setIsDrawing(false);
      }
    });

    mapInstance.on(window.L.Draw.Event.EDITED, (event) => {
      const layers = event.layers;
      layers.eachLayer((layer) => {
        if (layer instanceof window.L.Polygon) {
          const latLngs = layer.getLatLngs()[0];
          const coords = latLngs.map(latLng => ({
            lat: latLng.lat,
            lng: latLng.lng
          }));
          
          setCoordinates(coords);
          onAreaSelected(coords);
        }
      });
    });

    mapInstance.on(window.L.Draw.Event.DELETED, (event) => {
      setCoordinates([]);
      setCurrentPolygon(null);
      onAreaSelected([]);
      setIsDrawing(true);
    });
  };

  const clearSelection = () => {
    if (drawingLayerRef.current) {
      drawingLayerRef.current.clearLayers();
    }
    if (mapInstanceRef.current && mapInstanceRef.current.pm) {
      mapInstanceRef.current.pm.removeControls();
    }
    setCoordinates([]);
    setCurrentPolygon(null);
    onAreaSelected([]);
    setIsDrawing(true);
  };

  const handleAnalyzeArea = () => {
    if (coordinates.length >= 3) {
      const boundsData = {
        bounds: {
          geometry: {
            coordinates: coordinates
          },
          name: "Selected Area",
          description: "User-selected area for sustainability analysis"
        },
        include_satellite_data: true
      };
      onAnalyzeArea(boundsData);
    }
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Select Area on Map</h3>
        <div className="space-x-2">
          {coordinates.length >= 3 && (
            <>
              <button
                onClick={handleAnalyzeArea}
                disabled={analyzing}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {analyzing ? <LoadingSpinner size="small" /> : 'Analyze Area'}
              </button>
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Clear Selection
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Click the polygon tool in the top-right corner to draw your area of interest. 
          Click multiple points to create a shape, then click the first point again to complete it.
        </p>
        {coordinates.length >= 3 && (
          <p className="text-sm text-green-600 mt-2">
            ✓ Area selected with {coordinates.length} points. Click "Analyze Area" to get satellite data.
          </p>
        )}
      </div>

      <div className="relative">
        <div
          ref={mapContainerRef}
          className="w-full h-96 rounded-lg border-2 border-gray-300"
          style={{ minHeight: '400px' }}
        />
        
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-2 text-gray-600">Loading Map...</p>
            </div>
          </div>
        )}
      </div>

      {coordinates.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Selected Coordinates:</h4>
          <div className="max-h-32 overflow-y-auto text-xs text-gray-600">
            {coordinates.map((coord, index) => (
              <div key={index}>
                Point {index + 1}: {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSelector;