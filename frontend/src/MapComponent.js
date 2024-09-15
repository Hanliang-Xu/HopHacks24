import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
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
  const [selectedPropertyNo, setSelectedPropertyNo] = useState(0); // Default property: 0 = healthcare, 1 = income, etc.
  
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
  }, []);

  // Dynamic style function for polygons
  const getStyle = (region) => {
    let fillColor = '#ccc';  // Default color
    const regionData = regionInfo[region.region];
    if (!regionData) return { fillColor, weight: 2, opacity: 1, color: 'white', dashArray: '3', fillOpacity: 0.7 };

    if (selectedPropertyNo === 0) {
      fillColor = getColorBasedOnScore(regionData, selectedYear, 'Percentage Without Access to Healthcare');
    } else if (selectedPropertyNo === 1) {
      fillColor = getColorBasedOnScore(regionData, selectedYear, 'Income');
    }
    // Add more cases for different properties if needed

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

  // Change selected property (0 for healthcare, 1 for income, etc.)
  const changeLayerStyle = (propertyNo) => {
    setSelectedPropertyNo(propertyNo);
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

      {/* Dropdown to change property (Healthcare, Income, etc.) */}
      <div>
        <label>Select Property:</label>
        <select onChange={(e) => changeLayerStyle(Number(e.target.value))}>
          <option value="0">Healthcare Access</option>
          <option value="1">Income</option>
          {/* Add more properties here */}
        </select>
      </div>

      <MapContainer center={[39.2904, -76.6122]} zoom={10} style={{ height: '500px', width: '100%' }} ref={mapRef}>
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
                    <p><strong>Income ({selectedYear}):</strong> {regionInfo[polygon.region][`Income ${selectedYear}`]}</p>
                    {/* Add more information as needed */}
                  </div>
                )}
              </div>
            </Popup>
          </Polygon>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
