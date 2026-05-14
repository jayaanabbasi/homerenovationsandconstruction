// script.js - Complete Lightbox Gallery with Video Support
document.addEventListener('DOMContentLoaded', () => {
  // ========== LIGHTBOX GALLERY ==========
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  
  let galleryItems = [];
  let currentIndex = 0;
  
  // Collect all gallery items
  function collectGalleryItems() {
    galleryItems = [];
    const items = document.querySelectorAll('.gallery-item');
    items.forEach((item, index) => {
      const type = item.dataset.galleryType;
      const caption = item.querySelector('.gallery-caption')?.textContent || '';
      
      if (type === 'video') {
        const video = item.querySelector('video');
        const videoSrc = video?.querySelector('source')?.src || '';
        galleryItems.push({
          index,
          element: item,
          type: 'video',
          src: videoSrc,
          caption,
        });
      } else {
        const img = item.querySelector('img');
        galleryItems.push({
          index,
          element: item,
          type: 'image',
          src: img?.src || '',
          caption,
        });
      }
    });
  }
  
  function openLightbox(index) {
    collectGalleryItems();
    if (galleryItems.length === 0) return;
    
    currentIndex = index;
    updateLightboxContent();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Pause all thumbnail videos
    document.querySelectorAll('.gallery-thumb-video').forEach(v => v.pause());
  }
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Stop lightbox video
    lightboxVideo.pause();
    lightboxVideo.currentTime = 0;
    lightboxVideo.style.display = 'none';
    lightboxImage.style.display = 'none';
    
    // Resume thumbnail video previews
    document.querySelectorAll('.gallery-thumb-video').forEach(v => {
      v.currentTime = 0;
      v.play().catch(() => {});
    });
  }
  
  function updateLightboxContent() {
    const item = galleryItems[currentIndex];
    if (!item) return;
    
    // Hide both first
    lightboxImage.style.display = 'none';
    lightboxVideo.style.display = 'none';
    
    if (item.type === 'video') {
      lightboxVideo.style.display = 'block';
      lightboxVideo.querySelector('source').src = item.src;
      lightboxVideo.load();
      // Auto-play video in lightbox
      lightboxVideo.play().catch(() => {});
    } else {
      lightboxImage.style.display = 'block';
      lightboxImage.src = item.src;
      lightboxImage.alt = item.caption;
    }
    
    lightboxCaption.textContent = item.caption;
    lightboxCounter.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
  }
  
  function nextItem() {
    if (galleryItems.length === 0) return;
    lightboxVideo.pause();
    currentIndex = (currentIndex + 1) % galleryItems.length;
    updateLightboxContent();
  }
  
  function prevItem() {
    if (galleryItems.length === 0) return;
    lightboxVideo.pause();
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightboxContent();
  }
  
  // Event listeners for gallery items
  document.querySelectorAll('.gallery-item').forEach((item, index) => {
    item.addEventListener('click', (e) => {
      // If clicking on video controls, don't open lightbox
      if (e.target.tagName === 'VIDEO') {
        e.stopPropagation();
        return;
      }
      openLightbox(index);
    });
  });
  
  // Lightbox controls
  lightboxClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });
  
  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    nextItem();
  });
  
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    prevItem();
  });
  
  // Close lightbox on overlay click
  document.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);
  
  // Prevent lightbox content click from closing
  document.querySelector('.lightbox-content').addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowRight':
        nextItem();
        break;
      case 'ArrowLeft':
        prevItem();
        break;
    }
  });
  
  // Swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true});
  
  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, {passive: true});
  
  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      nextItem();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      prevItem();
    }
  }
  
  // Auto-play thumbnail videos when visible
  const thumbVideos = document.querySelectorAll('.gallery-thumb-video');
  
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.3 });
    
    thumbVideos.forEach(video => videoObserver.observe(video));
  } else {
    // Fallback: play all thumbnails
    thumbVideos.forEach(v => v.play().catch(() => {}));
  }
  
  // ========== INTERSECTION OBSERVER FOR ANIMATIONS ==========
  const animatedElements = document.querySelectorAll('[data-animate]');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

    animatedElements.forEach(el => observer.observe(el));
  } else {
    animatedElements.forEach(el => el.classList.add('visible'));
  }

  // ========== MOBILE MENU TOGGLE ==========
  const toggle = document.getElementById('mobileToggle');
  const nav = document.querySelector('.main-nav');
  
  if (toggle && nav) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('nav-open');
      const isOpen = nav.classList.contains('nav-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
    
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ========== TOUCH INTERACTIONS FOR CARDS ==========
  const cards = document.querySelectorAll('.service-card, .contact-card');
  cards.forEach(card => {
    card.addEventListener('touchstart', function() {
      this.style.transform = 'translateY(-4px)';
    }, {passive: true});
    card.addEventListener('touchend', function() {
      this.style.transform = '';
    });
  });

  // ========== ACTIVE NAV LINK HIGHLIGHT ==========
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (pageYOffset >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }
  
  window.addEventListener('scroll', updateActiveLink, {passive: true});
  updateActiveLink();
});