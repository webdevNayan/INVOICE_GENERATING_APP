import React, { useState } from "react";
import axios from "axios";
import numberToWords from "number-to-words";
import "./App.css";

const App = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInvoiceData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/invoices/${orderNumber}`
      );
      setInvoiceData(response.data);
    } catch (error) {
      console.error("Error fetching invoice data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (orderNumber.trim() !== "") {
      fetchInvoiceData();
    }
  };

  const {
    seller,
    buyer,
    order,
    invoice,
    items,
    placeOfSupply,
    placeOfDelivery,
    signatureImage,
  } = invoiceData || {};

  let subtotal = 0;
  let totalTaxAmount = 0;
  let totalAmount = 0;

  const itemRows =
    items &&
    items.map((item, index) => {
      const netAmount = item.unitPrice * item.quantity - item.discount;
      const taxAmount = netAmount * item.taxRate;
      const cgst = placeOfSupply === placeOfDelivery ? taxAmount / 2 : 0;
      const sgst = placeOfSupply === placeOfDelivery ? taxAmount / 2 : 0;
      const igst = placeOfSupply !== placeOfDelivery ? taxAmount : 0;
      const totalItemAmount = netAmount + taxAmount + item.shippingCharges;

      subtotal += netAmount;
      totalTaxAmount += taxAmount;
      totalAmount += totalItemAmount;

      // Determine shipping tax details
      let shippingTaxType = "IGST";
      let shippingTaxAmount = item.shippingCharges * 0.09; // Default IGST
      if (placeOfSupply === placeOfDelivery) {
        shippingTaxType = "CGST/SGST";
        shippingTaxAmount = (item.shippingCharges * 0.09 / 2);
      }

      return (
        <React.Fragment key={index}>
          <tr className="item">
            <td>{index + 1}</td>
            <td>{item.description}</td>
            <td>₹{item.unitPrice.toFixed(2)}</td>
            <td>{item.quantity}</td>
            <td>₹{netAmount.toFixed(2)}</td>
            <td>{(item.taxRate * 100).toFixed(2)}%</td>
            <td>
              {/* GST: ₹{taxAmount.toFixed(2)}<br /> */}
              {shippingTaxType === "CGST/SGST" ? `CGST: ₹${cgst.toFixed(2)}\nSGST: ₹${sgst.toFixed(2)}` : `IGST: ₹${igst.toFixed(2)}`}
            </td>
            <td>₹{totalItemAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td></td>
            <td>Shipping Charges</td>
            <td></td>
            <td></td>
            <td>₹{item.shippingCharges.toFixed(2)}</td>
            <td>9%</td>
            <td>{shippingTaxType === "CGST/SGST" ? `CGST: ₹${(item.shippingCharges * 0.09 / 2).toFixed(2)}\nSGST: ₹${(item.shippingCharges * 0.09 / 2).toFixed(2)}` : `IGST: ₹${(item.shippingCharges * 0.09).toFixed(2)}`}</td>
            <td>₹{(item.shippingCharges * 1.09).toFixed(2)}</td>
          </tr>
        </React.Fragment>
      );
    });

  return (
    <>
    <section className="centered">
  <div className="search-card">
    <input
      type="text"
      value={orderNumber}
      onChange={(e) => setOrderNumber(e.target.value)}
      placeholder="Enter Order Number"
      className="search-input"
    />
    <button onClick={handleSearch} className="search-button">Get Invoice</button>
  </div>
</section>


    <section className="invoice-container">
   <div>
   <div className="invoice-box">

      {loading && <div>Loading...</div>}

      {invoiceData && (
        <>
          <div className="header">
            <div className="left">
              <img
                src="./Amazon_logo.svg"
                alt="Company Logo"
                className="logo"
              />
            </div>
            <div className="right">
              <strong>Tax Invoice/Bill of Supply/Cash Memo</strong>
              <br />
              (Original for Recipient)
            </div>
          </div>
          <div className="flex-container">
            <div className="left">
              <strong>Sold By:</strong>
              <br />
              {seller.name}
              <br />
              {seller.address}
              <br />
              <strong>PAN No:</strong> {seller.pan}
              <br />
              <strong>GST Registration No:</strong> {seller.gst}
              <br />
              <div className="order-number">
                <strong>Order Number:</strong> {order.number}
                <br />
                <strong>Order Date:</strong> {order.date}
              </div>
            </div>
            <div className="right">
              <strong>Billing Address:</strong>
              <br />
              {buyer.name}
              <br />
              {buyer.address}
              <br />
              <strong>State/UT Code:</strong> {buyer.stateCode}
              <br />
              <strong>Shipping Address:</strong>
              <br />
              {buyer.name}
              <br />
              {buyer.address}
              <br />
              <strong>State/UT Code:</strong> {buyer.stateCode}
              <br />
              <strong>Place of Supply:</strong> {placeOfSupply}
              <br />
              <strong>Place of Delivery:</strong> {placeOfDelivery}
              <br />
              <strong>Invoice Number:</strong> {invoice.number}
              <br />
              <strong>Invoice Details:</strong> {invoice.details}
              <br />
              <strong>Invoice Date:</strong> {invoice.date}
            </div>
          </div>
          <table>
            <thead>
              <tr className="heading">
                <th>Sl No.</th>
                <th>Description</th>
                <th>Unit Price</th>
                <th>QTY</th>
                <th>Net Amount</th>
                <th>Tax Rate</th>
                <th>Tax Type</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {itemRows}
              <tr className="total">
                <td colSpan="6">TOTAL:</td>
                <td>₹{totalTaxAmount.toFixed(2)}</td>
                <td>₹{totalAmount.toFixed(2)}</td>
              </tr>
              <tr className="total">
                <td colSpan="8">
                  <strong>Amount in Words:</strong>{" "}
                  {numberToWords.toWords(totalAmount)} rupees only
                </td>
              </tr>
              <tr>
                <td colSpan="8">
                  <div className="signature">
                    For {seller.name}:<br />
                    <img
                      src={signatureImage}
                      alt="Signature"
                    />
                    <br />
                    Authorised Signatory
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="reverse-charge">
            Whether tax is payable under reverse charge - {invoice.reverseCharge}
          </div>
        </>
      )}
    </div>
   </div>
    </section>
    </>
  );
};

export default App;
