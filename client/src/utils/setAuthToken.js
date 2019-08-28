import axios from 'axios';

/* 
  By login it will always attach auth headers
*/

const setAuthToken = token => {
  if(token) {
    // Apply to every request
    axios.defaults.headers.common['Authorization'] = token;
  } else {
    // Delete auth header
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default setAuthToken;

