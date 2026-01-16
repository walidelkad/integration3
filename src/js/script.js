// ============================================================================
// CHRISTIAN DIOR WEBSITE - JAVASCRIPT
// ============================================================================

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Animate SVG stroke on scroll
function setupStrokeAnimation() {
  const strokePath = document.querySelector('.stroke path');
  if (!strokePath) return;

  const pathLength = strokePath.getTotalLength();

  // Set up the starting position
  gsap.set(strokePath, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength
  });

  // Animate on scroll
  gsap.to(strokePath, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.stroke',
      start: 'top center',
      end: 'bottom center',
      scrub: 1
    }
  });
}

// Initialize the canvas eraser functionality
function initializeSketchCanvas() {
  const canvas = document.getElementById('sketch-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const img = document.getElementById('sketch-image');
  let isDrawing = false;

  // Set canvas size
  const container = canvas.parentElement;
  canvas.width = container.offsetWidth;
  canvas.height = (canvas.width / 800) * 600;

  // Draw the image on canvas
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  // Load the image
  if (img.complete) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  // Eraser functionality
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    erase(e);
  });

  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    erase(e);
  });

  // Touch support for mobile
  canvas.addEventListener('touchstart', (e) => {
    isDrawing = true;
    erase(e.touches[0]);
  });

  canvas.addEventListener('touchend', () => {
    isDrawing = false;
  });

  canvas.addEventListener('touchmove', (e) => {
    if (!isDrawing) return;
    erase(e.touches[0]);
  });

  function erase(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;

    // Create a larger eraser effect
    ctx.clearRect(x - 30, y - 30, 60, 60);
  }
}

// Smooth scroll to section
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Setup scroll animations
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.content-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
}

// Counter timer for the sketch challenge
function setupTimer() {
  const timerElement = document.querySelector('.timer');
  if (!timerElement) return;

  let seconds = 30;

  // Start a countdown when user scrolls to that section
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // You could add logic to start the timer here
        // For now, just display the initial time
      }
    });
  });

  const section = timerElement.closest('.your-dior-section');
  if (section) {
    observer.observe(section);
  }
}


/********************************/


// Animate sketch gallery images
function setupSketchesAnimation() {
  const sketches = document.querySelectorAll('.sketch-item');

  if (sketches.length === 0) return;

  gsap.to(sketches, {
    scrollTrigger: {
      trigger: '.sketches-gallery',
      start: 'top 70%',
      toggleActions: 'play none none reset'
    },
    opacity: 1,
    scale: 1,
    rotation: 0,
    duration: 2,
    stagger: {
      amount: 0.8,
      from: 'start'
    },
    ease: 'power3.out'
  });
}

function setupAnimation() {
  // Animate first diorimg (header image)
  const diorimg = document.querySelector('.diorimg');
  if (diorimg) {
    gsap.to(diorimg, {
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top 70%',
        toggleActions: 'play none none reset'
      },
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 1.5,
      ease: 'power3.out'
    });
  }

  // Animate second diorimg (2defoto.png)
  const dior2img = document.querySelector('.dior2img');
  if (dior2img) {
    gsap.to(dior2img, {
      scrollTrigger: {
        trigger: '.dior2img',
        start: 'top 95%',
        toggleActions: 'play none none reset'
      },
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 1.5,
      ease: 'power3.out'
    });
  }

  // Animate third diorimg (3defoto.png)
  const dior3img = document.querySelector('.dior3img');
  if (dior3img) {
    gsap.to(dior3img, {
      scrollTrigger: {
        trigger: '.dior3img',
        start: 'top 95%',
        toggleActions: 'play none none reset'
      },
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 1.5,
      ease: 'power3.out'
    });
  }
}




















// Initialize all interactions on page load
document.addEventListener('DOMContentLoaded', () => {
  setupStrokeAnimation();
  initializeSketchCanvas();
  setupSmoothScrolling();
  setupScrollAnimations();
  setupTimer();
  setupSketchesAnimation();
  setupAnimation();

  // Handle window resize for canvas
  window.addEventListener('resize', () => {
    const canvas = document.getElementById('sketch-canvas');
    if (canvas) {
      const container = canvas.parentElement;
      const newWidth = container.offsetWidth;
      const newHeight = (newWidth / 800) * 600;

      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        const ctx = canvas.getContext('2d');
        const img = document.getElementById('sketch-image');
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    }
  });

  console.log('Christian Dior Website - Initialized');
});

