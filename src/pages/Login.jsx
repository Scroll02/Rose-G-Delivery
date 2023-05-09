import React, { useState, useEffect } from "react";
import "../style/Login.css";

// Icons or  Images
import registerIcon from "../assets/images/registered.png";
import peopleIcon from "../assets/images/user-dark.png";
import googleIcon from "../assets/images/googleLogo.png";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

// Navigation
import { Link, useNavigate } from "react-router-dom";

// Firebase
import { db, auth } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  addDoc,
} from "firebase/firestore";

// Redux
import { useDispatch, useSelector } from "react-redux";
import {
  userLogInState,
  userLogOutState,
  selectUser,
} from "../store/UserSlice/userSlice";
import { fetchBagItems } from "../store/MyBag/bagSlice";

// Toast
import {
  showSuccessToast,
  showInfoToast,
  showErrorToast,
} from "../components/Toast/Toast";

const Login = () => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Navigation
  const navigate = useNavigate();

  //Redux
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (authUser && authUser.emailVerified === true) {
        // Logged In Action
        dispatch(
          userLogInState({
            email: authUser.email,
            lastSignIn: authUser.metadata.lastSignInTime,
            // emailVerified: authUser.emailVerified.toString(),
          })
        );
        // Clear textfields once successfully logged in
        setEmail("");
        setPassword("");
      } else {
        // Logged Out action
        dispatch(userLogOutState());
        // Clear textfields once successfully logged out
        setEmail("");
        setPassword("");
      }
    });
  }, []);

  // Validation Error Messagge
  const [customErrorMsg, setCustomErrorMsg] = useState("");

  // Sign Up Button Function
  const handleSignIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // If email is verified, the user can logged in
        if (auth.currentUser.emailVerified) {
          showSuccessToast("Logged in successfully", 1000);
          navigate("/home");
          dispatch(fetchBagItems(auth.currentUser.uid));
          // Prevent user from going back to login page
          window.history.pushState(null, "", "/home");
          window.addEventListener("popstate", function (event) {
            window.history.pushState(null, "", "/home");
          });
        }
        // Verify email first to login
        else {
          showErrorToast("Verify your email first", 1000);
          setEmail("");
          setPassword("");
          setCustomErrorMsg("");
        }
      })
      .catch((error) => {
        console.log(error);
        var errorMessage = error.message;
        if (email === "" && password === "") {
          setCustomErrorMsg("Please enter your email address and password");
        } else if (
          errorMessage ===
          "Firebase: The email address is badly formatted. (auth/invalid-email)."
        ) {
          setCustomErrorMsg("Please enter a valid email address");
        } else {
          setCustomErrorMsg(
            "Please enter your correct email address or password"
          );
        }
      });
  };
  // When "Enter" pressed, handleSignIn will be working
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSignIn(e);
    }
  };

  // Sign in With Google
  const [displayName, setDisplayName] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);

  const handleGoogleLogin = () => {
    const googleProvider = new GoogleAuthProvider();

    // this custom parameter will let the user to select the google account they want to use for signing in
    googleProvider.setCustomParameters({ prompt: "select_account" });

    signInWithPopup(auth, googleProvider)
      .then(async (result) => {
        const email = result.user.email;
        const googleUid = result.user.uid;

        const displayName = result.user.displayName;
        setDisplayName(displayName);
        // Split the display name into first and last name
        const names = displayName.split(" ");
        setFirstName(names[0]);
        setLastName(names[names.length - 1]);

        const userDataRef = collection(db, "UserData"); // getting the UserData collection
        const queryData = query(userDataRef, where("uid", "==", googleUid));

        const querySnapshot = await getDocs(queryData);
        if (querySnapshot.empty) {
          // user does not exist in database, so add a new document
          await addDoc(userDataRef, {
            fullName: displayName,
            firstName: firstName,
            lastName: lastName,
            email: email,
            uid: googleUid,
          });
        }

        showSuccessToast("Successfully sign-in using google");
        navigate("/home");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Order as Guest Button Function
  const handleOrderAsGuest = () => {
    signInAnonymously(auth)
      .then(() => {
        showSuccessToast("Signed in as guest", 1000);
        navigate("/home");
      })
      .catch((error) => {
        console.error("Error signing in as guest: ", error);
      });
  };

  return (
    <div className="login__body">
      <div className="login__container">
        <h5 className="mb-4">Sign in to your account</h5>

        {/*------------------ Login Content ----------------- */}

        {/*------------------ Validation Error Message ----------------- */}
        {customErrorMsg !== "" && (
          <label className="customErrorMsg">{customErrorMsg}</label>
        )}

        <form className="login__form" onSubmit={handleSignIn}>
          {/*------------------ Email Field ----------------- */}
          <div className="loginForm__group">
            <label htmlFor="email__input">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="youremail@gmail.com"
              id="email__input"
              className="loginForm__input"
              name="email"
              onFocus={() => {
                setEmailFocus(true);
                setShowPassword(false);
                setPasswordFocus(false);
              }}
              onKeyDown={handleKeyPress}
            />
          </div>

          {/*------------------ Password Field ----------------- */}
          <div className="loginForm__group">
            <label htmlFor="password__input">Password</label>
            <div className="login__input-container">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="**********"
                id="password__input"
                className="loginForm__input"
                onFocus={() => {
                  setEmailFocus(false);
                  setPasswordFocus(true);
                }}
                onKeyDown={handleKeyPress}
              />

              {/* Toggle On and Off Eye Icon */}
              <div
                className="login__input-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <VisibilityOffIcon className="visibility-icon" />
                ) : (
                  <VisibilityIcon className="visibility-icon" />
                )}
              </div>
            </div>
          </div>

          {/*------------------ Password Field ----------------- */}
        </form>

        {/*------------------ Forgot Password ----------------- */}

        <label className="forgotPassTxt mt-2 mb-3">
          <span className="forgotPassTxt">
            <Link to="/forgotPassword">Forgot Password?</Link>
          </span>
        </label>

        {/*------------------ Sign In Button ----------------- */}
        <button className="signIn__btn" onClick={handleSignIn}>
          Sign In
        </button>

        {/*------------------ Dont' have an account? ----------------- */}
        <label className="dontHave__txt d-flex justify-content-center mt-3">
          Don't have an account?
        </label>

        {/*------------------ Create An Account Button ----------------- */}
        <Link to="/registration">
          <button className="createAcc__btn">
            <img className="btn__icon" src={registerIcon} alt="btn-icon" />
            Create An Account
          </button>
        </Link>

        {/*------------------ Connect With Google Button ----------------- */}

        <button className="connectGoogle__btn" onClick={handleGoogleLogin}>
          <img className="btn__icon" src={googleIcon} alt="btn-icon" />
          Connect With Google
        </button>

        {/*------------------ Terms & Condition - Privacy Policy ----------------- */}
        <div className="youAgree__txt">
          <label>
            By continuing, you agree to our updated&nbsp;
            <Link to="/termsCondition">
              <span className="termsConditionTxt">Terms & Conditions</span>
            </Link>
            &nbsp;and&nbsp;
            <Link to="/privacyPolicy">
              <span className="privacyPolicyTxt">Privacy Policy.</span>
            </Link>
          </label>
        </div>

        <label className="or__txt d-flex justify-content-center mb-2">OR</label>

        {/*------------------ Order As Guest Button ----------------- */}
        <button className="guest__btn" onClick={handleOrderAsGuest}>
          <img className="btn__icon" src={peopleIcon} alt="btn-icon" />
          Order as Guest
        </button>
      </div>
    </div>
  );
};

export default Login;
