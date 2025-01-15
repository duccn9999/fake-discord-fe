// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFNLzgLlhDoepLhUcXypRxVstypyiLpLw",
  authDomain: "fakediscordservice.firebaseapp.com",
  projectId: "fakediscordservice",
  storageBucket: "fakediscordservice.firebasestorage.app",
  messagingSenderId: "241571918361",
  appId: "1:241571918361:web:7243ea2670e0b282e13088",
  measurementId: "G-FC6NTCGFJR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);