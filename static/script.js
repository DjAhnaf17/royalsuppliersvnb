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
    if (typeof Swiper !== 'undefined') {
        const swiper = new Swiper('.gallery-swiper', {
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

    // 5. Customer Enquiry Form Submission to Formspree
    const enquiryForm = document.getElementById('enquiry-form');
    if(enquiryForm) {
        enquiryForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent page refresh

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';
            submitBtn.disabled = true;

            const alertBox = document.getElementById('form-alert');

            // Create FormData from the form
            const formData = new FormData(this);

            // Send POST request to Formspree
            fetch('https://formspree.io/f/your-form-id', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    alertBox.classList.remove('d-none', 'alert-danger');
                    alertBox.classList.add('alert-success');
                    alertBox.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Enquiry sent successfully! We will contact you soon.';
                    enquiryForm.reset();
                } else {
                    throw new Error('Form submission failed');
                }
                
                // Show pop effect on the alert
                anime({
                    targets: alertBox,
                    scale: [0.9, 1],
                    opacity: [0, 1],
                    duration: 600,
                    ease: 'easeOutElastic(1, .8)'
                });

                // Hide the alert after 5 seconds
                setTimeout(() => {
                    anime({
                        targets: alertBox,
                        opacity: 0,
                        duration: 500,
                        complete: () => {
                            alertBox.classList.add('d-none');
                            alertBox.style.opacity = 1;
                        }
                    })
                }, 5000);
            })
            .catch(error => {
                alertBox.classList.remove('d-none', 'alert-success');
                alertBox.classList.add('alert-danger');
                alertBox.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i> Error sending enquiry. Please try again.';
                
                anime({
                    targets: alertBox,
                    scale: [0.9, 1],
                    opacity: [0, 1],
                    duration: 600,
                    ease: 'easeOutElastic(1, .8)'
                });
            })
            .finally(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }

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
