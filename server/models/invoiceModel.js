const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceID: {
    type: String,
    unique: true,
    default: function() {
      return `INV-${Math.floor(Math.random() * 1000000)}`; // Generates a random invoice ID
    }
  },
  aptID: {
    type: String,
    required: true,
    unique: true
  },
  invoice_date: {
    type: Date,
    required: true
  },
  payment_status: {
    type: Boolean,
    required: true
  },
  items: [
    {
      description: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      }
    }
  ]
});

// Virtual field for total amount
invoiceSchema.virtual('total_amt').get(function () {
  return this.items.reduce((total, item) => total + item.amount, 0);
});

invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
