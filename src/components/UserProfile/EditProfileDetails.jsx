import React, { useState } from "react";
import "../../style/EditProfileDetails.css";

// Firebase
import { doc, updateDoc, collection } from "firebase/firestore";
import { db, auth, storage } from "../../firebase";
import {
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";

// Toast
import {
  showErrorToast,
  showSuccessToast,
  showInfoToast,
} from "../Toast/Toast";

const EditProfileDetails = ({
  userData,
  onSave,
  newProfileImage,
  setNewProfileImage,
  fileName,
  setFileName,
  newFirstName,
  setNewFirstName,
  newLastName,
  setNewLastName,
  newEmail,
  setNewEmail,
  newContactNumber,
  setNewContactNumber,
  newAddress,
  setNewAddress,
}) => {
  const handleNewProfileImage = (file) => {
    if (file) {
      setNewProfileImage(file);
      setFileName(file.name);
    } else {
      setNewProfileImage(null);
      setFileName(null);
    }
  };

  /* -------------------- First Name Validation -------------------- */
  const [checkNewFirstName, setCheckNewFirstName] = useState(false);
  const handleNewFirstName = (text) => {
    setNewFirstName(text);
    let reg = /^[A-Za-z ]+$/; // valid alphabet with space
    if (reg.test(text)) {
      setCheckNewFirstName(false);
    } else {
      setCheckNewFirstName(true);
    }
  };

  /* -------------------- Last Name Validation -------------------- */
  const [checkNewLastName, setCheckNewLastName] = useState(false);
  const handleNewLastName = (text) => {
    setNewLastName(text);
    let reg = /^[A-Za-z ]+$/; // valid alphabet with space
    if (reg.test(text)) {
      setCheckNewLastName(false);
    } else {
      setCheckNewLastName(true);
    }
  };

  /* -------------------- Email Validation -------------------- */
  const [checkNewValidEmail, setCheckNewValidEmail] = useState(false);
  const handleNewEmail = (text) => {
    let re = /\S+@\S+\.\S+/;
    let regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

    setNewEmail(text);
    if (re.test(text) || regex.test(text)) {
      setCheckNewValidEmail(false);
    } else {
      setCheckNewValidEmail(true);
    }
  };

  /* -------------------- Contact Number Validation -------------------- */
  const [checkNewContactNumber, setCheckNewContactNumber] = useState(false);
  const handleNewContactNumber = (text) => {
    let regex = /^0\d{10}$/;

    setNewContactNumber(text);
    if (regex.test(text)) {
      setCheckNewContactNumber(false);
    } else {
      setCheckNewContactNumber(true);
    }
  };

  const handleNewAddress = (text) => {
    setNewAddress(text);
  };

  const handleSave = () => {
    const userDataRef = doc(db, "UserData", userData.uid); // getting the UserData document

    const newData = {}; // object to hold updated data
    if (newFirstName !== userData?.firstName && newFirstName.trim() !== "") {
      newData.firstName = newFirstName;
    } else {
      newData.firstName = userData?.firstName;
    }

    if (newLastName !== userData?.lastName && newLastName.trim() !== "") {
      newData.lastName = newLastName;
    } else {
      newData.lastName = userData?.lastName;
    }

    if (newEmail !== userData?.email && newEmail.trim() !== "") {
      newData.email = newEmail;
    } else {
      newData.email = userData?.email;
    }

    if (
      newContactNumber !== userData?.contactNumber &&
      newContactNumber.trim() !== ""
    ) {
      newData.contactNumber = newContactNumber;
    } else {
      newData.contactNumber = userData?.contactNumber;
    }

    if (newAddress !== userData?.address && newAddress.trim() !== "") {
      newData.address = newAddress;
    } else {
      newData.address = userData?.address;
    }

    // Check if a new profile image has been selected
    if (newProfileImage) {
      const storageRef = ref(
        storage,
        `userProfile_images/${userData.uid}/${new Date().getTime()}_${
          newProfileImage.name
        }`
      );
      const uploadTask = uploadBytesResumable(storageRef, newProfileImage);

      Promise.all([uploadTask])
        .then(([snapshot]) => {
          return getDownloadURL(snapshot.ref);
        })
        .then((profileImageUrl) => {
          // Delete old profile image if it exists
          if (userData.profileImageUrl) {
            const oldProfileImageRef = ref(storage, userData.profileImageUrl);
            deleteObject(oldProfileImageRef)
              .then(() => {
                console.log("Old profile image deleted successfully");
              })
              .catch((error) => {
                console.log(error);
              });
          }

          // Update the document with the new data and profile image URL
          newData.profileImageUrl = profileImageUrl;
          return updateDoc(userDataRef, newData);
        })
        .then(() => {
          onSave();
          showSuccessToast("Profile updated successfully.");
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (Object.keys(newData).length === 0) {
      // No changes made
      showInfoToast("No changes made.");
      return;
    } else {
      // Update the document with the new data
      updateDoc(userDataRef, newData)
        .then(() => {
          onSave();
          showSuccessToast("Profile updated successfully.");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  return (
    <div className="editProfile__container">
      <h5>Edit Profile Details</h5>
      <form className="editProfile__form">
        {/* Profile Image */}
        <div className="editForm__group">
          <label htmlFor="profileImage__input">Profile Image:&nbsp;</label>
          <div className="custom__file-upload">
            <input
              type="file"
              accept="image/*"
              id="profileImage__input"
              onChange={(e) => handleNewProfileImage(e.target.files[0])}
            />
            <label htmlFor="profileImage__input">Choose a file</label>
            <span>{fileName}</span>
          </div>
        </div>

        {/* First Name */}
        <div className="editForm__group">
          <label htmlFor="firstName__input">First Name:&nbsp;</label>
          <input
            type="text"
            id="firstName__input"
            className="editForm__input"
            defaultValue={userData?.firstName}
            placeholder="Enter New First Name"
            onChange={(e) => handleNewFirstName(e.target.value)}
          />

          {/* First Name Validation Msg */}
          {checkNewFirstName ? (
            <label className="edit__errorMsg">
              First name may only contain alphabet
            </label>
          ) : (
            ""
          )}
        </div>

        {/* Last Name */}
        <div className="editForm__group">
          <label htmlFor="lastName__input">Last Name:&nbsp;</label>
          <input
            type="text"
            id="lastName__input"
            className="editForm__input"
            defaultValue={userData?.lastName}
            placeholder="Enter New Last Name"
            onChange={(e) => handleNewLastName(e.target.value)}
          />

          {/* Last Name Validation Msg */}
          {checkNewLastName ? (
            <label className="edit__errorMsg">
              Last name may only contain alphabet
            </label>
          ) : (
            ""
          )}
        </div>

        {/* Email */}
        {/* <div className="editForm__group">
          <label htmlFor="email__input">Email:&nbsp;</label>
          <input
            type="email"
            id="email__input"
            className="editForm__input"
            defaultValue={userData?.email}
            placeholder="Enter New Email"
            onChange={(e) => handleNewEmail(e.target.value)}
          />

          {checkNewValidEmail ? (
            <label className="edit__errorMsg">
              Please enter a valid email address. Example: sample@domain.com
            </label>
          ) : (
            ""
          )}
        </div> */}

        {/* Contact Number */}
        <div className="editForm__group">
          <label htmlFor="contactNumber__input">Contact Number:&nbsp;</label>
          <input
            type="text"
            maxLength={11}
            pattern="[0-9]*"
            id="contactNumber__input"
            className="editForm__input"
            defaultValue={userData?.contactNumber}
            placeholder="Enter New Contact Number"
            onChange={(e) => handleNewContactNumber(e.target.value)}
          />

          {checkNewContactNumber ? (
            <label className="edit__errorMsg">
              Please enter a valid mobile number. Example: 0917123456
            </label>
          ) : (
            ""
          )}
        </div>

        {/* Address */}
        <div className="editForm__group">
          <label htmlFor="address__input">Address:&nbsp;</label>
          <input
            type="text"
            id="address__input"
            className="editForm__input"
            defaultValue={userData?.address}
            placeholder="Enter New Address"
            onChange={(e) => handleNewAddress(e.target.value)}
          />
        </div>
      </form>

      {/* Save Button */}
      <div className="editProfile__btns">
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default EditProfileDetails;
