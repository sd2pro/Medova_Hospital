const Razorpay = require("razorpay");

// Replace these with your Razorpay test keys
const razorpay = new Razorpay({
  key_id: "rzp_test_iYFDSVHVLuJcMw",         // e.g. "rzp_test_abc123..."
  key_secret: "mpxJDRej7k99eguFtfEzEDaw", // e.g. "your_test_key_secret"
});

// Create Razorpay order
exports.createOrder = async (req, res) => {
  const { amount } = req.body; // amount in paise (e.g. 50000 for ₹500)

  try {
    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      payment_capture: 1, // auto capture payment
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay create order error:", error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};