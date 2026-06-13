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