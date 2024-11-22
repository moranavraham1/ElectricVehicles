import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';


export const registerUser = async (fullName, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      fullName,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : 'Error registering user');
  }
};

// פונקציה להתחברות
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : 'Error logging in');
  }
};

// פונקציה להתנתקות
export const logoutUser = () => {
  localStorage.removeItem('token');
};
