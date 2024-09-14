import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './App.css';
import { readCSVFile } from './readCSVFile';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';


const colors = [
  '#FF5733',  // Color 1
  '#33FF57',  // Color 2
  '#3357FF',  // Color 3
  '#FF33A1',  // Color 4
  '#A133FF',  // Color 5
  '#33FFF5'   // Color 6
];

// Register the components you need
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading, getAccessTokenSilently } = useAuth0();
  const [comments, setComments] = useState([]); // Store the list of comments
  const [newComment, setNewComment] = useState(''); // Track new comment input
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // "Healthcare Coverage Based on Size of Metro"
  const [sizeOfMetro, setSizeOfMetro] = useState(null);
  const [racialDemographic, setRacialDemographic] = useState(null);
  
  // Track the selected chart from the dropdown
  const [selectedChart, setSelectedChart] = useState('Urban County');

  // Trigger login with audience and scopes
  const handleLogin = () => {
    loginWithRedirect({
      audience: 'https://hophacks24.us.auth0.com/api/v2/',
      scope: 'read:users update:users'
    });
  };

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '') {
      setErrorMessage('Comment cannot be empty.');
      return;
    }
    if (newComment.trim() === '') return;

    setIsSubmitting(true);
   
    const commentData = {
      user: user.name,
      comment: newComment,
    };
   
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:5001/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
      });
   
      const result = await response.json();
      setComments([...comments, result]);
      setNewComment('');
      setErrorMessage(null); // Clear any previous error
    } catch (error) {
      setErrorMessage('Failed to submit comment. Please try again.');
      console.error('Error submitting comment:', error);
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch('http://localhost:5001/comments'); // Updated to match backend port
        const result = await response.json();
        setComments(result);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();

    const fetchCSVData = async (filePath, setDataCallback) => {
      try {
        const data = await readCSVFile(filePath); // Adjust file path
        const years = data[0].slice(1); // First row is the years
    
        const interpolateMissingValues = (arr) => {
          let result = [...arr];  // Clone the array
          for (let i = 0; i < result.length; i++) {
            if (result[i] === '**') {
              let nextValidIndex = i + 1;
              while (nextValidIndex < result.length && result[nextValidIndex] === '**') {
                nextValidIndex++;
              }

              if (nextValidIndex < result.length && i > 0) {
                let y1 = +result[i - 1]; // Previous valid value
                let y2 = +result[nextValidIndex]; // Next valid value
                let x1 = i - 1; // Index of the previous valid value
                let x2 = nextValidIndex; // Index of the next valid value
                let interpolatedValue = y1 + ((y2 - y1) / (x2 - x1)) * (i - x1);

                result[i] = interpolatedValue; // Replace missing value with interpolated value
              }
            } else {
              result[i] = +result[i]; // Convert valid values to numbers
            }
          }
          return result;
        };
    
        const datasets = data.slice(1).map((row, index) => ({
          label: row[0], // First column is the label (e.g., 'a', 'b', 'c')
          data: interpolateMissingValues(row.slice(1)), // Interpolate missing values
          borderColor: colors[index % colors.length], // Assign color based on index
          fill: false,  // Ensure the line isn't filled
        }));
    
        setDataCallback({
          labels: years,
          datasets: datasets,
        });
      } catch (error) {
        console.error("Error reading CSV data:", error);
      }
    };

    fetchCSVData("/urban_county.csv", setSizeOfMetro);
    fetchCSVData("/racial_demographic.csv", setRacialDemographic);

  }, [isLoading, isAuthenticated, user]);

  if (isLoading || !sizeOfMetro || !racialDemographic) {
    return <div>Loading...</div>;
  }

  // Dropdown options to select between the charts
  const handleChartChange = (e) => {
    setSelectedChart(e.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="content-container">

          {/* Display the selected chart */}
          <div className="chart-container">
            {/* Flex container for dropdown and title */}
            <div className="chart-header">
              <div className="chart-selector">
                <label htmlFor="chart-select">Choose a chart: </label>
                <select id="chart-select" value={selectedChart} onChange={handleChartChange}>
                  <option value="Urban County">Urban County</option>
                  <option value="Racial Demographic">Racial Demographic</option>
                </select>
              </div>
              <h2 className="chart-title">{selectedChart}</h2>
            </div>

            {/* Chart */}
            <div className="chart-section">
              {selectedChart === 'Urban County' && <Line data={sizeOfMetro} />}
              {selectedChart === 'Racial Demographic' && <Line data={racialDemographic} />}
            </div>
          </div>
  
          {/* Right column for user info and discussion */}
          <div className="discussion-column">
            <div className="user-info">
              {isAuthenticated ? (
                <span>
                  Welcome, {user.name}{' '}
                  <button
                    className="logout-button"
                    onClick={() => logout({ returnTo: window.location.origin })}
                  >
                    Logout
                  </button>
                </span>
              ) : (
                <button className="login-button" onClick={handleLogin}>
                  Login
                </button>
              )}
            </div>
  
            {/* Discussion Forum below the button */}
            <div className="comment-section">
              <h2>Discussion Forum</h2>
              {errorMessage && <div className="error-message">{errorMessage}</div>}
              {isAuthenticated ? (
                <form onSubmit={handleSubmitComment}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Enter your comment"
                    rows="4"
                    cols="50"
                  />
                  <br />
                  <button type="submit" disabled={isSubmitting}>
                    Submit Comment
                  </button>
                </form>
              ) : (
                <p>Please log in to leave a comment.</p>
              )}
  
              {/* Display the list of comments */}
              <div className="comments-list">
                <h3>Comments:</h3>
                {comments.length > 0 ? (
                  comments.map((c, index) => (
                    <div key={index}>
                      <strong>{c.user}:</strong> {c.comment}
                    </div>
                  ))
                ) : (
                  <p>No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );   
}

export default App;
