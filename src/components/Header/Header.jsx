import React, { useState, useRef, useEffect } from "react";
import "../../style/Header.css";
import moment from "moment";

// Navigation
import { NavLink, Link, useNavigate } from "react-router-dom";

// Icons or Images
// import RoseGLogo5 from "../../assets/logo/logo5.png";
import RoseGLogo6 from "../../assets/logo/logo6.png";
import userIcon from "../../assets/images/user.png";
import userDarkIcon from "../../assets/images/user-dark.png";
import settingIcon from "../../assets/images/setting.png";
import logoutIcon from "../../assets/images/logout.png";
import logoutDarkIcon from "../../assets/images/logout-dark.png";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ShoppingCartTwoToneIcon from "@mui/icons-material/ShoppingCartTwoTone";

// Firebase
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  where,
  getDocs,
  query,
  onSnapshot,
  updateDoc,
  getDoc,
  doc,
} from "firebase/firestore";

// Redux
import { bagUiActions } from "../../store/MyBag/bagUiSlice";
import { useSelector, useDispatch } from "react-redux";
import {
  userLogInState,
  userLogOutState,
  selectUser,
} from "../../store/UserSlice/userSlice";

// Toast
import { showSuccessToast } from "../Toast/Toast";

// Main Menu Navigation Links
const nav__links = [
  {
    display: "Home",
    path: "/home",
  },
  {
    display: "Menu",
    path: "/menu",
  },
  {
    display: "Orders",
    path: "/orders",
  },
  // {
  //   display: "Login",
  //   path: "/login",
  // },
  // {
  //   display: "Sign up",
  //   path: "/registration",
  // },
];

const Header = () => {
  const menuRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate(); // Navigation
  const signInClicked = useSelector((state) => state.user.signInClicked);

  //------------------ User Profile Drop Down ------------------//
  const [open, setOpen] = useState(false);
  const toggleProfileMenu = () => {
    setOpen(!open);
  };
  // When the user click outside of the drop down menu, the toggle should be off or closed
  const dropdownMenuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownMenuRef]);

  //------------------ Retrieve User Data ------------------//
  const [userLoggedUid, setUserLoggedUid] = useState(null);
  const [userData, setUserData] = useState(null);

  const getUserData = () => {
    const userDataRef = collection(db, "UserData"); // getting the UserData collection
    const queryData = query(userDataRef, where("uid", "==", userLoggedUid));

    const unsubscribe = onSnapshot(queryData, (querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          setUserData(doc.data());
        });
      } else {
        //navigation.navigate("Login");
        console.log("Empty user document");
      }
    });

    return unsubscribe;
  };
  useEffect(() => {
    const unsubscribe = getUserData();
    return () => {
      unsubscribe();
    };
  }, [userLoggedUid]);

  // const getUserData = () => {
  //   const userDataRef = collection(db, "UserData"); // getting the UserData collection
  //   const queryData = query(userDataRef, where("uid", "==", userLoggedUid));

  //   getDocs(queryData).then((querySnapshot) => {
  //     if (!querySnapshot.empty) {
  //       querySnapshot.forEach((doc) => {
  //         setUserData(doc.data());
  //       });
  //     } else {
  //       //navigation.navigate("Login");
  //       console.log("Empty user document");
  //     }
  //   });
  // };
  // useEffect(() => {
  //   getUserData();
  // }, [userLoggedUid]);

  //------------------ User Bag ------------------//
  const totalQuantity = useSelector((state) => state.bag.totalQuantity);
  const dispatch = useDispatch();
  const toggleBag = () => {
    dispatch(bagUiActions.toggle());
  };

  //------------------ Redux ------------------//
  const user = useSelector(selectUser);
  // onAuthChanged
  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (authUser && authUser.emailVerified === true) {
        // Logged In Action
        dispatch(
          userLogInState({
            email: authUser.email,
            firstName: authUser.firstName,
          })
        );
        setUserLoggedUid(authUser.uid);
      } else {
        // Logged Out action
        dispatch(userLogOutState());
        setUserLoggedUid(null);
      }
    });
  }, []);

  //------------------ Sign Out Function ------------------//
  const handleSignOut = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Retrieve the UserData document
        const userDataRef = doc(db, "UserData", currentUser.uid);
        const userDataDoc = await getDoc(userDataRef);
        const userData = userDataDoc.data();
        const lastLogoutAt = new Date().toISOString();

        // Update lastLogoutAt field in UserData
        await updateDoc(userDataRef, { lastLogoutAt });

        // Update lastLogoutAt field in ActivityLog
        const startOfMonth = moment().startOf("month").toISOString();
        const endOfMonth = moment().endOf("month").toISOString();
        const monthDocumentId = moment().format("YYYY-MM");

        const activityLogRef = doc(db, "ActivityLog", monthDocumentId);
        const activityLogDoc = await getDoc(activityLogRef);

        if (activityLogDoc.exists()) {
          const activityLogData = activityLogDoc.data().activityLogData || [];

          // Find the login entry to update
          const entryToUpdate = activityLogData.find(
            (entry) => entry.uid === currentUser.uid && !entry.lastLogoutAt
          );

          if (entryToUpdate) {
            // Update the entry with the lastLogoutAt value
            entryToUpdate.lastLogoutAt = lastLogoutAt;

            // Update the activityLogData field in ActivityLog
            await updateDoc(activityLogRef, { activityLogData });
          }
        }
      }

      await signOut(auth);
      showSuccessToast("You've successfully logged out", 2000);
      navigate("/login");
    } catch (error) {
      console.log(error);
      alert("An error occurred while logging out. Please try again.");
    }
  };

  //------------------ User Profile Drop Down Links ------------------//
  const userProfile__links = [
    {
      display: "Profile",
      path: "/userProfile",
      icon: userDarkIcon,
    },
    // {
    //   display: "Settings",
    //   path: "/settings",
    //   icon: settingIcon,
    // },
    {
      display: "Logout",
      icon: logoutDarkIcon,
      onClick: handleSignOut,
    },
  ];

  return (
    <header className="header">
      <div className="nav_wrapper d-flex align-items-center">
        <div className="nav__left d-flex align-items-center me-auto">
          <div className="logo">
            <Link to="/home">
              <img src={RoseGLogo6} alt="rose-g-logo" />
            </Link>
          </div>
        </div>

        {/*------------------ Navigation Links ------------------*/}
        <div
          className={isMobile ? "menu-mobile" : "navigation"}
          ref={menuRef}
          onClick={() => setIsMobile(false)}
        >
          <div className="menu d-flex align-items-center gap-4">
            {nav__links.map((item, index) => (
              <NavLink
                to={item.path}
                key={index}
                className={(navClass) =>
                  navClass.isActive ? "active__menu" : ""
                }
              >
                {item.display}
              </NavLink>
            ))}
            {/* Only show login and sign up links when user is not logged in */}
            {user && signInClicked ? null : (
              <>
                <NavLink
                  to="/login"
                  className={(navClass) =>
                    navClass.isActive ? "active__menu" : ""
                  }
                >
                  Login
                </NavLink>
              </>
            )}
          </div>
        </div>

        {user && signInClicked && (
          <div className="nav__icons d-flex align-items-center gap-4">
            {/*------------------ Bag ------------------*/}
            <span className="bag__icon" onClick={toggleBag}>
              <i class="ri-shopping-cart-2-line"></i>
              <span className="bag__badge">{totalQuantity}</span>
            </span>

            {/*------------------ User Profile Drop Down ------------------*/}
            <div className="dropdown" ref={dropdownMenuRef}>
              <button className="dropdown__button" onClick={toggleProfileMenu}>
                {userData?.profileImageUrl ? (
                  <img
                    className="profile__icon"
                    src={userData?.profileImageUrl}
                    alt="Profile Avatar"
                  />
                ) : (
                  <img
                    className="profile__icon"
                    src={userIcon}
                    alt="Profile Avatar"
                  />
                )}

                {/* Determine if the user log in as a guest or not  */}
                <span>
                  {user && user.isAnonymous
                    ? "Guest"
                    : userData?.firstName || "User"}
                </span>
                <svg
                  className="dropdown__icon"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {open && (
          <div className="dropdown__menu">
            {userProfile__links.map((item, index) => (
              <>
                {/* item.onClick is use to not overlap the onClick function from the NavLink */}
                {item.onClick ? (
                  // Log out Link
                  <a className="dropdown__menu__item" onClick={item.onClick}>
                    <img
                      className="icon-logout"
                      src={item.icon}
                      alt={item.display}
                    />
                    {item.display}
                  </a>
                ) : (
                  // Profile Link
                  <NavLink
                    to={item.path}
                    key={index}
                    className="dropdown__menu__item"
                    onClick={toggleProfileMenu}
                  >
                    <img
                      className="icon-profile"
                      src={item.icon}
                      alt={item.display}
                    />
                    {item.display}
                  </NavLink>
                )}
              </>
            ))}
          </div>
        )}
        <span className="mobile__menu" onClick={() => setIsMobile(!isMobile)}>
          {isMobile ? (
            <i class="ri-close-line"></i>
          ) : (
            <i class="ri-menu-line"></i>
          )}
        </span>
      </div>
    </header>
  );
};

export default Header;
