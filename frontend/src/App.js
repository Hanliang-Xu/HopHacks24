import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './App.css';

function App() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading, getAccessTokenSilently } = useAuth0();
  const [comments, setComments] = useState([]); // Store the list of comments
  const [newComment, setNewComment] = useState(''); // Track new comment input
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        {isAuthenticated ? (
          <div>
            <div className="user-info">
              <span>Welcome, {user.name}</span>
              <button className="logout-button" onClick={() => logout({ returnTo: window.location.origin })}>
                Logout
              </button>
            </div>
            <div className="comment-section">
              <h2>Discussion Forum</h2>
              {errorMessage && <div className="error-message">{errorMessage}</div>}
              <form onSubmit={handleSubmitComment}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Enter your comment"
                  rows="4"
                  cols="50"
                />
                <br />
                <button type="submit" disabled={isSubmitting}>Submit Comment</button>
              </form>
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
        ) : (
          <div>
            <h2>Please log in to leave a comment.</h2>
            <button className="login-button" onClick={handleLogin}>
              Login
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
