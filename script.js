document.addEventListener('DOMContentLoaded', function() {

  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightbox-image');
  var lightboxVideo = document.getElementById('lightbox-video');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxCounter = document.getElementById('lightbox-counter');
  var lightboxClose = document.querySelector('.lightbox-close');
  var lightboxPrev = document.querySelector('.lightbox-prev');
  var lightboxNext = document.querySelector('.lightbox-next');
  
  var galleryItems = [];
  var currentIndex = 0;
  
  function collectGalleryItems() {
    galleryItems = [];
    var items = document.querySelectorAll('.gallery-item');
    items.forEach(function(item, index) {
      var type = item.dataset.galleryType;
      var captionEl = item.querySelector('.gallery-caption');
      var caption = captionEl ? captionEl.textContent : '';
      
      if (type === 'video') {
        var video = item.querySelector('video');
        var sourceEl = video ? video.querySelector('source') : null;
        var videoSrc = sourceEl ? sourceEl.src : '';
        galleryItems.push({
          index: index,
          element: item,
          type: 'video',
          src: videoSrc,
          caption: caption
        });
      } else {
        var img = item.querySelector('img');
        var imgSrc = img ? img.src : '';
        galleryItems.push({
          index: index,
          element: item,
          type: 'image',
          src: imgSrc,
          caption: caption
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
    
    var thumbVids = document.querySelectorAll('.gallery-thumb-video');
    thumbVids.forEach(function(v) { v.pause(); });
  }
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    lightboxVideo.pause();
    lightboxVideo.currentTime = 0;
    lightboxVideo.style.display = 'none';
    lightboxImage.style.display = 'none';
    
    var thumbVids = document.querySelectorAll('.gallery-thumb-video');
    thumbVids.forEach(function(v) {
      v.currentTime = 0;
      v.play().catch(function() {});
    });
  }
  
  function updateLightboxContent() {
    var item = galleryItems[currentIndex];
    if (!item) return;
    
    lightboxImage.style.display = 'none';
    lightboxVideo.style.display = 'none';
    
    if (item.type === 'video') {
      lightboxVideo.style.display = 'block';
      var sourceEl = lightboxVideo.querySelector('source');
      sourceEl.src = item.src;
      lightboxVideo.load();
      lightboxVideo.play().catch(function() {});
    } else {
      lightboxImage.style.display = 'block';
      lightboxImage.src = item.src;
      lightboxImage.alt = item.caption;
    }
    
    lightboxCaption.textContent = item.caption;
    lightboxCounter.textContent = (currentIndex + 1) + ' / ' + galleryItems.length;
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
  
  var allGalleryItems = document.querySelectorAll('.gallery-item');
  allGalleryItems.forEach(function(item, index) {
    item.addEventListener('click', function(e) {
      if (e.target.tagName === 'VIDEO') {
        e.stopPropagation();
        return;
      }
      openLightbox(index);
    });
  });
  
  lightboxClose.addEventListener('click', function(e) {
    e.stopPropagation();
    closeLightbox();
  });
  
  lightboxNext.addEventListener('click', function(e) {
    e.stopPropagation();
    nextItem();
  });
  
  lightboxPrev.addEventListener('click', function(e) {
    e.stopPropagation();
    prevItem();
  });
  
  document.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);
  
  document.querySelector('.lightbox-content').addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextItem();
    if (e.key === 'ArrowLeft') prevItem();
  });
  
  var touchStartX = 0;
  var touchEndX = 0;
  
  lightbox.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true});
  
  lightbox.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, {passive: true});
  
  function handleSwipe() {
    var threshold = 50;
    if (touchEndX < touchStartX - threshold) nextItem();
    if (touchEndX > touchStartX + threshold) prevItem();
  }
  
  var thumbVideos = document.querySelectorAll('.gallery-thumb-video');
  
  if ('IntersectionObserver' in window) {
    var videoObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(function() {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.3 });
    
    thumbVideos.forEach(function(video) { videoObserver.observe(video); });
  } else {
    thumbVideos.forEach(function(v) { v.play().catch(function() {}); });
  }
  
  var animatedElements = document.querySelectorAll('[data-animate]');
  
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

    animatedElements.forEach(function(el) { observer.observe(el); });
  } else {
    animatedElements.forEach(function(el) { el.classList.add('visible'); });
  }

  var toggle = document.getElementById('mobileToggle');
  var nav = document.querySelector('.main-nav');
  
  if (toggle && nav) {
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      nav.classList.toggle('nav-open');
      var isOpen = nav.classList.contains('nav-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
    
    var navLinks = nav.querySelectorAll('.nav-link');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        nav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var cards = document.querySelectorAll('.service-card, .contact-card');
  cards.forEach(function(card) {
    card.addEventListener('touchstart', function() {
      this.style.transform = 'translateY(-4px)';
    }, {passive: true});
    card.addEventListener('touchend', function() {
      this.style.transform = '';
    });
  });

  var sections = document.querySelectorAll('section[id]');
  var allNavLinks = document.querySelectorAll('.nav-link');
  
  function updateActiveLink() {
    var current = '';
    sections.forEach(function(section) {
      var sectionTop = section.offsetTop - 100;
      if (pageYOffset >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    allNavLinks.forEach(function(link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }
  
  window.addEventListener('scroll', updateActiveLink, {passive: true});
  updateActiveLink();
});