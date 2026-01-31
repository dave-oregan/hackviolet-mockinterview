import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../functions/login';
import SelectMode from './SelectMode';
import '../css/Home.css';

function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [openModal, setOpenModal] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const handleJoin = () => {
    setOpenModal(true);
  };

  const handleClose = () => setOpenModal(false);

  const handleSelect = (mode) => {
    console.log('Selected mode:', mode);
    // Future: route to mode-specific flow
  };

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-logo">Intervue</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <main className="home-main">
        <div className="welcome-top">
          <h2 className="welcome-text">Welcome, &lt;{user.name}&gt;</h2>
        </div>

        <div className="join-center">
          <button className="join-button" onClick={handleJoin}>
            Join Meeting
          </button>
        </div>

        <SelectMode open={openModal} onClose={handleClose} onSelect={handleSelect} />
      </main>
    </div>
  );
}

export default Home;
