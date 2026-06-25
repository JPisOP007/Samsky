// ============================
// SAMSKY DRONE SYSTEMS - JS
// ============================

// NAV SCROLL EFFECT
const nav = document.getElementById('nav');
const handleNavScroll = () => {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
};
window.addEventListener('scroll', handleNavScroll, { passive: true });

// BURGER MENU
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

burger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('open', menuOpen);
  // Animate burger
  const spans = burger.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

function closeMobile() {
  menuOpen = false;
  mobileMenu.classList.remove('open');
  const spans = burger.querySelectorAll('span');
  spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}
window.closeMobile = closeMobile;

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (menuOpen && !mobileMenu.contains(e.target) && !burger.contains(e.target)) {
    closeMobile();
  }
});

// REVEAL ON SCROLL
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings
      const siblings = [...entry.target.parentElement.querySelectorAll('[data-reveal]')];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('revealed');
      }, idx * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// SMOOTH ACTIVE NAV
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = 'var(--accent-1)';
        }
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => sectionObserver.observe(s));

// FORM SUBMIT
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-submit');
  const success = document.getElementById('form-success');
  
  const name = document.getElementById('contact-name').value;
  const organisation = document.getElementById('contact-organisation').value;
  const email = document.getElementById('contact-email').value;
  const interest = document.getElementById('contact-interest').value;
  const message = document.getElementById('contact-message').value;

  btn.textContent = 'Sending...';
  btn.disabled = true;

  fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, organisation, email, interest, message })
  })
  .then(res => {
    if (!res.ok) throw new Error('Submission failed');
    return res.json();
  })
  .then(data => {
    btn.textContent = 'Sent ✓';
    success.style.display = 'block';
    success.style.color = ''; // use CSS green variable style default
    success.textContent = '✓ Message sent! We\'ll respond within 24 hours.';
    e.target.reset();
    setTimeout(() => {
      btn.textContent = 'Send Inquiry →';
      btn.disabled = false;
      success.style.display = 'none';
    }, 4500);
  })
  .catch(err => {
    console.error('Error submitting form:', err);
    btn.textContent = 'Error';
    success.style.display = 'block';
    success.style.color = '#ef4444';
    success.textContent = '✗ Error sending message. Please try again later.';
    setTimeout(() => {
      btn.textContent = 'Send Inquiry →';
      btn.disabled = false;
    }, 4500);
  });
}
window.handleSubmit = handleSubmit;

// PARALLAX ORBS (subtle)
document.addEventListener('mousemove', (e) => {
  const orbs = document.querySelectorAll('.orb');
  const x = (e.clientX / window.innerWidth - 0.5) * 30;
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  orbs.forEach((orb, i) => {
    const factor = (i + 1) * 0.4;
    orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
});

// COUNTER ANIMATION for stats
const counters = document.querySelectorAll('.stat-num');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const text = el.textContent;
      const num = parseInt(text);
      if (isNaN(num)) return;
      const suffix = text.replace(/[0-9]/g, '');
      let start = 0;
      const duration = 1200;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * num) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterObserver.observe(c));

// TICKER pause on hover
const ticker = document.querySelector('.ticker');
const tickerWrap = document.querySelector('.ticker-wrap');
if (tickerWrap && ticker) {
  tickerWrap.addEventListener('mouseenter', () => ticker.style.animationPlayState = 'paused');
  tickerWrap.addEventListener('mouseleave', () => ticker.style.animationPlayState = 'running');
}

// VIEW TOGGLE (3D Model / Video)
function showView(type) {
  const modelView = document.getElementById('view-model');
  const videoView = document.getElementById('view-video');
  const btnModel  = document.getElementById('btn-model');
  const btnVideo  = document.getElementById('btn-video');
  const ytIframe  = document.getElementById('yt-iframe');

  if (type === 'model') {
    modelView.style.display = 'block';
    videoView.style.display = 'none';
    btnModel.classList.add('active');
    btnVideo.classList.remove('active');
    // pause YouTube
    ytIframe.src = '';
  } else {
    modelView.style.display = 'none';
    videoView.style.display = 'block';
    btnVideo.classList.add('active');
    btnModel.classList.remove('active');
    // lazy-load YouTube only when clicked
    if (!ytIframe.src || ytIframe.src === window.location.href) {
      ytIframe.src = ytIframe.dataset.src;
    }
  }
}
window.showView = showView;

// ============================
// CONSULTATION BOOKING SYSTEM JS
// ============================
let currentBookingStep = 1;

function openBookingModal() {
  const modal = document.getElementById('bookingModal');
  modal.classList.add('open');
  
  // Reset form and steps
  document.getElementById('booking-form').reset();
  document.getElementById('booking-form').classList.remove('hidden');
  document.getElementById('booking-success-screen').classList.add('hidden');
  document.getElementById('booking-error-screen').classList.add('hidden');
  
  document.getElementById('selected-booking-date').value = '';
  document.getElementById('selected-booking-slot').value = '';

  // Restrict custom date picker to tomorrow and onwards
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];
  const customPicker = document.getElementById('custom-booking-date');
  if (customPicker) {
    customPicker.min = minDateStr;
    customPicker.value = '';
  }
  
  goToBookingStep(1);
  renderBookingDates();
}
window.openBookingModal = openBookingModal;

function closeBookingModal() {
  document.getElementById('bookingModal').classList.remove('open');
}
window.closeBookingModal = closeBookingModal;

function closeBookingModalOnOuterClick(e) {
  if (e.target.id === 'bookingModal') {
    closeBookingModal();
  }
}
window.closeBookingModalOnOuterClick = closeBookingModalOnOuterClick;

function renderBookingDates() {
  const dateGrid = document.getElementById('booking-date-grid');
  dateGrid.innerHTML = '';
  
  const dates = [];
  let currentDate = new Date();
  
  // Generate next 7 business days (skipping Sundays)
  while (dates.length < 7) {
    currentDate.setDate(currentDate.getDate() + 1);
    // Sunday is 0
    if (currentDate.getDay() !== 0) {
      dates.push(new Date(currentDate));
    }
  }
  
  dates.forEach(date => {
    const tile = document.createElement('div');
    tile.className = 'date-tile';
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = dayNames[date.getDay()];
    const dayNum = date.getDate();
    const monthName = monthNames[date.getMonth()];
    
    // YYYY-MM-DD format for storage
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(dayNum).padStart(2, '0');
    const dateValue = `${year}-${month}-${day}`;
    
    tile.innerHTML = `
      <span class="day-name">${dayName}</span>
      <span class="day-num">${dayNum}</span>
      <span class="month-name">${monthName}</span>
    `;
    
    tile.addEventListener('click', () => {
      document.querySelectorAll('.date-tile').forEach(t => t.classList.remove('active'));
      tile.classList.add('active');
      document.getElementById('selected-booking-date').value = dateValue;

      // Clear custom date input
      const customPicker = document.getElementById('custom-booking-date');
      if (customPicker) customPicker.value = '';

      renderTimeSlots(dateValue);
    });
    
    dateGrid.appendChild(tile);
  });
  
  // Clear slots selector grid initially until date chosen
  document.getElementById('booking-slots-grid').innerHTML = '<div style="grid-column: 1/-1; color: var(--text-muted); font-size: 0.85rem; font-style: italic; text-align: center; padding: 1rem 0;">Please select a date first</div>';
}

function renderTimeSlots(dateValue) {
  const slotsGrid = document.getElementById('booking-slots-grid');
  slotsGrid.innerHTML = '';
  
  const slots = [
    '10:00 AM - 11:00 AM',
    '11:30 AM - 12:30 PM',
    '02:00 PM - 03:00 PM',
    '03:30 PM - 04:30 PM',
    '05:00 PM - 06:00 PM'
  ];
  
  slots.forEach(slot => {
    const chip = document.createElement('div');
    chip.className = 'slot-chip';
    chip.textContent = slot;
    
    chip.addEventListener('click', () => {
      document.querySelectorAll('.slot-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      document.getElementById('selected-booking-slot').value = slot;
    });
    
    slotsGrid.appendChild(chip);
  });
}

function goToBookingStep(step) {
  if (step === 2) {
    const selectedDate = document.getElementById('selected-booking-date').value;
    const selectedSlot = document.getElementById('selected-booking-slot').value;
    
    if (!selectedDate || !selectedSlot) {
      alert('Please select both a date and an available time slot before continuing.');
      return;
    }
  }
  
  currentBookingStep = step;
  
  // Update visibility
  if (step === 1) {
    document.getElementById('booking-step-1').classList.remove('hidden');
    document.getElementById('booking-step-2').classList.add('hidden');
    document.getElementById('indicator-step-1').classList.add('active');
    document.getElementById('indicator-step-2').classList.remove('active');
  } else {
    document.getElementById('booking-step-1').classList.add('hidden');
    document.getElementById('booking-step-2').classList.remove('hidden');
    document.getElementById('indicator-step-1').classList.add('active');
    document.getElementById('indicator-step-2').classList.add('active');
  }
}
window.goToBookingStep = goToBookingStep;

function handleBookingSubmit(e) {
  e.preventDefault();
  
  if (currentBookingStep !== 2) {
    goToBookingStep(2);
    return;
  }
  
  const btn = document.getElementById('btn-booking-submit-btn');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Registering Appointment...';
  btn.disabled = true;
  
  const name = document.getElementById('booking-name').value;
  const email = document.getElementById('booking-email').value;
  const organisation = document.getElementById('booking-org').value;
  const date = document.getElementById('selected-booking-date').value;
  const timeSlot = document.getElementById('selected-booking-slot').value;
  const topic = document.getElementById('booking-topic').value;
  const message = document.getElementById('booking-message').value;
  
  fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, organisation, date, timeSlot, topic, message })
  })
  .then(res => {
    if (!res.ok) throw new Error('Booking failed');
    return res.json();
  })
  .then(data => {
    btn.innerHTML = originalText;
    btn.disabled = false;
    
    // Fill receipt details
    document.getElementById('receipt-date').textContent = formatDateString(date);
    document.getElementById('receipt-time').textContent = timeSlot;
    document.getElementById('receipt-topic').textContent = topic;
    document.getElementById('receipt-email').textContent = email;
    
    // Toggle screens
    document.getElementById('booking-form').classList.add('hidden');
    document.getElementById('booking-success-screen').classList.remove('hidden');
  })
  .catch(err => {
    console.error('Error creating booking:', err);
    btn.innerHTML = originalText;
    btn.disabled = false;
    
    // Show error screen
    document.getElementById('booking-form').classList.add('hidden');
    document.getElementById('booking-error-screen').classList.remove('hidden');
  });
}
window.handleBookingSubmit = handleBookingSubmit;

function formatDateString(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function handleCustomDateChange(input) {
  const dateValue = input.value;
  if (!dateValue) return;

  // Deselect quick-select tiles
  document.querySelectorAll('.date-tile').forEach(t => t.classList.remove('active'));

  // Update selected booking date value
  document.getElementById('selected-booking-date').value = dateValue;

  // Render time slots
  renderTimeSlots(dateValue);
}
window.handleCustomDateChange = handleCustomDateChange;

window.setTestBookingDate = function(dateStr) {
  const customPicker = document.getElementById('custom-booking-date');
  if (customPicker) {
    customPicker.value = dateStr;
    handleCustomDateChange(customPicker);
  }
};