import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../functions/login';
import SelectMode from './SelectMode';
import '../css/Home.css';
import GlassIcons from './GlassIcon';
import TelOut from '../svg/telout';
import Graph from '../svg/graph';
import Archive from '../svg/archive';

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

    const items = [
        { icon: <TelOut />, color: 'blue', label: 'New Interview', click: handleJoin },
        { icon: <Graph />, color: 'purple', label: 'Progress', click: console.log('op2') },
        { icon: <Archive />, color: 'indigo', label: 'Archive', click: console.log('op3') },
    ];

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-logo">Intervue</h1>
        <button className="logout-button" onClick={handleLogout}>
          Log out
        </button>
      </div>
      <main className="home-main">

        <div className="welcome-top">
          <h2 className="welcome-text">Welcome, {user.name}</h2>
        </div>

        <div className="glass-container" style={{ width: '100vw'}}>
          <GlassIcons items={items} className="custom-class" colorful={false}/>
        </div>

        <br></br><br></br><br></br><br></br><br></br>

        <SelectMode open={openModal} onClose={handleClose} onSelect={handleSelect} />
      </main>
    </div>
  );
}

export default Home;
