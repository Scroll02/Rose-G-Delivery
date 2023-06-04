import axios from "axios";
import retrieveCheckoutSession from "./paymongo_retrieve";
const generateRandomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const createWebhook = async () => {
  const webhookUrl = `http://localhost:3000/webhook/${generateRandomString(
    16
  )}`;

  const options = {
    method: "POST",
    url: "https://api.paymongo.com/v1/webhooks",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: "Basic c2tfdGVzdF9pMVk0M25EeFZ5akRDTmFEdzc5NkhQaHg6",
    },
    data: {
      data: {
        attributes: {
          events: [
            "source.chargeable",
            "payment.paid",
            "payment.failed",
            "checkout_session.payment.paid",
          ],
          // url: webhookUrl,
          url: "http://localhost:3000/webhook",
        },
      },
    },
  };

  try {
    const response = await axios.request(options);
    console.log("Webhooks data:", response.data);
  } catch (error) {
    console.error(error);
  }
};

// const webhookHandler = async (data) => {
//   console.log("===Webhook triggered===");
//   console.log(data);
//   console.log("===webhook end===");

//   if (data.attributes.type === "source.chargeable") {
//     // Gcash and Grab Pay
//     console.log("E-wallet Payment Chargeable");
//   }

//   if (data.attributes.type === "payment.paid") {
//     // All Payment Types
//     // Add next steps for you
//     console.log("Payment Paid");
//   }

//   if (data.attributes.type === "payment.failed") {
//     // Failed Payments - Cards Paymaya
//     console.log("Payment Failed");
//   }

//   if (data.attributes.type === "checkout_session.payment.paid") {
//     // Retrieve payment object using checkoutSessionId
//     const checkoutSessionId = data.attributes.data.id;
//     const payment = await retrieveCheckoutSession(checkoutSessionId);
//     if (payment) {
//       console.log("Payment Object:", payment);
//       // Add next steps for handling the payment object
//     }
//   }

//   const req = {
//     method: "POST",
//     body: {
//       data: data,
//     },
//   };

//   const res = {
//     status: (code) => ({
//       send: (message) => {
//         console.log(message);
//       },
//     }),
//     setHeader: (key, value) => {
//       // Ignore for this example
//     },
//   };

//   if (req.method === "POST") {
//     webhookHandler(req.body.data);
//     res.status(200).send("Webhook Received");
//   } else {
//     res.setHeader("Allow", "POST");
//     res.status(405).send("Method Not Allowed");
//   }
// };

const webhookHandler = async (req, res) => {
  if (req.method === "POST") {
    console.log("===Webhook triggered===");
    const data = req.body.data;
    console.log(data);
    console.log("===webhook end===");
    if (data.attributes.type === "source.chargeable") {
      // Gcash and Grab Pay
      console.log("E-wallet Payment Chargeable");
    }
    if (data.attributes.type === "payment.paid") {
      // All Payment Types
      // Add next steps for you
      console.log("Payment Paid");
    }
    if (data.attributes.type === "payment.failed") {
      // Failed Payments - Cards Paymaya
      // Add next steps for you
      console.log("Payment Failed");
    }
    if (data.attributes.type === "checkout_session.payment.paid") {
      // Failed Payments - Cards Paymaya
      // Add next steps for you
      console.log("Payment Failed");
    }
    res.status(200).send("Webhook Received");
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).send("Method Not Allowed");
  }
};

export { createWebhook, webhookHandler };
