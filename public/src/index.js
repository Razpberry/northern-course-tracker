/*
HOW TO RUN BACKEND:

Cd into /public/src
Run "npm run build"
*/

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// initializeApp = require('firebase/app');
import { getAnalytics, setAnalyticsCollectionEnabled } from "firebase/analytics";
// getAnalytics = require('firebase/analytics');
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, addDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
// getFirestore = require('firebase/firestore');

// Authentication imports
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Your web app's Firebase configuration
import { firebaseConfig } from './config'
  
// Bootstrap imports
import * as bootstrap from 'bootstrap';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth();

// init firestore database
const db = getFirestore()
const colRefCText = 'semesters/26-2/courses'
const colRefSText = 'students'
const colRefC = collection(db, colRefCText)
const colRefS = collection(db, colRefSText)

window.addEventListener('DOMContentLoaded', function() {
  loadUserInfo()

  if (!getCookie('userId')) {
    const loginModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('loginModal'));
    loginModal.show();
  }
});

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

window.getStdClasses = async () => {
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

  let courseStr = '';

  // Get courses from db using id
  getDocs(colRefS)
      .then(async (snapshot) => {
        let stds = []
        snapshot.docs.forEach((doc) => {
          stds.push({ ...doc.data(), id: doc.id})
        })

        for (let i = 0; i < stds.length; i++) {
          if (code == stds[i].id) {
            let crs = stds[i].courses
            courseStr = ''

            for (let j = 0; j < crs.length; j++) {
              const courseCode = crs[j];
              courseStr += `<div style='font-weight: 600'>${courseCode}</div>`;
              
              try {
                const courseRef = doc(db, colRefCText + '/' + courseCode);
                const courseDoc = await getDoc(courseRef);
                
                const studentIds = courseDoc.data().students || [];
                
                // Get all students in this course
                const allStudents = [];
                for (const studentDoc of snapshot.docs) {
                  if (studentIds.includes(studentDoc.id)) {
                    const student = studentDoc.data();
                    allStudents.push(student.firstname + ' ' + student.lastname);
                  }
                }
                
                allStudents.sort();
                courseStr += allStudents.join('<br>') + '<br><br>';

              } catch (error) {
                console.error(`Error loading course ${courseCode}:`, error);
                courseStr += 'Error loading students<br><br>';
              }
            }

            break;
          }
        }
        document.getElementById("list").innerHTML = courseStr
      })  
      .catch(err => {
        console.log(err.message)
      })
      
  // if (document.getElementById("user-courses") && user.courses) {
  //         let courseStr = '';
          
  //         for (let i = 0; i < user.courses.length && i < 4; i++) {
  //           const courseCode = user.courses[i];
  //           courseStr += `<div style='font-weight: 600'>${courseCode}</div>`;
            
  //           try {
  //             const courseRef = doc(db, colRefCText + '/' + courseCode);
  //             const courseDoc = await getDoc(courseRef);
              
  //             if (courseDoc.exists()) {
  //               const studentIds = courseDoc.data().students || [];
                
  //               // Get all students in this course
  //               const allStudents = [];
  //               for (const studentDoc of snapshot.docs) {
  //                 if (studentIds.includes(studentDoc.id)) {
  //                   const student = studentDoc.data();
  //                   allStudents.push(student.firstname + ' ' + student.lastname);
  //                 }
  //               }
                
  //               allStudents.sort();
  //               courseStr += allStudents.join('<br>') + '<br><br>';
  //             } else {
  //               courseStr += 'No students found<br><br>';
  //             }
  //           } catch (error) {
  //             console.error(`Error loading course ${courseCode}:`, error);
  //             courseStr += 'Error loading students<br><br>';
  //           }
  //         }
          
  //         document.getElementById("user-courses").innerHTML = courseStr;
  //       }
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
          else if (subject == 'eng') {
            // Include NBE and ENG courses in English
            if (code == 'NBE' || code == 'ENG') {
              string += '<option value=' + id + '>' + id + '</option>'
            }
          }
          else if (subject == 'art') {
            // Include NAC courses in Art
            if (code == 'NAC') {
              string += '<option value=' + id + '>' + id + '</option>'
            }
          }
          else if (subject == 'other') {
            if (first != 'a' && first != 'b' && first != 'c' && first != 'e' && first != 'f' && first != 'l' && first != 'm' && first != 'p' && first != 's' && first != 't' && code != 'GLC' && code != 'NBE') {
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

  // addStudentForm.addEventListener('submit', (e) => {
  //   e.preventDefault()
  //   let crs = [
  //     addStudentForm.course1.value, 
  //     addStudentForm.course2.value, 
  //     addStudentForm.course3.value, 
  //     addStudentForm.course4.value
  //   ]
    
  //   // TODO: Ensure full first and last name; prevent one letter last initial's (e.g. Nicholas S)

  //   // TODO: Ensure capatalization of names (e.g. nicholas stakoun -> Nicholas Stakoun)

  //   // Course input error catching
  //   for (let i = 0; i < crs.length; i++) {
  //     let course = crs[i]

  //     // Ensure proper formatting
  //     if (
  //       (course.length != 8 && course.length != 9)
  //       || course[6] != '-'
  //     ) {
  //       document.getElementById("formconfirmation").innerText = 'Error submitting... Try again!'
  //       alert('Make sure your courses have the proper code + section number! \n \n Courses should look like MPM2D1-12 or ENG2D1-1')
  //       return 1;
  //     }

  //     // Alter common mistakes

  //     // 5th character 0 instead of O
  //     if (course[4] == '0') {
  //       let str = course.split('');
  //       str[4] = 'O';
  //       course = str.join('');
  //       crs[i] = course
  //     }

  //     // Course code to uppercase
  //     for (let j = 0; j < course.length; j++) {
  //       let code = course.charCodeAt(j)

  //       if (code >= 97 && code <= 122) {
  //         let str = course.split('');
  //         code -= 32

  //         str[j] = String.fromCharCode(code);
  //         course = str.join('');
  //         crs[i] = course
  //       }
  //     }
  //   }

  //   addDoc(colRefS, {
  //     firstname: addStudentForm.firstname.value,
  //     lastname: addStudentForm.lastname.value,
  //     courses: crs
  //   })
  //   .then((docRef) => {
  //     document.getElementById("formconfirmation").innerText = 'Submitted! Thank you! Please refresh the page to see updates'
  //     id = docRef.id

  //     getDocs(colRefC)
  //       .then((snapshot) => {
  //         let allCrs = []
  //         snapshot.docs.forEach((doc) => {
  //           allCrs.push({ ...doc.data(), id: doc.id})
  //         })

  //         for (let i = 0; i < crs.length; i++) {
  //           let found = false;
  //           let path = colRefCText + '/' + crs[i]
  //           let ref = doc(db, path)

  //           for (let j = 0; j < allCrs.length; j++) {
  //             if (crs[i] == allCrs[j].id) {
  //               found = true;
  //               updateDoc(ref, {
  //                 students: arrayUnion(id)
  //               })

  //               break;
  //             }
  //           }
  //           if (!found) {
  //             setDoc(ref, {
  //               students: [
  //                 id
  //               ]
  //             })
  //           }
  //         }
  //       })

  //       // TODO: Refresh after submission

  //       addStudentForm.reset()
  //   })
  //   .catch(err => {
  //     console.log(err.message)
  //   })
  // })
}


window.loginClick = () => {
  signIn(document.getElementById("emailFieldL").value, document.getElementById("passwordFieldL").value)
}

window.toSignUpClick = () => {
  const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
  loginModal.hide();
  const signUpModal = new bootstrap.Modal(document.getElementById('signUpModal'));
  signUpModal.show();
}

window.signUpClick = () => {
  signUp(document.getElementById("emailFieldS").value, document.getElementById("passwordFieldS").value)
}

window.toLoginClick = () => {
  const signUpModal = bootstrap.Modal.getInstance(document.getElementById('signUpModal'));
  signUpModal.hide();
  const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
  loginModal.show();
}

// --- Sign up a new user ---
window.signUp = async (email, password) => {
  try {
    if (!email.endsWith('@student.tdsb.on.ca')) {
      const errorTxt = "Only @student.tdsb.on.ca emails are allowed";
      document.getElementById("modalS-err-msg").innerHTML = errorTxt;
      return;
    }

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Add user data to Firestore
    const docRef = await addDoc(colRefS, {
      firstname: document.getElementById("firstField").value,
      lastname: document.getElementById("lastField").value,
      email: email,
      courses: []
    });

    document.cookie = `userId=${docRef.id}; path=/; max-age=31536000`;
    console.log(document.cookie)
    console.log("Signed up:", user.email);
    window.location.href = "account.html"
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    const errorTxt = "Sign-up failed: " + errorCode;
    document.getElementById("modalS-err-msg").innerHTML = errorTxt;
    console.error("Sign-up failed:", errorCode, errorMessage);
  }
}

// --- Sign in an existing user ---
window.signIn = async (email, password) => {
  try {
    // Sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Find the user's document in Firestore using their email
    const snapshot = await getDocs(colRefS);
    let userDocId = null;
    let userData = null;
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.email === email) {
        userDocId = doc.id;
        userData = data;
      }
    });
    
    if (userDocId && userData) {
      // Set the userId cookie
      document.cookie = `userId=${userDocId}; path=/; max-age=31536000`;
      
      // Update UI elements if they exist
      loadUserInfo()
      
      console.log("Signed in:", user.email);
      console.log("User cookie set:", document.cookie);
      
      // Hide login modal
      const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
      if (loginModal) {
        loginModal.hide();
      }
      
    } else {
      throw new Error("User data not found in database");
    }
    
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    const errorTxt = "Sign-in failed: " + errorCode;
    
    const errorElement = document.getElementById("modalL-err-msg1");
    if (errorElement) {
      errorElement.innerHTML = errorTxt;
    }

    if (errorCode === 'auth/invalid-credential') {
      const msg2 = document.getElementById("modalL-err-msg2");
      if (msg2) {
        msg2.innerHTML = "If you haven't yet... create a new account for semester 2!";
      }
    }
    
    console.error("Sign-in failed:", errorCode, errorMessage);
  }
}

// Example usage
// signUp("newuser@example.com", "my_secret_password");
// signIn("existinguser@example.com", "my_secret_password");

window.signOutUser = async () => {
  try {
    // Clear the userId cookie
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/public;';
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/public/;';
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

    await signOut(auth);
    
    
    console.log("User signed out successfully");
    
    // Show login modal again
    // const loginModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('loginModal'), {
    //   backdrop: 'static',
    //   keyboard: false
    // });
    // loginModal.show();
    
    // redirect to main page
    window.location.href = 'index.html';
    
  } catch (error) {
    console.error('Sign out error:', error);
    alert('Error signing out. Please try again.');
  }
}

window.updateName = async () => {
  let fName = document.getElementById("firstNameField").value
  let lName = document.getElementById("lastNameField").value

  if (fName == '' || lName == '') {
    alert('Please enter your first and last name!');
    return;
  }

  let uid = getCookie("userId");
  let colRefSTemp = colRefSText + '/' + uid
  let tempSRef = doc(db, colRefSTemp)

  try {
    const userDoc = await getDoc(tempSRef)

    await updateDoc(tempSRef, {
      firstname: fName,
      lastname: lName,
    })
    const nameModal = bootstrap.Modal.getInstance(document.getElementById('nameModal'));
    if (nameModal) {
      nameModal.hide();
      
      // Wait for hide animation to complete before disposing
      document.getElementById('nameModal').addEventListener('hidden.bs.modal', function() {
        nameModal.dispose();
        cleanupModalBackdrops();

        window.location.href = 'index.html';
      }, { once: true });
    }
  }
  catch (error) {
    console.log('Error updating courses:', error.message);
  }
}

window.updateCourses = async () => {
  let crs = [
    document.getElementById("courseField1").value, 
    document.getElementById("courseField2").value, 
    document.getElementById("courseField3").value, 
    document.getElementById("courseField4").value,
    // document.getElementById("courseField5").value,
    // document.getElementById("courseField6").value,
    // document.getElementById("courseField7").value,
    // document.getElementById("courseField8").value
  ]

  if (!crs[0] && !crs[1] && !crs[2] && !crs[3]) {
      alert('Please enter your course codes!');
      return;
  }

  // Course filter
  crs = crs.filter(course => course && course.trim() !== '')

  // Course input error catching
  for (let i = 0; i < crs.length; i++) {
    let course = crs[i]

    // Ensure proper formatting
    if (
      (course.length != 8 && course.length != 9)
      || course[6] != '-'
    ) {
      // document.getElementById("formconfirmation").innerText = 'Error submitting... Try again!'
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
    
    // 6th character O instead of 0
    if (course[5] == 'O') {
      let str = course.split('');
      str[5] = '0';
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

  let uid = getCookie("userId");
  let colRefSTemp = colRefSText + '/' + uid
  let tempSRef = doc(db, colRefSTemp)

  try {
    const userDoc = await getDoc(tempSRef)
    const oldCourses = (userDoc.data().courses || []).filter(course => course && course.trim() !== '')

    const removePromises = []

    for (const oldCourse of oldCourses) {
      const courseRef = doc(db, colRefCText + '/' + oldCourse)
      removePromises.push(
        updateDoc(courseRef, {
          students: arrayRemove(uid)
        }).catch((error) => {
          console.log(`Course ${oldCourse} not found, skipping removal`)
        })
      )
    }

    await Promise.all(removePromises)

    await updateDoc(tempSRef, {
      // firstname: addStudentForm.firstname.value,
      // lastname: addStudentForm.lastname.value,
      courses: crs
    })
  
    // document.getElementById("formconfirmation").innerText = 'Submitted! Thank you! Please refresh the page to see updates'
    const snapshot = await getDocs(colRefC)
    let allCrs = []
    snapshot.docs.forEach((doc) => {
      allCrs.push({ ...doc.data(), id: doc.id})
    })

    for (let i = 0; i < crs.length; i++) {
      let found = false;
      let path = colRefCText + '/' + crs[i]
      let ref = doc(db, path)

      for (let j = 0; j < allCrs.length; j++) {
        if (crs[i] == allCrs[j].id) {
          found = true;
          await updateDoc(ref, {
            students: arrayUnion(uid)
          })

          break;
        }
      }
      if (!found) {
        await setDoc(ref, {
          students: [
            uid
          ]
        })
      }
    }

    // addStudentForm.reset()
    const coursesModal = bootstrap.Modal.getInstance(document.getElementById('coursesModal'));
    if (coursesModal) {
      coursesModal.hide();
      
      // Wait for hide animation to complete before disposing
      document.getElementById('coursesModal').addEventListener('hidden.bs.modal', function() {
        coursesModal.dispose();
        cleanupModalBackdrops();

        window.location.href = 'index.html';
      }, { once: true });
    }
  }
  catch (error) {
    console.log('Error updating courses:', error.message);
  }
}

function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

async function loadUserInfo() {
  const userId = getCookie('userId');
  if (!userId) {
    document.getElementById('user-courses').innerHTML = "<div style='font-size: 20px'><em>Log in to see your courses!<em></div>";
    return;
  }
  try {
    const snapshot = await getDocs(colRefS);
    
    for (const docSnapshot of snapshot.docs) {
      if (docSnapshot.id === userId) {
        const user = docSnapshot.data();

        // Show Courses Modal if no courses have been selected
        if (!user.courses || user.courses.length === 0) {
          const coursesModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('coursesModal'));
          if (coursesModal && document.getElementById('coursesModal')) {
            coursesModal.show();
          }
        }
        
        // Update page elements if they exist
        if (document.getElementById("account-first")) {
          document.getElementById("account-first").innerHTML = `Your First Name: ${user.firstname}`;
        }
        if (document.getElementById("account-last")) {
          document.getElementById("account-last").innerHTML = `Your Last Name: ${user.lastname}`;
        }
        if (document.getElementById("firstNameField")) {
          document.getElementById("firstNameField").value = `${user.firstname}`;
        }
        if (document.getElementById("lastNameField")) {
          document.getElementById("lastNameField").value = `${user.lastname}`;
        }
        
        // Get classmates for each course
        if (document.getElementById("user-courses") && user.courses) {
          let courseStr = '';
          
          for (let i = 0; i < user.courses.length && i < 4; i++) {
            const courseCode = user.courses[i];
            courseStr += `<div style='font-weight: 600'>${courseCode}</div>`;
            
            try {
              const courseRef = doc(db, colRefCText + '/' + courseCode);
              const courseDoc = await getDoc(courseRef);
              
              if (courseDoc.exists()) {
                const studentIds = courseDoc.data().students || [];
                
                // Get all students in this course
                const allStudents = [];
                for (const studentDoc of snapshot.docs) {
                  if (studentIds.includes(studentDoc.id)) {
                    const student = studentDoc.data();
                    allStudents.push(student.firstname + ' ' + student.lastname);
                  }
                }
                
                allStudents.sort();
                courseStr += allStudents.join('<br>') + '<br><br>';
              } else {
                courseStr += 'No students found<br><br>';
              }
            } catch (error) {
              console.error(`Error loading course ${courseCode}:`, error);
              courseStr += 'Error loading students<br><br>';
            }
          }
          
          document.getElementById("user-courses").innerHTML = courseStr;
        }
        
        // Fill course fields if they exist
        if (user.courses) {
          for (let i = 0; i < 4; i++) {
            const field = document.getElementById(`courseField${i+1}`);
            if (field && user.courses[i]) {
              field.value = user.courses[i];
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading user:', error);
  }
}

window.cleanupModalBackdrops = () => {
  setTimeout(() => {
    // Only remove orphaned backdrops, not ones with active modals
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      const activeModals = document.querySelectorAll('.modal.show');
      if (activeModals.length === 0) {
        backdrop.remove();
      }
    });
    
    // Only reset body if no active modals
    const activeModals = document.querySelectorAll('.modal.show');
    if (activeModals.length === 0) {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }, 300);
}