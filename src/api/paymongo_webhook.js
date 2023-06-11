const axios = require("axios");
const handler = async (req, res) => {
  if (req.method === "POST") {
    console.log("===Webhook triggered===");
    const data = req.body.data;
    console.log(data);
    console.log("===webhook end===");

    if (data.attributes.type === "payment.paid") {
      console.log("Payment Paid");
    }

    res.status(200).json({ message: "Webhook Received" });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).send("Method Not Allowed");
  }
};

export default handler;
