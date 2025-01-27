// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// initializeApp = require('firebase/app');
import { getAnalytics } from "firebase/analytics";
// getAnalytics = require('firebase/analytics');
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
// getFirestore = require('firebase/firestore');

// Your web app's Firebase configuration
import { firebaseConfig } from './config'

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// init firestore database
const db = getFirestore()
const colRefC = collection(db, 'courses')
const colRefS = collection(db, 'students')

getDocs(colRefC)
  .then((snapshot) => {
    let crs = []
    snapshot.docs.forEach((doc) => {
      crs.push({ ...doc.data(), id: doc.id})
    })
    let string = '<option value="">--Please choose a class--</option>'

    for (let i = 0; i < crs.length; i++) {
      let id = crs[i].id
      string += '<option value=' + id + '>' + id + '</option>'
    }

    document.getElementById("course-select").innerHTML = string
  })  
  .catch(err => {
    console.log(err.message)
  })



window.goodAlert = () => {
  alert('alert called')
}
