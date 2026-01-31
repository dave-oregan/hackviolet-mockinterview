import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../functions/login';

// Components
import SelectMode from './SelectMode';
import FadeContent from './FadeContent'; 
import GlassIcons from './GlassIcon';
import LightPillar from './LightPillar';

// SVG Icons
import TelOut from '../svg/telout';
import Graph from '../svg/graph';
import ArchiveIcon from '../svg/archive';

// Styles
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
    };

    // Protect the route
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    // Menu Configuration
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
            icon: <ArchiveIcon />, 
            color: 'indigo', 
            label: 'Archive', 
            click: () => navigate('/archive') 
        },
    ];

    return (
        <FadeContent blur={true} duration={0.8}>
            <div className="home-container">
                {/* 1. Background Layer - LightPillar with Requested Settings */}
                <LightPillar
                    topColor="#5227FF"
                    bottomColor="#FF9FFC"
                    intensity={1}
                    rotationSpeed={0.3}
                    glowAmount={0.002}
                    pillarWidth={3}
                    pillarHeight={0.4}
                    noiseIntensity={0.5}
                    pillarRotation={25}
                    interactive={false}
                    mixBlendMode="screen"
                    quality="high"
                />

                {/* 2. Content Layer - Header */}
                <header className="home-header">
                    <h1 className="home-logo">Intervue</h1>
                    <button className="logout-button" onClick={handleLogout}>
                        Log out
                    </button>
                </header>

                {/* 3. Content Layer - Main */}
                <main className="home-main">
                    <div className="welcome-top">
                        <h2 className="welcome-text">Welcome, {user.name}</h2>
                    </div>

                    <div className="glass-container" style={{ width: '100vw' }}>
                        <GlassIcons items={items} className="custom-class" colorful={false} />
                    </div>

                    <div className="spacer" style={{ height: '15vh' }}></div>

                    <SelectMode open={openModal} onClose={handleClose} onSelect={handleSelect} />
                </main>
            </div>
        </FadeContent>
    );
}

export default Home;