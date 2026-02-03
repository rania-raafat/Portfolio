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
