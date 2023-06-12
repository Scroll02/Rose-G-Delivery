import React, { useState, useEffect } from "react";
import "../style/Orders.css";
import { Container, Row, Col } from "reactstrap";
import { Link, useLocation } from "react-router-dom";
import moment from "moment/moment";
import TitlePageBanner from "../components/UI/TitlePageBanner";
import OrderNowImg from "../assets/images/order-now.png";
// Firebase
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import ProofOfPaymentIssueModal from "../components/Modal/ProofOfPaymentIssueModal";

const Orders = () => {
  const location = useLocation();
  const fromCheckout = new URLSearchParams(location.search).get("fromCheckout");
  const paymentMethod = new URLSearchParams(location.search).get(
    "paymentMethod"
  );

  useEffect(() => {
    if (fromCheckout === "true" && paymentMethod === "GCash") {
      // Place the order here
      console.log("Placing order...");
    }
  }, [fromCheckout, paymentMethod]);

  const [orderData, setOrderData] = useState([]);

  const clearOrderData = () => {
    setOrderData([]);
  };

  const getOrdersData = async () => {
    if (auth.currentUser) {
      const ordersRef = query(
        collection(db, "UserOrders"),
        where("orderUserId", "==", auth.currentUser.uid),
        where("orderStatus", "in", [
          "Pending",
          "Confirmed",
          "Prepared",
          "Delivery",
        ])
      );
      onSnapshot(ordersRef, (snapshot) => {
        const orders = snapshot.docs.map((doc) => doc.data());
        setOrderData(orders);
        const hasIssue = orders.some(
          (order) =>
            order.proofOfPaymentIssue === "Insufficient Payment Amount" ||
            order.proofOfPaymentIssue === "Invalid Proof of Payment"
        );
        setShowPOPIssueModal(hasIssue);
      });
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        getOrdersData();
      } else {
        clearOrderData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
  // console.log(orderData);

  // Modal
  const [showPOPIssueModal, setShowPOPIssueModal] = useState(false);
  const [popIssue, setPopIssue] = useState("");
  const [issueOrder, setIssueOrder] = useState("");
  const closePOPIssueModal = () => {
    setShowPOPIssueModal(false);
  };
  useEffect(() => {
    // const hasIssue = orderData.some(
    //   (order) =>
    //     order.proofOfPaymentIssue === "Insufficient Payment Amount" ||
    //     order.proofOfPaymentIssue === "Invalid Proof of Payment"
    // );
    const hasIssue = orderData.some(
      (order) => order.proofOfPaymentIssue && order.orderStatus === "Pending"
    );
    setShowPOPIssueModal(hasIssue);
    if (hasIssue) {
      const issueOrder = orderData.find(
        (order) => order.proofOfPaymentIssue && order.orderStatus === "Pending"
      );
      setPopIssue(issueOrder?.proofOfPaymentIssue);
      setIssueOrder(issueOrder);
    }
  }, [orderData]);

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
        <Row>
          <Col lg="12">
            <header>
              <TitlePageBanner title="On-Going Orders" />
            </header>

            {orderData.length == 0 ? (
              // Empty Orders
              <div className="order__now">
                <img src={OrderNowImg} alt="Order-now-img" />
                <h1>You haven't placed any orders yet.</h1>
                <h1>When you do, their status will appear here.</h1>
              </div>
            ) : (
              // Orders not empty
              <div className="orderCards__container ">
                {orderData.map((order, index) => {
                  return (
                    <Col md="5">
                      <Row>
                        <Link
                          sm="6"
                          to={`/orders/${order.orderId}`}
                          className="orderCard no-underline"
                          key={index}
                        >
                          <article className="orderCard__body">
                            <h4
                              className={`${
                                order.orderStatus === "Pending"
                                  ? "pending"
                                  : order.orderStatus === "Delivery"
                                  ? "delivery"
                                  : order.orderStatus === "Prepared"
                                  ? "preparing"
                                  : order.orderStatus === "Confirmed"
                                  ? "confirmed"
                                  : ""
                              }`}
                            >
                              {order.orderStatus}
                            </h4>
                            <p>Order ID: {order.orderId}</p>
                            <p>
                              Order Date:&nbsp;
                              {order.orderDate
                                ? moment(order.orderDate.toDate()).format(
                                    "MMM D, YYYY h:mm A"
                                  )
                                : null}
                            </p>
                            <p>Payment Method: {order.orderPayment}</p>
                            <p>
                              Total: ₱
                              {parseFloat(order.orderTotalCost)
                                .toFixed(2)
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </p>
                          </article>
                        </Link>
                      </Row>
                    </Col>
                  );
                })}
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default Orders;
