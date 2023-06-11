import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Col, Row } from "reactstrap";
import moment from "moment/moment";
import "../../style/ActivityHistory.css";

import NoHistoryImage from "../../assets/images/no-history.png";

// Firebase
import { auth, db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const ActivityHistory = () => {
  const [orderData, setOrderData] = useState([]);

  const clearOrderData = () => {
    setOrderData([]);
  };

  const getOrdersData = async () => {
    if (auth.currentUser) {
      const ordersRef = query(
        collection(db, "UserOrders"),
        where("orderUserId", "==", auth.currentUser.uid),
        where("orderStatus", "in", ["Delivered", "Cancelled"]) // Only retrieve orders with Delivered or Cancelled status
      );
      onSnapshot(ordersRef, (snapshot) => {
        setOrderData(snapshot.docs.map((doc) => doc.data()));
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

  return (
    <div className="actHistory__container">
      <h5>Order History</h5>
      <div className="actHistoryCards__container">
        {orderData.length === 0 ||
        !orderData.some(
          (order) =>
            order.orderStatus === "Delivered" ||
            order.orderStatus === "Cancelled"
        ) ? (
          <div className="no__history">
            <img src={NoHistoryImage} alt="No History" />
            <h2>Nothing's happened yet.</h2>
            <h2>When an activity is over, it'll appear here.</h2>
          </div>
        ) : (
          orderData.map((order, index) => {
            return (
              <Col lg="5">
                <Row>
                  <Link
                    to={`/activityHistoryDetails/${order.orderId}`}
                    className="actHistoryCards no-underline"
                    key={index}
                  >
                    <div className="actHistoryCard__body ">
                      <h6
                        className={`${
                          order.orderStatus === "Delivered"
                            ? "delivered"
                            : order.orderStatus === "Cancelled"
                            ? "cancelled"
                            : ""
                        }`}
                      >
                        {order.orderStatus}
                      </h6>
                      <p>Order ID: {order.orderId}</p>
                      <p>
                        Order Date:&nbsp;
                        {order.orderDate
                          ? moment(order.orderDate.toDate()).format(
                              "MMM D, YYYY h:mm A"
                            )
                          : null}
                      </p>
                      <p>
                        Total: ₱
                        {parseFloat(order.orderTotalCost)
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </p>
                    </div>
                  </Link>
                </Row>
              </Col>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityHistory;
