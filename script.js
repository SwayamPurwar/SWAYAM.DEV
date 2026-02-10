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

 // NEW FIXED CODE
tl.fromTo(".hero-sub", 
    { y: 30, opacity: 0 },      // Start State
    { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, // End State
    "-=0.6"
);

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
            document.body.style.overflow = "hidden"; // FREEZE BACKGROUND
        
            isMenuOpen = true;
        } else {
            // CLOSE
            gsap.to(mobileMenu, { y: "-100%", autoAlpha: 0, duration: 0.6 });
            
            menuToggle.classList.remove("active");
            mobileMenu.classList.remove("active"); // <--- THIS WAS MISSING
            document.body.style.overflow = ""; // UNFREEZE
            isMenuOpen = false;
        }
    });
    
    // Close Menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            gsap.to(mobileMenu, { y: "-100%", autoAlpha: 0, duration: 0.6 });
            
            menuToggle.classList.remove("active");
            mobileMenu.classList.remove("active"); // <--- THIS WAS MISSING
            document.body.style.overflow = ""; // UNFREEZE
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


// 12. PROJECT PREVIEW REVEAL
const previewEl = document.getElementById('preview-img');
const projectLinks = document.querySelectorAll('.project-link');

if (previewEl && projectLinks.length > 0) {
    projectLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const imgUrl = link.getAttribute('data-img');
            if (imgUrl) {
                previewEl.style.backgroundImage = `url('${imgUrl}')`;
                
                gsap.to(previewEl, { 
                    opacity: 1, 
                    scale: 1, 
                    duration: 0.4, 
                    ease: "power2.out" 
                });
            }
        });

        link.addEventListener('mouseleave', () => {
            gsap.to(previewEl, { 
                opacity: 0, 
                scale: 0.8, 
                duration: 0.3, 
                ease: "power2.in" 
            });
        });

        link.addEventListener('mousemove', (e) => {
            // Optional: Move image slightly with cursor
            const x = (e.clientX - window.innerWidth / 2) * 0.15;
            const y = (e.clientY - window.innerHeight / 2) * 0.15;
            
            gsap.to(previewEl, { 
                x: x, 
                y: y, 
                duration: 0.5, 
                ease: "power1.out" 
            });
        });
    });
}

// 13. DYNAMIC YEAR
const yearSpan = document.getElementById("year");
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

// ACCESSIBILITY: Detect Keyboard vs Mouse
window.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
    }
});

window.addEventListener('mousemove', () => {
    document.body.classList.remove('user-is-tabbing');
});

// --- AMBIENT GLOW FOLLOWER ---
const glow = document.getElementById("ambient-glow");

if (glow) {
    // We use a slower duration (1.5) for a "floating" feel
    const glowX = gsap.quickTo(glow, "x", { duration: 1.5, ease: "power3.out" });
    const glowY = gsap.quickTo(glow, "y", { duration: 1.5, ease: "power3.out" });

    window.addEventListener("mousemove", (e) => {
        glowX(e.clientX);
        glowY(e.clientY);
    });
}

// --- LIVE LOCAL TIME (IST) ---
function updateLiveClock() {
    const clockElement = document.getElementById("live-clock");
    if (clockElement) {
        // specific time for India (Asia/Kolkata)
        const now = new Date();
        const timeString = now.toLocaleTimeString("en-US", {
            timeZone: "Asia/Kolkata",
            hour12: false, // Use 24-hour format (looks more "dev")
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
        
        clockElement.textContent = timeString + " IST";
    }
}

// Update immediately, then every second
updateLiveClock();
setInterval(updateLiveClock, 1000);
// --- EASTER EGG: MATRIX RAIN ---
const secretCode = "matrix";
let inputSequence = "";
const canvas = document.getElementById("matrix-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;

if (canvas && ctx) {
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops = new Array(columns).fill(1); // Y-coordinate of drops
    let matrixInterval;
    let isActive = false;

    // Resize safely
    window.addEventListener("resize", () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });

    function drawMatrix() {
        // Semi-transparent black to create trail effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#0F0"; // Green Text
        ctx.font = `${fontSize}px 'Fira Code'`;

        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            // Reset drop to top randomly
            if (drops[i] * fontSize > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    function toggleMatrix(enable) {
        if (enable) {
            isActive = true;
            // Fade In
            gsap.to(canvas, { opacity: 1, duration: 1 });
            // Start Loop
            matrixInterval = setInterval(drawMatrix, 33);
            
            // Optional: Change Site Colors to Hacker Green temporarily
            document.documentElement.style.setProperty('--accent', '#0F0');
        } else {
            isActive = false;
            // Fade Out
            gsap.to(canvas, { opacity: 0, duration: 1, onComplete: () => {
                clearInterval(matrixInterval);
                ctx.clearRect(0, 0, width, height); // Clean up
            }});
            // Reset Colors
            document.documentElement.style.setProperty('--accent', '#bfa5d8');
        }
    }

    // LISTENER
    window.addEventListener("keydown", (e) => {
        // Add key to sequence
        inputSequence += e.key.toLowerCase();
        
        // Trim sequence to match code length
        if (inputSequence.length > secretCode.length) {
            inputSequence = inputSequence.slice(-secretCode.length);
        }

        // CHECK CODE
        if (inputSequence === secretCode) {
            if (!isActive) {
                toggleMatrix(true);
                console.log("%c SYSTEM BREACH DETECTED ", "background: #000; color: #0f0; font-size: 20px");
            } else {
                toggleMatrix(false); // Type it again to turn off
            }
        }
    });
}

// --- TAB TITLE ANIMATION ---
const originalTitle = document.title;
const blurTitle = "System Offline // Come Back"; // The message when they leave

window.addEventListener("blur", () => {
    document.title = blurTitle;
});

window.addEventListener("focus", () => {
    document.title = originalTitle;
}); 