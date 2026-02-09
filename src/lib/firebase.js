// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBOajfDB1KtWfO-5OO05c_MmuHch46jNnk",
    authDomain: "rasarabakery-a7847.firebaseapp.com",
    projectId: "rasarabakery-a7847",
    storageBucket: "rasarabakery-a7847.firebasestorage.app",
    messagingSenderId: "903305696628",
    appId: "1:903305696628:web:e840b58953e26487214821"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Firebase persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        console.warn('Firebase persistence not supported in this browser');
    }
});