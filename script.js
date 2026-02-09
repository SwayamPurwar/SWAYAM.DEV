gsap.registerPlugin(ScrollTrigger);

gsap.set(".cv-wrapper", { opacity: 0 });
// 1. CURSOR ANIMATION
const cursor = document.getElementById("cursor");
const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3.out" });
const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3.out" });

if (window.matchMedia("(pointer: fine)").matches) {
  document.addEventListener("mousemove", (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
  });
  document.querySelectorAll(".mouse-hover").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("hovered"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("hovered"));
  });
}

// 2. MASTER ANIMATION TIMELINE (Loader)

// --- NEW LOGIC START ---
// Check if the page is being reloaded
const navEntry = performance.getEntriesByType("navigation")[0];
// Fallback for older browsers: performance.navigation.type === 1 means RELOAD
const isReload = (navEntry && navEntry.type === 'reload') || 
                 (window.performance && window.performance.navigation && window.performance.navigation.type === 1);

// Logic: If visited BEFORE and NOT reloading -> Skip. 
// If Reloading -> Play Animation (treat as new).
if (sessionStorage.getItem("visited") === "true" && !isReload) {
  
  // CASE A: VISITED & NAVIGATING BACK -> HIDE LOADER
  gsap.set(".preloader-container", { display: "none" });
  
  // Ensure Hero content is visible
  gsap.set(".hero-text", { y: "0%", opacity: 1 });
  gsap.set(".hero-sub", { opacity: 1, y: 0 });
  
  // Show CV button immediately
  gsap.set(".cv-wrapper", { opacity: 1 });
  
  // Allow scrolling
  document.body.style.overflow = "";

} else {
  
  // CASE B: FIRST VISIT OR RELOAD -> PLAY ANIMATION
  sessionStorage.setItem("visited", "true");
  
  document.body.style.overflow = "hidden";
  window.scrollTo(0, 0);

  const masterTl = gsap.timeline({
    onComplete: () => {
      document.body.style.overflow = "";
    },
  });

  // Word Cycle
  masterTl.to(
    ".loader-words",
    {
      y: -200,
      duration: 2.5,
      ease: "steps(4)",
    },
    0,
  );

  // Counter 0-100
  const counterObj = { value: 0 };
  masterTl.to(
    counterObj,
    {
      value: 100,
      duration: 2.5,
      ease: "power3.inOut",
      onUpdate: () =>
        (document.querySelector(".counter").textContent = Math.floor(
          counterObj.value,
        )),
    },
    0,
  );

  // Exit Loader & Reveal Hero
  masterTl.to(".loader-content", { opacity: 0, duration: 0.5 });
  masterTl.to(
    ".blind",
    {
      scaleY: 0,
      transformOrigin: "top",
      duration: 1.2,
      stagger: 0.08,
      ease: "power4.inOut",
    },
    "-=0.3",
  );
  masterTl.to(
    ".hero-text",
    { y: "0%", duration: 1.2, stagger: 0.1, ease: "power4.out" },
    "-=0.8",
  );
  masterTl.to(
    ".hero-sub",
    { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
    "-=0.8",
  );
  
  // Reveal CV Button at the end
  masterTl.to(
    ".cv-wrapper",
    {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
    },
    "-=0.5",
  );
}
// --- NEW LOGIC END ---


// 3. SCROLL ANIMATIONS

// Hero Parallax
gsap.to("#hero", {
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: 1,
  },
  y: 100,
  opacity: 0.5,
  ease: "none",
});

// Work Projects Reveal
gsap.utils.toArray(".project").forEach((project) => {
  gsap.from(project, {
    scrollTrigger: { trigger: project, start: "top 90%" },
    y: 50,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
  });
});

// About Image Reveal
let imgTl = gsap.timeline({
  scrollTrigger: { trigger: ".about-img", start: "top 75%" },
});
imgTl
  .to(".reveal-curtain", {
    scaleY: 0,
    transformOrigin: "bottom",
    duration: 1.5,
    ease: "power4.out",
  })
  .to(".reveal-img img", { scale: 1, duration: 1.5, ease: "power4.out" }, 0);

// 4. MOBILE MENU LOGIC (HAMBURGER)
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-link");

if (menuToggle) {
    let isMenuOpen = false;

    menuToggle.addEventListener("click", () => {
      if (!isMenuOpen) {
        // OPEN MENU
        gsap.to(mobileMenu, {
          y: 0,
          autoAlpha: 1,
          duration: 0.6,
          ease: "power4.inOut",
        });

        gsap.fromTo(
          mobileLinks,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.5,
            delay: 0.2,
            ease: "power3.out",
          },
        );

        menuToggle.classList.add("active");
        document.body.style.overflow = "hidden";
        isMenuOpen = true;
      } else {
        // CLOSE MENU
        gsap.to(mobileMenu, {
          y: "-100%",
          autoAlpha: 0,
          duration: 0.6,
          ease: "power4.inOut",
        });

        menuToggle.classList.remove("active");
        document.body.style.overflow = "";
        isMenuOpen = false;
      }
    });

    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        gsap.to(mobileMenu, { y: "-100%", autoAlpha: 0, duration: 0.6 });
        menuToggle.classList.remove("active");
        document.body.style.overflow = "";
        isMenuOpen = false;
      });
    });
}

// 5. MAGNETIC BUTTON EFFECT
const magnets = document.querySelectorAll(
  ".nav-item, .submit-btn, .footer-link, .btn, .socials a, .cv-btn",
);

magnets.forEach((magnet) => {
  magnet.addEventListener("mousemove", (e) => {
    const bounding = magnet.getBoundingClientRect();
    const magnetsStrength = 40;
    const newX = (e.clientX - bounding.left) / magnet.offsetWidth - 0.5;
    const newY = (e.clientY - bounding.top) / magnet.offsetHeight - 0.5;

    gsap.to(magnet, {
      duration: 1,
      x: newX * magnetsStrength,
      y: newY * magnetsStrength,
      ease: "power4.out",
    });
  });

  magnet.addEventListener("mouseleave", () => {
    gsap.to(magnet, {
      duration: 1,
      x: 0,
      y: 0,
      ease: "elastic.out(1, 0.3)",
    });
  });
});

// Hide CV button initially if we haven't determined status yet
if (!sessionStorage.getItem("visited")) {
    gsap.set(".cv-wrapper", { opacity: 0 });
}
// Add this to the end of script.js
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});