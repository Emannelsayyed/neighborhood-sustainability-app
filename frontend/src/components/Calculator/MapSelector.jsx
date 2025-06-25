import React, { useEffect, useRef, useState } from "react";
import { MAP_CONFIG } from "../../utils/constants";
import ApiService from "../../services/api";

const MapSelector = ({
  onPolygonSelected,
  onAreaCalculated,
  onSatelliteImage,
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [drawControl, setDrawControl] = useState(null);
  const [drawnItems, setDrawnItems] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [area, setArea] = useState(null);
  const [satelliteImageUrl, setSatelliteImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingLayer, setPendingLayer] = useState(null);

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
      // Load Leaflet CSS
      const leafletCSS = document.createElement("link");
      leafletCSS.rel = "stylesheet";
      leafletCSS.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(leafletCSS);

      // Load Leaflet Draw CSS
      const drawCSS = document.createElement("link");
      drawCSS.rel = "stylesheet";
      drawCSS.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css";
      document.head.appendChild(drawCSS);

      // Load Leaflet JS
      const leafletJS = document.createElement("script");
      leafletJS.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      leafletJS.onload = () => {
        // Load Leaflet Draw JS after Leaflet is loaded
        const drawJS = document.createElement("script");
        drawJS.src =
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js";
        drawJS.onload = initMap;
        document.head.appendChild(drawJS);
      };
      document.head.appendChild(leafletJS);
    } else if (window.L.Control && window.L.Control.Draw) {
      initMap();
    } else {
      // Leaflet exists but Draw doesn't, load Draw
      const drawCSS = document.createElement("link");
      drawCSS.rel = "stylesheet";
      drawCSS.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css";
      document.head.appendChild(drawCSS);

      const drawJS = document.createElement("script");
      drawJS.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js";
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
      MAP_CONFIG.DEFAULT_CENTER.reverse(),
      MAP_CONFIG.DEFAULT_ZOOM
    );

    // Base layers
    const osmLayer = window.L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap contributors",
      }
    );

    const satelliteLayer = window.L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "© Esri",
      }
    );

    const hybridLayer = window.L.layerGroup([
      satelliteLayer,
      window.L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "© Esri",
        }
      ),
    ]);

    // Add default layer
    osmLayer.addTo(newMap);

    // Layer control
    const baseLayers = {
      OpenStreetMap: osmLayer,
      Satellite: satelliteLayer,
      Hybrid: hybridLayer,
    };
    window.L.control.layers(baseLayers).addTo(newMap);

    const drawnItemsLayer = new window.L.FeatureGroup();
    newMap.addLayer(drawnItemsLayer);

    const drawControl = new window.L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: "#e1e100",
            message: "<strong>Error:</strong> Shape edges cannot cross!",
          },
          shapeOptions: {
            color: "#97009c",
          },
        },
        rectangle: true,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
      },
      edit: {
        featureGroup: drawnItemsLayer,
        remove: true,
      },
    });

    newMap.addControl(drawControl);

    newMap.on(window.L.Draw.Event.CREATED, (e) => {
      const { layer } = e;
      drawnItemsLayer.clearLayers();
      drawnItemsLayer.addLayer(layer);
      handleLayerCreated(layer);
    });

    newMap.on(window.L.Draw.Event.DELETED, () => {
      clearData();
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
      processDrawnLayerLocal(pendingLayer);
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

  const processDrawnLayerLocal = async (layer) => {
    setLoading(true);
    try {
      let coords;

      if (layer instanceof window.L.Polygon) {
        coords = layer
          .getLatLngs()[0]
          .map((latLng) => [latLng.lng, latLng.lat]);
      } else if (layer instanceof window.L.Rectangle) {
        const bounds = layer.getBounds();
        coords = [
          [bounds.getWest(), bounds.getSouth()],
          [bounds.getEast(), bounds.getSouth()],
          [bounds.getEast(), bounds.getNorth()],
          [bounds.getWest(), bounds.getNorth()],
        ];
      }

      if (coords && coords.length >= 3) {
        const closedCoords = [...coords, coords[0]];
        setCoordinates(closedCoords);

        const areaResult = await ApiService.calculateArea(closedCoords);
        setArea(areaResult);
        onAreaCalculated?.(areaResult);

        const imageResult = await ApiService.getSatelliteImage(
          closedCoords,
          MAP_CONFIG.SATELLITE_IMAGE_DIMENSIONS.width,
          MAP_CONFIG.SATELLITE_IMAGE_DIMENSIONS.height
        );
        setSatelliteImageUrl(imageResult.image_url);
        onSatelliteImage?.(imageResult.image_url);

        onPolygonSelected(closedCoords);
      }
    } catch (error) {
      console.error("Error processing polygon:", error);
      alert("Error processing polygon: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setCoordinates([]);
    setArea(null);
    setSatelliteImageUrl("");
    if (drawnItems) {
      drawnItems.clearLayers();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Select Area</h3>
        {loading && (
          <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-lg z-[10000]">
              <svg
                className="animate-spin h-6 w-6 text-blue-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span className="text-base font-medium text-blue-700">
                Processing...
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div
          ref={mapRef}
          className="w-full h-96 rounded border"
          style={{ minHeight: "400px" }}
        />
        <p className="text-sm text-gray-600 mt-2">
          Use the drawing tools on the map to select a polygon or rectangle
          area.
          {coordinates.length > 0 &&
            ` Selected area: ${coordinates.length - 1} points`}
        </p>
      </div>

      {area && (
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <h4 className="font-medium text-blue-800 mb-2">Area Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-blue-600">Square Meters:</span>
              <div className="font-bold">
                {area.area_sqm.toLocaleString()} m²
              </div>
            </div>
            <div>
              <span className="text-sm text-blue-600">Square Kilometers:</span>
              <div className="font-bold">{area.area_sqkm.toFixed(3)} km²</div>
            </div>
          </div>
        </div>
      )}

      {satelliteImageUrl && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-800 mb-2">Satellite Preview</h4>
          <img
            src={satelliteImageUrl}
            alt="Satellite view of selected area"
            className="w-full max-w-md mx-auto rounded border"
          />
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-lg z-[10000]">
            <h3 className="text-lg font-semibold mb-4">
              Confirm Area Selection
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to analyze this selected area?
            </p>

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

export default MapSelector;
