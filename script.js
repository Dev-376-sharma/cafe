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

/* ── Add to Order / Cart ── */
let orderCount = 0;
const orderItems = [];

function addToOrder(name, price) {
  orderCount++;
  orderItems.push({ name, price });

  const toast = document.getElementById('orderToast');
  const toastMsg = document.getElementById('toastMsg');

  if (toast && toastMsg) {
    toastMsg.textContent = `${name} added! (${orderCount} item${orderCount > 1 ? 's' : ''})`;
    toast.style.display = 'flex';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 2800);
  }
}

/* ── Reservation form submission ── */
function submitReservation(e) {
  e.preventDefault();

  const name = document.getElementById('res-name')?.value;
  const phone = document.getElementById('res-phone')?.value;
  const date = document.getElementById('res-date')?.value;
  const time = document.getElementById('res-time')?.value;
  const guests = document.getElementById('res-guests')?.value;

  if (!name || !phone || !date || !time || !guests) {
    alert('Please fill in all required fields.');
    return;
  }

  // Simulate submission — show success modal
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  // Reset form
  document.getElementById('reservationForm')?.reset();
}

function closeModal() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// Close modal on backdrop click
document.getElementById('successModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

/* ── Set min date to today on reservation form ── */
const dateInput = document.getElementById('res-date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Active nav link highlighting ── */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
  }
});
