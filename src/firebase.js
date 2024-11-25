import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAOlSd5q7DROIsDMYqUpeRw-EWwiDl870M",
  authDomain: "farmerfunddistribution.firebaseapp.com",
  projectId: "farmerfunddistribution",
  storageBucket: "farmerfunddistribution.appspot.com",
  messagingSenderId: "953019309146",
  appId: "1:953019309146:web:c056b699bd7935502a8c63"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { storage, auth, db };