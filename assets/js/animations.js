// Hero Section Page-Load Animations
// Triggers staggered fade-in and slide-up/scale-in animations on page load
// Uses setTimeout for precise timing control

document.addEventListener('DOMContentLoaded', () => {
  // Hero elements to animate
  const heroElements = [
    '.hero-section .col-lg-6:first-child > div',        // Greeting (stars + name)
    '.hero-section .col-lg-6:first-child h1',           // Heading (Frontend Developer)
    '.hero-section .col-lg-6:first-child > p',          // Description
    '.hero-section .col-lg-6:first-child > a',          // CTA button
    '.hero-section .col-lg-6:first-child .my-links',    // Social links
    '.hero-section .col-lg-6:last-child img:last-child', // Avatar image
    '.hero-section .col-lg-6:last-child img:first-child' // Rotating circle
  ];

  // First, hide all hero elements
  heroElements.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('hero-hidden');
    }
  });

  // Staggered animation delays (100-150ms between elements)
  const delays = [0, 100, 200, 300, 400, 500, 600];

  // Then animate them in sequence
  heroElements.forEach((selector, index) => {
    const element = document.querySelector(selector);
    if (element) {
      setTimeout(() => {
        element.classList.remove('hero-hidden');
        element.classList.add('hero-animate');
      }, delays[index] || 0);
    }
  });
});

// Scroll-based animations for boxes only (.ele and .swiper-slide)
// Uses Intersection Observer for performance-friendly detection
// Triggers fade-in and slide-up animations when individual boxes enter viewport
// Compatible with navbar smooth scroll

const boxes = document.querySelectorAll('.ele, .swiper-slide');

const observerOptions = {
  threshold: 0.1, // Trigger when 10% of box is visible
  rootMargin: '0px 0px -50px 0px' // Slight offset for better UX
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Add animate class to box for animation
      entry.target.classList.add('animate');
      // Stop observing once animated for performance
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all box elements
boxes.forEach(box => observer.observe(box));

// Note: Navbar clicks use smooth scroll, bringing sections into view
// Boxes animate as they enter viewport during scroll
