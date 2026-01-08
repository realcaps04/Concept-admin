  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
    import { getAuth, googleAuthProvider,signInWithPopup } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDvoyPiAuv7xs98XXKjX50mjrtB6pHLJyw",
    authDomain: "consoleprojectsmain.firebaseapp.com",
    projectId: "consoleprojectsmain",
    storageBucket: "consoleprojectsmain.firebasestorage.app",
    messagingSenderId: "310183711208",
    appId: "1:310183711208:web:5c4888e45b41ab4c78d45d"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  auth.languageCode = 'en'
  const provider = new googleAuthProvider();





const googleLogin = document.getElementById("google-login-btn");
    googleLogin.addEventListener("click", function(){
    signInWithPopup (auth, provider)
    .then((result) => {
    const credential = GoogleAuthProvider.credential FromResult (result);
    const user = result.user;
    console.log(user);
    window.location.href = "../all.html";
    }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    });
})