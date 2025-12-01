// ============== DOM ELEMENTS ==============
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const buyButtons = document.querySelectorAll('[data-ticket]');
const ticketTypeSelect = document.getElementById('ticketType');
const quantityInput = document.getElementById('quantity');
const totalPriceSpan = document.getElementById('totalPrice');
const bookingForm = document.getElementById('bookingForm');
const paymentSection = document.getElementById('paymentSection');
const confirmationSection = document.getElementById('confirmationSection');
const newBookingBtn = document.getElementById('newBookingBtn');

// Confirmation display fields
const confName = document.getElementById('confName');
const confPhone = document.getElementById('confPhone');
const confTicket = document.getElementById('confTicket');
const confQty = document.getElementById('confQty');
const confTotal = document.getElementById('confTotal');

// Input fields for validation
const fullNameInput = document.getElementById('fullName');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');

// ============== MOBILE MENU TOGGLE ==============
hamburger?.addEventListener('click', () => {
  navLinks?.classList.toggle('active');
});

// ============== TICKET SELECTION FROM BUTTONS ==============
buyButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const ticket = btn.getAttribute('data-ticket');
    ticketTypeSelect.value = ticket;
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    navLinks?.classList.remove('active');
  });
});

// ============== REAL-TIME PRICE CALCULATION ==============
function updateTotal() {
  const ticket = ticketTypeSelect.value;
  const qty = parseInt(quantityInput.value) || 1;
  let price = 0;

  if (ticket === 'regular') price = 150;
  else if (ticket === 'vip') price = 300;
  else if (ticket === 'vvip') price = 500;

  totalPriceSpan.textContent = price * qty;
}

ticketTypeSelect?.addEventListener('change', updateTotal);
quantityInput?.addEventListener('input', updateTotal);
updateTotal();

// ============== FORM SUBMISSION ==============
bookingForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const fullName = fullNameInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();
  const ticket = ticketTypeSelect.value;
  const qty = parseInt(quantityInput.value);
  const total = parseInt(totalPriceSpan.textContent);

  if (!fullName || !phone || !ticket || qty < 1) {
    alert('Please fill all required fields.');
    return;
  }

  const bookingData = {
    fullName,
    phone,
    email,
    ticket,
    quantity: qty,
    total,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('latestBooking', JSON.stringify(bookingData));

  bookingForm.classList.add('hidden');
  paymentSection.classList.remove('hidden');

  // Re-attach scan listeners (dynamic elements)
  setTimeout(() => {
    document.querySelectorAll('.scan-btn').forEach(btn => {
      if (!btn.dataset.attached) {
        btn.dataset.attached = 'true';
        btn.addEventListener('click', handleScanClick);
      }
    });
  }, 100);
});

// ============== INPUT VALIDATION ==============
fullNameInput?.addEventListener('input', function(e) {
  e.target.value = e.target.value.replace(/[^a-zA-Z\s\-']/g, '');
});

fullNameInput?.addEventListener('paste', function(e) {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text');
  const clean = text.replace(/[^a-zA-Z\s\-']/g, '');
  document.execCommand('insertHTML', false, clean);
});

phoneInput?.addEventListener('input', function(e) {
  let value = e.target.value.replace(/[^0-9+]/g, '');
  if (!value.startsWith('+251')) {
    value = '+251' + value.replace(/\+|251/g, '');
  }
  if (value.length > 13) value = value.slice(0, 13);
  e.target.value = value;
});

phoneInput?.addEventListener('keydown', function(e) {
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter'];
  if (allowedKeys.includes(e.key)) return;
  if (e.key === '+' && this.selectionStart === 0 && !this.value.includes('+')) return;
  if (!/^[0-9]$/.test(e.key)) e.preventDefault();
});

emailInput?.addEventListener('paste', function(e) {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text');
  const clean = text.replace(/[^\w@.\-+_]/g, '');
  document.execCommand('insertHTML', false, clean);
});

// ============== SCAN BUTTON CLICK HANDLER ==============
function handleScanClick() {
  const method = this.getAttribute('data-method');
  const booking = JSON.parse(localStorage.getItem('latestBooking'));
  
  if (!booking) {
    alert('No booking found. Please complete the form first.');
    return;
  }

  const ticketMap = {
    regular: '🎟️ Regular (150 ETB)',
    vip: '🌟 VIP (300 ETB)',
    vvip: '👑 VVIP (500 ETB)'
  };
  const ticketDisplay = ticketMap[booking.ticket] || booking.ticket;

  const popupContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation | UniVibe</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Poppins', sans-serif;
          background: #f0f4ff;
          padding: 20px;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        .header {
          background: linear-gradient(135deg, #4361ee, #7209b7);
          color: white;
          padding: 24px;
          text-align: center;
        }
        .header h2 { font-size: 1.6rem; margin: 0; }
        .header p { margin-top: 6px; opacity: 0.9; }
        .content {
          padding: 24px;
        }
        .detail {
          background: #f8f9ff;
          padding: 16px;
          border-radius: 10px;
          margin: 16px 0;
        }
        .detail p { margin: 6px 0; font-size: 1.05rem; }
        .detail strong { color: #4361ee; font-weight: 600; }
        .security {
          text-align: center;
          color: #27ae60;
          font-weight: 600;
          margin-top: 20px;
          font-size: 1.1rem;
          line-height: 1.5;
        }
        .footer {
          text-align: center;
          font-size: 0.85rem;
          color: #6c757d;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px dashed #eee;
        }
        .popup-footer-note {
          font-size: 0.8rem;
          color: #999;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✅ Payment Initiated</h2>
          <p>${method} — Processing...</p>
        </div>
        <div class="content">
          <div class="detail">
            <p><strong>Full Name:</strong> ${booking.fullName}</p>
            <p><strong>Phone:</strong> ${booking.phone}</p>
            <p><strong>Ticket:</strong> ${ticketDisplay}</p>
            <p><strong>Quantity:</strong> ${booking.quantity}</p>
            <p><strong>Total:</strong> ${booking.total} ETB</p>
          </div>
          <p class="security">🔒 Your payment is secure.<br>We’ll verify and send confirmation within 5 minutes.</p>
          <div class="footer">
            <p>UniVibe Events & Solutions • support@univibe.et</p>
            <p class="popup-footer-note">This window will close automatically in 5 seconds.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const w = 600, h = 500;
  const left = (screen.width - w) / 2;
  const top = (screen.height - h) / 2;
  const popup = window.open('', 'PaymentConfirmation', `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`);

  if (popup) {
    popup.document.write(popupContent);
    popup.document.close();

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      if (!popup.closed) popup.close();
    }, 5000);

    popup.addEventListener('beforeunload', () => clearTimeout(timer));
  } else {
    alert('⚠️ Popup blocked! Please allow popups to view payment confirmation.');
  }

  // Proceed to main confirmation after 2s
  setTimeout(() => {
    const ticketNames = { regular: '🎟️ Regular', vip: '🌟 VIP', vvip: '👑 VVIP' };
    confName.textContent = booking.fullName;
    confPhone.textContent = booking.phone;
    confTicket.textContent = ticketNames[booking.ticket] || booking.ticket;
    confQty.textContent = booking.quantity;
    confTotal.textContent = booking.total;

    paymentSection.classList.add('hidden');
    confirmationSection.classList.remove('hidden');
  }, 2000);
}

// ============== NEW BOOKING ==============
newBookingBtn?.addEventListener('click', () => {
  bookingForm.reset();
  bookingForm.classList.remove('hidden');
  confirmationSection.classList.add('hidden');
  updateTotal();
});

// ============== SMOOTH SCROLLING ==============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: 'smooth'
      });
      navLinks?.classList.remove('active');
    }
  });
});