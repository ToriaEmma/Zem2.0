// Remove background color from images dynamically using canvas
function removeBackground(selector, keyColor = null, tolerance = 25) {
  const imgElement = document.querySelector(selector);
  if (!imgElement) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = imgElement.src;

  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Use top-left pixel if keyColor is not provided
    const targetR = keyColor ? keyColor[0] : data[0];
    const targetG = keyColor ? keyColor[1] : data[1];
    const targetB = keyColor ? keyColor[2] : data[2];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const diffR = Math.abs(r - targetR);
      const diffG = Math.abs(g - targetG);
      const diffB = Math.abs(b - targetB);

      if (diffR < tolerance && diffG < tolerance && diffB < tolerance) {
        data[i + 3] = 0; // set alpha to 0
      }
    }

    ctx.putImageData(imgData, 0, 0);
    imgElement.src = canvas.toDataURL();
    imgElement.style.opacity = "1"; // reveal cleanly
  };
}

// Key out navy blue background of the logo (mascot is already transparent PNG)
removeBackground(".nav-logo-img", [13, 47, 97], 25);

// Initialize GSAP positioning defaults
gsap.set(".mascot-container", { transformPerspective: 1000, xPercent: -50, yPercent: -46, x: 0, y: 0 });
gsap.set(".mascot-vibe-wrap", { transformPerspective: 1000, rotationZ: -2.0, transformOrigin: "bottom center" });
gsap.set(".mascot-img", { transformPerspective: 1000 });
gsap.set(".hero-bg-text-wrap", { xPercent: -50, yPercent: -50, x: 0, y: 0 });

// Animations de vibration désactivées — la voiture reste immobile au repos

// --- 2. INTERACTIVE MOUSE PARALLAX TILT ---
const mascotX = gsap.quickTo(".mascot-container", "x", { duration: 0.6, ease: "power2.out" });
const mascotY = gsap.quickTo(".mascot-container", "y", { duration: 0.6, ease: "power2.out" });

const textX = gsap.quickTo(".hero-bg-text-wrap", "x", { duration: 0.8, ease: "power2.out" });
const textY = gsap.quickTo(".hero-bg-text-wrap", "y", { duration: 0.8, ease: "power2.out" });

window.addEventListener("mousemove", (e) => {
  const normX = (e.clientX / window.innerWidth) * 2 - 1;
  const normY = (e.clientY / window.innerHeight) * 2 - 1;

  mascotX(normX * 30);
  mascotY(normY * 20);

  textX(-normX * 15);
  textY(-normY * 10);
});

// --- 3. INTERACTIVE TAB SELECTOR CARD ---
const tabs = document.querySelectorAll(".tab-item");
const tabCard = document.querySelector(".tab-card");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    if (tab.classList.contains("active")) return;

    document.querySelector(".tab-item.active").classList.remove("active");
    tab.classList.add("active");

    // Play card wobble micro-animation around the default 6deg tilt (desktop only)
    if (window.innerWidth > 576) {
      gsap.fromTo(tabCard,
        { rotate: "4deg", scale: 0.98 },
        { 
          rotate: "8deg", 
          scale: 1.02, 
          duration: 0.25, 
          ease: "back.out(2)", 
          onComplete: () => {
            gsap.to(tabCard, { rotate: "6deg", scale: 1, duration: 0.3, ease: "power2.out" });
          }
        }
      );
    }
  });
});

// Intro Animation Sequence on load
window.addEventListener("load", () => {

  gsap.from(".hero-card", {
    opacity: 0,
    scale: 0.95,
    duration: 1.2,
    ease: "power3.out"
  });

  gsap.from(".navbar", {
    y: -30,
    opacity: 0,
    duration: 0.8,
    delay: 0.4,
    ease: "power2.out"
  });

  gsap.from(".hero-bg-text-wrap", {
    yPercent: -40,
    opacity: 0,
    duration: 1,
    delay: 0.5,
    ease: "power3.out"
  });

  gsap.from(".mascot-container", {
    scale: 0.5,
    opacity: 0,
    duration: 1.2,
    delay: 0.6,
    ease: "back.out(1.5)"
  });

  gsap.from(".tab-card", {
    x: -50,
    opacity: 0,
    duration: 0.8,
    delay: 0.8,
    ease: "power2.out"
  });
});

// --- 4. FEATURES ACCORDION LOGIC ---
const accordionHeaders = document.querySelectorAll(".accordion-header");

accordionHeaders.forEach(header => {
  header.addEventListener("click", () => {
    const currentItem = header.parentElement;
    const isAlreadyActive = currentItem.classList.contains("active");

    // Close any open item
    document.querySelectorAll(".accordion-item.active").forEach(item => {
      item.classList.remove("active");
      const icon = item.querySelector(".accordion-header .icon");
      if (icon) icon.textContent = "+";
      const content = item.querySelector(".accordion-content");
      if (content) {
        gsap.to(content, { height: 0, opacity: 0, duration: 0.3, ease: "power2.out" });
      }
    });

    // If clicked item wasn't active, open it
    if (!isAlreadyActive) {
      currentItem.classList.add("active");
      const icon = currentItem.querySelector(".accordion-header .icon");
      if (icon) icon.textContent = "−";
      const content = currentItem.querySelector(".accordion-content");
      if (content) {
        content.style.height = "auto";
        const realHeight = content.clientHeight;
        content.style.height = "0px";
        
        gsap.to(content, { 
          height: realHeight, 
          opacity: 1, 
          duration: 0.4, 
          ease: "power2.out",
          onComplete: () => {
            content.style.height = "auto"; // Reset to auto after opening for responsiveness
          }
        });
      }
    }
  });
});

// Set active content height on load
window.addEventListener("load", () => {
  const activeContent = document.querySelector(".accordion-item.active .accordion-content");
  if (activeContent) {
    activeContent.style.height = "auto";
    activeContent.style.opacity = "0.95";
  }
});

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);


// --- 4b. HERO MASCOT 3D SCROLL ANIMATION (Driving & Bumping forward) ---
const drivingTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: ".hero-card",
    start: "top top",
    end: "bottom top",
    scrub: 0.5
  }
});

drivingTimeline
  .to(".mascot-img", { scale: 1.03, y: "+=5", rotationZ: 1.2, rotationX: 1, rotationY: 1.5, duration: 0.1 })
  .to(".mascot-img", { scale: 1.06, y: "-=5", rotationZ: -1.2, rotationX: 2, rotationY: 3, duration: 0.1 })
  .to(".mascot-img", { scale: 1.09, y: "+=4", rotationZ: 1, rotationX: 3, rotationY: 4.5, duration: 0.1 })
  .to(".mascot-img", { scale: 1.12, y: "-=4", rotationZ: -1, rotationX: 4, rotationY: 6, duration: 0.1 })
  .to(".mascot-img", { scale: 1.15, y: "+=5", rotationZ: 1.4, rotationX: 5, rotationY: 7.5, duration: 0.1 })
  .to(".mascot-img", { scale: 1.18, y: "-=5", rotationZ: -1.4, rotationX: 6, rotationY: 9, duration: 0.1 })
  .to(".mascot-img", { scale: 1.21, y: "+=4", rotationZ: 0.8, rotationX: 7, rotationY: 10.5, duration: 0.1 })
  .to(".mascot-img", { scale: 1.24, y: "-=4", rotationZ: -0.8, rotationX: 8, rotationY: 12, duration: 0.1 })
  .to(".mascot-img", { scale: 1.27, y: "+=5", rotationZ: 1.2, rotationX: 9, rotationY: 13.5, duration: 0.1 })
  .to(".mascot-img", { scale: 1.3, y: "-=5", rotationZ: 0, rotationX: 10, rotationY: 15, opacity: 0, duration: 0.1 });

// --- 4c. BACKGROUND PARALLAX & ELEMENTS FADE-OUT ON SCROLL ---
gsap.to(".hero-bg-text-wrap", {
  scrollTrigger: {
    trigger: ".hero-card",
    start: "top top",
    end: "bottom top",
    scrub: true
  },
  yPercent: -85, // Move up faster to create depth
  opacity: 0.05,
  ease: "none"
});

gsap.to(".bg-title-row", {
  scrollTrigger: {
    trigger: ".hero-card",
    start: "top top",
    end: "bottom 70%",
    scrub: true
  },
  opacity: 0,
  y: -35,
  ease: "none"
});

// --- 5. SCROLLTRIGGER REVEAL ANIMATIONS ---
gsap.from(".features-heading", {
  scrollTrigger: {
    trigger: ".features-section",
    start: "top 70%",
    toggleActions: "play none none none"
  },
  y: 50,
  opacity: 0,
  duration: 1,
  ease: "power3.out"
});

gsap.from(".accordion-item", {
  scrollTrigger: {
    trigger: ".accordion",
    start: "top 75%",
    toggleActions: "play none none none"
  },
  y: 30,
  opacity: 0,
  duration: 0.8,
  stagger: 0.2,
  ease: "power2.out",
  clearProps: "transform,y,opacity",
  onComplete: () => {
    const accordion = document.querySelector(".accordion");
    if (accordion) accordion.classList.add("ready");
  }
});

gsap.from(".illustration-card", {
  scrollTrigger: {
    trigger: ".illustration-card-wrap",
    start: "top 75%",
    toggleActions: "play none none none"
  },
  scale: 0.8,
  rotate: 15,
  opacity: 0,
  duration: 1.2,
  ease: "back.out(1.5)",
  clearProps: "transform,scale,rotate,opacity",
  onComplete: () => {
    const card = document.querySelector(".illustration-card");
    if (card) card.classList.add("ready");
  }
});

// Animate graph lines on scroll
gsap.from(".graph-line", {
  scrollTrigger: {
    trigger: ".illustration-card-wrap",
    start: "top 70%",
    toggleActions: "play none none none"
  },
  strokeDasharray: 500,
  strokeDashoffset: 500,
  duration: 1.5,
  delay: 0.4,
  ease: "power2.out"
});

gsap.from(".illustration-card circle", {
  scrollTrigger: {
    trigger: ".illustration-card-wrap",
    start: "top 70%",
    toggleActions: "play none none none"
  },
  scale: 0,
  transformOrigin: "center center",
  duration: 0.6,
  delay: 1.5,
  ease: "back.out(1.8)"
});

gsap.from(".features-description", {
  scrollTrigger: {
    trigger: ".features-description",
    start: "top 85%",
    toggleActions: "play none none none"
  },
  y: 30,
  opacity: 0,
  duration: 0.8,
  ease: "power2.out"
});

// --- 6. NUMBERS SECTION CAROUSEL LOGIC ---
const peSlides = document.querySelectorAll(".carousel-slide");
const pePrevBtn = document.querySelector(".prev-btn");
const peNextBtn = document.querySelector(".next-btn");
let currentPeSlide = 0;

function showPeSlide(index) {
  const currentSlide = document.querySelector(".carousel-slide.active");
  const targetSlide = document.querySelector(`.carousel-slide[data-slide="${index}"]`);
  
  if (currentSlide === targetSlide) return;

  // Fade out current slide
  gsap.to(currentSlide, {
    opacity: 0,
    y: -15,
    duration: 0.35,
    ease: "power2.inOut",
    onComplete: () => {
      currentSlide.classList.remove("active");
      
      // Animate target slide in
      targetSlide.classList.add("active");
      gsap.fromTo(targetSlide,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
      );
      
      // Animate the cards deck group inside the target slide
      const cardDeck = targetSlide.querySelector(".stat-cards-wrapper");
      if (cardDeck) {
        gsap.fromTo(cardDeck,
          { scale: 0.88, opacity: 0, y: 10 },
          { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.3)" }
        );
      }
    }
  });

  currentPeSlide = index;
}

if (pePrevBtn && peNextBtn) {
  pePrevBtn.addEventListener("click", () => {
    let target = currentPeSlide - 1;
    if (target < 0) target = peSlides.length - 1;
    showPeSlide(target);
  });

  peNextBtn.addEventListener("click", () => {
    let target = (currentPeSlide + 1) % peSlides.length;
    showPeSlide(target);
  });
}

// ScrollTrigger for Numbers section elements
gsap.from(".stats-carousel-card", {
  scrollTrigger: {
    trigger: ".numbers-section",
    start: "top 70%",
    toggleActions: "play none none none"
  },
  x: -50,
  opacity: 0,
  duration: 1,
  ease: "power3.out"
});

gsap.from(".accent-wavy-card", {
  scrollTrigger: {
    trigger: ".numbers-section",
    start: "top 70%",
    toggleActions: "play none none none"
  },
  x: 50,
  opacity: 0,
  duration: 1,
  ease: "power3.out"
});

gsap.from(".numbers-title", {
  scrollTrigger: {
    trigger: ".numbers-header-row",
    start: "top 85%",
    toggleActions: "play none none none"
  },
  y: 40,
  opacity: 0,
  duration: 0.8,
  ease: "power2.out"
});

gsap.from(".numbers-description", {
  scrollTrigger: {
    trigger: ".numbers-header-row",
    start: "top 85%",
    toggleActions: "play none none none"
  },
  y: 30,
  opacity: 0,
  duration: 0.8,
  delay: 0.2,
  ease: "power2.out"
});

// ScrollTrigger entrance animation for the Footer
gsap.from(".footer-card", {
  scrollTrigger: {
    trigger: ".footer",
    start: "top 80%",
    toggleActions: "play none none none"
  },
  y: 50,
  opacity: 0,
  duration: 1,
  ease: "power3.out"
});

gsap.from(".footer-brand-logo", {
  scrollTrigger: {
    trigger: ".footer-main",
    start: "top 85%",
    toggleActions: "play none none none"
  },
  x: -50,
  opacity: 0,
  duration: 0.8,
  ease: "power3.out"
});

gsap.from(".footer-links-column", {
  scrollTrigger: {
    trigger: ".footer-main",
    start: "top 85%",
    toggleActions: "play none none none"
  },
  y: 30,
  opacity: 0,
  duration: 0.6,
  stagger: 0.15,
  ease: "power2.out"
});

// --- 6. FAQ ACCORDION & LOAD MORE LOGIC ---
const faqTriggers = document.querySelectorAll(".faq-trigger");
faqTriggers.forEach(trigger => {
  trigger.addEventListener("click", () => {
    const item = trigger.parentNode;
    const content = item.querySelector(".faq-content");
    const isActive = item.classList.contains("active");
    
    // Close other active items
    document.querySelectorAll(".faq-item.active").forEach(activeItem => {
      if (activeItem !== item) {
        activeItem.classList.remove("active");
        activeItem.querySelector(".faq-content").style.maxHeight = null;
      }
    });

    // Toggle current clicked item
    if (isActive) {
      item.classList.remove("active");
      content.style.maxHeight = null;
    } else {
      item.classList.add("active");
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});

const loadMoreBtn = document.querySelector(".faq-load-more-btn");
const hiddenFaqItems = document.querySelectorAll(".faq-hidden-item");

if (loadMoreBtn && hiddenFaqItems.length > 0) {
  loadMoreBtn.addEventListener("click", () => {
    const isShowing = loadMoreBtn.classList.contains("expanded");
    
    if (isShowing) {
      // Hide extra items
      hiddenFaqItems.forEach(item => {
        item.classList.remove("show");
        item.classList.remove("active");
        const content = item.querySelector(".faq-content");
        if (content) content.style.maxHeight = null;
      });
      loadMoreBtn.textContent = "Voir plus de questions";
      loadMoreBtn.classList.remove("expanded");
    } else {
      // Show extra items
      hiddenFaqItems.forEach(item => {
        item.classList.add("show");
      });
      loadMoreBtn.textContent = "Voir moins de questions";
      loadMoreBtn.classList.add("expanded");
    }
  });
}

// =============================================
// GSAP — Section "Comment ça marche ?" — Animation Premium
// =============================================
(function initStepsAnimation() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // ── 1. Titre : chaque mot arrive avec un décalage élégant ────────────────
  var headingEl = document.querySelector('.steps-heading');
  if (headingEl) {
    // Wrap each word in a span for individual animation
    var words = headingEl.innerHTML.split(/(\s+)/);
    // We use clipPath on the whole heading instead for cleaner result
    gsap.fromTo('.steps-heading', {
      clipPath: 'inset(0 100% 0 0)',
      opacity: 1
    }, {
      scrollTrigger: {
        trigger: '.steps-section',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.1,
      ease: 'power4.inOut'
    });
  }

  gsap.fromTo('.steps-subheading',
    { y: 30, opacity: 0 },
    {
      scrollTrigger: {
        trigger: '.steps-section',
        start: 'top 76%',
        toggleActions: 'play none none none'
      },
      y: 0,
      opacity: 1,
      duration: 0.9,
      delay: 0.5,
      ease: 'power3.out'
    }
  );

  // ── 2. Cards : révélation par clip-path + légère élévation ────────────────
  var stepCards = gsap.utils.toArray('.step-card');

  stepCards.forEach(function(card, i) {
    var isLeft = card.classList.contains('num-left');

    // Card : clip-path reveal depuis le côté + scale subtil
    gsap.fromTo(card,
      {
        clipPath: isLeft ? 'inset(0 0 0 100% round 24px)' : 'inset(0 100% 0 0 round 24px)',
        scale: 0.96,
        opacity: 0
      },
      {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        clipPath: 'inset(0 0% 0 0% round 24px)',
        scale: 1,
        opacity: 1,
        duration: 0.95,
        delay: i * 0.08,
        ease: 'expo.out',
        clearProps: 'clipPath,scale'
      }
    );

    // Chiffre géant : arrive en montant et reste coupé par le bas de la carte (y:140 = translateY CSS)
    var numEl = card.querySelector('.step-giant-number');
    if (numEl) {
      var isMobile = window.innerWidth <= 576;
      var startY = isMobile ? 105 : 170;
      var endY = isMobile ? 55 : 110;

      gsap.set(numEl, { y: startY, opacity: 0 });
      gsap.to(numEl, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        y: endY,
        opacity: 1,
        duration: 1.2,
        delay: i * 0.08 + 0.3,
        ease: 'power4.out'
      });
    }

    // Titre du step
    var titleEl = card.querySelector('.step-title');
    if (titleEl) {
      gsap.fromTo(titleEl,
        { y: 18, opacity: 0 },
        {
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
          y: 0, opacity: 1,
          duration: 0.7,
          delay: i * 0.08 + 0.42,
          ease: 'power2.out'
        }
      );
    }

    // Description
    var descEl = card.querySelector('.step-desc');
    if (descEl) {
      gsap.fromTo(descEl,
        { y: 18, opacity: 0 },
        {
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
          y: 0, opacity: 1,
          duration: 0.7,
          delay: i * 0.08 + 0.54,
          ease: 'power2.out'
        }
      );
    }
  });

  // ── 3. Parallax doux sur les chiffres au scroll ────────────────────────────
  // Parallax désactivé — les chiffres restent fixes à y:140 pour l'effet coupé

  // ── 4. Hover : élévation propre sans ombre colorée ────────────────────────
  stepCards.forEach(function(card) {
    card.addEventListener('mouseenter', function() {
      gsap.to(card, {
        y: -7,
        scale: 1.015,
        boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
        duration: 0.35,
        ease: 'power2.out'
      });
    });
    card.addEventListener('mouseleave', function() {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: '0 0px 0px rgba(0,0,0,0)',
        duration: 0.45,
        ease: 'power2.inOut'
      });
    });
  });

})();
