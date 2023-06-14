import React, { useState, useEffect, useRef } from "react";
import "../style/OrderTracker.css";
import { Container, Row, Col } from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment"; //date format

import Circle from "../assets/images/circle-gray.png";
import DottedLine from "../assets/images/dotted_line.png";
import TitlePageBanner from "../components/UI/TitlePageBanner";
import { track_order_status, pickup_order_status } from "../globals/constant";
// Modal
import Modal from "../components/Modal/Modal";
import ProofOfPaymentIssueModal from "../components/Modal/ProofOfPaymentIssueModal";
import ConfirmationModal from "../components/Modal/ConfirmationModal";
// Firebase
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage, auth } from "../firebase";
// Toast
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../components/Toast/Toast";

const OrderTracker = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Retrieve Order Data
  const [orderData, setOrderData] = useState(null);
  const [showPOPIssueModal, setShowPOPIssueModal] = useState(false);
  const [popIssue, setPopIssue] = useState("");
  const [issueOrder, setIssueOrder] = useState("");
  useEffect(() => {
    const getOrder = async () => {
      const orderRef = doc(collection(db, "UserOrders"), orderId);
      const unsubscribe = onSnapshot(orderRef, (snapshot) => {
        if (snapshot.exists()) {
          setOrderData(snapshot.data());
        }
      });
      return () => {
        unsubscribe();
      };
    };
    getOrder();
  }, [orderId]);

  useEffect(() => {
    if (
      orderData?.proofOfPaymentIssue &&
      orderData?.orderStatus === "Pending" &&
      !orderData?.settlementOptions
    ) {
      setShowPOPIssueModal(true);
      setPopIssue(orderData?.proofOfPaymentIssue);
      setIssueOrder(orderData);
    }
  }, [orderData]);

  const [currentStep, setCurrentStep] = useState("0");
  useEffect(() => {
    if (orderData != null) {
      const status = orderData.orderStatus;
      if (status === "Pending") {
        setCurrentStep(0);
      } else if (status === "Confirmed") {
        setCurrentStep(1);
      } else if (status === "Prepared") {
        setCurrentStep(2);
      } else if (status === "Delivery" || status === "Ready for Pickup") {
        setCurrentStep(3);
      } else if (status === "Delivered" || status === "Order Picked up") {
        setCurrentStep(4);
      }
    }
  }, [orderData]);

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

  // Cancel Button Function
  const handleCancel = async () => {
    try {
      const orderRef = doc(collection(db, "UserOrders"), orderId);
      const orderDoc = await getDoc(orderRef);
      if (orderDoc.exists()) {
        const orderData = orderDoc.data();
        const status = orderData.orderStatus;
        if (status === "Prepared") {
          showInfoToast(
            "Sorry, your order is already prepared and cannot be cancelled."
          );
        } else {
          await updateDoc(orderRef, { orderStatus: "Cancelled" });
          setCurrentStep(-1);
          showInfoToast("Your order has been cancelled.", 2000);
          navigate("/orders");
          // closeModal();
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showErrorToast("Failed to cancel your order.");
    }
  };

  // Pop up modal
  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Close cancellation modal (Cancelling order)
  const closeModal = () => {
    setShowModal(false);
  };

  // Close confirmation modal & hide proof of payment button
  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setShowProofOfPayment(false);
  };

  // Close proof of payment issue modal
  const closePOPIssueModal = () => {
    setShowPOPIssueModal(false);
  };

  // Settlement Options
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [showProofOfPayment, setShowProofOfPayment] = useState(false);

  // File upload for proof of payment
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.includes("image")) {
      setSelectedFile(file);
      setFileName(file.name);
    } else {
      showErrorToast("Invalid file type. Please upload an image file.", 3000);
    }
  };

  // Pay with GCash button function
  const handlePayWithGCash = () => {
    window.open("https://paymongo.page/l/rose-garden", "_blank");
    setShowProofOfPayment(true);
  };

  // Pay Cash to Rider button function
  const handlePayCashToRider = async () => {
    const orderRef = doc(collection(db, "UserOrders"), orderId);
    await updateDoc(orderRef, { settlementOptions: "Pay Cash to Rider" });
    setShowConfirmationModal(false);
    setShowProofOfPayment(false);
    setShowPOPIssueModal(false);
  };

  // Save Button Function
  const deleteFileFromStorage = async (filePath) => {
    try {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Error deleting file from storage:", error);
      showErrorToast("Failed to delete old file.");
    }
  };

  const handleSaveSubmit = async () => {
    try {
      const orderRef = doc(collection(db, "UserOrders"), orderId);
      const orderDoc = await getDoc(orderRef);
      if (orderDoc.exists()) {
        const orderData = orderDoc.data();

        let updatedProofOfPaymentURL = [];

        let fileName, filePath;

        if (selectedFile) {
          fileName = `${auth.currentUser.uid}_${Date.now()}_${
            selectedFile.name
          }`;
          filePath = `proofOfPayment_images/${auth.currentUser.uid}/${fileName}`;
        } else {
          showErrorToast("No file selected.");
          return;
        }

        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        let downloadURL;

        uploadTask.on(
          "state_changed",
          (snapshot) => {},
          (error) => {
            // Handle any errors during the upload
            console.error("Error uploading proof of payment:", error);
            showErrorToast("Failed to upload proof of payment.");
          },
          async () => {
            // File uploaded successfully
            try {
              downloadURL = await getDownloadURL(uploadTask.snapshot.ref); // Assign the downloadURL

              if (
                orderData.proofOfPaymentIssue === "Insufficient Payment Amount"
              ) {
                updatedProofOfPaymentURL = orderData.proofOfPaymentURL || []; // Copy the existing proofOfPaymentURL array if it exists, otherwise create an empty array
                updatedProofOfPaymentURL.push(downloadURL); // Add the new proof of payment URL to the array
              } else if (
                orderData.proofOfPaymentIssue === "Invalid Proof of Payment"
              ) {
                // Delete the old file from storage if it exists
                if (
                  Array.isArray(orderData.proofOfPaymentURL) &&
                  orderData.proofOfPaymentURL.length > 0
                ) {
                  const oldFilePath = orderData.proofOfPaymentURL[0];
                  await deleteFileFromStorage(oldFilePath);
                }
                updatedProofOfPaymentURL = [downloadURL]; // Replace the existing proof of payment URL with the new one
              }

              await updateDoc(orderRef, {
                proofOfPaymentURL: updatedProofOfPaymentURL,
                settlementOptions: "Pay with GCash",
              });

              // Hide and reset buttons and uploaded files
              setShowProofOfPayment(false);
              setSelectedFile(null);
              setFileName("");
              setShowPOPIssueModal(false);

              showSuccessToast("Proof of payment saved.", 2000);
            } catch (error) {
              console.error("Error updating proof of payment:", error);
              showErrorToast("Failed to save proof of payment.");
            }
          }
        );
      }
    } catch (error) {
      console.error("Error updating proof of payment:", error);
      showErrorToast("Failed to save proof of payment.");
    }
  };

  return (
    <main>
      <Container>
        {showPOPIssueModal && (
          <ProofOfPaymentIssueModal
            closePOPIssueModal={closePOPIssueModal}
            popIssue={popIssue}
            orderId={issueOrder?.orderId}
          />
        )}
        {showConfirmationModal && (
          <ConfirmationModal
            closeConfirmationModal={closeConfirmationModal}
            handlePayCashToRider={handlePayCashToRider}
          />
        )}
        <Row>
          <TitlePageBanner title="Order Tracker" />
          {/* Left Column */}
          <Col lg="8" md="6">
            <Row>
              {/* Order Details */}
              <div className="order__details-container">
                <h4 className="mb-3">Order Details</h4>
                <div className="order__details-item">
                  <p>Order ID:&nbsp;</p>
                  <span>{orderData?.orderId}</span>
                </div>

                <div className="order__details-item">
                  <p>Order Date:&nbsp;</p>
                  <span>
                    {orderData?.orderDate
                      ? moment(orderData?.orderDate.toDate()).format(
                          "MMM D, YYYY h:mm A"
                        )
                      : null}
                  </span>
                </div>

                {orderData?.orderPickUpTime &&
                  orderData?.orderPickUpTime !== "" && (
                    <div className="order__details-item">
                      <p>Pickup Time:&nbsp;</p>
                      <span>{orderData?.orderPickUpTime}</span>
                    </div>
                  )}

                <div className="order__details-item">
                  <p>Payment Method:&nbsp; </p>
                  <span>{orderData?.orderPayment}</span>
                </div>

                <div className="order__details-item">
                  <p>Delivery Address:&nbsp; </p>
                  <span>{orderData?.orderAddress}</span>
                </div>

                {orderData?.orderNote && orderData?.orderNote !== "" && (
                  <div className="order__details-item">
                    <p>Note:&nbsp;</p>
                    <span>{orderData?.orderNote}</span>
                  </div>
                )}

                {orderData?.proofOfPaymentIssue && (
                  <div className="order__details-item">
                    <p>Proof Of Payment Issue:&nbsp; </p>
                    <span>{orderData?.proofOfPaymentIssue}</span>
                  </div>
                )}

                {/* Settlement Options (Insufficient Payment Amount) */}
                {/* Issue: Insufficient Payment Amount */}
                {orderData?.proofOfPaymentIssue ===
                  "Insufficient Payment Amount" && (
                  <div className="order__details-item">
                    <p>Settlement Options:&nbsp;</p>
                    <span>{orderData?.settlementOptions}</span>
                    {/* Only show the buttons if showPaymentButtons is true */}
                    {orderData?.settlementOptions === null ||
                      (orderData?.settlementOptions === undefined && (
                        <div className="settlementOpt__actions">
                          <button
                            className="settlementOpt__btn"
                            onClick={handlePayWithGCash}
                          >
                            Pay with GCash
                          </button>
                          <button
                            className="settlementOpt__btn"
                            // onClick={() =>
                            //   handleSettlementOption("Pay Cash to Rider")
                            // }
                            onClick={() => setShowConfirmationModal(true)}
                          >
                            Pay Cash to Rider
                          </button>
                        </div>
                      ))}
                  </div>
                )}
                {/* Issue: Invalid Proof of Payment */}
                {orderData?.proofOfPaymentIssue ===
                  "Invalid Proof of Payment" && (
                  <div className="order__details-item">
                    <p>Settlement Option:&nbsp;</p>
                    <span>{orderData?.settlementOptions}</span>
                    {/* Only show the buttons if showPaymentButtons is true */}
                    {orderData?.settlementOptions === null ||
                      (orderData?.settlementOptions === undefined && (
                        <div className="settlementOpt__actions">
                          <button
                            className="settlementOpt__btn"
                            onClick={handlePayWithGCash}
                          >
                            Pay with GCash
                          </button>
                        </div>
                      ))}
                  </div>
                )}
                {/* Upload Proof Of Payment */}
                {showProofOfPayment && (
                  <>
                    <div className="popIssueUploadFile">
                      <div className="popUploadContainer">
                        <label
                          htmlFor="fileUpload"
                          className="customPOPFileUpload"
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
                      {selectedFile && (
                        <div className="popSave__action">
                          <button
                            className="popSave__btn"
                            onClick={handleSaveSubmit}
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="popDoubleCheck__msg">
                      <span>
                        *Please ensure to double-check the uploaded proof of
                        payment.
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Row>

            {/* Order Status */}
            <Row>
              {/* Left Side - Order Status */}
              <Col>
                {/* Order Status - Image*/}
                {orderData?.orderPayment === "Cash On Delivery" ||
                orderData?.orderPayment === "GCash"
                  ? track_order_status.map((item, index) => {
                      return (
                        <div
                          key={`StatusList-${index}`}
                          className="status__image-container"
                        >
                          {/* Display image only for the current step */}
                          {index === currentStep && item.image && (
                            <div className="status__image-wrapper">
                              <img src={item.image} alt={item.title} />
                            </div>
                          )}
                        </div>
                      );
                    })
                  : pickup_order_status.map((item, index) => {
                      return (
                        <div
                          key={`StatusList-${index}`}
                          className="status__image-container"
                        >
                          {/* Display image only for the current step */}
                          {index === currentStep && item.image && (
                            <div className="status__image-wrapper">
                              <img src={item.image} alt={item.title} />
                            </div>
                          )}
                        </div>
                      );
                    })}
              </Col>

              {/* Right Side - Order Status */}
              <Col>
                {/* Order Status - Check & Lines */}
                {orderData?.orderPayment === "Cash On Delivery" ||
                orderData?.orderPayment === "GCash"
                  ? track_order_status.map((item, index) => {
                      return (
                        <div key={`StatusList-${index}`}>
                          <div className="order__status-container">
                            <img
                              src={Circle}
                              alt="check circle"
                              className={`${
                                index <= currentStep ? "check-circle" : ""
                              }`}
                            />

                            <div className="order__status-text">
                              <h5>{item.title}</h5>
                              <p>{item.sub_title}</p>
                            </div>
                          </div>

                          {index < track_order_status.length - 1 && (
                            <div className="order__status-line">
                              {index < currentStep && (
                                <div className="line"></div>
                              )}
                              {index >= currentStep && (
                                <img
                                  src={DottedLine}
                                  alt="dotted line"
                                  className="dotted-line"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  : pickup_order_status.map((item, index) => {
                      return (
                        <div key={`StatusList-${index}`}>
                          <div className="order__status-container">
                            <img
                              src={Circle}
                              alt="check circle"
                              className={`${
                                index <= currentStep ? "check-circle" : ""
                              }`}
                            />

                            <div className="order__status-text">
                              <h5>{item.title}</h5>
                              <p>{item.sub_title}</p>
                            </div>
                          </div>

                          {index < track_order_status.length - 1 && (
                            <div className="order__status-line">
                              {index < currentStep && (
                                <div className="line"></div>
                              )}
                              {index >= currentStep && (
                                <img
                                  src={DottedLine}
                                  alt="dotted line"
                                  className="dotted-line"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
              </Col>
            </Row>
          </Col>

          {/* Right Column */}
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
              <hr
                style={{
                  border: "2px solid var(--background-color2)",
                }}
              ></hr>
              {orderData?.orderData.length === 0 ? (
                <h5 className="text-center">Your Bag is empty</h5>
              ) : (
                <table className="table">
                  <tbody>
                    {orderData?.orderData.map((item) => (
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
                    {parseFloat(
                      orderData?.orderData.reduce(
                        (total, item) => total + item.price * item.productQty,
                        0
                      )
                    )
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </h6>

                {orderData?.orderPayment === "Cash On Pickup" ? null : (
                  <h6>
                    Delivery Fee:
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
                    {parseFloat(orderData?.orderTotalCost)
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </h6>
              </div>

              {orderData?.orderStatus === "Pending" ||
              orderData?.orderStatus === "Confirmed" ? (
                <button
                  className="place__order"
                  onClick={() => setShowModal(true)}
                >
                  Cancel Order
                </button>
              ) : null}

              {showModal && (
                <Modal closeModal={closeModal} handleCancel={handleCancel} />
              )}
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
        ₱
        {parseFloat(totalPrice)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      </td>
    </tr>
  );
};

export default OrderTracker;
