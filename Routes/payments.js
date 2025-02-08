const coinpaymentHook = require("../webhooks/webHook");

const router = require("express").Router();

router.post("/test-coinpayment", coinpaymentHook);

module.exports = router;
