// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// initializeApp = require('firebase/app');
import { getAnalytics, setAnalyticsCollectionEnabled } from "firebase/analytics";
// getAnalytics = require('firebase/analytics');
import { getFirestore, collection, doc, setDoc, getDocs, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';
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


window.getCourses = () => {
  let subject = document.getElementById("subject-select").value;
  if (subject != '') {
    document.getElementById("all-courses").style.display = "block"
    getDocs(colRefC)
      .then((snapshot) => {
        let crs = []
        snapshot.docs.forEach((doc) => {
          crs.push({ ...doc.data(), id: doc.id})
        })

        let string = '<option value="">--Please choose a class--</option>'

        for (let i = 0; i < crs.length; i++) {
          let id = crs[i].id
          let first = id[0].toLowerCase()
          let code = id.slice(0, 3)
          console.log(first, subject[0])
          if (subject == 'careers') {
            if (code == 'CIV' || code == 'CHV' || code == 'GLC') {
              string += '<option value=' + id + '>' + id + '</option>'
            }
          }
          else if (subject == 'other') {
            if (first != 'a' && first != 'b' && first != 'c' && first != 'e' && first != 'f' && first != 'm' && first != 'p' && first != 's' && first != 't' && code != 'GLC') {
              string += '<option value=' + id + '>' + id + '</option>'
            }
          }
          else {
            if (first[0] == subject[0] && !(code == 'CIV' || code == 'CHV' || code == 'GLC')) {
              string += '<option value=' + id + '>' + id + '</option>'
            }
          }
          
        }

        document.getElementById("course-select").innerHTML = string
        document.getElementById("class-list").innerText = 'Choose a course!'
      })  
      .catch(err => {
        console.log(err.message)
      })
  } else {
    document.getElementById("all-courses").style.display = "none"
    document.getElementById("class-list").innerText = 'Choose a subject!'
  }
}


window.getStudents = () => {
  let allCourses = []
  let studentIds = []
  let courseName = document.getElementById("course-select").value;

  getDocs(colRefC)
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        allCourses.push({ ...doc.data(), id: doc.id})
      })

      for (let i = 0; i < allCourses.length; i++) {
        if (courseName == allCourses[i].id) {
          studentIds = allCourses[i].students
          break;
        }
      }

      getDocs(colRefS)
        .then((snapshot) => {
          let ids = studentIds;
          let string = ''
          let name = ''
          let allIds = []

          snapshot.docs.forEach((doc) => {
            allIds.push({ ...doc.data(), id: doc.id})
          })

          ids.sort()
          allIds.sort()

          for (let i = 0; i < ids.length; i++) {
            for (let j = 0; j < allIds.length; j++) {
              let student = allIds[j]

              if (ids[i] == student.id) {
                name = student.firstname + ' ' + student.lastname
                string += name + '\n'
                break;
              }
            }
          }
          
          document.getElementById("class-list").innerText = string

        })  
        .catch(err => {
          console.log(err.message)
        })
    })  
    .catch(err => {
      console.log(err.message)
    })  
}

window.onload = () => {
  const addStudentForm = document.getElementById('addform')
  let id = ''

  addStudentForm.addEventListener('submit', (e) => {
    e.preventDefault()
    let crs = [
      addStudentForm.course1.value, 
      addStudentForm.course2.value, 
      addStudentForm.course3.value, 
      addStudentForm.course4.value
    ]

    addDoc(colRefS, {
      firstname: addStudentForm.firstname.value,
      lastname: addStudentForm.lastname.value,
      courses: crs
    })
    .then((docRef) => {
      document.getElementById("formconfirmation").innerText = 'Submitted! Thank you!'
      id = docRef.id

      getDocs(colRefC)
        .then((snapshot) => {
          let allCrs = []
          snapshot.docs.forEach((doc) => {
            allCrs.push({ ...doc.data(), id: doc.id})
          })

          for (let i = 0; i < crs.length; i++) {
            let found = false;

            for (let j = 0; j < allCrs.length; j++) {
              if (crs[i] == allCrs[j].id) {
                found = true;
              
                let path = 'courses/' + crs[i]
                let ref = doc(db, path)
                updateDoc(ref, {
                  students: arrayUnion(id)
                })

                break;
              }
            }
            if (!found) {
              let path = 'courses/' + crs[i]
              let ref = doc(db, path)
              setDoc(ref, {
                students: [
                  id
                ]
              })
            }
          }
        })

        addStudentForm.reset()
    })
    .catch(err => {
      console.log(err.message)
    })
  })
}