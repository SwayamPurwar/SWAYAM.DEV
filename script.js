gsap.registerPlugin(ScrollTrigger);

// 1. SMOOTH SCROLLING
if (typeof Lenis !== 'undefined') {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// 2. CUSTOM CURSOR
const cursor = document.getElementById("cursor");
if (cursor) {
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3.out" });

    if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener("mousemove", (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        });
        const hoverables = ".mouse-hover, .nav-item, .project, .btn, .socials a, .cv-btn, .toc-link, .cs-tag, .project-link, .tech-pill";
        document.body.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverables)) cursor.classList.add("hovered");
        });
        document.body.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverables)) cursor.classList.remove("hovered");
        });
    }
}

// 3. PRELOADER & HERO LOGIC (CINEMATIC VERSION)
const preloader = document.querySelector(".preloader-container");
if (preloader) {
    const isReload = performance.getEntriesByType("navigation")[0]?.type === 'reload';

    // If user has visited before (and didn't reload manually), skip animation
    if (sessionStorage.getItem("visited") === "true" && !isReload) {
        gsap.set(".preloader-container", { display: "none" });
        
        // Set elements to visible state immediately
        gsap.set(".hero-text", { y: 0, opacity: 1 });
        gsap.set(".hero-sub", { opacity: 1, y: 0 });
        if(document.querySelector(".cv-wrapper")) gsap.set(".cv-wrapper", { opacity: 1 });
        
        // --- FIX: Ensure Nav is visible for returning users ---
        gsap.set("nav", { y: 0, opacity: 1 }); 
        
        document.body.style.overflow = "";
    } else {
        // FIRST VISIT ANIMATION
        sessionStorage.setItem("visited", "true");
        document.body.style.overflow = "hidden";

        // --- FIX: Hide Nav initially so it doesn't overlap loader ---
        gsap.set("nav", { y: -50, opacity: 0 });

        const tl = gsap.timeline();

        // 1. Reveal Loader Elements
        tl.to(".loader-text", { opacity: 1, duration: 0.5, ease: "power2.out" });
        
        // 2. Count from 0 to 100
        const counterObj = { value: 0 };
        const counterEl = document.querySelector(".counter");
        
        tl.to(counterObj, {
            value: 100,
            duration: 2.5,
            ease: "power3.inOut",
            onUpdate: () => {
                if(counterEl) counterEl.textContent = Math.floor(counterObj.value);
            }
        });

        // 3. The "Exit" - Slide the curtain UP
        tl.to(".loader-text, .loader-meta", { opacity: 0, duration: 0.3 }); // Fade out text first
        
        tl.to(".preloader-container", {
            yPercent: -100, // Slide Up
            duration: 1.2,
            ease: "power4.inOut",
            onComplete: () => {
                document.body.style.overflow = "";
                gsap.set(".preloader-container", { display: "none" });
            }
        });

        // 4. Hero Section Entrance
        tl.from(".hero-text", { 
            y: 100, 
            opacity: 0, 
            duration: 1.2, 
            stagger: 0.1, 
            ease: "power4.out" 
        }, "-=0.8");

        tl.from(".hero-sub", { 
            y: 30, 
            opacity: 0, 
            duration: 1, 
            ease: "power3.out" 
        }, "-=0.6");

        if(document.querySelector(".cv-wrapper")) {
            tl.from(".cv-wrapper", { 
                y: 30, 
                opacity: 0, 
                duration: 1, 
                ease: "power3.out" 
            }, "-=0.8");
        }

        // --- FIX: Reveal Nav smoothly after loader finishes ---
        tl.to("nav", { 
            y: 0, 
            opacity: 1, 
            duration: 1, 
            ease: "power3.out" 
        }, "-=1.0"); // Overlaps slightly with hero animation
    }
}

// 4. PAGE TRANSITIONS
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !link.hasAttribute('download') && link.target !== '_blank') {
            e.preventDefault();
            let curtain = document.querySelector('.page-transition-curtain');
            if (!curtain) {
                curtain = document.createElement('div');
                curtain.classList.add('page-transition-curtain');
                curtain.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: #000; z-index: 10000;
                    transform: scaleY(0); transform-origin: bottom; pointer-events: none;
                `;
                document.body.appendChild(curtain);
            }
            gsap.to(curtain, {
                scaleY: 1,
                duration: 0.8,
                ease: "power4.inOut",
                onComplete: () => { window.location.href = href; }
            });
        }
    });
});

// 5. NAV SCROLL EFFECT
const nav = document.querySelector('nav');
if (nav) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });
}

// 6. ANIMATIONS
const hero = document.getElementById("hero");
if (hero) {
    gsap.to("#hero", {
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1 },
        y: 100,
        opacity: 0.5,
    });
}

const revealItems = document.querySelectorAll(".project, .reveal-text");
if (revealItems.length > 0) {
    revealItems.forEach((item) => {
        gsap.from(item, {
            scrollTrigger: { trigger: item, start: "top 90%" },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
        });
    });
}

// 7. IMAGE REVEAL LOGIC
const revealContainers = document.querySelectorAll(".reveal-container");
if (revealContainers.length > 0) {
    revealContainers.forEach((container) => {
        const curtain = container.querySelector(".reveal-curtain");
        const img = container.querySelector("img");
        
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top 80%",
            }
        });

        tl.to(curtain, { scaleY: 0, duration: 1.5, ease: "power4.inOut" });
        if(img) {
            tl.to(img, { scale: 1, filter: "grayscale(0%)", duration: 1.5, ease: "power4.out" }, "-=1.5");
        }
    });
}

// 8. MAGNETIC BUTTONS
const magnets = document.querySelectorAll(".nav-item, .submit-btn, .btn, .socials a, .cv-btn, .cs-tag, .tech-pill");
magnets.forEach((magnet) => {
    magnet.addEventListener("mousemove", (e) => {
        const bounding = magnet.getBoundingClientRect();
        const strength = 30; 
        const newX = (e.clientX - bounding.left) / magnet.offsetWidth - 0.5;
        const newY = (e.clientY - bounding.top) / magnet.offsetHeight - 0.5;

        gsap.to(magnet, { duration: 1, x: newX * strength, y: newY * strength, ease: "power4.out" });
    });

    magnet.addEventListener("mouseleave", () => {
        gsap.to(magnet, { duration: 1, x: 0, y: 0, ease: "elastic.out(1, 0.3)" });
    });
});

// 9. MOBILE MENU
const menuToggle = document.querySelector(".menu-toggle");
if (menuToggle) {
    const mobileMenu = document.querySelector(".mobile-menu");
    const mobileLinks = document.querySelectorAll(".mobile-link");
    let isMenuOpen = false;

    // Toggle Menu Open/Close
    menuToggle.addEventListener("click", () => {
        if (!isMenuOpen) {
            // OPEN
            gsap.to(mobileMenu, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power4.inOut" });
            gsap.fromTo(mobileLinks, { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.2 });
            
            menuToggle.classList.add("active");
            mobileMenu.classList.add("active"); // <--- THIS WAS MISSING
            
            isMenuOpen = true;
        } else {
            // CLOSE
            gsap.to(mobileMenu, { y: "-100%", autoAlpha: 0, duration: 0.6 });
            
            menuToggle.classList.remove("active");
            mobileMenu.classList.remove("active"); // <--- THIS WAS MISSING
            
            isMenuOpen = false;
        }
    });
    
    // Close Menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            gsap.to(mobileMenu, { y: "-100%", autoAlpha: 0, duration: 0.6 });
            
            menuToggle.classList.remove("active");
            mobileMenu.classList.remove("active"); // <--- THIS WAS MISSING
            
            isMenuOpen = false;
        });
    });
}

// 11. CINEMATIC MOBILE SCROLL HIGHLIGHT
// This makes projects "pop" and glow when they hit the center of the screen
if (window.matchMedia("(max-width: 768px)").matches) {
    const projects = document.querySelectorAll('.project');
    
    // Config: When 60% of the item is visible, trigger the effect
    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -20% 0px", // Focus area is the center 60% of screen
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // ACTIVE STATE (In Center)
                gsap.to(entry.target, {
                    scale: 1.03,                 // Subtle zoom
                    backgroundColor: "#0a0a0a",  // Darker background
                    borderColor: "rgba(255,255,255,0.8)", // Bright border
                    boxShadow: "0 10px 30px -10px rgba(255,255,255,0.15)", // Soft Glow
                    duration: 0.6,
                    ease: "power3.out"
                });
                
                // Animate the Title inside
                gsap.to(entry.target.querySelector("h2"), {
                    color: "#fff",
                    x: 10,                       // Slide text right
                    duration: 0.6
                });

                // Animate the Meta text (Date/Type)
                gsap.to(entry.target.querySelector(".project-meta"), {
                    color: "#ccc",
                    duration: 0.6
                });

            } else {
                // INACTIVE STATE (scrolled away)
                gsap.to(entry.target, {
                    scale: 1,
                    backgroundColor: "transparent",
                    borderColor: "#222",        // Back to dim border
                    boxShadow: "none",
                    duration: 0.6,
                    ease: "power3.out"
                });

                gsap.to(entry.target.querySelector("h2"), {
                    color: "#888",
                    x: 0,                       // Slide text back
                    duration: 0.6
                });

                gsap.to(entry.target.querySelector(".project-meta"), {
                    color: "#666",
                    duration: 0.6
                });
            }
        });
    }, observerOptions);

    projects.forEach(p => observer.observe(p));
}
