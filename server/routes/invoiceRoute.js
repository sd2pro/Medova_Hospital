const express = require("express");
const router = express.Router();
const {
  createInvoice,
  getInvoiceById,
  updateInvoice,
  markInvoiceAsPaid
} = require('../controllers/invoiceController');


router.post("/create", createInvoice);

router.get('/get', getInvoiceById);

router.put('/update', updateInvoice)

router.put("/pay", markInvoiceAsPaid);

module.exports = router;