// src/config/apiConfig.js
const COMMON = {
  API_BASE_URL: "https://localhost:7065/",
  JwtDecode: (obj) => {
    return obj && Object.keys(obj).length === 0;
  },
};

export default COMMON;
