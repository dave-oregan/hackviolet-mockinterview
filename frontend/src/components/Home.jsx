import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../functions/login';
import '../css/Home.css';

function Home() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
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
        <div className="dashboard-message">
          <h2>Welcome, {user.name}!</h2>
          <p>This is your dashboard</p>
        </div>
      </main>
    </div>
  );
}

export default Home;
