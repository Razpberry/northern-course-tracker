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


window.getSearch = () => {
  let search = document.getElementById("search-select").value;

  if (search == 'course') {
    document.getElementById("subject-select").value = ""
    document.getElementById("all-courses").style.display = "none"
    document.getElementById("all-students").style.display = "none"
    document.getElementById("all-subjects").style.display = "block"
    document.getElementById("list").innerHTML = "Choose a subject!"
    document.getElementById("list-text").innerHTML = "Class List:"
  }
  else if (search == 'student') {
    document.getElementById("all-subjects").style.display = "none"
    document.getElementById("all-courses").style.display = "none"
    document.getElementById("list").innerHTML = "Choose a student!"
    document.getElementById("all-students").style.display = "block"
    document.getElementById("list-text").innerHTML = "Course List:"

    getDocs(colRefS)
      .then((snapshot) => {
        let stds = []
        snapshot.docs.forEach((doc) => {
          stds.push({ ...doc.data(), id: doc.id})
        })

        let string = '<option value="">--Please choose a student--</option>'
        const set = new Set()
        let names = []

        for (let i = 0; i < stds.length; i++) {
          let name = stds[i].firstname + ' ' + stds[i].lastname
          
          set.add({id: stds[i].id, name: name})
          names[i] = name
        }

        names.sort()
        let infoSet = []

        for (let i = 0; i < stds.length; i++) {
          let name = names[i]
          let valName;
          valName = name.split(' ')
          valName = valName.join('_').toLocaleLowerCase()
  
          string += '<option value=' + valName + '>' + name + '</option>'

        }

        set.forEach((x) => {
          infoSet.push(x.id)
          infoSet.push(x.name.toLocaleLowerCase())
        });

        document.getElementById("student-select").innerHTML = string


        document.getElementById("studentset").innerHTML = infoSet
      })

  }
  else {
    document.getElementById("all-students").style.display = "none"
    document.getElementById("all-subjects").style.display = "none"
    document.getElementById("all-courses").style.display = "none"
    document.getElementById("list").innerHTML = "Choose what to search by!"
  }
}

window.getStdClasses = () => {
  let student = document.getElementById("student-select").value.split('_');
  let list = document.getElementById("studentset").innerHTML.split(',')

  let first = student[0]
  let last = student[1]
  let code;

  // Find student id
  for (let i = 0; i < list.length; i++) {
    let full = student.join(' ')
    if (list[i] == full) {
      code = list[i - 1];
      break;
    }
  }

  // Get courses from db using id
  getDocs(colRefS)
      .then((snapshot) => {
        let stds = []
        snapshot.docs.forEach((doc) => {
          stds.push({ ...doc.data(), id: doc.id})
        })

        for (let i = 0; i < stds.length; i++) {
          if (code == stds[i].id) {
            let crs = stds[i].courses
            let string = ''

            for (let j = 0; j < crs.length; j++) {
              string += crs[j] + '\n'
            }
            
            document.getElementById("list").innerText = string
            break;
          }
        }
      })  
      .catch(err => {
        console.log(err.message)
      })
}

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
  
          if (subject == 'careers') {
            if (code == 'CIV' || code == 'CHV' || code == 'GLC') {
              string += '<option value=' + id + '>' + id + '</option>'
            }
          }
          else if (subject == 'other') {
            if (first != 'a' && first != 'b' && first != 'c' && first != 'e' && first != 'f' && first != 'l' && first != 'm' && first != 'p' && first != 's' && first != 't' && code != 'GLC') {
              string += '<option value=' + id + '>' + id + '</option>'
            }
          }
          else {
            if (first[0] == subject[0] && !(code == 'CIV' || code == 'CHV' || code == 'GLC')) {
              string += '<option value=' + id + '>' + id + '</option>'
            }
          }

          //TODO: add NBE to english and NAC to art
          
        }

        document.getElementById("course-select").innerHTML = string
        document.getElementById("list").innerText = 'Choose a course!'
      })  
      .catch(err => {
        console.log(err.message)
      })
  } else {
    document.getElementById("all-courses").style.display = "none"
    document.getElementById("list").innerText = 'Choose a subject!'
  }
}


window.getCrsStudents = () => {

  // TODO: Output class list SORTED 

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
          
          document.getElementById("list").innerText = string

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

  // TODO: Prevent person duplication

  addStudentForm.addEventListener('submit', (e) => {
    e.preventDefault()
    let crs = [
      addStudentForm.course1.value, 
      addStudentForm.course2.value, 
      addStudentForm.course3.value, 
      addStudentForm.course4.value
    ]
    
    // TODO: Ensure full first and last name; prevent one letter last initial's (e.g. Nicholas S)

    // TODO: Ensure capatalization of names (e.g. nicholas stakoun -> Nicholas Stakoun)

    // Course input error catching
    for (let i = 0; i < crs.length; i++) {
      let course = crs[i]

      // Ensure proper formatting
      if (
        (course.length != 8 && course.length != 9)
        || course[6] != '-'
      ) {
        document.getElementById("formconfirmation").innerText = 'Error submitting... Try again!'
        alert('Make sure your courses have the proper code + section number! \n \n Courses should look like MPM2D1-12 or ENG2D1-1')
        return 1;
      }

      // Alter common mistakes

      // 5th character 0 instead of O
      if (course[4] == '0') {
        let str = course.split('');
        str[4] = 'O';
        course = str.join('');
        crs[i] = course
      }

      // Course code to uppercase
      for (let j = 0; j < course.length; j++) {
        let code = course.charCodeAt(j)

        if (code >= 97 && code <= 122) {
          let str = course.split('');
          code -= 32

          str[j] = String.fromCharCode(code);
          course = str.join('');
          crs[i] = course
        }
      }
    }

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

        // TODO: Refresh after submission

        addStudentForm.reset()
    })
    .catch(err => {
      console.log(err.message)
    })
  })
}