// Shared app JS for mock careers site + admin (client-side localStorage simulation)
// FIXED & IMPROVED VERSION: Better scoping, error handling, and slideshow logic

(function() {
  // API base for serverless functions — default empty for local demo
  const SERVER_API = window.GIMBI_API_BASE || '/.netlify/functions';

  const JOBS = [
    { 
      id: '1', 
      title: 'Community Engagement & Support Officer', 
      location: 'Regional / Flexible', 
      type: 'Full-time', 
      salary: '$65,000-$75,000', 
      short: 'Work with local communities to deliver culturally-safe programs.' 
    },
    { 
      id: '2', 
      title: 'Aboriginal Employment Mentor', 
      location: 'City / Hybrid', 
      type: 'Part-time', 
      salary: '$55,000-$65,000 (FTE)', 
      short: 'Provide mentoring and workforce pathways for community members.' 
    }
  ];

  function getJobs() { 
    return JOBS; 
  }

  function getJobById(id) { 
    return JOBS.find(j => j.id === String(id)); 
  }

  // Applications are stored in localStorage under key 'gimbi_applications'
  function getApplications() {
    try {
      const raw = localStorage.getItem('gimbi_applications') || '[]';
      return JSON.parse(raw);
    } catch (e) { 
      console.error('Error parsing applications:', e);
      return []; 
    }
  }

  function saveApplication(app) {
    try {
      const all = getApplications();
      app.id = 'app_' + Date.now() + '_' + Math.floor(Math.random() * 9999);
      app.submittedAt = (new Date()).toISOString();
      all.push(app);
      localStorage.setItem('gimbi_applications', JSON.stringify(all));
      return app;
    } catch (e) {
      console.error('Error saving application:', e);
      return null;
    }
  }

  async function submitToServer(app) {
    // app expected to be an object with fields matching the server submit function
    try {
      if (!SERVER_API) throw new Error('No server endpoint configured');
      const url = SERVER_API + '/submit';
      const res = await fetch(url, { 
        method: 'POST', 
        headers: { 'content-type': 'application/json' }, 
        body: JSON.stringify(app) 
      });
      if (!res.ok) throw new Error('Server submission failed: ' + res.status);
      return await res.json();
    } catch (e) {
      console.error('Submit to server error:', e);
      throw e;
    }
  }

  async function requestUploadUrl(fileName, contentType, id) {
    try {
      if (!SERVER_API) throw new Error('No server endpoint configured');
      const url = SERVER_API + '/upload-url';
      const res = await fetch(url, { 
        method: 'POST', 
        headers: { 'content-type': 'application/json' }, 
        body: JSON.stringify({ fileName, contentType, id }) 
      });
      if (!res.ok) throw new Error('Failed to get upload url');
      return await res.json(); // { uploadUrl, key }
    } catch (e) {
      console.error('Request upload URL error:', e);
      throw e;
    }
  }

  async function uploadFileToUrl(uploadUrl, file) {
    try {
      const res = await fetch(uploadUrl, { 
        method: 'PUT', 
        body: file, 
        headers: { 'Content-Type': file.type } 
      });
      if (!res.ok) throw new Error('Upload failed: ' + res.status);
      return true;
    } catch (e) {
      console.error('Upload file error:', e);
      throw e;
    }
  }

  async function getDownloadUrl(key) {
    try {
      if (!SERVER_API) throw new Error('No server endpoint configured');
      const url = SERVER_API + '/get-file-url';
      const res = await fetch(url, { 
        method: 'POST', 
        headers: { 'content-type': 'application/json' }, 
        body: JSON.stringify({ key }) 
      });
      if (!res.ok) throw new Error('Failed to get download url');
      return await res.json(); // { url }
    } catch (e) {
      console.error('Get download URL error:', e);
      throw e;
    }
  }


  function deleteApplication(appId) {
    try {
      const all = getApplications().filter(a => a.id !== appId);
      localStorage.setItem('gimbi_applications', JSON.stringify(all));
    } catch (e) {
      console.error('Error deleting application:', e);
    }
  }

  function exportCSV() {
    try {
      const apps = getApplications();
      if (!apps.length) return null;
      const keys = ['id', 'jobId', 'pathway', 'name', 'email', 'phone', 'identify', 'message', 'fileName', 'fileRef', 'submittedAt'];
      const rows = [keys.join(',')].concat(apps.map(a => keys.map(k => '"' + (a[k] || '') + '"').join(',')));
      return rows.join('\n');
    } catch (e) {
      console.error('Error exporting CSV:', e);
      return null;
    }
  }

  // Expose for pages
  window.gimbi = {
    getJobs, getJobById, getApplications, saveApplication, deleteApplication, exportCSV,
    submitToServer, requestUploadUrl, uploadFileToUrl, getDownloadUrl, SERVER_API
  };

  // ========================================
  // UI HELPERS: Animated charts & counters
  // ========================================

  function animateDonuts(root = document) {
    const donuts = root.querySelectorAll('.donut');
    donuts.forEach(d => {
      const val = Number(d.getAttribute('data-value')) || 0;
      const svgValue = d.querySelector('.value');
      const label = d.querySelector('.label');
      if (!svgValue) return;

      const r = svgValue.getAttribute('r');
      const circumference = 2 * Math.PI * Number(r);
      const offset = circumference - (val / 100) * circumference;

      // Set initial state to full offset so animate looks nice
      svgValue.style.strokeDasharray = circumference;
      svgValue.style.strokeDashoffset = circumference;

      setTimeout(() => {
        svgValue.style.transition = 'stroke-dashoffset .9s cubic-bezier(.2,.9,.24,1)';
        svgValue.style.strokeDashoffset = offset;
      }, 120);

      // Label animation (count up)
      if (label) {
        let start = 0;
        const end = val;
        const step = Math.max(1, Math.round(end / 20));
        const id = setInterval(() => {
          start += step;
          if (start >= end) {
            start = end;
            clearInterval(id);
          }
          label.textContent = start + '%';
        }, 30);
      }
    });
  }

  function animateCounters(root = document) {
    const vals = root.querySelectorAll('.metric-box .val');
    vals.forEach(el => {
      const final = Number(el.textContent) || 0;
      el.textContent = '0';
      let cur = 0;
      const step = Math.max(1, Math.round(final / 25));
      const id = setInterval(() => {
        cur += step;
        if (cur >= final) {
          cur = final;
          el.textContent = cur;
          clearInterval(id);
        } else {
          el.textContent = cur;
        }
      }, 30);
    });
  }

  function animateBars(root = document) {
    const containers = root.querySelectorAll('.bar-chart');
    containers.forEach(c => {
      const bars = Array.from(c.querySelectorAll('.bar'));
      bars.forEach((b, i) => {
        const h = b.style.height || '20%';
        b.style.height = '6%';
        setTimeout(() => {
          b.style.height = h;
        }, 120 + i * 90);
      });
    });
  }

  // Run animations on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      animateDonuts();
      animateCounters();
      animateBars();
    });
  } else {
    animateDonuts();
    animateCounters();
    animateBars();
  }

  // ========================================
  // HERO SLIDESHOW INITIALIZER
  // ========================================
  // Finds .hero-slideshow containers and cycles child .hero-slide images
  // Auto-advances every 10 seconds with pause-on-hover

  function initHeroSlides(root = document) {
    const containers = root.querySelectorAll('.hero-slideshow');
    
    containers.forEach(container => {
      const slides = Array.from(container.querySelectorAll('.hero-slide'));
      if (!slides.length) return;

      // Ensure layout + initial styles
      container.style.position = 'relative';
      container.style.overflow = 'hidden';

      slides.forEach((s, i) => {
        // Position container (picture or img)
        s.style.position = 'absolute';
        s.style.inset = '0';
        s.style.width = '100%';
        s.style.height = '100%';
        s.style.transition = 'opacity .9s ease-in-out, transform .9s ease-in-out';
        s.style.opacity = s.classList.contains('visible') ? '1' : '0';
        s.style.willChange = 'opacity, transform';
        s.setAttribute('aria-hidden', s.classList.contains('visible') ? 'false' : 'true');

        // Ensure inner image fills container
        try {
          const inner = (s.nodeName && s.nodeName.toLowerCase() === 'picture') 
            ? s.querySelector('img') 
            : (s.nodeName && s.nodeName.toLowerCase() === 'img' ? s : s.querySelector('img'));

          if (inner) {
            // Ensure images fill the 16:9 hero area without distortion
            inner.style.width = '100%';
            inner.style.height = '100%';
            inner.style.maxWidth = '100%';
            inner.style.objectFit = inner.getAttribute('data-fit') || 'cover';
            inner.style.objectPosition = 'center';
            inner.style.display = 'block';
          }
        } catch (e) {
          // Ignore errors in image setup
        }
      });

      // Find initial visible slide
      let idx = slides.findIndex(x => x.classList.contains('visible'));
      if (idx < 0 || !slides[idx]) {
        idx = 0;
        slides[0].classList.add('visible');
        slides[0].style.opacity = '1';
        slides[0].setAttribute('aria-hidden', 'false');
      }

      // Slideshow timer and control functions
      let timer = null;
      let isHovering = false;

      const advance = () => {
        const next = (idx + 1) % slides.length;
        slides[idx].classList.remove('visible');
        slides[idx].style.opacity = '0';
        slides[idx].setAttribute('aria-hidden', 'true');

        slides[next].classList.add('visible');
        slides[next].style.opacity = '1';
        slides[next].setAttribute('aria-hidden', 'false');

        idx = next;
      };

      const start = () => {
        if (timer) return;
        timer = setInterval(advance, 10000); // 10 seconds per slide
      };

      const stop = () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      };

      // Start immediately
      start();

      // Pause/resume based on hover
      container.addEventListener('mouseenter', () => {
        isHovering = true;
        stop();
      });

      container.addEventListener('mouseleave', () => {
        isHovering = false;
        start();
      });

      // Pause/resume based on page visibility so inactive tabs don't spin indefinitely
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stop();
        } else if (!isHovering) {
          start();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initHeroSlides();
    });
  } else {
    initHeroSlides();
  }

  // ========================================
  // THEME STEPPER UI
  // ========================================
  // Create a small control to step through theme-60..theme-140

  function applyThemeStep(value) {
    // Clamp to nearest 10
    const n = Math.min(140, Math.max(60, Math.round(value / 10) * 10));
    const body = document.body;

    // Remove old theme classes
    body.classList.remove(...Array.from(body.classList).filter(c => /^theme-\d+$/i.test(c)));
    body.classList.add('theme-' + n);

    localStorage.setItem('gimbi_theme_step', String(n));

    // Re-run small animations so charts reflect new sizing
    setTimeout(() => {
      animateDonuts();
      animateCounters();
      animateBars();
    }, 160);

    return n;
  }

  function createThemeStepper() {
    // If header exists add a compact controller
    const header = document.querySelector('header');
    if (!header) return;

    // Avoid duplicate
    if (document.getElementById('gimbi-theme-stepper')) return;

    const stepper = document.createElement('div');
    stepper.id = 'gimbi-theme-stepper';
    stepper.setAttribute('role', 'group');
    stepper.setAttribute('aria-label', 'Theme intensity control');
    stepper.tabIndex = 0; // Focusable container
    stepper.style.cssText = 'display:inline-flex; gap:8px; align-items:center; padding:6px 8px; border-radius:10px; background:rgba(255,255,255,0.95); color:#111; box-shadow: 0 6px 18px rgba(15,23,42,0.06); font-weight:700; font-size:0.9rem; margin-left:12px;';

    const minus = document.createElement('button');
    minus.textContent = '-';
    minus.className = 'icon-btn';
    minus.setAttribute('aria-label', 'Decrease theme intensity');

    const plus = document.createElement('button');
    plus.textContent = '+';
    plus.className = 'icon-btn';
    plus.setAttribute('aria-label', 'Increase theme intensity');

    const label = document.createElement('div');
    label.style.minWidth = '56px';
    label.style.textAlign = 'center';
    label.setAttribute('aria-live', 'polite');
    label.textContent = '100%';

    // Continuous slider for fine control
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '60';
    slider.max = '140';
    slider.step = '1';
    slider.value = '100';
    slider.className = 'theme-range';
    slider.setAttribute('aria-label', 'Theme intensity slider');
    slider.style.width = '96px';

    stepper.appendChild(minus);
    stepper.appendChild(label);
    stepper.appendChild(plus);
    stepper.appendChild(slider);

    minus.addEventListener('click', () => {
      let current = Number(localStorage.getItem('gimbi_theme_step') || '100');
      current = Math.max(60, current - 10);
      const n = applyThemeStep(current);
      label.textContent = n + '%';
      slider.value = n;
    });

    plus.addEventListener('click', () => {
      let current = Number(localStorage.getItem('gimbi_theme_step') || '100');
      current = Math.min(140, current + 10);
      const n = applyThemeStep(current);
      label.textContent = n + '%';
      slider.value = n;
    });

    // Slider continuous control (fine-grain)
    slider.addEventListener('input', (e) => {
      const v = Math.max(60, Math.min(140, Number(e.target.value)));
      label.textContent = Math.round(v) + '%';
      // Temporarily apply exact value (we allow non-10 increments)
      applyThemeStep(v);
    });

    // When user releases the slider, persist the nearest 1% value
    slider.addEventListener('change', (e) => {
      applyThemeStep(Number(e.target.value));
    });

    // Reset double-click
    label.addEventListener('dblclick', () => {
      const n = applyThemeStep(100);
      label.textContent = n + '%';
    });

    // Keyboard support: left/right arrow adjusts by 10, up/down by 1
    stepper.addEventListener('keydown', (ev) => {
      const key = ev.key;
      let current = Number(localStorage.getItem('gimbi_theme_step') || '100');

      if (key === 'ArrowLeft' || key === '-') {
        ev.preventDefault();
        current = Math.max(60, current - 10);
      } else if (key === 'ArrowRight' || key === '+') {
        ev.preventDefault();
        current = Math.min(140, current + 10);
      } else if (key === 'ArrowUp') {
        ev.preventDefault();
        current = Math.min(140, current + 1);
      } else if (key === 'ArrowDown') {
        ev.preventDefault();
        current = Math.max(60, current - 1);
      } else {
        return;
      }

      const n = applyThemeStep(current);
      label.textContent = n + '%';
      slider.value = n;
    });

    // Insert into nav-bar if present, else header
    const target = document.querySelector('.nav-bar') || header;
    target.appendChild(stepper);

    // Initial state
    const stored = Number(localStorage.getItem('gimbi_theme_step') || '100');
    const n = applyThemeStep(stored || 100);
    label.textContent = n + '%';
    slider.value = n;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createThemeStepper);
  } else {
    createThemeStepper();
  }

  // ========================================
  // PAGE UI HELPERS
  // ========================================
  // Used by index.html and other pages

  // Show or hide main sections (id-based) for single-page navigation UI
  function showSection(id) {
    try {
      const sections = document.querySelectorAll('main .slide-in');
      sections.forEach(s => {
        s.style.display = 'none';
      });

      const el = document.getElementById(id);
      if (el) el.style.display = '';

      // Update nav active state
      const navLinks = document.querySelectorAll('.nav-links .nav-link');
      navLinks.forEach(a => a.classList.remove('active'));

      const target = document.querySelector('.nav-links .nav-link[href$="#' + id + '"]');
      if (target) target.classList.add('active');

      return true;
    } catch (e) {
      console.error('Error showing section:', e);
      return false;
    }
  }

  // Attempt to locate a matching job by title from DOM and route to job details
  function _findJobFromButton(button) {
    if (!button) return null;

    const card = button.closest ? button.closest('.job-card') : null;
    if (card) {
      // Try title inside card
      const titleEl = card.querySelector('h3') || card.querySelector('div[style*="font-weight:800"]');
      const title = titleEl ? (titleEl.textContent || '').trim() : '';

      if (title) {
        return getJobs().find(j =>
          j.title.toLowerCase().includes(
            title.toLowerCase().split(/\s+/).slice(0, 6).join(' ')
          ) || j.title.toLowerCase() === title.toLowerCase()
        );
      }
    }

    return null;
  }

  function applyForJob(btn) {
    try {
      const job = _findJobFromButton(btn);
      if (job) location.href = 'job.html?id=' + encodeURIComponent(job.id);
      else location.href = 'jobs.html';
    } catch (e) {
      console.error('Error applying for job:', e);
      location.href = 'jobs.html';
    }
  }

  function viewJobDetails(btn) {
    return applyForJob(btn);
  }

  // Basic filter for job cards in index.html
  function filterJobs() {
    try {
      const loc = document.getElementById('locationFilter')?.value || '';
      const type = document.getElementById('typeFilter')?.value || '';
      const list = document.querySelectorAll('.jobs-list .job-card');

      list.forEach(card => {
        const meta = (card.querySelector('.job-meta')?.textContent || '').toLowerCase();
        const okLoc = !loc || meta.includes(loc.toLowerCase());
        const okType = !type || meta.includes(type.toLowerCase());
        card.style.display = (okLoc && okType) ? '' : 'none';
      });
    } catch (e) {
      console.error('Error filtering jobs:', e);
    }
  }

  function resetFilters() {
    try {
      const lf = document.getElementById('locationFilter');
      if (lf) lf.value = '';
      const tf = document.getElementById('typeFilter');
      if (tf) tf.value = '';
      filterJobs();
    } catch (e) {
      console.error('Error resetting filters:', e);
    }
  }

  // Expose to global scope for inline handlers used by pages
  window.showSection = showSection;
  window.applyForJob = applyForJob;
  window.viewJobDetails = viewJobDetails;
  window.filterJobs = filterJobs;
  window.resetFilters = resetFilters;

})(); // End IIFE
