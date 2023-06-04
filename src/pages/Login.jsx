import React, { useState, useEffect } from "react";
import "../style/Login.css";
import moment from "moment/moment";

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
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

// Redux
import { useDispatch, useSelector } from "react-redux";
import {
  userLogInState,
  userLogOutState,
  selectUser,
  setSignInClicked,
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

  // Update Activity Log Data once login
  const updateActivityLog = async (uid, userData) => {
    const startOfMonth = moment().startOf("month").toISOString();
    const endOfMonth = moment().endOf("month").toISOString();
    const monthDocumentId = moment().format("YYYY-MM");

    const docRef = doc(db, "ActivityLog", monthDocumentId);
    const docSnap = await getDoc(docRef);

    const uniqueId = `${uid}-${Date.now()}`; // Generate a unique ID
    const logData = {
      id: uniqueId,
      uid,
      profileImageUrl: userData.profileImageUrl,
      firstName: userData.firstName,
      lastName: userData.lastName,
      lastLoginAt: userData.lastLoginAt,
    };

    const updatedLogData = { ...logData }; // Create a copy of logData

    if (docSnap.exists()) {
      const activityLogData = docSnap.data().activityLogData || [];
      activityLogData.push(updatedLogData);
      await updateDoc(docRef, { activityLogData });
    } else {
      await setDoc(docRef, { activityLogData: [updatedLogData] });
    }
  };

  // Sign Up Button Function
  const handleSignIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // If email is verified, update emailVerified and lastLoginAt
        if (auth.currentUser.emailVerified) {
          // Get the current date and time
          const currentDate = new Date();
          const lastLoginAt = currentDate.toISOString();

          // Update user data in Firestore
          const userDocRef = doc(db, "UserData", auth.currentUser.uid);
          updateDoc(userDocRef, {
            emailVerified: "Verified",
            lastLoginAt: lastLoginAt, // Update lastLoginAt field
          })
            .then(async () => {
              // Retrieve the user data for activity log
              const userDoc = await getDoc(userDocRef);
              const userData = userDoc.data();

              // Update activity log
              await updateActivityLog(auth.currentUser.uid, userData);

              showSuccessToast("You've successfully logged in", 1000);
              navigate("/home");
              dispatch(fetchBagItems(auth.currentUser.uid));
              // Prevent user from going back to login page
              window.history.pushState(null, "", "/home");
              window.addEventListener("popstate", function (event) {
                window.history.pushState(null, "", "/home");
              });
              dispatch(setSignInClicked(true));
            })
            .catch((error) => {
              showErrorToast(
                "Error updating email verification status",
                error.message
              );
              setEmail("");
              setPassword("");
              setCustomErrorMsg("");
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
          setEmail("");
          setPassword("");
        } else if (
          errorMessage ===
          "Firebase: The email address is badly formatted. (auth/invalid-email)."
        ) {
          setCustomErrorMsg("Please enter a valid email address");
          setEmail("");
          setPassword("");
        } else {
          setCustomErrorMsg(
            "Please enter your correct email address or password"
          );
          setEmail("");
          setPassword("");
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
  const handleGoogleLogin = () => {
    const googleProvider = new GoogleAuthProvider();

    // this custom parameter will let the user select the Google account they want to use for signing in
    googleProvider.setCustomParameters({ prompt: "select_account" });

    signInWithPopup(auth, googleProvider)
      .then(async (result) => {
        const email = result.user.email;
        const googleUid = result.user.uid;

        const displayName = result.user.displayName;
        const [firstName, ...lastNameArr] = displayName.split(" ");
        const lastName = lastNameArr.join(" ");

        const userDataRef = collection(db, "UserData"); // getting the UserData collection
        const queryData = query(userDataRef, where("uid", "==", googleUid));

        const querySnapshot = await getDocs(queryData);
        if (querySnapshot.empty) {
          // user does not exist in the database, so add a new document with document id and user id having the same value
          await setDoc(doc(userDataRef, googleUid), {
            fullName: displayName,
            firstName: firstName,
            lastName: lastName,
            email: email,
            emailVerified: "Verified",
            uid: googleUid,
            role: "Customer",
            createdAt: serverTimestamp(),
            lastLoginAt: new Date().toISOString(), // Set the initial value of lastLoginAt
          });
        } else {
          // User already exists, so update the lastLoginAt field
          const docRef = querySnapshot.docs[0].ref;
          await updateDoc(docRef, {
            lastLoginAt: new Date().toISOString(),
          });
        }

        // Call the updateActivityLog function
        await updateActivityLog(googleUid, {
          profileImageUrl: "", // Add the profile image URL if available
          firstName: firstName,
          lastName: lastName,
          lastLoginAt: new Date().toISOString(),
        });

        showSuccessToast("You've successfully logged in using Google");
        navigate("/home");
        dispatch(setSignInClicked(true));
      })
      .catch((error) => {
        console.log(error);
        showErrorToast(
          "An error occurred while signing in with Google. Please try again."
        );
      });
  };

  // Order as Guest Button Function
  const handleOrderAsGuest = () => {
    signInAnonymously(auth)
      .then(() => {
        showSuccessToast("Signed in as guest", 1000);
        navigate("/home");
        dispatch(setSignInClicked(true));
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

        {/* <label className="or__txt d-flex justify-content-center mb-2">OR</label> */}

        {/*------------------ Order As Guest Button ----------------- */}
        {/* <button className="guest__btn" onClick={handleOrderAsGuest}>
          <img className="btn__icon" src={peopleIcon} alt="btn-icon" />
          Order as Guest
        </button> */}
      </div>
    </div>
  );
};

export default Login;
