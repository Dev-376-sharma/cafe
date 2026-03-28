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
    
    // Send to Google Sheets using our new unified function
    sendToSheets(orderDetails);

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
  const featuredGrid = document.querySelector('.featured-grid');

  if(drinksGrid) drinksGrid.innerHTML = '';
  if(dessertsGrid) dessertsGrid.innerHTML = '';
  
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
