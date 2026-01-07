import re

# Read the original file
with open(r'c:\Users\ediso\OneDrive\Documents\coding\project-Concept\Consolebilling.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add QR Code library after jsPDF
qr_lib = '''    <!-- QRCode.js Library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
'''

# Find the position after jsPDF autotable script
jspdf_pattern = r'(<script src="https://cdnjs\.cloudflare\.com/ajax/libs/jspdf-autotable/[^"]+"></script>)'
if not re.search(r'qrcodejs', content):
    content = re.sub(jspdf_pattern, r'\1\n' + qr_lib, content)

# 2. Add QR Code styles before closing </style>
qr_styles = '''
        /* QR Code Containers */
        .qr-container {
            display: flex;
            gap: 1rem;
            margin-top: 0.75rem;
        }
        .qr-box {
            flex: 1;
            background: var(--background);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 0.75rem;
            text-align: center;
        }
        .qr-box h4 {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .qr-code-wrapper {
            display: inline-block;
            padding: 0.5rem;
            background: white;
            border-radius: var(--radius-md);
            margin-bottom: 0.5rem;
        }
        .qr-code-wrapper canvas {
            display: block;
        }
        .qr-amount {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--primary);
        }
'''

if not re.search(r'qr-container', content):
    content = content.replace('    </style>', qr_styles + '\n    </style>')

# 3. Add QR Code HTML section after Business Footer
qr_html = '''
                 <!-- Payment QR Codes -->
                 <div class="section-title"><i class="fas fa-qrcode"></i> Payment QR Codes</div>
                 <div class="form-group">
                     <label class="form-label">UPI ID / VPA</label>
                     <input type="text" class="form-input" id="inpUpiId" placeholder="e.g. merchant@upi" oninput="generateQRCodes()">
                 </div>
                 <div class="form-group">
                     <label class="form-label">Account Number</label>
                     <input type="text" class="form-input" id="inpAccountNumber" value="41189296858" readonly>
                 </div>
                 <div class="form-group">
                     <label class="form-label">IFSC Code</label>
                     <input type="text" class="form-input" id="inpIfscCode" value="SBIN00064986" readonly>
                 </div>
                 <div class="qr-container">
                     <div class="qr-box">
                         <h4>Total Amount QR</h4>
                         <div class="qr-code-wrapper" id="qrTotalWrapper"></div>
                         <div class="qr-amount" id="qrTotalAmount">₹0.00</div>
                     </div>
                     <div class="qr-box">
                         <h4>Pending Amount QR</h4>
                         <div class="qr-code-wrapper" id="qrPendingWrapper"></div>
                         <div class="qr-amount" id="qrPendingAmountDisplay">₹0.00</div>
                     </div>
                 </div>
'''

# Find the closing div of editor-content (after Business Footer)
if not re.search(r'id="inpUpiId"', content):
    # Find the pattern: Business Footer section followed by </div> (closing editor-content)
    pattern = r'(value="contact@consoleprojects\.co \| \+1 818-456-3562" oninput="updatePreview\(\)">[\s\r\n]+</div>[\s\r\n]+)(</div>[\s\r\n]+<div class="editor-footer">)'
    content = re.sub(pattern, r'\1' + qr_html + '\n\n            \\2', content)

# 4. Add QR Code generation JavaScript
qr_js = '''
        // QR Code Generation
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

'''

if not re.search(r'function generateQRCodes', content):
    # Add before updatePreview function
    pattern = r'(// Core Functions[\s\r\n]+)'
    content = re.sub(pattern, qr_js + '\n        \\1', content)

# 5. Update updatePreview to also update QR codes
if 'generateQRCodes();' not in content:
    # Find the end of updatePreview function
    pattern = r'(pendingRow\.style\.display = \'none\';[\s\r\n]+}[\s\r\n]+})'
    content = re.sub(pattern, r'\1\n            \n            // Update QR codes\n            generateQRCodes();', content)

# 6. Add generateQRCodes() call in DOMContentLoaded
if 'Initial fit' in content and 'generateQRCodes()' not in content.split('Initial fit')[1].split('})')[0]:
    pattern = r'(// Initial fit[\s\r\n]+fitInvoiceToScreen\(\);)'
    content = re.sub(pattern, r'\1\n            \n            // Initialize QR Codes\n            generateQRCodes();', content)

# Write the updated file
with open(r'c:\Users\ediso\OneDrive\Documents\coding\project-Concept\Consolebilling.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("File updated successfully!")
print(f"Total lines: {content.count(chr(10))}")
