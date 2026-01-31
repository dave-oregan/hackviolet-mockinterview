// Mock authentication functions

export const loginUser = async (email, password) => {
  // Mock credentials
  const validEmail = 'test@intervue.com';
  const validPassword = 'testpass';

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (email === validEmail && password === validPassword) {
    // Mock user object
    const user = {
      id: 1,
      email: email,
      name: 'Test User',
    };
    // Store user in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(user));
    return { success: true, user };
  } else {
    return { success: false, error: 'Invalid email or password' };
  }
};

export const signupUser = async (name, email, password) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock signup - in real app would validate and create user in database
  const user = {
    id: Math.random(), // Mock ID
    email: email,
    name: name,
  };

  // Store user in localStorage for persistence
  localStorage.setItem('user', JSON.stringify(user));
  return { success: true, user };
};

export const logoutUser = () => {
  localStorage.removeItem('user');
  return { success: true };
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
