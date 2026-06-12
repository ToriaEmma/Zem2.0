// Cookie Banner
function acceptCookies() {
    document.getElementById('cookieBanner').classList.add('hidden');
    localStorage.setItem('cookiesAccepted', 'true');
}

function declineCookies() {
    document.getElementById('cookieBanner').classList.add('hidden');
    localStorage.setItem('cookiesAccepted', 'false');
}

// Check if cookies were already accepted
window.addEventListener('DOMContentLoaded', () => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (cookiesAccepted) {
        document.getElementById('cookieBanner').classList.add('hidden');
    }
});

// Carousel Functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;

// Auto-advance carousel every 5 seconds
let autoSlideInterval = setInterval(nextSlide, 5000);

function showSlide(index) {
    // Remove active class from all slides and indicators
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    indicators.forEach(indicator => {
        indicator.classList.remove('active');
    });

    // Add active class to current slide and indicator
    slides[index].classList.add('active');
    indicators[index].classList.add('active');

    currentSlide = index;
}

function nextSlide() {
    let next = (currentSlide + 1) % totalSlides;
    showSlide(next);
}

function prevSlide() {
    let prev = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(prev);
}

function changeSlide(direction) {
    // Reset auto-advance timer
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextSlide, 5000);

    if (direction === 1) {
        nextSlide();
    } else {
        prevSlide();
    }
}

function goToSlide(index) {
    // Reset auto-advance timer
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextSlide, 5000);
    
    showSlide(index);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
window.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .news-card, .stat-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Mobile menu toggle (if needed later)
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Log page load
console.log('Zem Transport - Site chargé avec succès! 🚌');
console.log('Carrousel automatique activé - change toutes les 5 secondes');
