import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, signupUser } from '../functions/login';
import '../css/Login.css';

function Login() {
  const navigate = useNavigate();
  const [isSignIn, setIsSignIn] = useState(true);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Login
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

  // Handle Signup
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
        // [CHANGE] Redirect new users to the Survey page
        navigate('/survey');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        layout 
        className="login-box login-card"
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      >
        <div className="toggle-container">
          <button
            className={`toggle-button ${isSignIn ? 'active' : ''}`}
            onClick={() => {
              setIsSignIn(true);
              setError('');
            }}
            aria-pressed={isSignIn}
          >
            Log in
          </button>
          <button
            className={`toggle-button ${!isSignIn ? 'active' : ''}`}
            onClick={() => {
              setIsSignIn(false);
              setError('');
            }}
            aria-pressed={!isSignIn}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <AnimatePresence mode="wait">
          {isSignIn ? (
            <motion.form
              key="signin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              onSubmit={handleSignInSubmit}
              className="login-form"
            >
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
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              onSubmit={handleSignUpSubmit}
              className="login-form"
            >
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
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="login-button" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Login;