import React, { useState, useEffect } from "react";
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

// Firebase
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

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
      } else if (status === "Delivery") {
        setCurrentStep(3);
      } else if (status === "Delivered") {
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
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <main>
      <Container>
        <Row>
          <TitlePageBanner title="Order Tracker" />
          {/* Left Column */}
          <Col lg="8" md="6">
            <Row>
              {/* Order Details */}
              <div className="order__details-container">
                <h4>Order Details</h4>
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

                {/* <div className="order__details-item">
                  <p>Delivery Rider:&nbsp;</p>
                  <span>
                    {orderData?.deliveryRiderInfo
                      ? orderData?.deliveryRiderInfo
                      : null}
                  </span>
                </div> */}
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
