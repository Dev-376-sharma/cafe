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
  
  // Also show toast (DO NOT open cart automatically)
  const toast = document.getElementById('orderToast');
  const toastMsg = document.getElementById('toastMsg');
  if (toast && toastMsg) {
    toastMsg.textContent = name + ' added!';
    toast.style.display = 'flex';
    toast.style.opacity = '1';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 2000);
  }
}

function updateCartUI() {
  const container = document.getElementById('cartItems');
  const cartBadges = document.querySelectorAll('.cart-badge');
  
  if(!container) return;
  
  // 1. Render Items
  if(orderItems.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-light);margin-top:20px;">Your cart is empty.</p>';
  } else {
    container.innerHTML = orderItems.map((item, index) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>₹${item.price}</p>
        </div>
        <div class="cart-item-controls">
          <span class="cart-item-price">₹${item.price}</span>
          <button class="cart-item-remove" onclick="removeCartItem(${index})">Remove</button>
        </div>
      </div>
    `).join('');
  }

  // 2. Calculations
  const tax = orderTotal * 0.05;
  const deliveryFee = currentService === 'delivery' ? 40 : 0;
  const finalTotal = orderTotal + tax + deliveryFee - currentDiscount;

  // 3. Update Bill Table (Drawer)
  const subEl = document.getElementById('billSubtotal');
  const taxEl = document.getElementById('billTax');
  const discEl = document.getElementById('billDiscount');
  const totalEl = document.getElementById('billTotal');
  const btnTotalEl = document.getElementById('placeOrderTotal');
  const discRow = document.getElementById('discountRow');

  if(subEl) subEl.textContent = `₹${orderTotal}`;
  if(taxEl) taxEl.textContent = `₹${tax.toFixed(0)}`; // Round GST for cleaner UI
  if(totalEl) totalEl.textContent = `₹${finalTotal.toFixed(0)}`;
  if(btnTotalEl) btnTotalEl.textContent = `₹${finalTotal.toFixed(0)}`;
  
  if(discEl && discRow) {
    if(currentDiscount > 0) {
      discEl.textContent = `-₹${currentDiscount.toFixed(0)}`;
      discRow.style.display = 'flex';
    } else {
      discRow.style.display = 'none';
    }
  }

  // 4. Update Badges
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

// Enhanced Cart Logic Variables
let currentService = 'pickup'; // default
let currentDiscount = 0;
let lastOrderID = '';

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

// Toggle Pickup / Delivery
function setService(type) {
  currentService = type;
  const btns = document.querySelectorAll('.service-btn');
  btns.forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-service') === type);
  });
  
  const deliveryFields = document.getElementById('deliveryFields');
  const deliveryRow = document.getElementById('deliveryRow');
  
  if(type === 'delivery') {
    if(deliveryFields) deliveryFields.style.display = 'block';
    if(deliveryRow) deliveryRow.style.display = 'flex';
  } else {
    if(deliveryFields) deliveryFields.style.display = 'none';
    if(deliveryRow) deliveryRow.style.display = 'none';
  }
  updateCartUI();
}

// Coupon Logic
function applyCoupon() {
  const code = document.getElementById('couponCode').value.trim().toUpperCase();
  const msg = document.getElementById('couponMsg');
  
  if(code === 'WELCOME10') {
    currentDiscount = orderTotal * 0.10; // 10% off
    msg.textContent = '✓ 10% Discount Applied!';
    msg.style.color = '#10b981';
  } else if(code === 'OFFER20') {
    currentDiscount = orderTotal * 0.20; // 20% off
    msg.textContent = '✓ 20% Discount Applied!';
    msg.style.color = '#10b981';
  } else {
    currentDiscount = 0;
    msg.textContent = '× Invalid Coupon Code';
    msg.style.color = '#ef4444';
  }
  msg.style.display = 'block';
  updateCartUI();
}

// Submission Logic
function submitEnhancedOrder() {
  if(orderItems.length === 0) {
    alert("Please add items to your cart first.");
    return;
  }

  const name = document.getElementById('custName').value;
  const phone = document.getElementById('custPhone').value;
  const email = document.getElementById('custEmail').value;

  if(!name || !phone || !email) {
    alert("Please fill in your name, phone, and email.");
    return;
  }

  const orderID = 'LQ-' + Math.floor(1000 + Math.random() * 9000);
  lastOrderID = orderID;

  // Final Calculations
  const tax = orderTotal * 0.05;
  const deliveryFee = currentService === 'delivery' ? 40 : 0;
  const finalTotal = orderTotal + tax + deliveryFee - currentDiscount;

  const orderDetails = {
    orderID: orderID,
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    serviceType: currentService,
    address: document.getElementById('custAddress')?.value || 'N/A',
    deliveryTime: document.getElementById('deliveryTime')?.value || 'ASAP',
    subtotal: orderTotal,
    tax: tax.toFixed(2),
    deliveryCharge: deliveryFee,
    discount: currentDiscount.toFixed(2),
    finalTotal: finalTotal.toFixed(2),
    paymentMethod: document.getElementById('paymentMethod').value,
    notes: document.getElementById('orderNotes')?.value || '',
    items: orderItems.map(i => `${i.name} (x1)`).join(", "),
    timestamp: new Date().toLocaleString()
  };

  console.log("Submitting Enhanced Order:", orderDetails);
  
  // Custom script: Send to Sheets
  sendToSheets(orderDetails);

  // Show Confirmation
  closeCart();
  const modal = document.getElementById('orderConfirmModal');
  const displayID = document.getElementById('displayOrderID');
  if(modal && displayID) {
    displayID.textContent = '#' + orderID;
    modal.style.display = 'flex';
  }

  // Reset Cart
  orderItems = [];
  orderTotal = 0;
  currentDiscount = 0;
  updateCartUI();
}

function closeConfirmModal() {
  const modal = document.getElementById('orderConfirmModal');
  if(modal) modal.style.display = 'none';
}

function shareToWhatsApp() {
  const text = `*New Order from La Quench!* 🍽️\n` +
               `Order ID: ${lastOrderID}\n` +
               `Total Amount: ₹${document.getElementById('billTotal').textContent}\n` +
               `Items: ${orderItems.length} items ordered.\n` +
               `Thanks for choosing La Quench! Please leave a review here: [Review Link]`;
  
  window.open(`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(text)}`, '_blank');
}

/**
 * Unified function to send data to Google Sheets
 * Max compatibility with 'no-cors' mode
 */
const scriptURL = 'https://script.google.com/macros/s/AKfycbyVUwDwk0QqfP7csZ7AQ-LEhYELANoOrjhYixouXvnuOWlMMs8UrAVIflF7ava6_BrEcA/exec';

/**
 * Fetch Menu items from Google Sheets
 */
async function fetchMenu() {
  console.log("Fetching live menu from Sheets...");
  try {
    const response = await fetch(scriptURL);
    const data = await response.json();
    console.log("Menu data received:", data);
    
    if(data && data.length > 0 && !data.error) {
      renderMenu(data);
    } else {
      showMenuError("No items found in your Google Sheet. Please add some to the 'Menu' tab!");
    }
  } catch (err) {
    console.error("Error fetching live menu:", err);
    showMenuError("Could not connect to the live menu. Please check your Web App deployment.");
  }
}

function showMenuError(msg) {
  const loaders = document.querySelectorAll('.loading-text');
  loaders.forEach(l => {
    l.textContent = msg;
    l.style.color = 'var(--gold-light)';
  });
}

/**
 * Render Menu items into HTML
 */
function renderMenu(items) {
  const drinksGrid = document.querySelector('#cat-drinks .menu-grid');
  const dessertsGrid = document.querySelector('#cat-desserts .menu-grid');
  const foodGrid = document.querySelector('#cat-food .menu-grid');
  const featuredGrid = document.querySelector('.featured-grid');

  if(drinksGrid) drinksGrid.innerHTML = '';
  if(dessertsGrid) dessertsGrid.innerHTML = '';
  if(foodGrid) foodGrid.innerHTML = '';
  
  items.forEach(item => {
    // Determine the image/emoji block
    let imgBlock = `<div class="menu-card-emoji">${item.emoji || '🍽️'}</div>`;
    if(item.image && item.image.trim() !== "") {
        imgBlock = `<div class="menu-card-img-container">
                      <img src="${item.image}" alt="${item.name}" class="menu-card-img" onerror="this.parentElement.innerHTML='<div class=\'menu-card-emoji\'>${item.emoji || '🍽️'}</div>'">
                    </div>`;
    }

    const cardHTML = `
      <div class="menu-card reveal visible" data-cat="${item.category}" style="position:relative;">
        ${item.popular === 'yes' ? '<span class="popular-badge">🏆 Bestseller</span>' : ''}
        ${imgBlock}
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="menu-card-footer">
          <span class="menu-price">₹${item.price}</span>
          <button class="btn-cart" onclick="addToOrder('${item.name}', ${item.price})">+ Add to Cart</button>
        </div>
      </div>
    `;

    // Menu Page injection
    if(item.category && item.category.toLowerCase().includes('drink') && drinksGrid) {
      drinksGrid.innerHTML += cardHTML;
    } else if(item.category && item.category.toLowerCase().includes('dessert') && dessertsGrid) {
      dessertsGrid.innerHTML += cardHTML;
    } else if(item.category && item.category.toLowerCase().includes('food') && foodGrid) {
      foodGrid.innerHTML += cardHTML;
    }

    // Home Page (Index) injection for Bestsellers
    if(item.popular === 'yes' && featuredGrid) {
        // Map to Home page card style
        const featuredCardHTML = `
          <div class="item-card reveal visible">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" class="item-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
            <div class="item-img-ph" style="display:${item.image ? 'none' : 'flex'};height:200px;background:var(--cream-dark);align-items:center;justify-content:center;font-size:4rem;border-radius:12px 12px 0 0;">${item.emoji || '☕'}</div>
            <div class="item-body">
              <h3>${item.name}</h3>
              <p>${item.description}</p>
              <div class="item-footer">
                <span class="item-price">₹${item.price}</span>
                <button class="btn-add" onclick="addToOrder('${item.name}', ${item.price})">+ Add to Order</button>
              </div>
            </div>
          </div>
        `;
        if(featuredGrid.querySelector('.loading-text')) featuredGrid.innerHTML = '';
        featuredGrid.innerHTML += featuredCardHTML;
    }
  });
}

// Initial Fetch on Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the menu page or index page
    if(document.querySelector('.menu-grid') || document.querySelector('.featured-grid')) {
        fetchMenu();
    }
});

/**
 * Unified function to send data to Google Sheets
 * Max compatibility with 'no-cors' mode
 */
function sendToSheets(data) {
  const formData = new URLSearchParams();
  for (const key in data) {
    formData.append(key, data[key]);
  }

  console.log("Dispatching Order to Google Sheets:", data);

  fetch(scriptURL, {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  })
  .then(() => console.log("Success: Order dispatched to Google Sheets."))
  .catch(err => console.error("Error sending to Sheets:", err));
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
  const date = document.getElementById('res-date')?.value;
  const time = document.getElementById('res-time')?.value;
  const guests = document.getElementById('res-guests')?.value;
  const occasion = document.getElementById('res-occasion')?.value;
  const requests = document.getElementById('res-requests')?.value;

  if (!name || !phone || !date || !time || !guests) {
    alert('Please fill in required fields.');
    return;
  }

  // Send to Google Sheets
  sendToSheets({
    type: 'Reservation',
    name: name,
    phone: phone,
    date: date,
    time: time,
    guests: guests,
    occasion: occasion || 'N/A',
    requests: requests || 'None',
    submittedAt: new Date().toLocaleString()
  });

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
const path = window.location.pathname;
const currentPage = path.split('/').pop() || 'index.html';

document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  // Handle both "index.html" and root "/" cases
  if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
  }
});
