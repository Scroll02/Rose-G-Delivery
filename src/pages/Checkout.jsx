import React, { useEffect, useState, useRef } from "react";
import "../style/Checkout.css";
import { Container, Row, Col } from "reactstrap";
import CheckingDetails from "../assets/images/profile-details.svg";
import DeliveryIcon from "../assets/images/delivery.png";
import PurseIcon from "../assets/images/purse.png";
import GCashIcon from "../assets/images/GCash.png";
import SelfPickUpIcon from "../assets/images/self-pickup.png";
import TitlePageBanner from "../components/UI/TitlePageBanner";

// Navigation
import { useNavigate } from "react-router-dom";
// Firebase
import { db, auth, storage } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// Redux
import { useSelector, useDispatch } from "react-redux";
import { userLogInState, userLogOutState } from "../store/UserSlice/userSlice";
import { bagActions } from "../store/MyBag/bagSlice";
// Toast
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../components/Toast/Toast";

const Checkout = () => {
  const bagItems = useSelector((state) => state.bag.bagItems);
  const bagSubTotalAmount = useSelector((state) => state.bag.subTotalAmount);
  const bagTotalAmount = useSelector((state) => state.bag.totalAmount);
  const [orderNote, setOrderNote] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //------------------ Retrieve User Data ------------------//
  const [userLoggedUid, setUserLoggedUid] = useState(null);
  const [userData, setUserData] = useState(null);
  const getUserData = () => {
    const userDataRef = collection(db, "UserData"); // getting the UserData collection
    const queryData = query(userDataRef, where("uid", "==", userLoggedUid));

    getDocs(queryData).then((querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          setUserData(doc.data());
        });
      } else {
        //navigation.navigate("Login");
        console.log("Empty user document");
      }
    });
  };
  useEffect(() => {
    getUserData();
  }, [userLoggedUid]);

  //------------------ Redux (when the page is refresh the data will persist) ------------------//
  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (authUser && authUser.emailVerified === true) {
        // Logged In Action
        dispatch(
          userLogInState({
            email: authUser.email,
            lastSignIn: authUser.metadata.lastSignInTime,
            emailVerified: authUser.emailVerified.toString(),
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

  // Radio button for payment method & select time
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showSelectTime, setShowSelectTime] = useState(false);
  const [showProofOfPayment, setShowProofOfPayment] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [orderID, setOrderID] = useState(() => {
    const storedOrderID = localStorage.getItem("orderID");
    return storedOrderID ? storedOrderID : "";
  });
  const generateOrderID = () => {
    const newOrderID = new Date().getTime().toString();
    setOrderID(newOrderID);
    localStorage.setItem("orderID", newOrderID);
  };
  useEffect(() => {
    if (!orderID) {
      generateOrderID();
    }
  }, [orderID]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);

    if (e.target.value === "Cash On Pickup") {
      setShowSelectTime(true);
      setShowProofOfPayment(false);
    } else if (e.target.value === "GCash") {
      setShowSelectTime(false);
      setShowProofOfPayment(true);
    } else {
      setShowSelectTime(false);
      setShowProofOfPayment(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.includes("image")) {
      setSelectedFile(file);
      setFileName(file.name);
    } else {
      showErrorToast("Invalid file type. Please upload an image file.", 3000);
    }
  };

  // Handle Changes
  const [isEditing, setIsEditing] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newContactNumber, setNewContactNumber] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

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

  // Retrieve Delivery Fee Value
  const [deliveryFee, setDeliveryFee] = useState(0);
  useEffect(() => {
    const fetchDeliveryFee = async () => {
      const deliveryFeeRef = doc(db, "DeliveryFee", "deliveryFee");
      const deliveryFeeDoc = await getDoc(deliveryFeeRef);
      if (deliveryFeeDoc.exists()) {
        const fee = deliveryFeeDoc.data().value;
        setDeliveryFee(fee);
      }
    };

    fetchDeliveryFee();
  }, []);

  // Save Button Function
  const handleSave = async (e) => {
    e.preventDefault();
    const userDataRef = doc(db, "UserData", auth.currentUser.uid);
    const updatedData = {};

    if (newFirstName !== userData?.firstName || newFirstName === undefined) {
      updatedData.firstName = newFirstName || userData?.firstName;
    }

    if (newLastName !== userData?.lastName || newLastName === undefined) {
      updatedData.lastName = newLastName || userData?.lastName;
    }

    if (
      newContactNumber !== userData?.contactNumber ||
      newContactNumber === undefined
    ) {
      updatedData.contactNumber = newContactNumber || userData?.contactNumber;
    }

    if (newAddress !== userData?.address || newAddress === undefined) {
      updatedData.address = newAddress || userData?.address;
    }

    if (Object.keys(updatedData).length > 0) {
      await updateDoc(userDataRef, updatedData);
      showSuccessToast("Recipient Details is updated", 1000);
      getUserData();
    }
    setIsEditing(false);
  };

  // Redirect to paymongo checkout page if Gcash is selected and total amount > 100
  useEffect(() => {
    if (paymentMethod === "GCash" && bagTotalAmount > 100) {
      window.open("https://paymongo.page/l/rose-garden", "_blank");
    } else if (paymentMethod === "GCash" && bagTotalAmount < 100) {
      showErrorToast("Minimum purchase amount for GCash is ₱100.00.", 2000);
    }
  }, [paymentMethod]);

  // Selected Time
  const [selectableTimes, setSelectableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
  };
  // Time excluded 12:00pm-1:00pm, Weekdays (8am-6pm), Weekends (8am-7pm)
  useEffect(() => {
    const getCurrentTime = () => {
      const now = new Date();
      const oneHourAhead = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead
      const times = [];
      let currentTime = oneHourAhead;

      const dayOfWeek = currentTime.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const startTime = isWeekend ? 8 : 8; // 8:00 AM
      const endTime = isWeekend ? 19 : 18; // 7:00 PM on weekends, 6:00 PM on weekdays

      while (currentTime.getDate() === oneHourAhead.getDate()) {
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();

        // Exclude the time range from 12:00 PM to 1:00 PM
        if (
          !(hours === 12 && minutes === 0) &&
          !(hours === 13 && minutes === 0)
        ) {
          if (
            (isWeekend || hours < endTime) &&
            hours >= startTime &&
            (minutes === 0 ||
              minutes === 15 ||
              minutes === 30 ||
              minutes === 45)
          ) {
            const formattedTime = currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            times.push(formattedTime);
          }
        }

        currentTime = new Date(currentTime.getTime() + 1 * 60 * 1000); // Add 1 minute
      }

      return times;
    };

    setSelectableTimes(getCurrentTime());
  }, []);

  // Opening hours indicator for disabling the place ordder button
  const openingHoursPassed = () => {
    const openingHours = {
      weekdays: { start: "08:00:00", end: "19:00:00" }, // 8:00am - 7:00pm
      weekends: { start: "08:00:00", end: "20:00:00" }, // 8:00am - 8:00pm
    };

    const today = new Date();
    const currentDay = today.getDay();
    const currentTime = today.toLocaleTimeString("en-US", { hour12: false });

    if (
      (currentDay >= 1 &&
        currentDay <= 5 &&
        currentTime >= openingHours.weekdays.end) ||
      ((currentDay === 0 || currentDay === 6) &&
        currentTime >= openingHours.weekends.end)
    ) {
      return true;
    }

    return false;
  };

  // Place order button function
  const handlePlaceOrder = async () => {
    // If bag is empty, they can't place an order
    if (bagItems.length === 0) {
      showErrorToast(
        "Your cart is empty. Please add some items to place an order.",
        2000
      );
      return;
    }

    // Recipient details are required to place the order
    if (
      !userData?.address ||
      !userData?.contactNumber ||
      !userData?.firstName ||
      !userData?.lastName
    ) {
      showErrorToast("Please fill in all the recipient details.", 2000);
      return;
    }

    // If any payment method is not selected, they can't place their order
    if (!paymentMethod) {
      showErrorToast("Please select a payment method.", 2000);
      return;
    }

    if (paymentMethod === "GCash" && bagTotalAmount < 100) {
      showErrorToast("Minimum purchase amount for GCash is ₱100.00.", 2000);
      return;
    }

    // Check if Cash on Pickup is selected and a time is not selected
    if (paymentMethod === "Cash on Pickup" && !selectedTime) {
      showErrorToast("Please select a time for Cash on Pickup.", 2000);
      return;
    }

    if (paymentMethod === "GCash" && !selectedFile) {
      showErrorToast("Please upload a proof of payment for GCash.", 2000);
      return;
    }

    let fileName = "";
    let filePath = "";

    if (selectedFile) {
      fileName = `${auth.currentUser.uid}_${Date.now()}_${selectedFile.name}`;
      filePath = `proofOfPayment_images/${auth.currentUser.uid}/${fileName}`;
    }

    try {
      // Upload the proof of payment image to Firebase Storage
      if (paymentMethod === "GCash") {
        // Upload the proof of payment image to Firebase Storage
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, selectedFile);

        // Get the download URL of the uploaded image
        const downloadURL = await getDownloadURL(storageRef);

        const docRef = doc(collection(db, "UserOrders"), orderID);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
          const existingProofOfPaymentURLs =
            docSnapshot.data().proofOfPaymentURL || [];

          // Append the new proofOfPaymentURL to the existing array
          const updatedProofOfPaymentURLs = [
            ...existingProofOfPaymentURLs,
            downloadURL,
          ];

          await updateDoc(docRef, {
            proofOfPaymentURL: updatedProofOfPaymentURLs,
          });
        } else {
          await setDoc(docRef, {
            orderId: orderID,
            orderData: bagItems,
            orderStatus: "Pending",
            orderTotalCost: bagTotalAmount,
            orderDate: serverTimestamp(),
            orderAddress: userData?.address,
            orderContactNumber: userData?.contactNumber,
            orderFirstName: userData?.firstName,
            orderLastName: userData?.lastName,
            customerProfileImg: userData?.profileImageUrl || "",
            orderUserId: auth.currentUser.uid,
            orderPayment: paymentMethod,
            orderDeliveryFee: deliveryFee,
            orderNote: orderNote,
            orderPickUpTime:
              paymentMethod === "Cash On Pickup" ? selectedTime : null,
            paymentStatus: "Paid",
            proofOfPaymentURL: [downloadURL], // Store as an array with a single element
            paymentId: null,
          });
        }
      } else {
        const docRef = doc(collection(db, "UserOrders"), orderID);
        await setDoc(docRef, {
          orderId: orderID || docRef.id,
          orderData: bagItems,
          orderStatus: "Pending",
          orderTotalCost: bagTotalAmount,
          orderDate: serverTimestamp(),
          orderAddress: userData?.address,
          orderContactNumber: userData?.contactNumber,
          orderFirstName: userData?.firstName,
          orderLastName: userData?.lastName,
          customerProfileImg: userData?.profileImageUrl || "",
          orderUserId: auth.currentUser.uid,
          orderPayment: paymentMethod,
          orderDeliveryFee: deliveryFee,
          orderNote: orderNote,
          orderPickUpTime:
            paymentMethod === "Cash On Pickup" ? selectedTime : null,
          paymentStatus: "Pending",
          proofOfPaymentURL: null,
          paymentId: null,
        });
      }

      showSuccessToast(
        "Thank you for your order! Your order has been successfully placed.",
        2000
      );
      localStorage.removeItem("orderID");
      navigate("/orders");
      dispatch(bagActions.resetTotalQuantity());

      // Delete the document to reset the bag
      const docRef2 = doc(collection(db, "UserBag"), auth.currentUser.uid);
      await deleteDoc(docRef2);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main>
      <Container>
        <TitlePageBanner title="Check Out" />
        <Row>
          {/*------------------ Left Side ----------------- */}
          <Col lg="8" md="6">
            <div className="checkout__details">
              {/*------------------ Recipient Details ----------------- */}
              <div
                className={`recipient__details ${
                  isEditing ? "is-flipped" : ""
                }`}
              >
                {/* Recipient Details Front */}
                <div className="recipient__details-front">
                  <div className="recipient__details-header">
                    <h6>Recipient Details</h6>

                    <button
                      className="recipient__details-edit-btn"
                      onClick={handleEdit}
                    >
                      {isEditing ? <i class="ri-close-fill"></i> : "Edit"}
                    </button>
                  </div>
                  <form>
                    {/* Full Name */}
                    <div className="detailsForm__group">
                      {/* <label>Full Name:&nbsp;</label>
                      <span>{`${userData?.firstName} ${userData?.lastName}`}</span> */}
                      <label htmlFor="first__name-input">Full Name:</label>
                      <input
                        disabled
                        type="text"
                        id="first__name-input"
                        className="detailsForm__input"
                        required
                        value={`${userData?.firstName} ${userData?.lastName}`}
                        onChange={(e) => setNewFirstName(e.target.value)}
                      />
                    </div>

                    {/* Contact Number */}
                    <div className="detailsForm__group">
                      {/* <label>Contact Number:&nbsp;</label>
                      <span>{userData?.contactNumber}</span> */}
                      <label htmlFor="contact__number-input">
                        Contact Number:
                      </label>
                      <input
                        disabled
                        type="text"
                        maxLength={11}
                        pattern="[0-9]*"
                        id="contact__number-input"
                        className="detailsForm__input"
                        value={userData?.contactNumber}
                        onChange={(e) => handleNewContactNumber(e.target.value)}
                      />
                    </div>

                    {/* Address */}
                    <div className="detailsForm__group">
                      {/* <label>Address:&nbsp;</label>
                      <span>{userData?.address}</span> */}
                      <label htmlFor="address-input">Address:</label>
                      <input
                        type="text"
                        disabled
                        id="address-input"
                        className="detailsForm__input"
                        defaultValue={userData?.address}
                        onChange={(e) => setNewAddress(e.target.value)}
                      />
                    </div>
                  </form>
                </div>

                {/* Recipient Details Back */}
                <div className="recipient__details-back">
                  <div className="recipient__details-header">
                    <h6>Edit Recipient Details</h6>
                    <button
                      className="recipient__details-cancel-btn"
                      onClick={handleEdit}
                    >
                      {isEditing ? <i class="ri-close-fill"></i> : "Edit"}
                    </button>
                  </div>
                  <form>
                    {/* First Name */}
                    <div className="detailsForm__group">
                      <label htmlFor="first__name-input">First Name:</label>
                      <input
                        type="text"
                        id="first__name-input"
                        className="detailsForm__input"
                        required
                        defaultValue={userData?.firstName}
                        onChange={(e) => setNewFirstName(e.target.value)}
                      />
                    </div>

                    {/* Last Name */}
                    <div className="detailsForm__group">
                      <label>Last Name:</label>
                      <input
                        type="text"
                        id="last__name-input"
                        className="detailsForm__input"
                        defaultValue={userData?.lastName}
                        onChange={(e) => setNewLastName(e.target.value)}
                      />
                    </div>

                    {/* Contact Number */}
                    <div className="detailsForm__group">
                      <label htmlFor="contact__number-input">
                        Contact Number:
                      </label>
                      <input
                        type="text"
                        maxLength={11}
                        pattern="[0-9]*"
                        id="contact__number-input"
                        className="detailsForm__input"
                        defaultValue={userData?.contactNumber}
                        onChange={(e) => handleNewContactNumber(e.target.value)}
                      />
                    </div>

                    {/* Address */}
                    <div className="detailsForm__group">
                      <label htmlFor="address-input">Address:</label>
                      <input
                        type="text"
                        id="address-input"
                        className="detailsForm__input"
                        defaultValue={userData?.address}
                        onChange={(e) => setNewAddress(e.target.value)}
                      />
                    </div>

                    {/* Save Button */}
                    <button
                      className="recipient__details-save-btn"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                  </form>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="payment__methods mt-5 ">
                <h6 className=".payment__methods-header">
                  Choose Payment Method
                </h6>
                <form>
                  {/* Cash on pickup */}
                  <div className="paymentMethod__group">
                    <input
                      type="radio"
                      id="cashOnPickup"
                      value="Cash On Pickup"
                      name="type"
                      onChange={handlePaymentMethodChange}
                      checked={paymentMethod === "Cash On Pickup"}
                    />
                    <label htmlFor="cashOnPickup">
                      <img
                        src={PurseIcon}
                        alt="Purse icon"
                        className="radio__icon"
                      />
                      Cash On Pickup
                    </label>
                  </div>
                  {/* Select a Time */}
                  {showSelectTime && (
                    <div className="selectTime__group">
                      <label htmlFor="selectTime">Select a Time:</label>
                      <select
                        id="selectTime"
                        className="detailsForm__input"
                        onChange={handleTimeChange}
                        value={selectedTime}
                      >
                        {selectableTimes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Self pickup */}
                  {/* <div className="paymentMethod__group">
                    <input
                      type="radio"
                      id="selfPickup"
                      value="Self PickUp"
                      name="type"
                      onChange={handlePaymentMethodChange}
                      checked={paymentMethod === "Self PickUp"}
                    />
                    <label htmlFor="cashOnPickup">
                      <img
                        src={SelfPickUpIcon}
                        alt="Purse icon"
                        className="radio__icon"
                      />
                      Self PickUp
                    </label>
                  </div> */}

                  {/* Cash on delivery */}
                  <div className="paymentMethod__group">
                    <input
                      type="radio"
                      id="cashOnDelivery"
                      value="Cash On Delivery"
                      name="type"
                      onChange={handlePaymentMethodChange}
                      checked={paymentMethod === "Cash On Delivery"}
                    />
                    <label htmlFor="cashOnDelivery">
                      <img
                        src={DeliveryIcon}
                        alt="Delivery icon"
                        className="radio__icon"
                      />
                      Cash On Delivery
                    </label>
                  </div>

                  {/* GCash */}
                  <div className="paymentMethod__group">
                    <input
                      type="radio"
                      id="gcash"
                      value="GCash"
                      name="type"
                      onChange={handlePaymentMethodChange}
                      checked={paymentMethod === "GCash"}
                    />
                    <label htmlFor="gcash">
                      <img
                        src={GCashIcon}
                        alt="GCash icon"
                        className="radio__icon"
                      />
                      GCash&nbsp;
                    </label>
                    <span>
                      (Copy the Order ID from the Order summary and proceed on
                      the Paymongo checkout page)
                    </span>
                  </div>
                  {showProofOfPayment && (
                    <>
                      <div className="proofOfPayment">
                        <label
                          htmlFor="fileUpload"
                          className="customFileUpload"
                        >
                          <input
                            type="file"
                            id="fileUpload"
                            onChange={handleFileUpload}
                          />
                          Upload proof of payment
                        </label>
                        <span>{fileName}</span>
                      </div>
                      <div className="doubleCheck__msg">
                        <span>
                          *Please ensure to double-check the uploaded proof of
                          payment.
                        </span>
                      </div>
                    </>
                  )}
                </form>

                <div className="orderNoteForm__group">
                  <label htmlFor="order__note">Note (optional):</label>
                  <textarea
                    id="order__note"
                    className="orderNoteForm__input"
                    placeholder="Notes to the store/rider (optional)"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side */}
          <Col lg="4" md="6">
            {/* Order Summary */}
            <div className="order__summary">
              <h6
                style={{
                  textAlign: "center",
                  color: "var(--background-color2)",
                }}
              >
                Order Summary
              </h6>
              <h6
                style={{
                  textAlign: "center",
                  color: "var(--background-color2)",
                }}
              >
                ORDER ID:&nbsp;{orderID}
              </h6>
              <hr
                style={{
                  border: "2px solid var(--background-color2)",
                }}
              ></hr>
              {bagItems.length === 0 ? (
                <h5
                  className="text-center"
                  style={{ color: "var(--background-color2)" }}
                >
                  Your Bag is empty
                </h5>
              ) : (
                <table className="table">
                  <tbody>
                    {bagItems.map((item) => (
                      <Tr item={item} key={item.id} />
                    ))}
                  </tbody>
                </table>
              )}
              <hr
                style={{
                  border: "2px solid var(--background-color2)",
                }}
              ></hr>
              <div className="orderSummary__footer">
                <h6>
                  Subtotal:
                  <span>
                    ₱
                    {parseFloat(bagSubTotalAmount)
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </h6>
                {paymentMethod === "Cash On Pickup" ? null : (
                  <h6>
                    Delivery Fee:{" "}
                    <span>
                      ₱
                      {parseFloat(deliveryFee)
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </span>
                  </h6>
                )}

                <h6>
                  Total:
                  <span>
                    ₱
                    {parseFloat(bagTotalAmount)
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </h6>
              </div>

              <button
                className="place__order"
                onClick={handlePlaceOrder}
                disabled={openingHoursPassed()}
              >
                Place Order
              </button>
            </div>
            <div className="svg__wrapper">
              <img
                src={CheckingDetails}
                alt="checking-detailsImg"
                className="svg__image"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

const Tr = (props) => {
  const { productName, totalPrice, productQty } = props.item;

  return (
    <tr>
      <td style={{ width: "20%" }}>{productQty}x</td>
      <td style={{ width: "50%" }}>{productName}</td>
      <td className="text-end" style={{ width: "30%" }}>
        ₱{" "}
        {parseFloat(totalPrice)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      </td>
    </tr>
  );
};

export default Checkout;
