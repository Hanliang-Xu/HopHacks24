import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse';

const regions = [
  'Baltimore City',
  'Baltimore Metro',
  'Eastern Shore',
  'Montgomery',
  'Northwest',
  "Prince George's",
  'Southern',
];

const MapComponent = () => {
  const [polygonData, setPolygonData] = useState([]);
  const [regionInfo, setRegionInfo] = useState({});
  const [selectedYear, setSelectedYear] = useState(2011); // Default year
  
  const mapRef = useRef();  // Reference for the map instance

  useEffect(() => {
    const loadPolygonData = async () => {
      const polygons = [];
      for (let region of regions) {
        try {
          const response = await fetch(`${region}.json`);
          const data = await response.json();
          polygons.push({ region, coordinates: data.coordinates });
        } catch (error) {
          console.error(`Error loading JSON for ${region}:`, error);
        }
      }
      setPolygonData(polygons);
    };

    const loadCSVData = async () => {
      Papa.parse('spatial.csv', {
        download: true,
        header: true,
        complete: (results) => {
          const regionData = results.data.reduce((acc, row) => {
            acc[row['region']] = row; // Store all data for popups and styling
            return acc;
          }, {});

          setRegionInfo(regionData);  // Save region info
        },
      });
    };

    loadPolygonData();
    loadCSVData();

    if (mapRef.current) {
      L.control.attribution({
        position: 'bottomleft' // Position the label in the bottom-left
      }).addTo(mapRef.current);
    }
  }, [mapRef]);

  // Dynamic style function for polygons
  const getStyle = (region) => {
    let fillColor = '#ccc';  // Default color
    const regionData = regionInfo[region.region];
    if (!regionData) return { fillColor, weight: 2, opacity: 1, color: 'white', dashArray: '3', fillOpacity: 0.7 };

    fillColor = getColorBasedOnScore(regionData, selectedYear, 'Percentage Without Access to Healthcare');

    return {
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
      fillColor
    };
  };

  // Function to get color based on score for the selected property
  const getColorBasedOnScore = (row, year, propertyKeyPrefix) => {
    const key = `${propertyKeyPrefix} ${year}`;
    let score = row[key];

    if (!score || score === "**") {
      console.warn(`Invalid or missing score for region: ${row.region}, year: ${year}`);
      return '#ccc';  // Default to grey if data is not available or invalid
    }

    score = parseFloat(score.replace('%', ''));  // Remove percentage sign and convert to float

    if (score > 18) return '#800000';  // Dark Red
    if (score > 15) return '#FF0000';  // Red
    if (score > 12) return '#FF4500';  // Orange Red
    if (score > 9) return '#FFA500';  // Orange
    return '#90EE90';  // Light Green
  };

  // Handle the slider change for years
  const handleYearChange = (event) => {
    setSelectedYear(Number(event.target.value));
  };

  return (
    <div>
      {/* Timeline Slider */}
      <div className="timeline-container">
        <label htmlFor="year-slider">Year: {selectedYear}</label>
        <input
          id="year-slider"
          type="range"
          min="2011"
          max="2022"
          step="1"
          value={selectedYear}
          onChange={handleYearChange}
        />
      </div>

      <div style={{ position: 'relative' }}>
        {/* Map */}
        <MapContainer
          center={[38.9, -77.35]}
          zoom={8}
          style={{ height: '400px', width: '100%' }}
          ref={mapRef}
          attributionControl={false} // Disable default attribution control
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {polygonData.map((polygon) => (
            <Polygon
              key={polygon.region}
              positions={polygon.coordinates}
              pathOptions={getStyle(polygon)}  // Apply dynamic styles here
            >
              <Popup>
                <div>
                  <strong>{polygon.region}</strong><br />
                  {regionInfo[polygon.region] && (
                    <div>
                      <p><strong>Percentage Without Access to Healthcare ({selectedYear}):</strong> {regionInfo[polygon.region][`Percentage Without Access to Healthcare ${selectedYear}`]}</p>
                      <p><strong>Lower Limit of 95% CI:</strong> {regionInfo[polygon.region][`Lower Limit of 95% CI ${selectedYear}`]}</p>
                      <p><strong>Upper Limit of 95% CI:</strong> {regionInfo[polygon.region][`Upper Limit of 95% CI ${selectedYear}`]}</p>
                      <p><strong>Population Without Access to Healthcare ({selectedYear}):</strong> {regionInfo[polygon.region][`Population Without Access to Healthcare ${selectedYear}`]}</p>
                      <p><strong>Total Population ({selectedYear}):</strong> {regionInfo[polygon.region][`Total Population ${selectedYear}`]}</p>
                    </div>
                  )}
                </div>
              </Popup>
            </Polygon>
          ))}
        </MapContainer>

        {/* Legend Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.6)', // Semi-transparent white background
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
          zIndex: 1000
        }}>
          <h4 style={{ margin: '0', padding: '5px 0', fontSize: '14px', lineHeight: '1.1' }}>
            Percentage Without <br /> Access to Healthcare
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ backgroundColor: '#800000', width: '20px', height: '20px', display: 'inline-block', marginRight: '10px' }} /> 
            <span>{'>'}18%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ backgroundColor: '#FF0000', width: '20px', height: '20px', display: 'inline-block', marginRight: '10px' }} /> 
            <span>15-18%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ backgroundColor: '#FF4500', width: '20px', height: '20px', display: 'inline-block', marginRight: '10px' }} /> 
            <span>12-15%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ backgroundColor: '#FFA500', width: '20px', height: '20px', display: 'inline-block', marginRight: '10px' }} /> 
            <span>9-12%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ backgroundColor: '#90EE90', width: '20px', height: '20px', display: 'inline-block', marginRight: '10px' }} /> 
            <span>0-9%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
