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
    
    // Legacy modal state (can be kept for other features or removed if unused)
    const [openModal, setOpenModal] = useState(false); 

    const handleLogout = () => {
        logoutUser();
        navigate('/');
    };

    // Triggered when clicking "New Interview"
    const handleJoin = () => {
        setShowCompanySelect(true);
    };

    // Triggered when the user finishes the Company -> Type -> Difficulty flow
    const handleCompanySelected = (finalData) => {
        console.log("Selection Complete:", finalData);
        
        setShowCompanySelect(false);

        // Navigate based on the selected Interview Type
        if (finalData.type === 'Behavioral') {
            navigate('/interview-behavioral', { 
                state: { 
                    company: finalData.company,
                    difficulty: finalData.difficulty 
                } 
            });
        } else if (finalData.type === 'Technical') {
            navigate('/interview/technical', { 
                state: { 
                    company: finalData.company,
                    difficulty: finalData.difficulty 
                } 
            });
        } else if (finalData.type === 'Technical') {
            navigate('/interview/technical', { 
                state: { 
                    company: finalData.company,
                    difficulty: finalData.difficulty 
                } 
            });
        } else {
            console.warn("Unknown interview type selected");
        }
    };

    const handleClose = () => {
        setOpenModal(false);
        setShowCompanySelect(false);
    };

    const handleSelect = (mode) => {
        console.log('Selected mode:', mode);
    };

    // Protect Route
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    // Menu Items
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
                {/* 1. Background Layer */}
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

                    {/* Spacer for visual balance */}
                    <div className="spacer" style={{ height: '15vh' }}></div>
                </main>

                {/* 4. Overlays */}
                <AnimatePresence>
                    {showCompanySelect && (
                        <CompanySelection 
                            onClose={() => setShowCompanySelect(false)} 
                            onSelect={handleCompanySelected} 
                        />
                    )}
                </AnimatePresence>

                {/* Legacy Modal (Hidden unless openModal is used) */}
                <SelectMode open={openModal} onClose={handleClose} onSelect={handleSelect} />
            </div>
        </FadeContent>
    );
}

export default Home;