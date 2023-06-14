import React, { useState } from "react";
import "../../style/ChangePassword.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import moment from "moment";
// Firebase
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
// Toast
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../Toast/Toast";

const ChangePassword = ({ userData, onSave }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [cNewPassword, setCNewPassword] = useState("");
  // Visibility (eye icon)
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCNewPassword, setShowCNewPassword] = useState(false);

  const [oldPasswordFocus, setOldPasswordFocus] = useState(false);
  const [newPasswordFocus, setNewPasswordFocus] = useState(false);
  const [cNewPasswordFocus, setCNewPasswordFocus] = useState(false);

  // Validation
  const [checkNewPassword, setCheckNewPassword] = useState(false);
  const [checkNewCPassword, setCheckNewCPassword] = useState(false);
  const handleCheckNewPassword = (text) => {
    let regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,}$/;

    setNewPassword(text);
    if (regex.test(text)) {
      setCheckNewPassword(false);
    } else {
      setCheckNewPassword(true);
    }
  };
  const handleCheckNewCPassword = (text) => {
    setCNewPassword(text);
    if (newPassword !== text) {
      setCheckNewCPassword(true);
    } else {
      setCheckNewCPassword(false);
    }
  };

  const [customErrorMsg, setCustomErrorMsg] = useState("");
  // Save button function
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      const updatedFields = [];

      // Perform the password update
      await updatePassword(user, newPassword);
      const userId = user.uid;
      const userDataRef = doc(db, "UserData", userId);
      const userDataSnapshot = await getDoc(userDataRef);

      if (userDataSnapshot.exists()) {
        const firstName = userDataSnapshot.data().firstName;
        const lastName = userDataSnapshot.data().lastName;
        const profileImageUrl = userDataSnapshot.data().profileImageUrl;
        const role = userDataSnapshot.data().role;

        const monthDocumentId = moment().format("YYYY-MM");
        const activityLogDocRef = doc(db, "ActivityLog", monthDocumentId);
        const activityLogDocSnapshot = await getDoc(activityLogDocRef);
        const activityLogData = activityLogDocSnapshot.exists()
          ? activityLogDocSnapshot.data().actionLogData || []
          : [];

        activityLogData.push({
          timestamp: new Date().toISOString(),
          updatedFields: updatedFields,
          userId: userId,
          firstName: firstName,
          lastName: lastName,
          profileImageUrl: profileImageUrl,
          role: role,
          actionType: "Update",
          actionDescription: "Updated user password",
        });

        await setDoc(
          activityLogDocRef,
          {
            actionLogData: activityLogData,
          },
          { merge: true }
        );
        onSave();
        showSuccessToast("Password updated successfully!");
      } else {
        showInfoToast("No user data", 2000);
      }
    } catch (error) {
      switch (error.code) {
        case "auth/wrong-password":
          showErrorToast("Incorrect old password. Please try again.");
          break;
        case "auth/too-many-requests":
          showErrorToast("Too many attempts. Please try again later.");
          break;
        default:
          showErrorToast("An error occurred. Please try again later.");
          break;
      }
    }
  };

  return (
    <div className="changePass__container">
      <h5>Change Password</h5>

      <form className="changePass__form">
        {/*------------------ Old Password ----------------- */}
        <div className="changePassForm__group">
          {customErrorMsg !== "" && (
            <label className="changePass__ErrorMsg">{customErrorMsg}</label>
          )}
          <label htmlFor="oldPass__input">Old Password:</label>
          <div className="changePass__input-container">
            <input
              type={showOldPassword ? "text" : "password"}
              id="oldPass__input"
              className="changePassForm__input"
              placeholder="Enter Old Password"
              onChange={(e) => setOldPassword(e.target.value)}
              onFocus={() => {
                setOldPasswordFocus(true);
                setNewPasswordFocus(false);
                setCNewPasswordFocus(false);

                setShowOldPassword(false);
                setShowNewPassword(false);
                setShowCNewPassword(false);
              }}
            />

            {/* Toggle On and Off Eye Icon */}
            <div
              className="changePass__input-icon"
              onClick={() => setShowOldPassword(!showOldPassword)}
            >
              {showOldPassword ? (
                <VisibilityOffIcon className="changePass__visibility-icon" />
              ) : (
                <VisibilityIcon className="changePass__visibility-icon" />
              )}
            </div>
          </div>
        </div>

        {/*------------------ New Password ----------------- */}
        <div className="changePassForm__group">
          <label htmlFor="newPass__input">New Password:</label>
          <div className="changePass__input-container">
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPass__input"
              className="changePassForm__input"
              placeholder="Enter New Password"
              // onChange={(e) => setNewPassword(e.target.value)}
              onChange={(e) => handleCheckNewPassword(e.target.value)}
              onFocus={() => {
                setOldPasswordFocus(false);
                setNewPasswordFocus(true);
                setCNewPasswordFocus(false);

                setShowOldPassword(false);
                setShowNewPassword(false);
                setShowCNewPassword(false);
              }}
            />

            {/* Toggle On and Off Eye Icon */}
            <div
              className="changePass__input-icon"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <VisibilityOffIcon className="changePass__visibility-icon" />
              ) : (
                <VisibilityIcon className="changePass__visibility-icon" />
              )}
            </div>
          </div>
          {/* Error Message */}
          {checkNewPassword ? (
            <label className="registration__errorMsg">
              The new password must contain at least 8 characters, including at
              least one uppercase letter, one lowercase letter, one number, and
              one special character (# $ @ ! % & * ?).
            </label>
          ) : (
            ""
          )}
        </div>

        {/*------------------ Confirm New Password ----------------- */}
        <div className="changePassForm__group">
          <label htmlFor="confirmNewPass__input">Confirm New Password:</label>
          <div className="changePass__input-container">
            <input
              type={showCNewPassword ? "text" : "password"}
              id="confirmNewPass__input"
              className="changePassForm__input"
              placeholder="Enter New Password"
              onChange={(e) => handleCheckNewCPassword(e.target.value)}
              onFocus={() => {
                setOldPasswordFocus(false);
                setNewPasswordFocus(false);
                setCNewPasswordFocus(true);

                setShowOldPassword(false);
                setShowNewPassword(false);
                setShowCNewPassword(false);
              }}
            />
            {/* Toggle On and Off Eye Icon */}
            <div
              className="changePass__input-icon"
              onClick={() => setShowCNewPassword(!showCNewPassword)}
            >
              {showCNewPassword ? (
                <VisibilityOffIcon className="changePass__visibility-icon" />
              ) : (
                <VisibilityIcon className="changePass__visibility-icon" />
              )}
            </div>
          </div>

          {/* Error Message */}
          {checkNewCPassword ? (
            <label className="registration__errorMsg">
              Confirm New Password do not match with New Password
            </label>
          ) : (
            ""
          )}
        </div>
      </form>

      <div className="changePass__btns">
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default ChangePassword;
