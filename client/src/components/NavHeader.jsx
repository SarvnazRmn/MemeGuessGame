import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link , useLocation } from 'react-router-dom';

const NavHeader = ({ loggedIn, handleLogout, username }) => {
  const location = useLocation(); // to get current location  
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">MemeGame</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
          {}
          </Nav>
          <Nav>
            {loggedIn ? (
              <>
              {location.pathname === '/profile' && (
                  <Nav.Link as={Link} to="/game" className="me-3">
                    Back to Game Page
                  </Nav.Link>
                )}
                {/* Show user's profile link and logout button */}
                <Nav.Link as={Link} to="/profile" className="me-3">
                  {username}'s Profile
                </Nav.Link>
                <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              // Show login button if user is not logged in
              <Button variant="outline-light" as={Link} to="/login">
                Login
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavHeader;
