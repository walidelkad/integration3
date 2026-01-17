import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


/*****************************/
// Animate SVG stroke on scroll
function setupStrokeAnimation() {
  const strokes = ['.stroke', '.stroke2', '.stroke3', '.stroke4', '.stroke5', '.stroke6'];

  strokes.forEach((selector) => {
    const strokeSVG = document.querySelector(selector);
    const strokeLine = strokeSVG?.querySelector('line');

    if (!strokeLine) {
      console.log(`Stroke line not found for ${selector}`);
      return;
    }

    // Calculate line length
    const x1 = parseFloat(strokeLine.getAttribute('x1'));
    const y1 = parseFloat(strokeLine.getAttribute('y1'));
    const x2 = parseFloat(strokeLine.getAttribute('x2'));
    const y2 = parseFloat(strokeLine.getAttribute('y2'));
    const lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    console.log(`Line length for ${selector}:`, lineLength);

    // Set up the starting position (draw from highest point to lowest point)
    gsap.set(strokeLine, {
      strokeDasharray: lineLength,
      strokeDashoffset: -lineLength
    });

    // Animate on scroll
    gsap.to(strokeLine, {
      strokeDashoffset: 0,
      duration: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: strokeSVG,
        start: 'top 100%',
        end: 'bottom 20%',
        scrub: 1,
      }
    });
  });
}
/*****************************/

// Initialize the sketchbook canvas for drawing
function initializeSketchbookCanvas() {
  const canvas = document.getElementById('sketchbook-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const img = document.getElementById('sketchbook-image');
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentTool = 'pencil'; // 'pencil' or 'eraser'

  // History for undo/redo - store only the drawing layer
  let history = [];
  let historyStep = -1;

  // Create separate canvases for background and drawing
  const bgCanvas = document.createElement('canvas');
  const bgCtx = bgCanvas.getContext('2d');
  const drawingCanvas = document.createElement('canvas');
  const drawingCtx = drawingCanvas.getContext('2d');

  // Set canvas sizes
  const container = canvas.parentElement;
  const computedStyle = getComputedStyle(canvas);
  const width = parseInt(computedStyle.width);
  const height = (width / 1000) * 700;

  canvas.width = width;
  canvas.height = height;
  bgCanvas.width = width;
  bgCanvas.height = height;
  drawingCanvas.width = width;
  drawingCanvas.height = height;

  // Draw the background image on separate canvas (permanent)
  const drawBackground = () => {
    bgCtx.drawImage(img, 0, 0, bgCanvas.width, bgCanvas.height);
  };

  // Composite background with drawing layer
  const redrawCanvas = () => {
    // Clear main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw background first
    ctx.drawImage(bgCanvas, 0, 0);
    // Draw the drawing layer on top
    ctx.drawImage(drawingCanvas, 0, 0);
  };

  img.onload = () => {
    drawBackground();
    redrawCanvas();
    if (history.length === 0) {
      saveState();
    }
  };

  if (img.complete) {
    drawBackground();
    redrawCanvas();
    if (history.length === 0) {
      saveState();
    }
  }

  // Configure drawing style
  function setDrawMode() {
    if (currentTool === 'pencil') {
      drawingCtx.globalCompositeOperation = 'source-over';
      drawingCtx.strokeStyle = '#000000b7';
      drawingCtx.lineWidth = 2;
    } else if (currentTool === 'eraser') {
      drawingCtx.globalCompositeOperation = 'destination-out';
      drawingCtx.strokeStyle = 'rgba(0,0,0,1)';
      drawingCtx.lineWidth = 20;
    }
    drawingCtx.lineCap = 'round';
    drawingCtx.lineJoin = 'round';
  }

  setDrawMode();

  function saveState() {
    historyStep++;
    // Remove any states after current step (when drawing after undo)
    if (historyStep < history.length) {
      history.length = historyStep;
    }
    // Save only the drawing layer
    history.push(drawingCanvas.toDataURL());
    updateButtons();
  }

  function updateButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    if (undoBtn) undoBtn.disabled = historyStep <= 0;
    if (redoBtn) redoBtn.disabled = historyStep >= history.length - 1;
  }

  function undo() {
    if (historyStep > 0) {
      historyStep--;
      const imgData = new Image();
      imgData.src = history[historyStep];
      imgData.onload = () => {
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        drawingCtx.globalCompositeOperation = 'source-over';
        drawingCtx.drawImage(imgData, 0, 0);
        setDrawMode();
        redrawCanvas();
        updateButtons();
      };
    }
  }

  function redo() {
    if (historyStep < history.length - 1) {
      historyStep++;
      const imgData = new Image();
      imgData.src = history[historyStep];
      imgData.onload = () => {
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        drawingCtx.globalCompositeOperation = 'source-over';
        drawingCtx.drawImage(imgData, 0, 0);
        setDrawMode();
        redrawCanvas();
        updateButtons();
      };
    }
  }

  function startDrawing(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;

    // Only allow drawing on the right half of the canvas
    if (x > canvas.width / 2) {
      isDrawing = true;
      lastX = x;
      lastY = y;
    }
  }

  function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;

    // Only draw on the right half of the canvas
    if (x > canvas.width / 2) {
      drawingCtx.beginPath();
      drawingCtx.moveTo(lastX, lastY);
      drawingCtx.lineTo(x, y);
      drawingCtx.stroke();

      // Redraw the composite
      redrawCanvas();

      lastX = x;
      lastY = y;
    } else {
      // Stop drawing if moved to left side
      isDrawing = false;
    }
  }

  function stopDrawing() {
    if (isDrawing) {
      isDrawing = false;
      saveState();
    }
  }

  // Mouse events
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  // Touch events for mobile
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e.touches[0]);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e.touches[0]);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopDrawing();
  }, { passive: false });

  canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    stopDrawing();
  }, { passive: false });

  // Button event listeners
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  const downloadBtn = document.getElementById('download-btn');
  const pencilTool = document.getElementById('pencil-tool');
  const eraserTool = document.getElementById('eraser-tool');

  if (undoBtn) undoBtn.addEventListener('click', undo);
  if (redoBtn) redoBtn.addEventListener('click', redo);

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      // Create a temporary canvas with both layers
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');

      // Draw background and drawing layer
      tempCtx.drawImage(bgCanvas, 0, 0);
      tempCtx.drawImage(drawingCanvas, 0, 0);

      // Convert to PNG and download
      tempCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dior-sketch-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    });
  }

  // Tool selection
  if (pencilTool) {
    pencilTool.addEventListener('click', () => {
      currentTool = 'pencil';
      setDrawMode();
      pencilTool.classList.add('active');
      eraserTool.classList.remove('active');
    });
  }

  if (eraserTool) {
    eraserTool.addEventListener('click', () => {
      currentTool = 'eraser';
      setDrawMode();
      eraserTool.classList.add('active');
      pencilTool.classList.remove('active');
    });
  }

  updateButtons();
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

// Fade in all sections on scroll
function setupSectionFadeIn() {
  const sections = document.querySelectorAll('section, .hero-content, .svg-container');

  sections.forEach((section) => {
    // Set initial state
    gsap.set(section, {
      opacity: 0
    });

    // Animate
    gsap.to(section, {
      opacity: 1,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 90%',
        toggleActions: 'play none none none',
        once: true
      }
    });
  });
}

// Quote writing animation
function setupQuoteWriting() {
  const quoteBlock = document.querySelector('.quote-block');
  const quotePen = document.querySelector('.quote-pen');
  const quoteText = document.querySelector('.quote-text');

  if (!quoteBlock || !quotePen || !quoteText) return;

  // Split text into individual characters
  const textContent = quoteText.innerHTML;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = textContent;

  // Function to wrap each character in a span
  function wrapCharacters(element) {
    const nodes = Array.from(element.childNodes);
    element.innerHTML = '';

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Split text into characters
        const chars = node.textContent.split('');
        chars.forEach(char => {
          const span = document.createElement('span');
          span.textContent = char;
          span.className = 'char';
          span.style.opacity = '0.15';
          element.appendChild(span);
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Clone the element and wrap its contents
        const clone = node.cloneNode(false);
        wrapCharacters(node);
        while (node.firstChild) {
          clone.appendChild(node.firstChild);
        }
        element.appendChild(clone);
      }
    });
  }

  wrapCharacters(quoteText);

  // Hold-to-write functionality
  let animation = null;
  let isPressed = false;

  const startWriting = () => {
    if (isPressed) return;
    isPressed = true;

    const chars = quoteText.querySelectorAll('.char');

    animation = gsap.to(chars, {
      opacity: 1,
      duration: 0.05,
      stagger: {
        amount: 10,
        from: 'start'
      },
      ease: 'none',
      paused: false
    });
  };

  const stopWriting = () => {
    isPressed = false;
    if (animation) {
      animation.pause();
    }
  };

  const resumeWriting = () => {
    if (isPressed) return;
    isPressed = true;
    if (animation) {
      animation.resume();
    }
  };

  // Mouse events
  quotePen.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (!animation) {
      startWriting();
    } else {
      resumeWriting();
    }
  });

  quotePen.addEventListener('mouseup', (e) => {
    e.preventDefault();
    stopWriting();
  });

  quotePen.addEventListener('mouseleave', (e) => {
    e.preventDefault();
    stopWriting();
  });

  // Touch events for mobile
  quotePen.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!animation) {
      startWriting();
    } else {
      resumeWriting();
    }
  }, { passive: false });

  quotePen.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.stopPropagation();
    stopWriting();
  }, { passive: false });

  quotePen.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    e.stopPropagation();
    stopWriting();
  }, { passive: false });

  // Prevent context menu on long press
  quotePen.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
}

// Animate chapter reveals as stroke draws
function setupChapterReveal() {
  const strokeWrapper = document.querySelector('.stroke-wrapper');
  const chapterItems = document.querySelectorAll('.chapter-item');

  if (!strokeWrapper || chapterItems.length === 0) return;

  // Animate each chapter to fade in as the stroke passes
  gsap.to(chapterItems, {
    opacity: 1,
    duration: 0.3,
    stagger: {
      amount: 2.5,
      from: 'start'
    },
    scrollTrigger: {
      trigger: strokeWrapper,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1
    }
  });
}


// Initialize all interactions on page load
document.addEventListener('DOMContentLoaded', () => {
  setupStrokeAnimation();
  initializeSketchCanvas();
  initializeSketchbookCanvas();
  setupSmoothScrolling();
  setupScrollAnimations();
  setupTimer();
  setupSketchesAnimation();
  setupAnimation();
  setupSectionFadeIn();
  setupQuoteWriting();
  setupChapterReveal();
  setupChapterNavigation();

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

function setupChapterNavigation() {
  const chapterLinks = document.querySelectorAll('.chapter-title');

  chapterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
