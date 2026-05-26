import { useState, useEffect, useRef } from 'react';

const Map = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading AQI data...');
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const infoWindows = useRef([]);
  const aqiMarkers = useRef([]);
  const userLocationMarker = useRef(null);

  // API Keys (Note: In production, these should be stored securely)
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const WAQI_API_KEY = import.meta.env.VITE_WAQI_API_KEY;
  const WAQI_API_URL = "https://api.waqi.info/feed/geo:";

  const defaultLocation = { lat: 28.6139, lng: 77.2090 };
  const currentLocationName = useRef("Your Location");

  // Light mode map styles
  const lightMapStyles = [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }]
    },
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }]
    },
    {
      featureType: "all",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#c9c9c9" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }]
    }
  ];

  // Dark mode map styles (original styles)
  const darkMapStyles = [
    {
      featureType: "poi",
      stylers: [{ visibility: "on" }]
    },
    {
      featureType: "administrative",
      elementType: "labels",
      stylers: [{ visibility: "on" }]
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "simplified" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#2c3e50" }]
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ color: "#34495e" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#3498db" }]
    }
  ];

  useEffect(() => {
    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    window.initMap = initMap;
    document.head.appendChild(script);

    return () => {
      // Clean up
      if (window.google && window.google.maps) {
        window.google.maps.event.clearListeners(mapInstance.current);
      }
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (mapInstance.current) {
      mapInstance.current.setOptions({
        styles: darkMode ? lightMapStyles : darkMapStyles
      });
    }
  };

  const initMap = () => {
    // Initialize the map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: false,
      styles: darkMode ? darkMapStyles : lightMapStyles
    });

    // Initialize services
    autocompleteService.current = new window.google.maps.places.AutocompleteService();
    placesService.current = new window.google.maps.places.PlacesService(mapInstance.current);

    // Map click listener
    mapInstance.current.addListener("click", async (event) => {
      clearOldMarkers();

      const pulseMarker = new window.google.maps.Marker({
        position: event.latLng,
        map: mapInstance.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: darkMode ? "#FFFFFF" : "#333333",
          fillOpacity: 0.8,
          strokeColor: darkMode ? "#333333" : "#FFFFFF",
          strokeWeight: 2,
          scale: 8
        },
        zIndex: 999
      });

      let size = 8;
      const pulseInterval = setInterval(async () => {
        size += 2;
        pulseMarker.setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: darkMode ? "#FFFFFF" : "#333333",
          fillOpacity: 0.8 - (size / 40),
          strokeColor: darkMode ? "#333333" : "#FFFFFF",
          strokeWeight: 2,
          scale: size
        });
        if (size > 20) {
          clearInterval(pulseInterval);
          pulseMarker.setMap(null);
          try {
            const locationName = await getLocationName(event.latLng.lat(), event.latLng.lng());
            currentLocationName.current = locationName || "Selected Location";
            await getAQIData(event.latLng.lat(), event.latLng.lng(), false);
          } catch (error) {
            console.error("Error:", error);
            currentLocationName.current = "Selected Location";
            showError(event.latLng, "Failed to get AQI data");
          }
        }
      }, 50);
    });

    // Try to get user location on load
    getUserLocation();
  };

  // Search and location functions
  const performSearch = () => {
    if (searchQuery.trim()) {
      searchCity(searchQuery.trim());
      setShowAutocomplete(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
      setShowAutocomplete(false);
      return;
    }

    setAutocompleteResults([{
      description: "Loading suggestions...",
      isPlaceholder: true
    }]);
    setShowAutocomplete(true);

    fetchAutocompleteSuggestions(query);
  };

  const fetchAutocompleteSuggestions = (query) => {
    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: query,
          types: ['(cities)', 'geocode']
        },
        (predictions, status) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
            setAutocompleteResults([{
              description: "No suggestions found",
              isPlaceholder: true
            }]);
            return;
          }

          setAutocompleteResults(predictions.slice(0, 5));
        }
      );
    } catch (error) {
      console.error("Autocomplete error:", error);
      setAutocompleteResults([{
        description: "Error loading suggestions",
        isPlaceholder: true
      }]);
    }
  };

  const handleSuggestionClick = (prediction) => {
    setSearchQuery(prediction.description);
    setShowAutocomplete(false);

    // Get place details to get precise coordinates
    placesService.current.getDetails(
      { placeId: prediction.place_id },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          searchPlace(place);
        } else {
          // Fallback to geocoding if place details fail
          searchCity(prediction.description);
        }
      }
    );
  };

  const searchPlace = async (place) => {
    showLoading(`Searching for ${place.name}...`);

    try {
      const location = place.geometry.location;
      currentLocationName.current = place.formatted_address || place.name;

      clearOldMarkers();

      mapInstance.current.setCenter(location);
      mapInstance.current.setZoom(14);

      const marker = new window.google.maps.Marker({
        position: location,
        map: mapInstance.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: darkMode ? "#FFFFFF" : "#333333",
          fillOpacity: 0.8,
          strokeColor: darkMode ? "#333333" : "#FFFFFF",
          strokeWeight: 2,
          scale: 10
        },
        zIndex: 999
      });
      aqiMarkers.current.push(marker);

      await getAQIData(location.lat(), location.lng(), false);
    } catch (error) {
      console.error("Search error:", error);
      showError(mapInstance.current.getCenter(), error.message || "Failed to find the location");
    } finally {
      hideLoading();
    }
  };

  const searchCity = async (query) => {
    showLoading(`Searching for ${query}...`);

    try {
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
        const location = geocodeData.results[0].geometry.location;
        currentLocationName.current = geocodeData.results[0].formatted_address;

        clearOldMarkers();

        mapInstance.current.setCenter(location);
        mapInstance.current.setZoom(12);

        const marker = new window.google.maps.Marker({
          position: location,
          map: mapInstance.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: darkMode ? "#FFFFFF" : "#333333",
            fillOpacity: 0.8,
            strokeColor: darkMode ? "#333333" : "#FFFFFF",
            strokeWeight: 2,
            scale: 10
          },
          zIndex: 999
        });
        aqiMarkers.current.push(marker);

        await getAQIData(location.lat, location.lng, false);
      } else {
        throw new Error("Location not found");
      }
    } catch (error) {
      console.error("Search error:", error);
      showError(mapInstance.current.getCenter(), error.message || "Failed to find the location");
    } finally {
      hideLoading();
    }
  };

  const getUserLocation = async () => {
    showLoading("Locating you...");

    if (!navigator.geolocation) {
      handleLocationError({ code: 0, message: "Geolocation not supported" });
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const userPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      try {
        const locationName = await getLocationName(userPos.lat, userPos.lng);
        currentLocationName.current = locationName || "Your Location";
      } catch (error) {
        console.error("Error getting location name:", error);
        currentLocationName.current = "Your Location";
      }

      await handleLocationSuccess(userPos);
    } catch (error) {
      handleLocationError(error);
    }
  };

  const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const handleLocationSuccess = async (position) => {
    try {
      mapInstance.current.setCenter(position);
      updateUserMarker(position);
      await getAQIData(position.lat, position.lng, true);
    } catch (error) {
      console.error("Location success error:", error);
      handleLocationError({
        code: 0,
        message: "Error processing location"
      });
    } finally {
      hideLoading();
    }
  };

  const updateUserMarker = (position) => {
    if (userLocationMarker.current) userLocationMarker.current.setMap(null);

    userLocationMarker.current = new window.google.maps.Marker({
      position,
      map: mapInstance.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: "#4285F4",
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 8
      },
      title: "Your Location",
      zIndex: 1000
    });
  };

  // AQI functions
  const getAQIData = async (lat, lng, isAutoLocation) => {
    showLoading(isAutoLocation ? "Getting local air quality..." : "Fetching AQI data...");

    try {
      const response = await fetch(`${WAQI_API_URL}${lat};${lng}/?token=${WAQI_API_KEY}`);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data && data.status === "ok" && data.data) {
        displayAQIData({ lat, lng }, data.data, isAutoLocation);
      } else {
        throw new Error(data.message || "No AQI data available for this location");
      }
    } catch (error) {
      console.error("Error:", error);
      showError({ lat, lng }, error.message || "Failed to fetch AQI data");
      throw error;
    } finally {
      hideLoading();
    }
  };

  const displayAQIData = (position, aqiData, isAutoLocation) => {
    const aqi = aqiData.aqi || 0;
    const aqiColor = getAQIColor(aqi);
    const aqiLevel = getAQILevel(aqi);
    const dominantPollutant = aqiData.dominentpol || 'N/A';

    if (!isAutoLocation) {
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstance.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: aqiColor,
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 12
        },
        zIndex: window.google.maps.Marker.MAX_ZINDEX + 1
      });

      const glowMarker = new window.google.maps.Marker({
        position,
        map: mapInstance.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: aqiColor,
          fillOpacity: 0.2,
          strokeWeight: 0,
          scale: 24
        },
        zIndex: window.google.maps.Marker.MAX_ZINDEX
      });

      let scale = 24;
      const pulseInterval = setInterval(() => {
        scale = scale === 24 ? 28 : 24;
        glowMarker.setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: aqiColor,
          fillOpacity: 0.2,
          strokeWeight: 0,
          scale: scale
        });
      }, 1000);

      aqiMarkers.current.push(marker, glowMarker);
    }

    const pollutants = [];
    if (aqiData.iaqi) {
      for (const [key, value] of Object.entries(aqiData.iaqi)) {
        if (value && value.v) {
          pollutants.push({
            code: key.toUpperCase(),
            value: value.v,
            units: getPollutantUnit(key)
          });
        }
      }
    }

    const pollutantsHtml = pollutants.length > 0
      ? pollutants.map(pollutant => `
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #3a3a3a; color: #e0e0e0">${pollutant.code}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #3a3a3a; text-align: right; color: #ffffff">
              <strong>${pollutant.value.toFixed(2)}</strong> ${pollutant.units}
            </td>
          </tr>
        `).join('')
      : '<tr><td colspan="2" style="padding: 8px 12px; color: #e0e0e0">No pollutant data available</td></tr>';

    const healthRecommendations = getHealthRecommendations(aqi);

    const content = `
      <div style="min-width: 280px; font-family: 'Segoe UI', Roboto, sans-serif; background: linear-gradient(145deg, #1e1e1e, #2a2a2a); border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); overflow: hidden;">
        <div style="background: ${aqiColor}; color: white; padding: 12px 16px; position: relative;">
          <div style="position: absolute; top: 0; right: 0; padding: 8px; font-size: 12px; opacity: 0.8;">${new Date().toLocaleTimeString()}</div>
          <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 600;">${currentLocationName.current}</h3>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <span style="font-size: 28px; font-weight: bold; text-shadow: 0 1px 3px rgba(0,0,0,0.3)">${aqi}</span>
            <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 14px; font-size: 12px; font-weight: 500;">
              ${aqiLevel}
            </span>
          </div>
        </div>
        <div style="padding: 12px 16px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #b0b0b0; font-size: 13px;">Primary Pollutant</span>
            <span style="color: #ffffff; font-weight: 500;">${dominantPollutant}</span>
          </div>
          
          <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin: 10px 0;">
            <p style="margin: 0; color: #f8f8f8; font-size: 13px;"><strong style="color: #ffffff">Health Advice:</strong><br>${healthRecommendations}</p>
          </div>
          
          <div style="max-height: 200px; overflow-y: auto; margin: 12px 0; border-radius: 6px; background: rgba(0,0,0,0.2);">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="text-align: left; padding: 8px 12px; border-bottom: 1px solid #3a3a3a; color: #b0b0b0; font-weight: 500; font-size: 12px;">POLLUTANT</th>
                  <th style="text-align: right; padding: 8px 12px; border-bottom: 1px solid #3a3a3a; color: #b0b0b0; font-weight: 500; font-size: 12px;">VALUE</th>
                </tr>
              </thead>
              <tbody>${pollutantsHtml}</tbody>
            </table>
          </div>
          
          <div style="display: flex; justify-content: space-between; color: #888; font-size: 11px; margin-top: 8px;">
            <span>${new Date().toLocaleDateString()}</span>
            <span>${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}</span>
          </div>
        </div>
      </div>
    `;

    const infoWindow = new window.google.maps.InfoWindow({
      content,
      maxWidth: 320
    });

    if (isAutoLocation) {
      infoWindow.open(mapInstance.current, userLocationMarker.current || mapInstance.current);
    } else {
      infoWindow.open(mapInstance.current, aqiMarkers.current[aqiMarkers.current.length - 2] || mapInstance.current);
    }
    infoWindows.current.push(infoWindow);
  };

  const getPollutantUnit = (pollutantCode) => {
    const units = {
      'pm25': 'µg/m³',
      'pm10': 'µg/m³',
      'o3': 'µg/m³',
      'no2': 'µg/m³',
      'so2': 'µg/m³',
      'co': 'ppm',
      't': '°C',
      'w': 'm/s',
      'h': '%',
      'p': 'hPa',
      'dew': '°C'
    };
    return units[pollutantCode.toLowerCase()] || '';
  };

  const getHealthRecommendations = (aqi) => {
    if (aqi <= 50) {
      return "Air quality is satisfactory. Enjoy your normal outdoor activities.";
    } else if (aqi <= 100) {
      return "Air quality is acceptable. Unually sensitive people should consider limiting prolonged outdoor exertion.";
    } else if (aqi <= 150) {
      return "Members of sensitive groups may experience health effects. The general public is less likely to be affected.";
    } else if (aqi <= 200) {
      return "Everyone may begin to experience health effects. Members of sensitive groups may experience more serious health effects.";
    } else if (aqi <= 300) {
      return "Health alert: everyone may experience more serious health effects.";
    } else {
      return "Health warning of emergency conditions. The entire population is more likely to be affected.";
    }
  };

  const getAQIColor = (aqi) => {
    if (!aqi) return "#999999";
    if (aqi <= 50) return "#00E400";
    if (aqi <= 100) return "rgb(25, 125, 56)";
    if (aqi <= 150) return "#FF7E00";
    if (aqi <= 200) return "#FF0000";
    if (aqi <= 300) return "#8F3F97";
    return "#7E0023";
  };

  const getAQILevel = (aqi) => {
    if (!aqi) return "Unknown";
    const levels = ["Good", "Moderate", "Unhealthy for Sensitive", "Unhealthy", "Very Unhealthy", "Hazardous"];
    return levels[Math.min(Math.floor(aqi / 50), levels.length - 1)];
  };

  // Utility functions
  const showLoading = (message) => {
    setLoadingMessage(message);
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  const showError = (position, message) => {
    const errorWindow = new window.google.maps.InfoWindow({
      position,
      content: `<div style="padding:10px;color:red;">${message}</div>`
    });
    errorWindow.open(mapInstance.current);
    infoWindows.current.push(errorWindow);
  };

  const clearOldMarkers = () => {
    aqiMarkers.current.forEach(marker => marker.setMap(null));
    aqiMarkers.current = [];
    closeAllInfoWindows();
  };

  const closeAllInfoWindows = () => {
    infoWindows.current.forEach(window => window.close());
    infoWindows.current = [];
  };

  const handleLocationError = (error) => {
    hideLoading();
    let message = "Error getting location: ";
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message += "Location access was denied.";
        break;
      case error.POSITION_UNAVAILABLE:
        message += "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        message += "The request to get location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        message += "An unknown error occurred.";
        break;
      default:
        message += error.message || "Unknown error occurred.";
    }
    showError(mapInstance.current.getCenter(), message);

    getAQIData(defaultLocation.lat, defaultLocation.lng, true);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden mt-[2rem]">
      {/* Loading indicator */}
      {loading && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-5 py-2 rounded-full text-sm z-50 shadow-lg backdrop-blur-sm">
          {loadingMessage}
        </div>
      )}

      {/* Map container */}
      <div ref={mapRef} className="h-full w-full" />

      {/* Search container */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[500px] z-40">
        <div className="flex bg-white rounded-full shadow-lg overflow-hidden">
          <input
            type="text"
            className="flex-1 border-none px-4 py-3 text-base outline-none"
            placeholder="Search for a city or address..."
            value={searchQuery}
            onChange={handleSearchInput}
            onKeyPress={handleSearchKeyPress}
          />
          <button
            className="bg-blue-500 text-white border-none px-5 cursor-pointer transition-colors duration-300 flex items-center justify-center hover:bg-blue-600"
            onClick={performSearch}
          >
            <i className="fas fa-search"></i>
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {showAutocomplete && (
          <div className="bg-white rounded-b-lg shadow-md mt-1 max-h-80 overflow-y-auto absolute w-full z-50">
            {autocompleteResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 cursor-pointer transition-colors duration-200 flex items-center border-b border-gray-100 ${result.isPlaceholder ? "text-gray-500" : "hover:bg-gray-50"
                  }`}
                onClick={() => !result.isPlaceholder && handleSuggestionClick(result)}
              >
                {!result.isPlaceholder && (
                  <div className="mr-3 text-blue-500 w-4 text-center">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                )}
                <div className="flex-1">
                  {result.isPlaceholder ? (
                    <div>{result.description}</div>
                  ) : (
                    <>
                      <div className="font-medium text-gray-800 mb-1">{result.structured_formatting.main_text}</div>
                      {result.structured_formatting.secondary_text && (
                        <div className="text-xs text-gray-600">{result.structured_formatting.secondary_text}</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Locate me button */}
      <button
        className="absolute top-15 right-3  z-40 bg-white border-none rounded-full w-10 h-10 shadow-md cursor-pointer flex items-center justify-center"
        onClick={getUserLocation}
        title="Locate Me"
      >
        <i className="fas fa-location-arrow text-gray-700"></i>
      </button>

      {/* Dark/Light mode toggle button */}
      <button
        className="absolute top-28 right-3 z-40 bg-white border-none rounded-full w-10 h-10 shadow-md cursor-pointer flex items-center justify-center"
        onClick={toggleDarkMode}
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? (
          <i className="fas fa-sun text-yellow-500"></i>
        ) : (
          <i className="fas fa-moon text-gray-700"></i>
        )}
      </button>
    </div>
  );
};

export default Map;