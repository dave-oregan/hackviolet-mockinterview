import { useState, useRef, useEffect } from 'react';
import '../css/Login.css';

function Login() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    console.log('Sign in attempt:', { email, password });
    // Add authentication logic here
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Sign up attempt:', { name, email, password });
    // Add registration logic here
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
            Sign In
          </button>
          <button
            className={`toggle-button ${!isSignIn ? 'active' : ''}`}
            onClick={() => setIsSignIn(false)}
            aria-pressed={!isSignIn}
          >
            Sign Up
          </button>
        </div>

        {isSignIn ? (
          <form onSubmit={handleSignInSubmit} className="login-form">
            <h1 className="login-title">Sign In</h1>
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
              <button type="submit" className="login-button">
                Continue
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
              <button type="submit" className="login-button">
                Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
