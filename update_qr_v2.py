with open(r'c:\Users\ediso\OneDrive\Documents\coding\project-Concept\Consolebilling.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
i = 0
qr_styles_added = False
qr_html_added = False
qr_js_added = False
qr_init_added = False
qr_update_added = False

while i < len(lines):
    line = lines[i]
    output.append(line)
    
    # 1. Add QR styles before </style>
    if not qr_styles_added and '</style>' in line:
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
        output.insert(-1, qr_styles)
        qr_styles_added = True
        print("Added QR styles")
    
    # 2. Add QR HTML after Business Footer section
    if not qr_html_added and 'value="contact@consoleprojects.co' in line and 'oninput="updatePreview()">' in line:
        # Look ahead for the closing </div> of the form-group
        j = i + 1
        while j < len(lines) and '</div>' not in lines[j]:
            output.append(lines[j])
            j += 1
        if j < len(lines):
            output.append(lines[j])  # Add the </div>
            
            # Now add the QR section
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
            output.append(qr_html)
            i = j
            qr_html_added = True
            print("Added QR HTML section")
    
    # 3. Add QR JavaScript function before "// Core Functions"
    if not qr_js_added and '// Core Functions' in line:
        qr_js = '''        // QR Code Generation
        function generateQRCodes() {
            const upiId = document.getElementById('inpUpiId')?.value || '';
            const cur = document.getElementById('inpCurrency')?.value || '₹';
            const subTotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
            const pendingAmount = parseFloat(document.getElementById('inpPendingAmount')?.value) || 0;
            const finalTotal = subTotal + pendingAmount;
            const invoiceNum = document.getElementById('inpInvoiceNum')?.value || '0001';
            
            const qrTotalWrapper = document.getElementById('qrTotalWrapper');
            const qrPendingWrapper = document.getElementById('qrPendingWrapper');
            
            if (qrTotalWrapper) qrTotalWrapper.innerHTML = '';
            if (qrPendingWrapper) qrPendingWrapper.innerHTML = '';
            
            const formattedTotal = cur + finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const formattedPending = cur + pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
            if (document.getElementById('qrTotalAmount')) {
                document.getElementById('qrTotalAmount').innerText = formattedTotal;
            }
            if (document.getElementById('qrPendingAmountDisplay')) {
                document.getElementById('qrPendingAmountDisplay').innerText = formattedPending;
            }
            
            if (!upiId) {
                if (qrTotalWrapper) qrTotalWrapper.innerHTML = '<p style="font-size:0.7rem;color:#9CA3AF;">Enter UPI ID</p>';
                if (qrPendingWrapper) qrPendingWrapper.innerHTML = '<p style="font-size:0.7rem;color:#9CA3AF;">Enter UPI ID</p>';
                return;
            }
            
            if (finalTotal > 0 && qrTotalWrapper && typeof QRCode !== 'undefined') {
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
                    console.error('QR Total error:', e);
                    qrTotalWrapper.innerHTML = '<p style="font-size:0.7rem;color:#EF4444;">QR Error</p>';
                }
            }
            
            if (pendingAmount > 0 && qrPendingWrapper && typeof QRCode !== 'undefined') {
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
                    console.error('QR Pending error:', e);
                    qrPendingWrapper.innerHTML = '<p style="font-size:0.7rem;color:#EF4444;">QR Error</p>';
                }
            } else if (qrPendingWrapper) {
                qrPendingWrapper.innerHTML = '<p style="font-size:0.7rem;color:#9CA3AF;">No Pending</p>';
            }
        }

'''
        output.insert(-1, qr_js)
        qr_js_added = True
        print("Added QR JavaScript function")
    
    # 4. Add QR init call after fitInvoiceToScreen()
    if not qr_init_added and '// Initial fit' in line:
        j = i + 1
        while j < len(lines) and 'fitInvoiceToScreen()' not in lines[j]:
            output.append(lines[j])
            j += 1
        if j < len(lines):
            output.append(lines[j])  # fitInvoiceToScreen() line
            output.append('\n            // Initialize QR Codes\n')
            output.append('            generateQRCodes();\n')
            i = j
            qr_init_added = True
            print("Added QR initialization")
    
    # 5. Add QR update call at end of updatePreview function
    if not qr_update_added and "pendingRow.style.display = 'none';" in line:
        j = i + 1
        # Find the closing brace of the else block
        while j < len(lines) and lines[j].strip() != '}':
            output.append(lines[j])
            j += 1
        if j < len(lines):
            output.append(lines[j])  # closing }
            j += 1
            if j < len(lines) and lines[j].strip() == '}':
                # This is the closing brace of updatePreview
                output.append('\n            // Update QR codes\n')
                output.append('            generateQRCodes();\n')
                output.append(lines[j])
                i = j
                qr_update_added = True
                print("Added QR update call")
            else:
                i = j - 1
        else:
            i = j - 1
    
    i += 1

with open(r'c:\Users\ediso\OneDrive\Documents\coding\project-Concept\Consolebilling.html', 'w', encoding='utf-8') as f:
    f.writelines(output)

print("\nUpdate complete!")
print(f"QR Styles: {qr_styles_added}")
print(f"QR HTML: {qr_html_added}")
print(f"QR JS: {qr_js_added}")
print(f"QR Init: {qr_init_added}")
print(f"QR Update: {qr_update_added}")
