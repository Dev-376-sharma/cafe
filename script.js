/* ═══════════════════════════════════════════
   La Quench – The Rooftop Cafe | script.js
   ═══════════════════════════════════════════ */

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* ── Mobile menu ── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}
if (mobileClose && mobileMenu) {
  mobileClose.addEventListener('click', closeMobile);
}
function closeMobile() {
  if (mobileMenu) {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ── Scroll reveal animations ── */
if (typeof IntersectionObserver !== 'undefined') {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, (i % 4) * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ── Menu filter tabs ── */
const filterBtns = document.querySelectorAll('.filter-btn');
const menuCats = document.querySelectorAll('.menu-cat');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show/hide categories
    menuCats.forEach(cat => {
      if (filter === 'all' || cat.dataset.cat === filter) {
        cat.classList.add('visible');
      } else {
        cat.classList.remove('visible');
      }
    });
  });
});

/* ── Cart & Ordering System ── */
let orderItems = [];
let orderTotal = 0;

function addToOrder(name, price) {
  orderItems.push({ name, price });
  orderTotal += price;
  updateCartUI();
  
  // Open drawer automatically
  const cd = document.getElementById('cartDrawer');
  const co = document.getElementById('cartOverlay');
  if(cd) cd.classList.add('open');
  if(co) co.classList.add('show');
  
  // Also show toast
  const toast = document.getElementById('orderToast');
  const toastMsg = document.getElementById('toastMsg');
  if (toast && toastMsg) {
    toastMsg.textContent = `${name} added!`;
    toast.style.display = 'flex';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 2000);
  }
}

function updateCartUI() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalAmt = document.getElementById('cartTotalAmt');
  const cartBadges = document.querySelectorAll('.cart-badge');
  
  if(!cartItemsContainer) return;
  
  cartItemsContainer.innerHTML = '';
  if(orderItems.length === 0){
    cartItemsContainer.innerHTML = '<p style="text-align:center;color:var(--text-light);margin-top:20px;">Your cart is empty.</p>';
  } else {
    orderItems.forEach((item, index) => {
      cartItemsContainer.innerHTML += `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>₹${item.price}</p>
          </div>
          <button class="cart-item-remove" onclick="removeCartItem(${index})">Remove</button>
        </div>
      `;
    });
  }
  
  if(cartTotalAmt) cartTotalAmt.textContent = `₹${orderTotal}`;
  cartBadges.forEach(badge => badge.textContent = orderItems.length);
}

function removeCartItem(index) {
  orderTotal -= orderItems[index].price;
  orderItems.splice(index, 1);
  updateCartUI();
}

function openCart() {
  const cd = document.getElementById('cartDrawer');
  const co = document.getElementById('cartOverlay');
  if(cd) cd.classList.add('open');
  if(co) co.classList.add('show');
}

function closeCart() {
  const cd = document.getElementById('cartDrawer');
  const co = document.getElementById('cartOverlay');
  if(cd) cd.classList.remove('open');
  if(co) co.classList.remove('show');
}

const closeCartBtn = document.getElementById('closeCart');
const cartOverlay = document.getElementById('cartOverlay');
if(closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if(cartOverlay) cartOverlay.addEventListener('click', closeCart);

// Handle Order Form Submission to Spreadsheet & Token
const orderForm = document.getElementById('orderForm');
if(orderForm) {
  orderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if(orderItems.length === 0) {
      alert("Please add items to your cart first.");
      return;
    }
    
    const tableNo = document.getElementById('tableNo').value;
    const payment = document.getElementById('paymentMethod').value;
    const token = Math.floor(100 + Math.random() * 900); // 3 digit token
    
    // Create the payload for Google Sheets via Formspree or custom webhook
    const orderDetails = {
      token: token,
      table: tableNo,
      payment: payment,
      total: orderTotal,
      items: orderItems.map(i => i.name).join(", "),
      time: new Date().toLocaleString()
    };
    
    console.log("Order submitted (Mock sending to Excel/Sheets): ", orderDetails);
    
    // NOTE: To make this ACTUALLY write to Google Sheets, you need to setup a Google App Script 
    // and POST this `orderDetails` object to the script URL using fetch().
    // Example: fetch('YOUR_GOOGLE_SCRIPT_URL', { method: 'POST', body: JSON.stringify(orderDetails) })

    // UI Updates
    closeCart();
    const tokenModal = document.getElementById('tokenModal');
    if(tokenModal) {
      document.getElementById('tokenNumberDisplay').textContent = '#' + token;
      tokenModal.style.display = 'flex';
    }
    
    // Clear cart
    orderItems = [];
    orderTotal = 0;
    updateCartUI();
    orderForm.reset();
  });
}

function closeTokenModal() {
  const tm = document.getElementById('tokenModal');
  if(tm) tm.style.display = 'none';
}

/* ── Reservation form submission ── */
function submitReservation(e) {
  e.preventDefault();
  const name = document.getElementById('res-name')?.value;
  const phone = document.getElementById('res-phone')?.value;
  if (!name || !phone) {
    alert('Please fill in required fields.');
    return;
  }
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  document.getElementById('reservationForm')?.reset();
}

function closeModal() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

document.getElementById('successModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

const dateInput = document.getElementById('res-date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

/* ── Active nav link ── */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
  }
});
