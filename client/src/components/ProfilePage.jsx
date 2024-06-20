import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Card, Button } from 'react-bootstrap';
import API from '../assets/API.mjs';


const ProfilePage = ({ loggedIn }) => {
  const [user, setUser] = useState(null); // State to hold user information

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userData = await API.getUserInfo(); // Assuming this fetches user data
        setUser(userData); // Set the user state with fetched data
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    if (loggedIn) {
      fetchUserInfo(); // Fetch user info only if logged in
    }
  }, [loggedIn]); // Run effect on loggedIn change

  return (
    <Container className="mt-5">
      <h2>User Profile</h2>
      {loggedIn ? (
        user ? (
          <p>Welcome, {user.username} !</p>
        ) : (
          <p>Loading user information...</p>
        )
      ) : (
        <p>Please log in to view your profile.</p>
      )}
      {/* Add more profile details as needed */}
    </Container>
  );
};

export default ProfilePage;