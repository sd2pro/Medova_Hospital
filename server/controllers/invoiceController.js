const Invoice = require('../models/invoiceModel');
const Appointment = require('../models/appointmentModel'); // Import the Appointment model

// Create a new invoice if the appointment exists
exports.createInvoice = async (req, res) => {
  try {
    const { aptID, invoice_date, payment_status, items } = req.body;

    // Check if the appointment exists
    const appointment = await Appointment.findOne({ aptID });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Create the invoice with the items
    const newInvoice = new Invoice({ aptID, invoice_date, payment_status, items });
    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (err) {
    res.status(400).json({ message: 'Error creating invoice', error: err.message });
  }
};

// Get an invoice by aptID
exports.getInvoiceById = async (req, res) => {
  try {
    const { aptID } = req.query;

    // Find the invoice by aptID
    const invoice = await Invoice.findOne({ aptID });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json(invoice);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching invoice', error: err.message });
  }
};

// Update an invoice by aptID
exports.updateInvoice = async (req, res) => {
  try {
    const { aptID, invoice_date, payment_status, items } = req.body;

    // Find and update the invoice by aptID
    const updatedInvoice = await Invoice.findOneAndUpdate(
      { aptID },
      { invoice_date, payment_status, items },
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json(updatedInvoice);
  } catch (err) {
    res.status(400).json({ message: 'Error updating invoice', error: err.message });
  }
};

// PUT /api/invoice/pay
exports.markInvoiceAsPaid = async (req, res) => {
  const { aptID } = req.body;
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { aptID },
      { payment_status: true },
      { new: true }
    );
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json({ message: "Payment successful", invoice });
  } catch (error) {
    res.status(500).json({ message: "Failed to update invoice", error: error.message });
  }
};