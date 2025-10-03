const sidebar = document.getElementById("sidebar");
const openBtn = document.getElementById("openSidebar");
const closeBtn = document.getElementById("closeSidebar");

openBtn.onclick = () => {
  sidebar.style.width = "250px";
};

closeBtn.onclick = () => {
  sidebar.style.width = "0";
};

document.querySelectorAll("#sidebar .nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    sidebar.style.width = "0";
  });
});

const allLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let fromTop = window.scrollY + 70;

  allLinks.forEach((link) => {
    let section = document.querySelector(link.getAttribute("href"));
    if (section) {
      if (
        section.offsetTop <= fromTop &&
        section.offsetTop + section.offsetHeight > fromTop
      ) {
        allLinks.forEach((l) => l.classList.remove("active"));

        document
          .querySelectorAll(`.nav-link[href="${link.getAttribute("href")}"]`)
          .forEach((l) => l.classList.add("active"));
      }
    }
  });
});
const head = document.querySelector(".head");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    head.classList.add("scrolled");
  } else {
    head.classList.remove("scrolled");
  }
});

const swiper = new Swiper(".swiper", {
  slidesPerView: 1, // default = 3 slides
  spaceBetween: 30,
  loop: true, // Makes it infinite loop
  centeredSlides: true,
  speed: 1200,
  threshold: 15,
  keyboard: {
    enabled: true,
    onlyInViewport: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true, // Makes dots clickable
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    0: { slidesPerView: 1 }, // mobile
    992: { slidesPerView: 3 }, // laptop and above
  },
  on: {
    init: function () {
      const self = this;

      function setEqualHeight() {
        self.slides.forEach((slide) => (slide.style.height = "auto"));

        if (window.innerWidth < 768) return;

        let maxHeight = 0;
        self.slides.forEach((slide) => {
          maxHeight = Math.max(maxHeight, slide.offsetHeight);
        });

        self.slides.forEach((slide) => {
          slide.style.height = maxHeight + "px";
        });
      }

      setEqualHeight();

      window.addEventListener("load", setEqualHeight);
      window.addEventListener("resize", setEqualHeight);
    },
    slideChange: function () {
      document.querySelectorAll(".swiper-pagination-bullet").forEach((b) => {
        b.classList.remove("pulse");
      });

      const active = document.querySelector(".swiper-pagination-bullet-active");
      if (active) {
        void active.offsetWidth;
        active.classList.add("pulse");
      }
    },
  },
});
const modal = document.getElementById("photoModal");
const modalImg = document.getElementById("modalImg");
const images = document.querySelectorAll(".zoom-img");

images.forEach((img) => {
  img.addEventListener("click", () => {
    modal.style.display = "flex";
    modalImg.src = img.src;
  });
});

modal.addEventListener("click", () => {
  modal.style.display = "none";
});

(function () {
  emailjs.init("SYJPP7fqvh_qjZYDo");
})();

document
  .getElementById("contactForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const status = document.getElementById("formStatus");
    status.style.color = "#555";
    status.innerText = "📨 Sending your message...";

    const params = {
      from_name: document.getElementById("name").value.trim(),
      from_email: document.getElementById("email").value.trim(),
      message: document.getElementById("message").value.trim(),
    };

    if (!params.from_name || !params.from_email || !params.message) {
      status.style.color = "red";
      status.innerText = "⚠️ Please fill in all fields.";
      return;
    }

    try {
      await emailjs.send("service_o674yce", "template_49yfd8m", params);

      status.style.color = "green";
      status.innerText = "✅ Message sent successfully!";
      document.getElementById("contactForm").reset();
    } catch (error) {
      console.error("EmailJS error:", error);
      status.style.color = "red";
      status.innerText = "❌ Failed to send. Please try again later.";
    }
  });
