import confetti from 'canvas-confetti';
import { dbManager, DEFAULT_SERVICES, DEFAULT_PRODUCTS, DEFAULT_SETTINGS } from './supabase.js';

// State
let allServices = [];
let allProducts = [];
let allBookings = [];
let shopSettings = { ...DEFAULT_SETTINGS };
let currentServiceFilter = 'all';
let currentProductFilter = 'all';
let adminCurrentTab = 'dashboard';
let bookingStatusFilter = 'all';
let bookingSearchQuery = '';
let isAdminAuthenticated = false;

// DOM Elements
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Escape HTML utility
const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Toast notification
function showToast(message, icon = '✓') {
  const toast = $('#toastMessage');
  const iconEl = $('#toastIcon');
  const textEl = $('#toastText');
  if (!toast) return;

  iconEl.textContent = icon;
  textEl.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// -----------------------------------------------------------------------------
// INITIALIZATION
// -----------------------------------------------------------------------------
async function initApp() {
  // Set copyright year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Set booking date min to today
  const bookDateInput = $('#bookDate');
  if (bookDateInput) {
    const today = new Date().toISOString().slice(0, 10);
    bookDateInput.min = today;
    bookDateInput.value = today;
  }

  // Load data from BackendManager
  await loadShopSettings();
  await loadServices();
  await loadProducts();
  await loadBookings();

  // Update Supabase connection badge in Admin
  updateSupabaseIndicator();

  // Setup Event Listeners
  setupEventListeners();

  // Subscribe to realtime changes
  dbManager.onBookingsChange(async () => {
    await loadBookings();
    if ($('#adminModal').style.display === 'block') {
      renderAdminContent();
    }
  });
}

// -----------------------------------------------------------------------------
// LOADERS
// -----------------------------------------------------------------------------
async function loadShopSettings() {
  shopSettings = await dbManager.getSettings();
  renderShopSettingsUI();
}

function renderShopSettingsUI() {
  const s = shopSettings;
  // Top ticker
  const tickerText = $('#tickerText');
  const topTicker = $('#topTicker');
  if (tickerText && s.banner_message) {
    tickerText.textContent = s.banner_message;
    topTicker.style.display = 'flex';
  } else if (topTicker) {
    topTicker.style.display = 'none';
  }

  // Emergency link & phone numbers
  const emTel = `tel:+91${(s.phone_emergency || '9673681767').replace(/\D/g, '').slice(-10)}`;
  const waTel = `https://wa.me/91${(s.phone_whatsapp || '9673681767').replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent('Hello Ajay Electricals, I need electrical sales / service assistance')}`;

  if ($('#tickerCallLink')) {
    $('#tickerCallLink').href = emTel;
  }
  const tickerPhoneSpan = $('#tickerPhoneSpan');
  if (tickerPhoneSpan) {
    tickerPhoneSpan.textContent = `+91 ${s.phone_emergency}`;
  }

  if ($('#heroEmergencyBtn')) $('#heroEmergencyBtn').href = emTel;
  if ($('#fabCallBtn')) $('#fabCallBtn').href = emTel;
  if ($('#fabWaBtn')) $('#fabWaBtn').href = waTel;

  // Contact section
  if ($('#contactAddressText')) $('#contactAddressText').textContent = s.address;
  if ($('#contactHoursText')) $('#contactHoursText').textContent = s.hours;
  if ($('#contactWaNum')) $('#contactWaNum').textContent = `+91 ${s.phone_whatsapp}`;
  if ($('#contactAltNum')) $('#contactAltNum').textContent = `+91 ${s.phone_alt}`;
  if ($('#contactUpiText')) $('#contactUpiText').textContent = s.upi_id;
  if ($('#contactWaBtn')) $('#contactWaBtn').href = waTel;
  if ($('#googleMapsBtn')) {
    $('#googleMapsBtn').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`;
  }

  // Instagram Links & Handles
  const igUrl = s.instagram_url || 'https://instagram.com/ajay_electricals';
  const igHandle = s.instagram_handle || '@ajay_electricals';
  if ($('#instagramBannerLink')) $('#instagramBannerLink').href = igUrl;
  if ($('#igHandleText')) $('#igHandleText').textContent = igHandle;
  if ($('#footerInstagramBtn')) $('#footerInstagramBtn').href = igUrl;
  if ($('#footerIgHandle')) $('#footerIgHandle').textContent = igHandle;
  if ($('#footerIgCircle')) $('#footerIgCircle').href = igUrl;
  if ($('#footerWaCircle')) $('#footerWaCircle').href = waTel;
  if ($('#footerCallCircle')) $('#footerCallCircle').href = emTel;
  if ($('#footerMapsCircle')) $('#footerMapsCircle').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`;

  // Brand Name
  if ($('#navShopName')) $('#navShopName').textContent = s.shop_name;
  if ($('#footerShopName')) $('#footerShopName').textContent = s.shop_name;
}

// PREMIUM VECTOR SVG ICONS FOR SERVICES
const SERVICE_SVGS = {
  'svc-fan': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3.5" fill="rgba(234, 88, 12, 0.2)"></circle>
    <path d="M12 8.5C12 4.5 15 2 17.5 2C19.5 2 20 4 17.5 6.5C15 9 12 8.5 12 8.5Z"></path>
    <path d="M15.5 12C19.5 12 22 15 22 17.5C22 19.5 20 20 17.5 17.5C15 15 15.5 12 15.5 12Z"></path>
    <path d="M12 15.5C12 19.5 9 22 6.5 22C4.5 22 4 20 6.5 17.5C9 15 12 15.5 12 15.5Z"></path>
    <path d="M8.5 12C4.5 12 2 9 2 6.5C2 4.5 4 4 6.5 6.5C9 9 8.5 12 8.5 12Z"></path>
  </svg>`,
  'svc-mixer': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 3h12l-1.5 10H7.5L6 3z" fill="rgba(234, 88, 12, 0.15)"></path>
    <path d="M18 6h2.5a1.5 1.5 0 0 1 1.5 1.5v2.5a1.5 1.5 0 0 1-1.5 1.5H16.5"></path>
    <path d="M6.5 13h11v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-7z"></path>
    <circle cx="12" cy="17.5" r="1.5" fill="currentColor"></circle>
    <line x1="8" y1="3" x2="16" y2="3"></line>
  </svg>`,
  'svc-geyser': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="5" y="3" width="14" height="18" rx="6" fill="rgba(234, 88, 12, 0.15)"></rect>
    <path d="M12 7v5"></path>
    <circle cx="12" cy="15" r="2.5" fill="currentColor"></circle>
    <path d="M9 21v1.5"></path>
    <path d="M15 21v1.5"></path>
    <path d="M2.5 10c.8-.8 1.8-.8 2.5 0s1.8.8 2.5 0"></path>
  </svg>`,
  'svc-wiring': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 2v4"></path>
    <path d="M15 2v4"></path>
    <rect x="6" y="6" width="12" height="7" rx="3.5" fill="rgba(234, 88, 12, 0.15)"></rect>
    <path d="M12 13v3a4 4 0 0 1-4 4H5"></path>
    <path d="M17.5 17l3.5-3.5-3-3"></path>
  </svg>`,
  'svc-install': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="rgba(234, 88, 12, 0.15)"></path>
  </svg>`,
  'svc-society': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 21h18"></path>
    <path d="M5 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16" fill="rgba(234, 88, 12, 0.15)"></path>
    <path d="M14 10h4a2 2 0 0 1 2 2v9"></path>
    <circle cx="8.5" cy="7.5" r="1" fill="currentColor"></circle>
    <circle cx="8.5" cy="11.5" r="1" fill="currentColor"></circle>
    <circle cx="8.5" cy="15.5" r="1" fill="currentColor"></circle>
    <circle cx="17" cy="14" r="1" fill="currentColor"></circle>
    <circle cx="17" cy="17.5" r="1" fill="currentColor"></circle>
  </svg>`,
  'svc-cctv': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 8.5l6-3.5v14l-6-3.5"></path>
    <rect x="2" y="6" width="13" height="12" rx="3" fill="rgba(234, 88, 12, 0.15)"></rect>
    <circle cx="8.5" cy="12" r="3" fill="currentColor"></circle>
    <circle cx="8.5" cy="12" r="1.2" fill="#ffffff"></circle>
  </svg>`,
  'svc-dishtv': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 10a10 10 0 0 1 14 0"></path>
    <path d="M7 13a6 6 0 0 1 8 0"></path>
    <circle cx="12" cy="19" r="2.5" fill="rgba(234, 88, 12, 0.2)"></circle>
    <path d="M12 16.5V4"></path>
    <circle cx="12" cy="4" r="2" fill="currentColor"></circle>
  </svg>`
};

function getServiceIconSvg(svc) {
  if (svc.id && SERVICE_SVGS[svc.id]) {
    return SERVICE_SVGS[svc.id];
  }
  if (svc.category === 'repair') return SERVICE_SVGS['svc-fan'];
  if (svc.category === 'wiring') return SERVICE_SVGS['svc-wiring'];
  if (svc.category === 'installation') return SERVICE_SVGS['svc-install'];
  if (svc.category === 'security') return SERVICE_SVGS['svc-cctv'];
  if (svc.category === 'maintenance') return SERVICE_SVGS['svc-society'];

  return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(234, 88, 12, 0.2)"></polygon>
  </svg>`;
}

async function loadServices() {
  allServices = await dbManager.getServices();
  renderServicesGrid();
  populateBookingServiceDropdown();
}

function renderServicesGrid() {
  const container = $('#servicesGridContainer');
  if (!container) return;

  const filtered = currentServiceFilter === 'all'
    ? allServices
    : allServices.filter(s => s.category === currentServiceFilter);

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No services found in this category.</div>`;
    return;
  }

  container.innerHTML = filtered.map(svc => `
    <div class="service-card">
      <div class="service-icon-box" title="${escapeHtml(svc.title)}">
        ${getServiceIconSvg(svc)}
      </div>
      <h3>${escapeHtml(svc.title)}</h3>
      <p>${escapeHtml(svc.desc || svc.description || '')}</p>
      <div class="service-card-footer">
        <span class="service-price">${escapeHtml(svc.price)}</span>
        <button class="btn btn-outline btn-sm book-this-svc-btn" data-title="${escapeHtml(svc.title)}">
          Book Service →
        </button>
      </div>
    </div>
  `).join('');

  // Attach quick-book listeners
  container.querySelectorAll('.book-this-svc-btn').forEach(btn => {
    btn.onclick = () => {
      const svcTitle = btn.dataset.title;
      selectServiceAndScrollToBook(svcTitle);
    };
  });
}

function populateBookingServiceDropdown() {
  const select = $('#bookService');
  if (!select) return;

  select.innerHTML = allServices.map(s => `
    <option value="${escapeHtml(s.title)}">${escapeHtml(s.title)} (${escapeHtml(s.price)})</option>
  `).join('');
}

function selectServiceAndScrollToBook(serviceTitle) {
  const select = $('#bookService');
  if (select) {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value === serviceTitle) {
        select.selectedIndex = i;
        break;
      }
    }
  }
  const bookSection = $('#book');
  if (bookSection) {
    bookSection.scrollIntoView({ behavior: 'smooth' });
  }
}

async function loadProducts() {
  allProducts = await dbManager.getProducts();
  renderProductsGrid();
}

function renderProductsGrid() {
  const container = $('#productsGridContainer');
  if (!container) return;

  const filtered = currentProductFilter === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === currentProductFilter);

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No products found in this category.</div>`;
    return;
  }

  container.innerHTML = filtered.map(prod => {
    const waText = encodeURIComponent(`Hi Ajay Electricals, I am interested in purchasing: ${prod.title} (${prod.brand}) for ₹${prod.price}. Is it in stock?`);
    const waUrl = `https://wa.me/91${(shopSettings.phone_whatsapp || '9673681767').replace(/\D/g, '').slice(-10)}?text=${waText}`;

    return `
      <div class="product-card">
        ${prod.badge ? `<span class="product-badge">${escapeHtml(prod.badge)}</span>` : ''}
        <span class="product-brand">${escapeHtml(prod.brand)}</span>
        <h3>${escapeHtml(prod.title)}</h3>
        <p>${escapeHtml(prod.description || '')}</p>
        <div class="product-pricing">
          <span class="product-price">₹${prod.price}</span>
          ${prod.mrp ? `<span class="product-mrp">₹${prod.mrp}</span>` : ''}
          ${prod.mrp && prod.mrp > prod.price ? `<span class="product-save">Save ₹${prod.mrp - prod.price}</span>` : ''}
        </div>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 14px;">
          ✓ ${escapeHtml(prod.warranty || 'Manufacturer Warranty')} · In Stock
        </div>
        <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="width: 100%; margin-top: auto;">
          🛒 Enquire / Buy on WhatsApp
        </a>
      </div>
    `;
  }).join('');
}

async function loadBookings() {
  allBookings = await dbManager.getBookings();
  const countEl = $('#tabBookingCount');
  if (countEl) countEl.textContent = allBookings.length;
}

// -----------------------------------------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------------------------------------
function setupEventListeners() {
  // Mobile navigation toggle
  const mobileMenuBtn = $('#mobileMenuBtn');
  const navLinksWrap = $('#navLinksWrap');
  if (mobileMenuBtn && navLinksWrap) {
    mobileMenuBtn.onclick = () => {
      const isOpen = navLinksWrap.classList.toggle('open');
      mobileMenuBtn.classList.toggle('open', isOpen);
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    };
    // Close menu when a nav link is clicked
    navLinksWrap.querySelectorAll('a.nav-link, a.btn').forEach(link => {
      link.addEventListener('click', () => {
        navLinksWrap.classList.remove('open');
        mobileMenuBtn.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
      if (!navLinksWrap.classList.contains('open')) return;
      if (navLinksWrap.contains(e.target) || mobileMenuBtn.contains(e.target)) return;
      navLinksWrap.classList.remove('open');
      mobileMenuBtn.classList.remove('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    });
  }

  // Service filter pills
  $$('#serviceFilterTabs .filter-chip').forEach(btn => {
    btn.onclick = () => {
      $$('#serviceFilterTabs .filter-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentServiceFilter = btn.dataset.filter;
      renderServicesGrid();
    };
  });

  // Product filter pills
  $$('#productFilterTabs .filter-chip').forEach(btn => {
    btn.onclick = () => {
      $$('#productFilterTabs .filter-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentProductFilter = btn.dataset.cat;
      renderProductsGrid();
    };
  });

  // Urgency radio buttons styling
  $$('.urgency-label').forEach(label => {
    label.onclick = () => {
      $$('.urgency-label').forEach(l => l.classList.remove('active'));
      label.classList.add('active');
      const radio = label.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    };
  });

  // Service Booking Form submit
  const bookingForm = $('#bookingForm');
  if (bookingForm) {
    bookingForm.onsubmit = handleBookingSubmit;
  }

  // Booking Tracking Form submit
  const trackForm = $('#trackForm');
  if (trackForm) {
    trackForm.onsubmit = handleTrackSubmit;
  }

  // Admin access button & modals
  const openAdminBtn = $('#openAdminBtn');
  const footerAdminLink = $('#footerAdminLink');
  const closeAdminBtn = $('#closeAdminBtn');
  const adminLoginModal = $('#adminLoginModal');
  const cancelLoginBtn = $('#cancelLoginBtn');
  const adminLoginForm = $('#adminLoginForm');
  const adminLogoutBtn = $('#adminLogoutBtn');
  const togglePasswordBtn = $('#togglePasswordBtn');
  const adminLoginAlert = $('#adminLoginAlert');

  const triggerAdminModal = () => {
    const user = dbManager.getCurrentUser();
    if (isAdminAuthenticated || user) {
      isAdminAuthenticated = true;
      openAdminPanel();
    } else {
      adminLoginModal.style.display = 'block';
      if (adminLoginAlert) adminLoginAlert.style.display = 'none';
      const idInput = $('#adminLoginIdInput');
      if (idInput) {
        idInput.focus();
      }
    }
  };

  if (openAdminBtn) openAdminBtn.onclick = triggerAdminModal;
  if (footerAdminLink) footerAdminLink.onclick = triggerAdminModal;
  if (closeAdminBtn) closeAdminBtn.onclick = () => { $('#adminModal').style.display = 'none'; };
  if (cancelLoginBtn) cancelLoginBtn.onclick = () => { adminLoginModal.style.display = 'none'; };

  if (adminLogoutBtn) {
    adminLogoutBtn.onclick = async () => {
      await dbManager.signOut();
      isAdminAuthenticated = false;
      $('#adminModal').style.display = 'none';
      showToast('Admin logged out successfully', '👋');
    };
  }

  if (togglePasswordBtn) {
    togglePasswordBtn.onclick = () => {
      const passInput = $('#adminPasswordInput');
      if (!passInput) return;
      if (passInput.type === 'password') {
        passInput.type = 'text';
        togglePasswordBtn.textContent = '🙈 Hide';
      } else {
        passInput.type = 'password';
        togglePasswordBtn.textContent = '👁️ Show';
      }
    };
  }

  if (adminLoginForm) {
    adminLoginForm.onsubmit = async (e) => {
      e.preventDefault();
      const loginId = $('#adminLoginIdInput').value.trim();
      const password = $('#adminPasswordInput').value.trim();
      const submitBtn = $('#adminLoginSubmitBtn');
      const originalText = submitBtn ? submitBtn.textContent : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying...';
      }
      if (adminLoginAlert) {
        adminLoginAlert.style.display = 'none';
      }

      try {
        const result = await dbManager.signIn(loginId, password);
        if (result.success) {
          isAdminAuthenticated = true;
          adminLoginModal.style.display = 'none';
          openAdminPanel();
          showToast(result.message || 'Admin access verified!', '🔓');
        } else {
          if (adminLoginAlert) {
            adminLoginAlert.textContent = result.message || 'Invalid login credentials.';
            adminLoginAlert.style.display = 'block';
          } else {
            alert(result.message || 'Invalid login credentials.');
          }
        }
      } catch (err) {
        if (adminLoginAlert) {
          adminLoginAlert.textContent = 'Login error: ' + (err.message || 'Please try again.');
          adminLoginAlert.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    };
  }

  // Admin Navigation Tabs
  $$('#adminTabsBar .admin-tab-btn').forEach(btn => {
    btn.onclick = () => {
      $$('#adminTabsBar .admin-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      adminCurrentTab = btn.dataset.tab;
      renderAdminContent();
    };
  });

  // Admin Refresh Button
  const refreshBtn = $('#refreshDataBtn');
  if (refreshBtn) {
    refreshBtn.onclick = async () => {
      refreshBtn.textContent = 'Refreshing...';
      await loadBookings();
      await loadServices();
      await loadProducts();
      await loadShopSettings();
      updateSupabaseIndicator();
      renderAdminContent();
      refreshBtn.textContent = '🔄 Refresh';
      showToast('Data refreshed');
    };
  }
}

// -----------------------------------------------------------------------------
// BOOKING SUBMIT HANDLER
// -----------------------------------------------------------------------------
async function handleBookingSubmit(e) {
  e.preventDefault();
  const submitBtn = $('#submitBookingBtn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Processing booking...</span>';

  const name = $('#bookName').value.trim();
  const phone = $('#bookPhone').value.trim();
  const service = $('#bookService').value;
  const address = $('#bookAddress').value.trim();
  const date = $('#bookDate').value;
  const slot = $('#bookSlot').value;
  const problem = $('#bookProblem').value.trim();
  const urgencyRadio = document.querySelector('input[name="urgency"]:checked');
  const urgency = urgencyRadio ? urgencyRadio.value : 'Standard';

  try {
    const res = await dbManager.createBooking({
      name,
      phone,
      service,
      address,
      date,
      slot,
      urgency,
      problem
    });

    if (res.success && res.booking) {
      // Fire celebration confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Confetti non-critical
      }

      const alertBox = $('#bookingConfirmationAlert');
      const waConfirmationText = encodeURIComponent(`Hello Ajay Electricals, I booked service ${res.booking.service_name} with Booking ID ${res.booking.booking_code}. My address is: ${res.booking.address}. Please confirm.`);
      const waUrl = `https://wa.me/91${(shopSettings.phone_whatsapp || '9673681767').replace(/\D/g, '').slice(-10)}?text=${waConfirmationText}`;

      alertBox.innerHTML = `
        <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 14px; padding: 20px; color: #166534;">
          <h4 style="margin: 0 0 8px; font-size: 1.15rem; color: #15803d; display: flex; align-items: center; gap: 8px;">
            🎉 Booking Confirmed! Your ID: <span style="font-family: monospace; background: #bbf7d0; padding: 2px 8px; border-radius: 6px;">${res.booking.booking_code}</span>
          </h4>
          <p style="margin: 0 0 14px; font-size: 0.9rem;">
            Thank you, <b>${escapeHtml(res.booking.customer_name)}</b>! Our electrician will visit on <b>${escapeHtml(res.booking.preferred_date)}</b> during <b>${escapeHtml(res.booking.preferred_slot)}</b>.
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="${waUrl}" target="_blank" class="btn btn-emerald btn-sm">💬 Send to WhatsApp for Instant Confirmation</a>
            <button class="btn btn-secondary btn-sm" onclick="quickTestTrack('${res.booking.booking_code}', '${res.booking.customer_phone}')">🔍 Track This Booking Now</button>
          </div>
        </div>
      `;
      alertBox.style.display = 'block';

      // Reset form
      $('#bookingForm').reset();
      const today = new Date().toISOString().slice(0, 10);
      $('#bookDate').value = today;
      showToast('Booking submitted successfully!', '🎉');
      await loadBookings();
    }
  } catch (err) {
    alert('Could not submit booking: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>⚡ Confirm Service Booking</span>';
  }
}

// -----------------------------------------------------------------------------
// TRACKING SUBMIT HANDLER
// -----------------------------------------------------------------------------
async function handleTrackSubmit(e) {
  if (e) e.preventDefault();
  const code = $('#trackCode').value.trim();
  const phone = $('#trackPhone').value.trim();
  performTracking(code, phone);
}

window.quickTestTrack = function (code, phone) {
  $('#trackCode').value = code;
  $('#trackPhone').value = phone;
  $('#track').scrollIntoView({ behavior: 'smooth' });
  performTracking(code, phone);
};

async function performTracking(code, phone) {
  const resultBox = $('#trackResultBox');
  if (!code || !phone) {
    alert('Please enter both Booking ID and registered phone number.');
    return;
  }

  const res = await dbManager.trackBooking(code, phone);
  if (!res.success) {
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; color: #991b1b;">
        <b>❌ Booking Not Found</b>
        <p style="margin: 4px 0 0; font-size: 0.88rem;">${escapeHtml(res.message)}</p>
      </div>
    `;
    return;
  }

  const b = res.booking;
  resultBox.style.display = 'block';

  // Title and Code
  $('#trackServiceTitle').textContent = b.service_name;
  $('#trackBookingCode').textContent = `ID: ${b.booking_code} · Urgency: ${b.urgency || 'Standard'}`;

  // Status Badge
  const badge = $('#trackStatusBadge');
  badge.className = `status-badge ${b.status.replace(/\s+/g, '-')}`;
  badge.textContent = b.status;

  // Timeline progress steps
  const steps = ['stepPlaced', 'stepConfirmed', 'stepProgress', 'stepCompleted'];
  steps.forEach(id => {
    const el = $(`#${id}`);
    if (el) el.className = 'timeline-step';
  });

  if (b.status === 'Pending') {
    $('#stepPlaced').className = 'timeline-step current';
  } else if (b.status === 'Confirmed') {
    $('#stepPlaced').className = 'timeline-step completed';
    $('#stepConfirmed').className = 'timeline-step current';
  } else if (b.status === 'In progress') {
    $('#stepPlaced').className = 'timeline-step completed';
    $('#stepConfirmed').className = 'timeline-step completed';
    $('#stepProgress').className = 'timeline-step current';
  } else if (b.status === 'Completed') {
    $('#stepPlaced').className = 'timeline-step completed';
    $('#stepConfirmed').className = 'timeline-step completed';
    $('#stepProgress').className = 'timeline-step completed';
    $('#stepCompleted').className = 'timeline-step completed';
  } else if (b.status === 'Cancelled') {
    $('#stepPlaced').className = 'timeline-step completed';
  }

  // Details
  $('#trackDetailsContent').innerHTML = `
    <div><b>Customer:</b> ${escapeHtml(b.customer_name)} (${escapeHtml(b.customer_phone)})</div>
    <div><b>Scheduled Date:</b> ${escapeHtml(b.preferred_date)} · ${escapeHtml(b.preferred_slot)}</div>
    <div><b>Doorstep Address:</b> ${escapeHtml(b.address)}</div>
    ${b.assigned_technician ? `<div><b>Assigned Electrician:</b> 👷 ${escapeHtml(b.assigned_technician)}</div>` : ''}
    ${b.admin_notes ? `<div><b>Shop Status Note:</b> 📝 ${escapeHtml(b.admin_notes)}</div>` : ''}
    ${b.problem_details ? `<div><b>Issue Reported:</b> ${escapeHtml(b.problem_details)}</div>` : ''}
  `;

  // Direct action links
  const waHelpText = encodeURIComponent(`Hi Ajay Electricals, I am checking the status of my booking ID: ${b.booking_code} (${b.service_name}).`);
  $('#trackDirectWaBtn').href = `https://wa.me/91${(shopSettings.phone_whatsapp || '9673681767').replace(/\D/g, '').slice(-10)}?text=${waHelpText}`;
  $('#trackDirectCallBtn').href = `tel:+91${(shopSettings.phone_emergency || '9673681767').replace(/\D/g, '').slice(-10)}`;
}

// -----------------------------------------------------------------------------
// ADMIN PANEL ENGINE
// -----------------------------------------------------------------------------
function openAdminPanel() {
  $('#adminModal').style.display = 'block';
  updateSupabaseIndicator();
  updateAdminUserBadge();
  renderAdminContent();
}

function updateAdminUserBadge() {
  const user = dbManager.getCurrentUser();
  const text = $('#adminUserEmailText');
  const badge = $('#adminUserBadge');
  if (!text) return;
  if (user) {
    text.textContent = user.email || user.username || 'Admin';
    if (badge) badge.title = `Logged in via ${user.type === 'supabase' ? 'Supabase Auth' : 'Local Admin'}`;
  } else {
    text.textContent = 'Admin';
  }
}

function updateSupabaseIndicator() {
  const cfg = dbManager.getSupabaseConfig();
  const indicator = $('#supabaseIndicator');
  const text = $('#supabaseIndicatorText');
  if (!indicator || !text) return;

  if (cfg.isConnected) {
    indicator.className = 'supabase-live-indicator live';
    text.textContent = 'Supabase Cloud Live 🟢';
  } else {
    indicator.className = 'supabase-live-indicator local';
    text.textContent = 'Local DB Mode (Ready for Supabase)';
  }
}

function renderAdminContent() {
  const container = $('#adminContentBody');
  if (!container) return;

  if (adminCurrentTab === 'dashboard') {
    renderAdminDashboard(container);
  } else if (adminCurrentTab === 'bookings') {
    renderAdminBookings(container);
  } else if (adminCurrentTab === 'services') {
    renderAdminServices(container);
  } else if (adminCurrentTab === 'products') {
    renderAdminProducts(container);
  } else if (adminCurrentTab === 'supabase') {
    renderAdminSupabaseSettings(container);
  }
}

// 1. ADMIN DASHBOARD OVERVIEW
function renderAdminDashboard(container) {
  const total = allBookings.length;
  const count = (st) => allBookings.filter(b => b.status === st).length;
  const pending = count('Pending');
  const confirmed = count('Confirmed');
  const inProgress = count('In progress');
  const completed = count('Completed');
  const cancelled = count('Cancelled');

  const estRevenue = allBookings
    .filter(b => b.status === 'Completed')
    .reduce((acc, b) => acc + (Number(b.estimated_cost) || 0), 0);

  container.innerHTML = `
    <!-- METRICS CARDS -->
    <div class="admin-stats-grid">
      <div class="admin-stat-card total">
        <span class="stat-label">Total Bookings</span>
        <div class="stat-number">${total}</div>
        <div class="stat-sub">Lifetime received</div>
      </div>
      <div class="admin-stat-card pending">
        <span class="stat-label">Pending</span>
        <div class="stat-number" style="color: #d97706;">${pending}</div>
        <div class="stat-sub">Needs attention</div>
      </div>
      <div class="admin-stat-card confirmed">
        <span class="stat-label">Confirmed</span>
        <div class="stat-number" style="color: #2563eb;">${confirmed}</div>
        <div class="stat-sub">Visit scheduled</div>
      </div>
      <div class="admin-stat-card inprogress">
        <span class="stat-label">In Progress</span>
        <div class="stat-number" style="color: #7c3aed;">${inProgress}</div>
        <div class="stat-sub">Technician on site</div>
      </div>
      <div class="admin-stat-card completed">
        <span class="stat-label">Completed</span>
        <div class="stat-number" style="color: #10b981;">${completed}</div>
        <div class="stat-sub">Successfully serviced</div>
      </div>
      <div class="admin-stat-card">
        <span class="stat-label">Completed Value</span>
        <div class="stat-number" style="color: #0f172a;">₹${estRevenue}</div>
        <div class="stat-sub">${cancelled} Cancelled</div>
      </div>
    </div>

    <!-- QUICK ACTIONS & RECENT BOOKINGS -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h4 style="margin: 0; font-size: 1.1rem;">Recent Booking Requests</h4>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-primary btn-sm" id="dashViewAllBookingsBtn">View All Bookings & Update Status →</button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Service</th>
            <th>When</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${allBookings.slice(0, 5).map(b => `
            <tr>
              <td><b style="font-family: monospace;">${escapeHtml(b.booking_code)}</b></td>
              <td>
                <b>${escapeHtml(b.customer_name)}</b><br />
                <a href="tel:+91${escapeHtml(b.customer_phone)}" style="color: var(--pri);">📞 ${escapeHtml(b.customer_phone)}</a><br />
                <span style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(b.address)}</span>
              </td>
              <td>
                <b>${escapeHtml(b.service_name)}</b>
                ${b.problem_details ? `<br /><span style="font-size: 0.76rem; color: #475569;">"${escapeHtml(b.problem_details)}"</span>` : ''}
              </td>
              <td>
                ${escapeHtml(b.preferred_date)}<br />
                <span style="font-size: 0.76rem; color: var(--text-muted);">${escapeHtml(b.preferred_slot)}</span>
              </td>
              <td>
                <span class="status-badge ${b.status.replace(/\s+/g, '-')}">${escapeHtml(b.status)}</span>
              </td>
              <td>
                <select class="form-control" style="padding: 4px 8px; font-size: 0.8rem; width: auto;" data-quick-status="${escapeHtml(b.booking_code)}">
                  ${['Pending', 'Confirmed', 'In progress', 'Completed', 'Cancelled'].map(s => `
                    <option value="${s}" ${b.status === s ? 'selected' : ''}>${s}</option>
                  `).join('')}
                </select>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Quick actions
  const viewAllBtn = $('#dashViewAllBookingsBtn');
  if (viewAllBtn) {
    viewAllBtn.onclick = () => {
      $$('#adminTabsBar .admin-tab-btn').forEach(b => b.classList.remove('active'));
      const bookingsTabBtn = document.querySelector('[data-tab="bookings"]');
      if (bookingsTabBtn) bookingsTabBtn.classList.add('active');
      adminCurrentTab = 'bookings';
      renderAdminContent();
    };
  }

  // Quick status updates
  container.querySelectorAll('[data-quick-status]').forEach(sel => {
    sel.onchange = async () => {
      const code = sel.dataset.quickStatus;
      const newStatus = sel.value;
      await dbManager.updateBookingStatus(code, newStatus);
      showToast(`Updated ${code} to ${newStatus}`);
      await loadBookings();
      renderAdminContent();
    };
  });
}

// 2. ADMIN BOOKINGS TABLE TAB
function renderAdminBookings(container) {
  let list = [...allBookings];

  // Filter by status
  if (bookingStatusFilter !== 'all') {
    list = list.filter(b => b.status === bookingStatusFilter);
  }

  // Search filter
  if (bookingSearchQuery) {
    const q = bookingSearchQuery.toLowerCase();
    list = list.filter(b =>
      b.booking_code.toLowerCase().includes(q) ||
      b.customer_name.toLowerCase().includes(q) ||
      b.customer_phone.includes(q) ||
      b.service_name.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q)
    );
  }

  container.innerHTML = `
    <div class="table-filter-bar">
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <input type="text" id="adminBookingSearch" class="table-search-input" placeholder="Search by ID, customer name, phone, address..." value="${escapeHtml(bookingSearchQuery)}" />
        <select id="adminStatusFilterSelect" class="form-control" style="width: auto; padding: 8px 12px; font-size: 0.88rem;">
          <option value="all" ${bookingStatusFilter === 'all' ? 'selected' : ''}>All Statuses (${allBookings.length})</option>
          <option value="Pending" ${bookingStatusFilter === 'Pending' ? 'selected' : ''}>Pending (${allBookings.filter(b => b.status === 'Pending').length})</option>
          <option value="Confirmed" ${bookingStatusFilter === 'Confirmed' ? 'selected' : ''}>Confirmed (${allBookings.filter(b => b.status === 'Confirmed').length})</option>
          <option value="In progress" ${bookingStatusFilter === 'In progress' ? 'selected' : ''}>In Progress (${allBookings.filter(b => b.status === 'In progress').length})</option>
          <option value="Completed" ${bookingStatusFilter === 'Completed' ? 'selected' : ''}>Completed (${allBookings.filter(b => b.status === 'Completed').length})</option>
          <option value="Cancelled" ${bookingStatusFilter === 'Cancelled' ? 'selected' : ''}>Cancelled (${allBookings.filter(b => b.status === 'Cancelled').length})</option>
        </select>
      </div>

      <div style="display: flex; gap: 8px;">
        <button id="exportCsvBtn" class="btn btn-secondary btn-sm">📥 Export CSV</button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Customer &amp; Contact</th>
            <th>Service &amp; Problem</th>
            <th>Schedule</th>
            <th>Status</th>
            <th>Technician &amp; Cost</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.length === 0 ? `
            <tr>
              <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                No service bookings match the filter criteria.
              </td>
            </tr>
          ` : list.map(b => {
            const waCustomerMsg = encodeURIComponent(`Hello ${b.customer_name}, this is Ajay Electricals regarding your booking ID ${b.booking_code} for ${b.service_name}. Your booking status is currently: ${b.status}.`);
            const waLink = `https://wa.me/91${b.customer_phone.replace(/\D/g, '').slice(-10)}?text=${waCustomerMsg}`;

            return `
              <tr>
                <td>
                  <b style="font-family: monospace; font-size: 0.95rem; color: #0f172a;">${escapeHtml(b.booking_code)}</b>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">
                    ${b.created_at ? new Date(b.created_at).toLocaleDateString() : ''}
                  </div>
                </td>
                <td>
                  <b style="font-size: 0.95rem;">${escapeHtml(b.customer_name)}</b><br />
                  <a href="tel:+91${escapeHtml(b.customer_phone)}" style="color: var(--pri); font-weight: 600;">📞 ${escapeHtml(b.customer_phone)}</a><br />
                  <span style="font-size: 0.8rem; color: #475569;">📍 ${escapeHtml(b.address)}</span>
                </td>
                <td>
                  <b>${escapeHtml(b.service_name)}</b>
                  <span class="status-badge" style="font-size: 0.7rem; background: #e0f2fe; color: #0284c7; margin-left: 4px;">${escapeHtml(b.urgency || 'Standard')}</span>
                  ${b.problem_details ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; max-width: 260px;">"${escapeHtml(b.problem_details)}"</div>` : ''}
                </td>
                <td>
                  <b>${escapeHtml(b.preferred_date)}</b><br />
                  <span style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(b.preferred_slot)}</span>
                </td>
                <td>
                  <select class="form-control admin-booking-status-sel" data-code="${escapeHtml(b.booking_code)}" style="font-size: 0.82rem; padding: 6px; font-weight: 700;">
                    ${['Pending', 'Confirmed', 'In progress', 'Completed', 'Cancelled'].map(s => `
                      <option value="${s}" ${b.status === s ? 'selected' : ''}>${s}</option>
                    `).join('')}
                  </select>
                </td>
                <td>
                  <input type="text" class="form-control admin-tech-input" data-code="${escapeHtml(b.booking_code)}" placeholder="Technician" value="${escapeHtml(b.assigned_technician || '')}" style="font-size: 0.8rem; padding: 4px 8px; margin-bottom: 4px;" />
                  <input type="number" class="form-control admin-cost-input" data-code="${escapeHtml(b.booking_code)}" placeholder="Est Cost ₹" value="${b.estimated_cost || ''}" style="font-size: 0.8rem; padding: 4px 8px;" />
                </td>
                <td>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-emerald btn-sm" title="Chat with customer on WhatsApp">
                      💬 WhatsApp
                    </a>
                    <button class="btn btn-danger btn-sm admin-del-booking-btn" data-code="${escapeHtml(b.booking_code)}" title="Delete booking">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Search input event
  const searchInput = $('#adminBookingSearch');
  if (searchInput) {
    searchInput.oninput = (e) => {
      bookingSearchQuery = e.target.value;
      renderAdminBookings(container);
    };
  }

  // Filter select event
  const filterSelect = $('#adminStatusFilterSelect');
  if (filterSelect) {
    filterSelect.onchange = (e) => {
      bookingStatusFilter = e.target.value;
      renderAdminBookings(container);
    };
  }

  // Status changer event
  container.querySelectorAll('.admin-booking-status-sel').forEach(sel => {
    sel.onchange = async () => {
      const code = sel.dataset.code;
      const newStatus = sel.value;
      await dbManager.updateBookingStatus(code, newStatus);
      showToast(`Updated status for ${code}`);
      await loadBookings();
    };
  });

  // Technician / Cost update event
  container.querySelectorAll('.admin-tech-input').forEach(input => {
    input.onblur = async () => {
      const code = input.dataset.code;
      const tech = input.value.trim();
      await dbManager.updateBookingStatus(code, undefined, tech);
      showToast('Assigned technician saved');
    };
  });

  container.querySelectorAll('.admin-cost-input').forEach(input => {
    input.onblur = async () => {
      const code = input.dataset.code;
      const cost = Number(input.value) || 0;
      const current = await dbManager.getBookings();
      const match = current.find(b => b.booking_code === code);
      if (match) {
        match.estimated_cost = cost;
        await dbManager.updateBookingStatus(code, match.status, match.assigned_technician, match.admin_notes);
        showToast('Service cost updated');
      }
    };
  });

  // Delete booking
  container.querySelectorAll('.admin-del-booking-btn').forEach(btn => {
    btn.onclick = async () => {
      const code = btn.dataset.code;
      if (confirm(`Are you sure you want to delete booking ${code}?`)) {
        await dbManager.deleteBooking(code);
        showToast(`Deleted ${code}`);
        await loadBookings();
        renderAdminBookings(container);
      }
    };
  });

  // Export CSV
  const exportBtn = $('#exportCsvBtn');
  if (exportBtn) {
    exportBtn.onclick = () => {
      exportBookingsToCSV();
    };
  }
}

function exportBookingsToCSV() {
  const headers = ['BookingCode', 'CustomerName', 'Phone', 'Service', 'Address', 'Date', 'Slot', 'Urgency', 'Status', 'Cost', 'Technician'];
  const rows = allBookings.map(b => [
    b.booking_code,
    `"${(b.customer_name || '').replace(/"/g, '""')}"`,
    b.customer_phone,
    `"${(b.service_name || '').replace(/"/g, '""')}"`,
    `"${(b.address || '').replace(/"/g, '""')}"`,
    b.preferred_date,
    `"${b.preferred_slot}"`,
    b.urgency,
    b.status,
    b.estimated_cost || 0,
    `"${(b.assigned_technician || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ajay_electricals_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Bookings exported to CSV');
}

// 3. ADMIN SERVICES TAB
function renderAdminServices(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <h4 style="margin: 0; font-size: 1.15rem;">Electrical Services Offered</h4>
        <p style="margin: 4px 0 0; color: var(--text-muted); font-size: 0.85rem;">Add, edit or adjust repair pricing shown to customers.</p>
      </div>
      <button id="adminAddNewServiceBtn" class="btn btn-primary btn-sm">+ Add New Service</button>
    </div>

    <!-- Inline Add/Edit Form Box -->
    <div id="serviceEditBox" style="display: none; background: #f8fafc; border: 1px solid var(--border); border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <h5 id="serviceFormTitle" style="margin: 0 0 14px; font-size: 1rem;">Add Service</h5>
      <form id="serviceForm" class="form-grid">
        <input type="hidden" id="editServiceId" />
        <div class="form-row-2">
          <div class="form-group">
            <label>Service Title *</label>
            <input type="text" id="serviceFormTitleInput" class="form-control" placeholder="e.g. Inverter Wiring & Installation" required />
          </div>
          <div class="form-group">
            <label>Category *</label>
            <select id="serviceFormCategory" class="form-control" required>
              <option value="repair">Appliance Repairs</option>
              <option value="wiring">Wiring &amp; MCB</option>
              <option value="installation">Fittings &amp; DTH</option>
              <option value="security">CCTV &amp; Security</option>
              <option value="maintenance">Society AMC</option>
            </select>
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Price Display *</label>
            <input type="text" id="serviceFormPrice" class="form-control" placeholder="e.g. From ₹250 or Free Survey" required />
          </div>
          <div class="form-group">
            <label>Emoji Icon *</label>
            <input type="text" id="serviceFormIcon" class="form-control" placeholder="e.g. ⚡ or 🔌" required />
          </div>
        </div>
        <div class="form-group">
          <label>Description *</label>
          <input type="text" id="serviceFormDesc" class="form-control" placeholder="Details of the service provided..." required />
        </div>
        <div style="display: flex; gap: 10px;">
          <button type="submit" class="btn btn-primary btn-sm">Save Service</button>
          <button type="button" id="cancelServiceEditBtn" class="btn btn-secondary btn-sm">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Services Cards List -->
    <div class="services-grid">
      ${allServices.map(s => `
        <div class="service-card">
          <div class="service-icon-box">${escapeHtml(s.icon || '⚡')}</div>
          <h3>${escapeHtml(s.title)}</h3>
          <p>${escapeHtml(s.desc || s.description || '')}</p>
          <div class="service-card-footer">
            <span class="service-price">${escapeHtml(s.price)}</span>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm edit-svc-btn" data-id="${escapeHtml(s.id)}">✏️</button>
              <button class="btn btn-danger btn-sm del-svc-btn" data-id="${escapeHtml(s.id)}">🗑️</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Add / Edit form toggle
  const addNewBtn = $('#adminAddNewServiceBtn');
  const editBox = $('#serviceEditBox');
  const cancelBtn = $('#cancelServiceEditBtn');
  const form = $('#serviceForm');

  if (addNewBtn) {
    addNewBtn.onclick = () => {
      $('#serviceFormTitle').textContent = 'Add New Service';
      $('#editServiceId').value = '';
      form.reset();
      $('#serviceFormIcon').value = '⚡';
      editBox.style.display = 'block';
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = () => { editBox.style.display = 'none'; };
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = $('#editServiceId').value || 'svc-' + Date.now();
      const service = {
        id,
        title: $('#serviceFormTitleInput').value.trim(),
        category: $('#serviceFormCategory').value,
        price: $('#serviceFormPrice').value.trim(),
        icon: $('#serviceFormIcon').value.trim() || '⚡',
        desc: $('#serviceFormDesc').value.trim()
      };
      await dbManager.saveService(service);
      showToast('Service saved successfully!');
      editBox.style.display = 'none';
      await loadServices();
      renderAdminServices(container);
    };
  }

  // Edit action
  container.querySelectorAll('.edit-svc-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const s = allServices.find(item => item.id === id);
      if (!s) return;

      $('#serviceFormTitle').textContent = `Edit Service: ${s.title}`;
      $('#editServiceId').value = s.id;
      $('#serviceFormTitleInput').value = s.title;
      $('#serviceFormCategory').value = s.category || 'repair';
      $('#serviceFormPrice').value = s.price;
      $('#serviceFormIcon').value = s.icon;
      $('#serviceFormDesc').value = s.desc || s.description || '';
      editBox.style.display = 'block';
      editBox.scrollIntoView({ behavior: 'smooth' });
    };
  });

  // Delete action
  container.querySelectorAll('.del-svc-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      if (confirm('Are you sure you want to remove this service?')) {
        await dbManager.deleteService(id);
        showToast('Service removed');
        await loadServices();
        renderAdminServices(container);
      }
    };
  });
}

// 4. ADMIN PRODUCTS (SALES) TAB
function renderAdminProducts(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <h4 style="margin: 0; font-size: 1.15rem;">Shop Sales Catalog</h4>
        <p style="margin: 4px 0 0; color: var(--text-muted); font-size: 0.85rem;">Manage showroom items, brand pricing, and stock status.</p>
      </div>
      <button id="adminAddNewProductBtn" class="btn btn-primary btn-sm">+ Add New Product</button>
    </div>

    <!-- Product Form Box -->
    <div id="productEditBox" style="display: none; background: #f8fafc; border: 1px solid var(--border); border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <h5 id="productFormTitle" style="margin: 0 0 14px; font-size: 1rem;">Add Product</h5>
      <form id="productForm" class="form-grid">
        <input type="hidden" id="editProductId" />
        <div class="form-row-2">
          <div class="form-group">
            <label>Product Title *</label>
            <input type="text" id="prodFormTitle" class="form-control" placeholder="e.g. Havells 20W LED Batten" required />
          </div>
          <div class="form-group">
            <label>Brand *</label>
            <input type="text" id="prodFormBrand" class="form-control" placeholder="e.g. Havells / Anchor / Polycab" required />
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Category *</label>
            <select id="prodFormCategory" class="form-control" required>
              <option value="appliances">Fans &amp; Geysers</option>
              <option value="lighting">LED Lighting</option>
              <option value="switches">Switches &amp; MCBs</option>
              <option value="wires">Cables &amp; Wires</option>
              <option value="security">CCTV Kits</option>
            </select>
          </div>
          <div class="form-group">
            <label>Badge / Tag (Optional)</label>
            <input type="text" id="prodFormBadge" class="form-control" placeholder="e.g. Best Seller / Hot Deal" />
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Selling Price (₹) *</label>
            <input type="number" id="prodFormPrice" class="form-control" placeholder="320" required />
          </div>
          <div class="form-group">
            <label>MRP (₹)</label>
            <input type="number" id="prodFormMrp" class="form-control" placeholder="480" />
          </div>
        </div>
        <div class="form-group">
          <label>Warranty / Certification</label>
          <input type="text" id="prodFormWarranty" class="form-control" placeholder="e.g. 2 Years Manufacturer Warranty" />
        </div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" id="prodFormDesc" class="form-control" placeholder="Key specifications..." />
        </div>
        <div style="display: flex; gap: 10px;">
          <button type="submit" class="btn btn-primary btn-sm">Save Product</button>
          <button type="button" id="cancelProductEditBtn" class="btn btn-secondary btn-sm">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Products Grid -->
    <div class="products-grid">
      ${allProducts.map(p => `
        <div class="product-card">
          ${p.badge ? `<span class="product-badge">${escapeHtml(p.badge)}</span>` : ''}
          <span class="product-brand">${escapeHtml(p.brand)}</span>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.description || '')}</p>
          <div class="product-pricing">
            <span class="product-price">₹${p.price}</span>
            ${p.mrp ? `<span class="product-mrp">₹${p.mrp}</span>` : ''}
          </div>
          <div style="display: flex; gap: 6px; margin-top: auto;">
            <button class="btn btn-secondary btn-sm edit-prod-btn" data-id="${escapeHtml(p.id)}" style="flex: 1;">✏️ Edit</button>
            <button class="btn btn-danger btn-sm del-prod-btn" data-id="${escapeHtml(p.id)}">🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  const addBtn = $('#adminAddNewProductBtn');
  const box = $('#productEditBox');
  const cancelBtn = $('#cancelProductEditBtn');
  const form = $('#productForm');

  if (addBtn) {
    addBtn.onclick = () => {
      $('#productFormTitle').textContent = 'Add New Product';
      $('#editProductId').value = '';
      form.reset();
      box.style.display = 'block';
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = () => { box.style.display = 'none'; };
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = $('#editProductId').value || 'prd-' + Date.now();
      const product = {
        id,
        title: $('#prodFormTitle').value.trim(),
        brand: $('#prodFormBrand').value.trim(),
        category: $('#prodFormCategory').value,
        badge: $('#prodFormBadge').value.trim(),
        price: Number($('#prodFormPrice').value) || 0,
        mrp: Number($('#prodFormMrp').value) || 0,
        warranty: $('#prodFormWarranty').value.trim() || 'Manufacturer Warranty',
        description: $('#prodFormDesc').value.trim()
      };
      await dbManager.saveProduct(product);
      showToast('Product saved successfully!');
      box.style.display = 'none';
      await loadProducts();
      renderAdminProducts(container);
    };
  }

  container.querySelectorAll('.edit-prod-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const p = allProducts.find(item => item.id === id);
      if (!p) return;

      $('#productFormTitle').textContent = `Edit Product: ${p.title}`;
      $('#editProductId').value = p.id;
      $('#prodFormTitle').value = p.title;
      $('#prodFormBrand').value = p.brand;
      $('#prodFormCategory').value = p.category || 'appliances';
      $('#prodFormBadge').value = p.badge || '';
      $('#prodFormPrice').value = p.price;
      $('#prodFormMrp').value = p.mrp || '';
      $('#prodFormWarranty').value = p.warranty || '';
      $('#prodFormDesc').value = p.description || '';
      box.style.display = 'block';
      box.scrollIntoView({ behavior: 'smooth' });
    };
  });

  container.querySelectorAll('.del-prod-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      if (confirm('Delete this product from catalog?')) {
        await dbManager.deleteProduct(id);
        showToast('Product removed');
        await loadProducts();
        renderAdminProducts(container);
      }
    };
  });
}

// 5. ADMIN SUPABASE & SETTINGS TAB
function renderAdminSupabaseSettings(container) {
  const cfg = dbManager.getSupabaseConfig();
  const s = shopSettings;
  const currentAdminUser = localStorage.getItem('ajay_admin_username') || 'rajveer';
  const currentAdminPass = localStorage.getItem('ajay_admin_password') || 'rajveer123';

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
      
      <!-- SUPABASE CONNECTION CONFIG & AUTH GUIDE -->
      <div>
        <h4 style="margin: 0 0 8px; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
          <span>⚡ Supabase Cloud Database</span>
        </h4>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 16px;">
          Connected to your <b>Ajay Electricals</b> Supabase project for real-time bookings sync and cloud storage.
        </p>

        <!-- Project Overview Pill -->
        <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: 12px; padding: 14px; margin-bottom: 16px; font-size: 0.84rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><b>Project:</b> Ajay Electricals</div>
            <div><b>Project ID:</b> <code style="background: #e2e8f0; padding: 2px 5px; border-radius: 4px;">nbtcsdvusomvcsblcpyo</code></div>
            <div><b>Region:</b> ap-southeast-2</div>
            <div><b>Status:</b> ${cfg.isConnected ? '<span style="color: #16a34a; font-weight: 600;">● Connected</span>' : '<span style="color: #d97706; font-weight: 600;">○ Local Mode (Add Key)</span>'}</div>
          </div>
        </div>

        <div style="background: #ffffff; border: 1px solid var(--border); border-radius: 14px; padding: 20px; margin-bottom: 20px;">
          <div style="margin-bottom: 14px; padding: 12px; border-radius: 10px; font-size: 0.86rem; ${cfg.isConnected ? 'background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;' : 'background: #fffbeb; color: #92400e; border: 1px solid #fde68a;'}">
            <b>Connection Status:</b> ${cfg.isConnected ? '✅ Live Supabase Connected & Realtime Active' : 'ℹ️ Ready for Supabase API Key'}
          </div>

          <form id="supabaseConfigForm" class="form-grid">
            <div class="form-group">
              <label>Supabase Project URL</label>
              <input type="url" id="supabaseUrlInput" class="form-control" placeholder="https://nbtcsdvusomvcsblcpyo.supabase.co" value="${escapeHtml(cfg.url || 'https://nbtcsdvusomvcsblcpyo.supabase.co')}" required />
            </div>
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <label style="margin: 0;">Supabase Anon Public API Key</label>
                <a href="https://supabase.com/dashboard/project/nbtcsdvusomvcsblcpyo/settings/api" target="_blank" rel="noopener" style="font-size: 0.78rem; color: #ea580c; text-decoration: underline;">
                  Get Key from Supabase ↗
                </a>
              </div>
              <input type="password" id="supabaseKeyInput" class="form-control" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value="${escapeHtml(cfg.key)}" />
              <small style="color: var(--text-muted); font-size: 0.76rem; margin-top: 4px; display: block;">
                Find this in Supabase Dashboard → <b>Project Settings</b> → <b>API</b> → <b>Project API keys (anon public)</b>.
              </small>
            </div>
            <div style="display: flex; gap: 10px;">
              <button type="submit" class="btn btn-primary btn-sm">💾 Save &amp; Connect Supabase</button>
              <button type="button" id="resetToLocalBtn" class="btn btn-secondary btn-sm">Use Local Mode</button>
            </div>
          </form>
        </div>

        <!-- HOW TO ADD ADMIN USER GUIDE -->
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 14px; padding: 18px; margin-bottom: 20px;">
          <h5 style="margin: 0 0 10px; font-size: 0.98rem; display: flex; align-items: center; gap: 8px; color: #0f172a;">
            <span>👤 How to Add Admin Login ID &amp; Password in Supabase</span>
          </h5>
          <ol style="margin: 0; padding-left: 20px; font-size: 0.84rem; color: #475569; line-height: 1.6;">
            <li>Go to <a href="https://supabase.com/dashboard/project/nbtcsdvusomvcsblcpyo/auth/users" target="_blank" rel="noopener" style="color: #ea580c; font-weight: 600;">Supabase Dashboard → Authentication → Users ↗</a></li>
            <li>Click the green <b>Add user</b> button → <b>Create user</b></li>
            <li>Enter your Admin Email (e.g. <code style="background:#f1f5f9; padding:2px 4px; border-radius:3px;">admin@ajayelectricals.com</code>) &amp; choose a strong Password</li>
            <li>Make sure <b>"Auto Confirm User?"</b> is checked so no email confirmation is needed</li>
            <li>Click <b>Create user</b> — now you can log into this admin panel with that email &amp; password!</li>
          </ol>
        </div>

        <!-- SQL Schema Helper -->
        <div class="sql-guide-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <b style="color: #38bdf8;">Supabase SQL Database Setup</b>
            <button id="copySqlScriptBtn" class="btn btn-secondary btn-sm" style="font-size: 0.78rem; padding: 4px 10px;">📋 Copy SQL Query</button>
          </div>
          <p style="font-size: 0.8rem; color: #94a3b8; margin: 0 0 10px;">
            In Supabase Dashboard: Go to <a href="https://supabase.com/dashboard/project/nbtcsdvusomvcsblcpyo/sql/new" target="_blank" rel="noopener" style="color: #38bdf8; text-decoration: underline;">SQL Editor → New query</a>, paste and click <b>Run</b>.
          </p>
          <div class="sql-code-block" id="sqlSnippetBox">-- Creates bookings, services, products, shop_settings tables & seed data
-- Full file: supabase-schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_name TEXT NOT NULL,
    address TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_slot TEXT NOT NULL,
    urgency TEXT DEFAULT 'Standard',
    problem_details TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    estimated_cost NUMERIC DEFAULT 0,
    assigned_technician TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all" ON public.bookings FOR ALL USING (true);</div>
        </div>
      </div>

      <!-- RIGHT COLUMN: MANUAL ADMIN CREDENTIALS & SHOP SETTINGS -->
      <div>
        <!-- MANUAL ADMIN LOGIN CREDENTIALS -->
        <div style="background: #ffffff; border: 1px solid var(--border); border-radius: 14px; padding: 20px; margin-bottom: 24px;">
          <h4 style="margin: 0 0 8px; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
            <span>🔐 Manual Admin Credentials</span>
          </h4>
          <p style="color: var(--text-muted); font-size: 0.86rem; margin-bottom: 14px;">
            Set or customize your manual Admin Login ID &amp; Password. This allows instant admin login even without or alongside Supabase Auth.
          </p>

          <form id="adminCredentialsForm" class="form-grid">
            <div class="form-group">
              <label>Admin Login ID / Username</label>
              <input type="text" id="customAdminUser" class="form-control" value="${escapeHtml(currentAdminUser)}" required />
            </div>
            <div class="form-group">
              <label>Admin Password</label>
              <input type="text" id="customAdminPass" class="form-control" value="${escapeHtml(currentAdminPass)}" required />
            </div>
            <button type="submit" class="btn btn-secondary btn-sm" style="align-self: flex-start;">
              Update Manual Credentials
            </button>
          </form>
        </div>

        <!-- SHOP DETAILS & CONTACTS -->
        <h4 style="margin: 0 0 8px; font-size: 1.15rem;">Shop Details &amp; Contacts</h4>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 16px;">
          Update emergency numbers, Karvenagar store address, UPI ID and announcement banner.
        </p>

        <form id="shopSettingsForm" class="form-grid" style="background: #ffffff; border: 1px solid var(--border); border-radius: 14px; padding: 20px;">
          <div class="form-group">
            <label>Shop Name</label>
            <input type="text" id="settingShopName" class="form-control" value="${escapeHtml(s.shop_name)}" required />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>Emergency 24x7 Phone</label>
              <input type="tel" id="settingPhoneEmerg" class="form-control" value="${escapeHtml(s.phone_emergency)}" required />
            </div>
            <div class="form-group">
              <label>WhatsApp Number</label>
              <input type="tel" id="settingPhoneWa" class="form-control" value="${escapeHtml(s.phone_whatsapp)}" required />
            </div>
          </div>
          <div class="form-group">
            <label>Alternate Phone</label>
            <input type="tel" id="settingPhoneAlt" class="form-control" value="${escapeHtml(s.phone_alt)}" />
          </div>
          <div class="form-group">
            <label>Showroom Address</label>
            <textarea id="settingAddress" class="form-control" rows="2" required>${escapeHtml(s.address)}</textarea>
          </div>
          <div class="form-group">
            <label>Store Working Hours</label>
            <input type="text" id="settingHours" class="form-control" value="${escapeHtml(s.hours)}" required />
          </div>
          <div class="form-group">
            <label>UPI ID (Google Pay / PhonePe)</label>
            <input type="text" id="settingUpi" class="form-control" value="${escapeHtml(s.upi_id)}" required />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>Instagram URL</label>
              <input type="url" id="settingInstagramUrl" class="form-control" value="${escapeHtml(s.instagram_url || 'https://instagram.com/ajay_electricals')}" placeholder="https://instagram.com/ajay_electricals" />
            </div>
            <div class="form-group">
              <label>Instagram Handle</label>
              <input type="text" id="settingInstagramHandle" class="form-control" value="${escapeHtml(s.instagram_handle || '@ajay_electricals')}" placeholder="@ajay_electricals" />
            </div>
          </div>
          <div class="form-group">
            <label>Top Announcement Banner</label>
            <input type="text" id="settingBanner" class="form-control" value="${escapeHtml(s.banner_message)}" />
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Save Shop Settings</button>
        </form>
      </div>

    </div>
  `;

  // Supabase Config Form
  const supaForm = $('#supabaseConfigForm');
  if (supaForm) {
    supaForm.onsubmit = async (e) => {
      e.preventDefault();
      const url = $('#supabaseUrlInput').value.trim();
      const key = $('#supabaseKeyInput').value.trim();

      const res = await dbManager.setSupabaseConfig(url, key);
      if (res.success) {
        showToast(res.message, '⚡');
        updateSupabaseIndicator();
        await loadBookings();
        renderAdminSupabaseSettings(container);
      } else {
        alert('Supabase Connection Error: ' + res.message);
      }
    };
  }

  // Admin Credentials Form
  const adminCredForm = $('#adminCredentialsForm');
  if (adminCredForm) {
    adminCredForm.onsubmit = (e) => {
      e.preventDefault();
      const newUser = $('#customAdminUser').value.trim();
      const newPass = $('#customAdminPass').value.trim();
      if (!newUser || !newPass) {
        alert('Please provide both username and password.');
        return;
      }
      localStorage.setItem('ajay_admin_username', newUser);
      localStorage.setItem('ajay_admin_password', newPass);
      showToast('Manual Admin credentials updated successfully!', '🔑');
    };
  }

  // Reset to Local
  const resetBtn = $('#resetToLocalBtn');
  if (resetBtn) {
    resetBtn.onclick = async () => {
      await dbManager.setSupabaseConfig('', '');
      showToast('Switched to Local Mode');
      updateSupabaseIndicator();
      renderAdminSupabaseSettings(container);
    };
  }

  // Copy SQL script
  const copySqlBtn = $('#copySqlScriptBtn');
  if (copySqlBtn) {
    copySqlBtn.onclick = async () => {
      try {
        const res = await fetch('/supabase-schema.sql');
        const text = await res.text();
        await navigator.clipboard.writeText(text);
        copySqlBtn.textContent = '✓ Copied!';
        setTimeout(() => { copySqlBtn.textContent = '📋 Copy SQL Query'; }, 2000);
        showToast('Full Supabase SQL script copied to clipboard!');
      } catch (e) {
        alert('Please open supabase-schema.sql directly from the project directory.');
      }
    };
  }

  // Shop Settings Form
  const shopForm = $('#shopSettingsForm');
  if (shopForm) {
    shopForm.onsubmit = async (e) => {
      e.preventDefault();
      const updated = {
        shop_name: $('#settingShopName').value.trim(),
        phone_emergency: $('#settingPhoneEmerg').value.trim(),
        phone_whatsapp: $('#settingPhoneWa').value.trim(),
        phone_alt: $('#settingPhoneAlt').value.trim(),
        address: $('#settingAddress').value.trim(),
        hours: $('#settingHours').value.trim(),
        upi_id: $('#settingUpi').value.trim(),
        instagram_url: ($('#settingInstagramUrl') ? $('#settingInstagramUrl').value.trim() : 'https://instagram.com/ajay_electricals'),
        instagram_handle: ($('#settingInstagramHandle') ? $('#settingInstagramHandle').value.trim() : '@ajay_electricals'),
        banner_message: $('#settingBanner').value.trim()
      };

      await dbManager.saveSettings(updated);
      shopSettings = updated;
      renderShopSettingsUI();
      showToast('Shop settings updated successfully!');
    };
  }
}

// Start application
window.addEventListener('DOMContentLoaded', initApp);
