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
import MapComponent from './MapComponent';  // Import the MapComponent
import MyEditor from './MyEditor';

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
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sizeOfMetro, setSizeOfMetro] = useState(null);
  const [racialDemographic, setRacialDemographic] = useState(null);
  const [sex, setSex] = useState(null);
  
  // Track the selected chart from the dropdown
  const [selectedChart, setSelectedChart] = useState('Size of Metro');

  const handleLogin = () => {
    loginWithRedirect({
      audience: 'https://hophacks24.us.auth0.com/api/v2/',
      scope: 'read:users update:users'
    });
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '') {
      setErrorMessage('Comment cannot be empty.');
      return;
    }

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
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to submit comment. Please try again.');
      console.error('Error submitting comment:', error);
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch('http://localhost:5001/comments');
        const result = await response.json();
        setComments(result);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();

    const fetchCSVData = async (filePath, setDataCallback) => {
      try {
        const data = await readCSVFile(filePath);
        const years = data[0].slice(1);
    
        const interpolateMissingValues = (arr) => {
          let result = [...arr];
          for (let i = 0; i < result.length; i++) {
            if (result[i] === '**') {
              let nextValidIndex = i + 1;
              while (nextValidIndex < result.length && result[nextValidIndex] === '**') {
                nextValidIndex++;
              }

              if (nextValidIndex < result.length && i > 0) {
                let y1 = +result[i - 1];
                let y2 = +result[nextValidIndex];
                let x1 = i - 1;
                let x2 = nextValidIndex;
                let interpolatedValue = y1 + ((y2 - y1) / (x2 - x1)) * (i - x1);

                result[i] = interpolatedValue;
              }
            } else {
              result[i] = +result[i];
            }
          }
          return result;
        };
    
        const datasets = data.slice(1).map((row, index) => ({
          label: row[0],
          data: interpolateMissingValues(row.slice(1)),
          borderColor: colors[index % colors.length],
          fill: false,
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
    fetchCSVData("/sex.csv", setSex);

  }, [isLoading, isAuthenticated, user]);

  if (isLoading || !sizeOfMetro || !racialDemographic || !sex) {
    return <div>Loading...</div>;
  }

  const handleChartChange = (e) => {
    setSelectedChart(e.target.value);
  };

  const handleEditorChange = (content) => {
    setNewComment(content);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="content-container">

          {/* Display the selected chart */}
          <div className="chart-container">
            <div className="chart-header">
              <div className="chart-selector">
                <label htmlFor="chart-select">Choose a chart: </label>
                <select id="chart-select" value={selectedChart} onChange={handleChartChange}>
                  <option value="Size of Metro">Size of Metro</option>
                  <option value="Racial Demographic">Racial Demographic</option>
                  <option value="Sex">Sex</option>
                </select>
              </div>
              <h2 className="chart-title">{selectedChart}</h2>
            </div>

            <div className="chart-section">
              {selectedChart === 'Size of Metro' && <Line data={sizeOfMetro} />}
              {selectedChart === 'Racial Demographic' && <Line data={racialDemographic} />}
              {selectedChart === 'Sex' && <Line data={sex} />}
            </div>

            {/* Map component, positioned below the chart */}
            <MapComponent />
          </div>
  
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

            <div className="comment-section">
              <MyEditor
                value={newComment}
                onChange={handleEditorChange}
              />
              <form onSubmit={handleSubmitComment}>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                </button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
              </form>
            </div>

            <div className="comments-list">
              {comments.map((comment, index) => (
                <div key={index} className="comment">
                  <strong>{comment.user}</strong>: <div dangerouslySetInnerHTML={{ __html: comment.comment }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
