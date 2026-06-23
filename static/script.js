document.addEventListener("DOMContentLoaded", () => {
    // Register GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // 1. Anime.js Preloader Logo Pulse Animation (Continuous)
    const logoPulse = anime({
        targets: '#preloader-logo',
        scale: [0.9, 1.1],
        duration: 1000,
        easing: 'easeInOutQuad',
        direction: 'alternate',
        loop: true,
        filter: [
            "drop-shadow(0 0 10px rgba(212, 175, 55, 0.2))",
            "drop-shadow(0 0 40px rgba(212, 175, 55, 0.8))"
        ]
    });

    // 2. Window Load Event to Remove Preloader & Reveal Content
    window.addEventListener("load", () => {
        setTimeout(() => {
            logoPulse.pause();
            
            const tl = gsap.timeline();
            
            tl.to("#preloader-logo", {
                scale: 0.5,
                opacity: 0,
                duration: 0.5,
                ease: "back.in(1.5)"
            })
            .to("#preloader", {
                yPercent: -100, 
                duration: 0.8,
                ease: "power4.inOut"
            })
            .set("#main-wrapper", { visibility: "visible", opacity: 1 }, "-=0.2")
            // Make sure these elements explicitly exist and display
            .set("#hero-logo-img, .navbar, .hero-btn", { clearProps: "all" })
            .from(".navbar", {
                y: -50,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.2")
            .from("#hero-logo-img", {
                scale: 0.5,
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.75)"
            }, "-=0.5")
            .from(".hero-title", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power4.out"
            }, "-=0.6")
            .from(".hero-subtitle", {
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out"
            }, "-=0.6")
            .from(".hero-btn", {
                scale: 0.9,
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "back.out(1.5)"
            }, "-=0.4");

            setTimeout(() => {
                const el = document.getElementById('preloader');
                if(el) el.style.display = 'none';
            }, 1000);

            // Setup Scroll Animations for all sections
            if (typeof gsap !== 'undefined') {
                gsap.utils.toArray('.section-anim').forEach(section => {
                    gsap.from(section, {
                        scrollTrigger: {
                            trigger: section,
                            start: "top 85%",
                        },
                        y: 40,
                        opacity: 0,
                        duration: 0.8,
                        ease: "power3.out"
                    });
                });

                // Animate Established Badge specifically
                gsap.from('.badge-anim', {
                    scrollTrigger: {
                        trigger: ".badge-anim",
                        start: "top 90%",
                    },
                    scale: 0.5,
                    opacity: 0,
                    rotationX: 45,
                    duration: 1,
                    ease: "elastic.out(1, 0.5)",
                    delay: 0.2
                });

                // Service cards stagger on scroll
                gsap.from(".service-card-wrapper", {
                    scrollTrigger: {
                        trigger: "#services",
                        start: "top 80%",
                    },
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "power2.out"
                });

            }

        }, 1200); 
    });

    // Initialize Swiper Coverflow Gallery with Continuous Marquee Effect
    let gallerySwiper;
    if (typeof Swiper !== 'undefined') {
        gallerySwiper = new Swiper('.gallery-swiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: true,
            speed: 3000,
            autoplay: {
                delay: 0,
                disableOnInteraction: false,
            },
            coverflowEffect: {
                rotate: 20,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }

    // 8. Premium Image Lightbox Logic
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    // Collect all unique gallery images from Swiper slides (excluding duplicates created by Swiper)
    let galleryImages = Array.from(document.querySelectorAll('.gallery-swiper .gallery-slide:not(.swiper-slide-duplicate) img'));
    let currentImageIndex = 0;

    function openLightbox(index) {
        if (galleryImages.length === 0) return;
        currentImageIndex = index;
        const img = galleryImages[currentImageIndex];
        lightboxImg.src = img.src;
        lightboxCaption.textContent = img.alt || "Royal Event Decor";
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Disable background scrolling
        
        // Modal scale-up animation
        gsap.fromTo(lightboxImg, 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.5)" }
        );
    }

    function closeLightbox() {
        if (!lightboxModal) return;
        gsap.to(lightboxImg, {
            scale: 0.8,
            opacity: 0,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
                lightboxModal.classList.remove('active');
                document.body.style.overflow = ''; // Re-enable background scrolling
            }
        });
    }

    function showPrevImage() {
        if (galleryImages.length === 0) return;
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        const img = galleryImages[currentImageIndex];
        gsap.to(lightboxImg, {
            opacity: 0,
            scale: 0.95,
            duration: 0.15,
            onComplete: () => {
                lightboxImg.src = img.src;
                lightboxCaption.textContent = img.alt || "Royal Event Decor";
                gsap.to(lightboxImg, { opacity: 1, scale: 1, duration: 0.25 });
            }
        });
    }

    // Preload helper to prevent white flash when sliding
    function preloadImage(url) {
        const temp = new Image();
        temp.src = url;
    }

    function showNextImage() {
        if (galleryImages.length === 0) return;
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        const img = galleryImages[currentImageIndex];
        gsap.to(lightboxImg, {
            opacity: 0,
            scale: 0.95,
            duration: 0.15,
            onComplete: () => {
                lightboxImg.src = img.src;
                lightboxCaption.textContent = img.alt || "Royal Event Decor";
                gsap.to(lightboxImg, { opacity: 1, scale: 1, duration: 0.25 });
            }
        });
    }

    // Delegate click events on the Swiper wrapper to handle cloned slides correctly
    const swiperWrapper = document.getElementById('dynamic-gallery-wrapper');
    if (swiperWrapper) {
        swiperWrapper.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                const clickedSrc = e.target.getAttribute('src');
                const origIndex = galleryImages.findIndex(img => img.getAttribute('src') === clickedSrc);
                if (origIndex !== -1) {
                    openLightbox(origIndex);
                } else {
                    lightboxImg.src = e.target.src;
                    lightboxCaption.textContent = e.target.alt || "Royal Event Decor";
                    lightboxModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);
    if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);

    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrevImage();
        if (e.key === 'ArrowRight') showNextImage();
    });



    // Royal Golden Confetti Animation in Hero Section
    const confettiCanvas = document.getElementById('confetti-canvas');
    if (confettiCanvas && typeof confetti !== 'undefined') {
        const myConfetti = confetti.create(confettiCanvas, {
            resize: true,
            useWorker: true
        });

        const royalColors = ['#d4af37', '#ffd700', '#f3e5ab', '#ffdf73'];

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        // Loop to create a continuous slow golden fall effect
        (function frame() {
            myConfetti({
                particleCount: 1,
                startVelocity: 0,
                ticks: 300,
                origin: {
                    x: Math.random(),
                    // spawn slightly above the viewport
                    y: (Math.random() * 0.2) - 0.2
                },
                colors: royalColors,
                shapes: ['square', 'circle'],
                gravity: randomInRange(0.4, 0.7),
                scalar: randomInRange(0.7, 1.2),
                drift: randomInRange(-0.5, 0.5),
                disableForReducedMotion: true
            });

            requestAnimationFrame(frame);
        }());
    }

    // 3. Navbar Scroll Effect (Dark Glassmorphism adjustments)
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
            navbar.style.background = "rgba(11, 15, 25, 0.95)";
            navbar.style.padding = "10px 0";
        } else {
            navbar.style.boxShadow = "none";
            navbar.style.background = "rgba(11, 15, 25, 0.8)";
            navbar.style.padding = "15px 0";
        }
    });

    // 4. Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 75,
                    behavior: 'smooth'
                });
                
                const navCollapse = document.getElementById('navbarNav');
                if (navCollapse && navCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navCollapse);
                    bsCollapse.hide();
                }
            }
        });
    });



    // 6. Chatbot Toggle Logic & Redirects
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChat = document.getElementById('close-chat');
    
    if(chatbotToggle && chatbotWindow) {
        chatbotToggle.addEventListener('click', () => {
            chatbotWindow.classList.toggle('d-none');
        });
        closeChat.addEventListener('click', () => {
            chatbotWindow.classList.add('d-none');
        });
        
        // Chatbot Redirect Buttons
        const chatRedirects = document.querySelectorAll('.chat-btn-redirect');
        chatRedirects.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = document.querySelector(btn.getAttribute('data-target'));
                if(target) {
                    window.scrollTo({
                        top: target.offsetTop - 75,
                        behavior: 'smooth'
                    });
                    chatbotWindow.classList.add('d-none');
                }
            });
        });
    }

    // 7. Animated Number Counters
    const counters = document.querySelectorAll('.number-counter');
    const speed = 100; // lower is slower

    const startCounters = (entries, observer) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const counter = entry.target;
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText;
                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 20);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCount();
                observer.unobserve(counter);
            }
        });
    };

    const counterObserver = new IntersectionObserver(startCounters, { threshold: 0.5 });
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
});
