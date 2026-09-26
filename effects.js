// ==========================================
// Capitan Vexor - Effects Library
// ==========================================

// ===== 1. Loader سینمایی =====
(function() {
  const loaderHTML = `
    <div id="cv-loader">
      <div class="cv-loader-content">
        <div class="cv-loader-ring"></div>
        <div class="cv-loader-logo">𝑪𝑨𝑷𝑰𝑻𝑨𝑵..-𝒗𝒆𝒙𝒐𝒓</div>
        <div class="cv-loader-counter">۰٪</div>
        <div class="cv-loader-bar"><div class="cv-loader-bar-fill"></div></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', loaderHTML);

  const styleHTML = `
    <style id="cv-effects-style">
      /* ==== Loader ==== */
      #cv-loader {
        position: fixed; inset: 0; z-index: 999999;
        background: #0a0a0f;
        display: flex; align-items: center; justify-content: center;
        transition: opacity 0.6s, visibility 0.6s;
      }
      #cv-loader.hide { opacity: 0; visibility: hidden; }
      .cv-loader-content {
        display: flex; flex-direction: column; align-items: center; gap: 20px;
      }
      .cv-loader-ring {
        width: 90px; height: 90px; border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: #00ffe7; border-right-color: #a855f7;
        animation: cv-spin 1s linear infinite;
        position: relative;
      }
      .cv-loader-ring::before {
        content: '⚓'; position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        font-size: 2rem; animation: cv-pulse 1.5s infinite;
      }
      @keyframes cv-spin { to { transform: rotate(360deg); } }
      @keyframes cv-pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.1);} }
      .cv-loader-logo {
        font-size: 1.3rem; font-weight: 900;
        background: linear-gradient(135deg, #00ffe7, #a855f7, #ff2ec4);
        background-size: 200% 200%;
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: cv-gradient 2s ease infinite;
      }
      @keyframes cv-gradient { 0%,100%{background-position:0% 50%;} 50%{background-position:100% 50%;} }
      .cv-loader-counter {
        font-size: 0.9rem; color: #00ffe7; font-weight: 700;
        letter-spacing: 2px;
      }
      .cv-loader-bar {
        width: 200px; height: 3px; background: rgba(255,255,255,0.1);
        border-radius: 10px; overflow: hidden;
      }
      .cv-loader-bar-fill {
        height: 100%; width: 0%;
        background: linear-gradient(90deg, #00ffe7, #a855f7);
        transition: width 0.1s;
        box-shadow: 0 0 15px #00ffe7;
      }

      /* ==== Custom Cursor ==== */
      .cv-cursor {
        position: fixed; width: 40px; height: 40px;
        border: 2px solid #00ffe7; border-radius: 50%;
        pointer-events: none; z-index: 99999;
        transition: transform 0.15s, width 0.3s, height 0.3s, background 0.3s;
        transform: translate(-50%, -50%);
        mix-blend-mode: difference;
      }
      .cv-cursor-dot {
        position: fixed; width: 6px; height: 6px;
        background: #00ffe7; border-radius: 50%;
        pointer-events: none; z-index: 100000;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 15px #00ffe7;
      }
      .cv-cursor.hover {
        width: 60px; height: 60px;
        background: rgba(0,255,231,0.1);
        border-color: #a855f7;
      }
      @media (max-width: 768px) {
        .cv-cursor, .cv-cursor-dot { display: none; }
      }

      /* ==== Click Ripple ==== */
      .cv-ripple {
        position: fixed; width: 20px; height: 20px;
        border: 2px solid #00ffe7; border-radius: 50%;
        pointer-events: none; z-index: 99998;
        transform: translate(-50%, -50%);
        animation: cv-ripple-anim 0.6s ease-out;
      }
      @keyframes cv-ripple-anim {
        0% { width: 20px; height: 20px; opacity: 1; }
        100% { width: 150px; height: 150px; opacity: 0; }
      }

      /* ==== Welcome Popup ==== */
      .cv-popup {
        position: fixed; bottom: 30px; right: 30px;
        background: linear-gradient(135deg, rgba(15,15,25,0.98), rgba(20,20,35,0.98));
        border: 1px solid rgba(0,255,231,0.3);
        border-radius: 20px; padding: 20px 25px;
        box-shadow: 0 25px 60px rgba(0,255,231,0.3);
        backdrop-filter: blur(20px);
        z-index: 99997; max-width: 350px;
        transform: translateX(500px);
        transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: flex; align-items: center; gap: 15px;
      }
      .cv-popup.show { transform: translateX(0); }
      .cv-popup-icon { font-size: 2.5rem; flex-shrink: 0; }
      .cv-popup-content h4 {
        color: #00ffe7; font-size: 1rem; margin-bottom: 4px;
        font-weight: 800;
      }
      .cv-popup-content p {
        color: #a0a0b0; font-size: 0.85rem; line-height: 1.5;
      }
      .cv-popup-close {
        position: absolute; top: 8px; left: 8px;
        background: transparent; border: none; color: #666;
        font-size: 1rem; cursor: pointer; padding: 4px 8px;
        border-radius: 6px;
      }
      .cv-popup-close:hover { color: #ff3860; background: rgba(255,56,96,0.1); }
      @media (max-width: 480px) {
        .cv-popup { bottom: 20px; right: 20px; left: 20px; max-width: none; }
      }

      /* ==== Toast Notification ==== */
      .cv-toast {
        position: fixed; top: 80px; left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: linear-gradient(135deg, rgba(15,15,25,0.98), rgba(20,20,35,0.98));
        border: 1px solid #00ffe7; color: #fff;
        padding: 15px 25px; border-radius: 15px;
        box-shadow: 0 20px 50px rgba(0,255,231,0.4);
        backdrop-filter: blur(20px);
        z-index: 999999; font-weight: 700; font-size: 0.9rem;
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: flex; align-items: center; gap: 10px;
      }
      .cv-toast.show { transform: translateX(-50%) translateY(0); }
      .cv-toast.error { border-color: #ff3860; box-shadow: 0 20px 50px rgba(255,56,96,0.4); }

      /* ==== Section Reveal ==== */
      .cv-reveal {
        opacity: 0; transform: translateY(60px);
        transition: opacity 0.8s, transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .cv-reveal.cv-visible { opacity: 1; transform: translateY(0); }

      /* ==== Gradient Text Animation ==== */
      .cv-gradient-text {
        background: linear-gradient(90deg, #00ffe7, #a855f7, #ff2ec4, #00ffe7);
        background-size: 300% 300%;
        -webkit-background-clip: text; background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: cv-gradient 4s ease infinite;
      }

      /* ==== Tilt Cards ==== */
      .cv-tilt { transition: transform 0.3s; transform-style: preserve-3d; }
    </style>
  `;
  document.head.insertAdjacentHTML('beforeend', styleHTML);

  // شمارنده لودر
  let progress = 0;
  const counter = document.querySelector('.cv-loader-counter');
  const barFill = document.querySelector('.cv-loader-bar-fill');
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        document.getElementById('cv-loader').classList.add('hide');
        setTimeout(() => document.getElementById('cv-loader')?.remove(), 700);
      }, 300);
    }
    if (counter) counter.textContent = Math.floor(progress).toLocaleString('fa-IR') + '٪';
    if (barFill) barFill.style.width = progress + '%';
  }, 100);
})();

// ===== 2. موس تعاملی =====
(function() {
  if (window.innerWidth < 768) return;
  
  const cursor = document.createElement('div');
  cursor.className = 'cv-cursor';
  const dot = document.createElement('div');
  dot.className = 'cv-cursor-dot';
  document.body.appendChild(cursor);
  document.body.appendChild(dot);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animate() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('button, a, .category-card, .float-btn, .stat-box, .product-card, .tab')) {
      cursor.classList.add('hover');
    } else {
      cursor.classList.remove('hover');
    }
  });
})();

// ===== 3. افکت کلیک (موج نئون) =====
(function() {
  document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'cv-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
})();

// ===== 4. ذرات تعاملی =====
(function() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); initParticles(); });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.color = Math.random() > 0.5 ? '0,255,231' : '168,85,247';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      if (mouse.x && mouse.y) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          this.x -= dx / 30;
          this.y -= dy / 30;
        }
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, 0.7)`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(${this.color}, 0.9)`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = window.innerWidth < 768 ? 25 : 60;
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }
  initParticles();

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,255,231,${0.15 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
})();

// ===== 5. Popup خوش‌آمد =====
(function() {
  if (sessionStorage.getItem('cv_popup_seen')) return;
  
  setTimeout(() => {
    const popup = document.createElement('div');
    popup.className = 'cv-popup';
    popup.innerHTML = `
      <button class="cv-popup-close">✕</button>
      <div class="cv-popup-icon">⚓</div>
      <div class="cv-popup-content">
        <h4>خوش اومدی به کاپیتان وکثور!</h4>
        <p>اگه سوالی داری، از چت زنده بپرس 💬</p>
      </div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add('show'), 100);
    
    popup.querySelector('.cv-popup-close').addEventListener('click', () => {
      popup.classList.remove('show');
      setTimeout(() => popup.remove(), 500);
      sessionStorage.setItem('cv_popup_seen', 'true');
    });

    setTimeout(() => {
      if (document.body.contains(popup)) {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 500);
        sessionStorage.setItem('cv_popup_seen', 'true');
      }
    }, 10000);
  }, 3000);
})();

// ===== 6. Reveal on Scroll =====
(function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('cv-visible'), i * 100);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal, section, .category-card, .feature, .stat-box').forEach(el => {
    el.classList.add('cv-reveal');
    observer.observe(el);
  });
})();

// ===== 7. Toast Notification =====
window.cvToast = function(msg, isError = false) {
  const toast = document.createElement('div');
  toast.className = 'cv-toast' + (isError ? ' error' : '');
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
};

// ===== 8. Tilt Cards (3D) =====
(function() {
  if (window.innerWidth < 768) return;
  
  document.querySelectorAll('.category-card, .product-card').forEach(card => {
    card.classList.add('cv-tilt');
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ===== 9. Transition بین صفحات =====
(function() {
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http')) return;
      e.preventDefault();
      document.body.style.transition = 'opacity 0.3s';
      document.body.style.opacity = '0';
      setTimeout(() => window.location.href = href, 300);
    });
  });
})();

// ===== 10. Typing Effect =====
window.cvType = function(el, text, speed = 80) {
  if (!el) return;
  let i = 0;
  el.innerHTML = '';
  const timer = setInterval(() => {
    if (i < text.length) {
      el.innerHTML += text.charAt(i);
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);
};

console.log('🎨 Capitan Vexor Effects Loaded!');
