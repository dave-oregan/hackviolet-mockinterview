import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, signupUser } from '../functions/login';
import '../css/Login.css';

function Login() {
  const navigate = useNavigate();
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginUser(email, password);
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const result = await signupUser(name, email, password);
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const boxRef = useRef(null);

  useEffect(() => {
    // adjust height to current content to enable smooth transitions
    const el = boxRef.current;
    if (!el) return;
    // allow browser to compute layout then set explicit height
    const resize = () => {
      // reset height to auto to get natural scrollHeight, then set to that value
      el.style.height = 'auto';
      const h = el.scrollHeight;
      el.style.height = h + 'px';
    };

    // run on next frame to ensure DOM updated
    requestAnimationFrame(resize);

    // also update on window resize
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [isSignIn, name, email, password, confirmPassword]);

  return (
    <div className="login-container">
      <div ref={boxRef} className="login-box login-card">
        <div className="toggle-container">
          <button
            className={`toggle-button ${isSignIn ? 'active' : ''}`}
            onClick={() => setIsSignIn(true)}
            aria-pressed={isSignIn}
          >
            Log in
          </button>
          <button
            className={`toggle-button ${!isSignIn ? 'active' : ''}`}
            onClick={() => setIsSignIn(false)}
            aria-pressed={!isSignIn}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isSignIn ? (
          <form onSubmit={handleSignInSubmit} className="login-form">
            <h1 className="login-title">Log in</h1>
            <div className="form-group">
              <label htmlFor="signin-email">Email</label>
              <input
                id="signin-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="signin-password">Password</label>
              <input
                id="signin-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Signing in...' : 'Continue'}
              </button>
              <a className="link-muted" href="#forgot">
                Forgot password?
              </a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignUpSubmit} className="login-form">
            <h1 className="login-title">Create Your Account</h1>
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Creating account...' : 'Create'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;