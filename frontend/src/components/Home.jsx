import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../functions/login';
import { AnimatePresence } from 'framer-motion';

// Components
import SelectMode from './SelectMode';
import CompanySelection from './CompanySelection'; 
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
    
    // State for the company selection overlay
    const [showCompanySelect, setShowCompanySelect] = useState(false);
    const [openModal, setOpenModal] = useState(false); 

    const handleLogout = () => {
        logoutUser();
        navigate('/');
    };

    const handleJoin = () => {
        setShowCompanySelect(true);
    };

    // [1] Handle the data coming back from CompanySelection.jsx
    const handleCompanySelected = (finalData) => {
        console.log("Selected:", finalData);
        
        setShowCompanySelect(false);

        // [2] Check type and navigate
        if (finalData.type === 'Behavioral') {
            navigate('/interview-behavioral', { 
                state: { 
                    company: finalData.company,
                    difficulty: finalData.difficulty 
                } 
            });
        } else {
            // Placeholder for Technical or other types
            console.log("Technical route not ready yet");
        }
    };

    const handleClose = () => {
        setOpenModal(false);
        setShowCompanySelect(false);
    };

    const handleSelect = (mode) => {
        console.log('Selected mode:', mode);
    };

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    if (!user) return null;

    const items = [
        { icon: <TelOut />, color: 'blue', label: 'New Interview', click: handleJoin },
        { icon: <Graph />, color: 'purple', label: 'Progress', click: () => navigate('/progress') },
        { icon: <ArchiveIcon />, color: 'indigo', label: 'Archive', click: () => navigate('/archive') },
    ];

    return (
        <FadeContent blur={true} duration={0.8}>
            <div className="home-container">
                <LightPillar 
                    topColor="#5227FF" bottomColor="#FF9FFC" intensity={1} rotationSpeed={0.3} 
                    glowAmount={0.002} pillarWidth={3} pillarHeight={0.4} noiseIntensity={0.5} 
                    pillarRotation={25} interactive={false} mixBlendMode="screen" quality="high"
                />

                <header className="home-header">
                    <h1 className="home-logo">Intervue</h1>
                    <button className="logout-button" onClick={handleLogout}>Log out</button>
                </header>

                <main className="home-main">
                    <div className="welcome-top">
                        <h2 className="welcome-text">Welcome, {user.name}</h2>
                    </div>

                    <div className="glass-container" style={{ width: '100vw' }}>
                        <GlassIcons items={items} className="custom-class" colorful={false} />
                    </div>
                    <div className="spacer" style={{ height: '15vh' }}></div>
                </main>

                <AnimatePresence>
                    {showCompanySelect && (
                        <CompanySelection 
                            onClose={() => setShowCompanySelect(false)} 
                            onSelect={handleCompanySelected} 
                        />
                    )}
                </AnimatePresence>

                <SelectMode open={openModal} onClose={handleClose} onSelect={handleSelect} />
            </div>
        </FadeContent>
    );
}

export default Home;