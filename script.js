// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'initial';
    });
}

// Close menu when link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'initial';
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// --- Scroll Reveal Animations (Trigger Every Time) ---
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        } else {
            // Remove the active class when element leaves viewport
            // This ensures it animates again when scrolling back
            entry.target.classList.remove('active');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe all elements with reveal classes
function initReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    revealElements.forEach(el => revealObserver.observe(el));
}

// Hero Slideshow
const heroImages = document.querySelectorAll('.hero-img');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;

function nextSlide() {
    if (heroImages.length === 0) return;
    heroImages[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % heroImages.length;
    heroImages[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

if (heroImages.length > 0) {
    setInterval(nextSlide, 5000);
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        heroImages[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = index;
        heroImages[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    });
});

// Initialize reveal on load
document.addEventListener('DOMContentLoaded', initReveal);
// Also run it immediately in case DOMContentLoaded already fired
initReveal();
