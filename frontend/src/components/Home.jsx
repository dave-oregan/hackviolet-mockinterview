import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { getCurrentUser, logoutUser } from '../functions/login';
import SelectMode from './SelectMode';
import MagicBento from './MagicBento'; 
import FadeContent from './FadeContent'; // [1] Import FadeContent
import '../css/Home.css';
import GlassIcons from './GlassIcon';
import TelOut from '../svg/telout';
import Graph from '../svg/graph';
import Archive from '../svg/archive';

function Home() {
    const navigate = useNavigate();
    const user = getCurrentUser();
    
    const [openModal, setOpenModal] = useState(false);
    // Note: We removed showProgress state since we now navigate to a new page

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
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    const items = [
        { 
            icon: <TelOut />, 
            color: 'blue', 
            label: 'New Interview', 
            click: handleJoin 
        },
        { 
            icon: <Graph />, 
            color: 'purple', 
            label: 'Progress', 
            click: () => navigate('/progress') 
        },
        { 
            icon: <Archive />, 
            color: 'indigo', 
            label: 'Archive', 
            click: () => console.log('Archive clicked') 
        },
    ];

    return (
        // [2] Wrap the entire container in FadeContent
        <FadeContent blur={true} duration={0.8}>
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

                    <div className="glass-container" style={{ width: '100vw' }}>
                        <GlassIcons items={items} className="custom-class" colorful={false} />
                    </div>

                    <br /><br /><br /><br /><br />

                    <SelectMode open={openModal} onClose={handleClose} onSelect={handleSelect} />
                </main>
            </div>
        </FadeContent>
    );
}

export default Home;