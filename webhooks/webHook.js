const crypto = require("crypto");

const { COINPAYMENTS_IPN_SECRET } = require("../var");

const coinpaymentHook = (req, res) => {
  const receivedHMAC = req.headers["hmac"];

  // Validate HMAC signature
  if (!receivedHMAC) {
    return res.status(400).send("No HMAC signature.");
  }

  const hmac = crypto.createHmac("sha512", COINPAYMENTS_IPN_SECRET);
  hmac.update(new URLSearchParams(req.body).toString());
  const calculatedHMAC = hmac.digest("hex");

  if (receivedHMAC !== calculatedHMAC) {
    return res.status(400).send("Invalid HMAC signature.");
  }

  const { currency, status } = req.body;

  // Process only LTCT transactions
  if (currency !== "LTCT") {
    return res.status(400).send("Not an LTCT transaction.");
  }

  console.log("✅ LTCT IPN Data:", req.body);

  // Handle payment status
  if (status == "100") {
    console.log("✅ LTCT Payment Successful!");
  } else {
    console.log("⚠ LTCT Payment Pending or Failed.");
  }

  res.status(200).send("OK");
};

module.exports = coinpaymentHook;
