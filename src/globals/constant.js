import PendingIcon from "../assets/gif/order-pending.gif";
import OrderConfirmed from "../assets/gif/order-confirmed.gif";
import PreparedIcon from "../assets/gif/order-prepared.gif";
import DeliveryIcon from "../assets/gif/order-delivery.gif";
import DeliveredIcon from "../assets/gif/order-delivered.gif";
import OrderPickedUpIcon from "../assets/gif/order-picked-up.gif";
import CancelledImg from "../assets/images/cancel-order.svg";

export const track_order_status = [
  {
    id: 1,
    title: "Order Pending",
    sub_title: "We are processing your order",
    image: PendingIcon,
  },
  {
    id: 2,
    title: "Order Confirmed",
    sub_title: "Your order has been validated",
    image: OrderConfirmed,
  },
  {
    id: 3,
    title: "Order Prepared",
    sub_title: "Your order has been prepared",
    image: PreparedIcon,
  },
  {
    id: 4,
    title: "Delivery on its way",
    sub_title: "Hang on! Your food is on the way",
    image: DeliveryIcon,
  },
  {
    id: 5,
    title: "Delivered",
    sub_title: "Enjoy your meal!",
    image: DeliveredIcon,
  },
];

export const pickup_order_status = [
  {
    id: 1,
    title: "Order Pending",
    sub_title: "We are processing your order",
    image: PendingIcon,
  },
  {
    id: 2,
    title: "Order Confirmed",
    sub_title: "Your order has been validated",
    image: OrderConfirmed,
  },
  {
    id: 3,
    title: "Order Prepared",
    sub_title: "Your order has been prepared",
    image: PreparedIcon,
  },
  {
    id: 4,
    title: "Ready for Pickup",
    sub_title: "Your order is ready for pickup",
    image: PreparedIcon,
  },
  {
    id: 5,
    title: "Order Picked Up",
    sub_title: "You have picked up your order",
    image: OrderPickedUpIcon,
  },
];
