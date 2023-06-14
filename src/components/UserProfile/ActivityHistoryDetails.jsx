import React, { useState, useEffect } from "react";
import "../../style/ActivityHistoryDetails.css";
import { Container, Row, Col } from "reactstrap";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import moment from "moment";
import TitlePageBanner from "../UI/TitlePageBanner";
import CancelledImg from "../../assets/images/cancel-order.svg";
import Circle from "../../assets/images/circle-gray.png";
import DottedLine from "../../assets/images/dotted_line.png";
import {
  track_order_status,
  pickup_order_status,
} from "../../globals/constant";
import FeedbackModal from "../Modal/FeedbackModal";

// Firebase
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Toast
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../Toast/Toast";
import { Feed } from "@mui/icons-material";

const ActivityHistoryDetails = () => {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);

  // Retrieve User Orders
  useEffect(() => {
    const getOrder = async () => {
      const orderRef = doc(collection(db, "UserOrders"), orderId);
      const orderDoc = await getDoc(orderRef);
      if (orderDoc.exists()) {
        setOrderData(orderDoc.data());
      }
    };
    getOrder();
  }, [orderId]);

  // Order Status
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

  // Modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
  };

  // Already reviewed or not
  const [hasReviewed, setHasReviewed] = useState(false);
  const handleHasReviewedChange = (value) => {
    setHasReviewed(value);
  };

  // Retrieve Feedback Data
  const [feedbackData, setFeedbackData] = useState([]);
  useEffect(() => {
    const fetchFeedbackData = async () => {
      const feedbackRef = collection(db, "FeedbackData");
      const feedbackQuery = query(
        feedbackRef,
        where("orderId", "==", orderData?.orderId),
        where("hasReviewed", "==", true)
      );
      const feedbackSnapshot = await getDocs(feedbackQuery);
      setFeedbackData(feedbackSnapshot.docs.map((doc) => doc.data()));
    };
    fetchFeedbackData();
  }, [orderData?.orderId]);

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
  return (
    <section>
      <Container>
        <Row>
          <TitlePageBanner title="Order History Details" />
          <Col lg="8" md="4">
            {/* Order Details */}
            <Row>
              <div className="orderHistory__container">
                <h5>Order Details</h5>
                <div className="orderHistory__group">
                  <div className="orderHistory__item">
                    <label>Order ID:&nbsp;</label>
                    <span>{orderData?.orderId}</span>
                  </div>

                  <div className="orderHistory__item">
                    <label>Order Date:&nbsp;</label>
                    <span>
                      {orderData?.orderDate
                        ? moment(orderData?.orderDate.toDate()).format(
                            "MMM D, YYYY h:mm A"
                          )
                        : "No Date"}
                    </span>
                  </div>

                  {orderData?.orderPickUpTime &&
                    orderData?.orderPickUpTime !== "" && (
                      <div className="orderHistory__item">
                        <label>Pickup Time:&nbsp;</label>
                        <span>{orderData?.orderPickUpTime}</span>
                      </div>
                    )}

                  <div className="orderHistory__item">
                    <label>Payment Method:&nbsp;</label>
                    <span>{orderData?.orderPayment}</span>
                  </div>

                  {orderData?.proofOfPaymentIssue && (
                    <div className="orderHistory__item">
                      <label>Proof of Payment Issue:&nbsp;</label>
                      <span>{orderData?.proofOfPaymentIssue}</span>
                    </div>
                  )}

                  {orderData?.settlementOptions && (
                    <div className="orderHistory__item">
                      <label>Settlement Options:&nbsp;</label>
                      <span>{orderData?.settlementOptions}</span>
                    </div>
                  )}

                  <div className="orderHistory__item">
                    <label>Order Status:&nbsp;</label>
                    <span className={`orderStatus${orderData?.orderStatus}`}>
                      {orderData?.orderStatus}
                    </span>
                  </div>

                  <div className="orderHistory__item">
                    <label>Delivery Address:&nbsp;</label>
                    <span>{orderData?.orderAddress}</span>
                  </div>

                  {orderData?.orderNote && orderData?.orderNote !== "" && (
                    <div className="orderHistory__item">
                      <label>Note:&nbsp;</label>
                      <span>{orderData?.orderNote}</span>
                    </div>
                  )}
                </div>
              </div>
            </Row>

            {/* Order Status  */}
            <Row>
              {/* Left Side - Order Status */}
              <Col>
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
                            <div
                              className="status
                            __image-wrapper"
                            >
                              <img src={item.image} alt={item.title} />
                            </div>
                          )}
                        </div>
                      );
                    })}

                {/* Display CancelledImg image if the order status is Cancelled */}
                {orderData?.orderStatus === "Cancelled" && (
                  <div className="cancelled__image-container">
                    <img src={CancelledImg} alt="Cancelled" />
                  </div>
                )}
              </Col>

              {/* Right Side - Order Status */}
              {orderData?.orderStatus === "Delivered" ||
              orderData?.orderStatus === "Order Picked up" ? (
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

                            {index < pickup_order_status.length - 1 && (
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
              ) : (
                <Col className="cancelled__msg-container">
                  <h2>Your order has been cancelled</h2>
                </Col>
              )}
            </Row>
          </Col>

          {/* Right Side */}
          <Col lg="4" md="6">
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
                    Delivery Fee:{" "}
                    <span>
                      ₱{" "}
                      {parseFloat(orderData?.orderDeliveryFee || 50)
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

              {orderData?.orderStatus === "Delivered" ||
              orderData?.orderStatus === "Order Picked up" ? (
                <>
                  <h6 className="footer__msg">
                    Thank you for ordering with us
                  </h6>
                  <button
                    className="footer__btn"
                    onClick={() => setShowFeedbackModal(true)}
                    disabled={feedbackData.length > 0}
                  >
                    {feedbackData.length > 0
                      ? "Thank you for giving a review!"
                      : "Leave a Review"}
                  </button>
                  {showFeedbackModal && (
                    <FeedbackModal
                      closeFeedbackModal={closeFeedbackModal}
                      orderData={orderData}
                      hasReviewed={hasReviewed}
                      handleHasReviewedChange={handleHasReviewedChange}
                    />
                  )}
                </>
              ) : (
                <>
                  <h6 className="footer__msg">Sorry for the inconvenience</h6>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

const Tr = (props) => {
  const { productName, totalPrice, productQty } = props.item;

  return (
    <tr>
      <td className="text-center">{productQty}x</td>
      <td className="text-center">{productName}</td>
      <td className="text-center">
        ₱{" "}
        {parseFloat(totalPrice)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      </td>
    </tr>
  );
};

export default ActivityHistoryDetails;
