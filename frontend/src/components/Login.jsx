import { useState } from 'react';
import './Login.css';

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

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="toggle-container">
          <button
            className={`toggle-button ${isSignIn ? 'active' : ''}`}
            onClick={() => setIsSignIn(true)}
          >
            Sign In
          </button>
          <button
            className={`toggle-button ${!isSignIn ? 'active' : ''}`}
            onClick={() => setIsSignIn(false)}
          >
            Sign Up
          </button>
        </div>

        {isSignIn ? (
          <form onSubmit={handleSignInSubmit}>
            <h1>Sign In</h1>
            <div className="form-group">
              <label htmlFor="signin-email">Email</label>
              <input
                id="signin-email"
                type="email"
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUpSubmit}>
            <h1>Sign Up</h1>
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="Enter your full name"
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
                placeholder="Enter your email"
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
                placeholder="Enter your password"
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
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
