// QR Code Generation Functions for UPI Payment

let qrTotalInstance = null;
let qrPendingInstance = null;

function generateQRCodes() {
    const upiId = document.getElementById('inpUpiId')?.value || '';
    const cur = document.getElementById('inpCurrency')?.value || '₹';
    const subTotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const pendingAmount = parseFloat(document.getElementById('inpPendingAmount')?.value) || 0;
    const finalTotal = subTotal + pendingAmount;
    const invoiceNum = document.getElementById('inpInvoiceNum')?.value || '0001';

    // Clear existing QR codes
    const qrTotalWrapper = document.getElementById('qrTotalWrapper');
    const qrPendingWrapper = document.getElementById('qrPendingWrapper');

    if (qrTotalWrapper) qrTotalWrapper.innerHTML = '';
    if (qrPendingWrapper) qrPendingWrapper.innerHTML = '';

    // Update amount displays
    const formattedTotal = cur + finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formattedPending = cur + pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (document.getElementById('qrTotalAmount')) {
        document.getElementById('qrTotalAmount').innerText = formattedTotal;
    }
    if (document.getElementById('qrPendingAmountDisplay')) {
        document.getElementById('qrPendingAmountDisplay').innerText = formattedPending;
    }

    // Only generate QR if UPI ID is provided
    if (!upiId) {
        if (qrTotalWrapper) qrTotalWrapper.innerHTML = '<p style="font-size:0.7rem;color:#9CA3AF;">Enter UPI ID</p>';
        if (qrPendingWrapper) qrPendingWrapper.innerHTML = '<p style="font-size:0.7rem;color:#9CA3AF;">Enter UPI ID</p>';
        return;
    }

    // Generate Total Amount QR Code
    if (finalTotal > 0 && qrTotalWrapper) {
        const upiStringTotal = `upi://pay?pa=${upiId}&pn=Console Projects&am=${finalTotal.toFixed(2)}&cu=INR&tn=Invoice ${invoiceNum} Payment`;

        try {
            new QRCode(qrTotalWrapper, {
                text: upiStringTotal,
                width: 120,
                height: 120,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            console.error('QR Total generation error:', e);
            qrTotalWrapper.innerHTML = '<p style="font-size:0.7rem;color:#EF4444;">QR Error</p>';
        }
    }

    // Generate Pending Amount QR Code
    if (pendingAmount > 0 && qrPendingWrapper) {
        const upiStringPending = `upi://pay?pa=${upiId}&pn=Console Projects&am=${pendingAmount.toFixed(2)}&cu=INR&tn=Invoice ${invoiceNum} Pending Payment`;

        try {
            new QRCode(qrPendingWrapper, {
                text: upiStringPending,
                width: 120,
                height: 120,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            console.error('QR Pending generation error:', e);
            qrPendingWrapper.innerHTML = '<p style="font-size:0.7rem;color:#EF4444;">QR Error</p>';
        }
    } else if (qrPendingWrapper) {
        qrPendingWrapper.innerHTML = '<p style="font-size:0.7rem;color:#9CA3AF;">No Pending</p>';
    }
}
