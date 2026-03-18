import React, { useEffect, useRef, useState } from 'react';

const TransformationHero = ({ heroTalent }) => {
    const transformationZoneRef = useRef(null);
    const rawDocumentRef = useRef(null);
    const portfolioCardRef = useRef(null);
    const replayButtonRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const EMAIL_SHOW_DURATION = 2000;
    const BUILD_DURATION = 4000;

    useEffect(() => {
        if (heroTalent) {
            // Start the sequence after a slight delay to ensure rendering
            const timer = setTimeout(() => {
                startAnimation();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [heroTalent]);

    const startAnimation = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        if (transformationZoneRef.current) transformationZoneRef.current.classList.add('animating');

        // Initial setup for transitions if necessary
        // Most of this logic was in buildPortfolio() in homepage.js
        buildPortfolio();
    };

    const buildPortfolio = () => {
        const portfolioCard = portfolioCardRef.current;
        const rawDocument = rawDocumentRef.current;
        
        if (!portfolioCard || !rawDocument) return;

        // Helper for staggered animations
        const schedule = (callback, delay) => setTimeout(callback, delay);

        // Step 1: Header
        const header = portfolioCard.querySelector('.portfolio-card__header');
        const name = portfolioCard.querySelector('.portfolio-card__name');
        const location = portfolioCard.querySelector('.portfolio-card__location');

        schedule(() => {
            if (header) {
                header.style.opacity = '1';
                header.style.transform = 'translateY(0)';
            }
        }, 0);

        schedule(() => {
            if (name) {
                name.style.opacity = '1';
                name.style.transform = 'translateY(0) scale(1)';
            }
        }, 300);

        schedule(() => {
            if (location) {
                location.style.opacity = '1';
                location.style.transform = 'translateY(0)';
            }
        }, 800);

        // Step 2: Hero Image
        const heroImage = portfolioCard.querySelector('.portfolio-card__hero-image');
        const heroImg = portfolioCard.querySelector('.portfolio-card__hero-image img');

        schedule(() => {
            if (heroImage) {
                heroImage.style.opacity = '1';
                heroImage.style.transform = 'scale(1)';
            }
            if (heroImg) {
                heroImg.style.filter = 'brightness(1.05) contrast(1.08) grayscale(0)';
            }
        }, 1200);

        // Step 3: Stats
        const stats = portfolioCard.querySelector('.portfolio-card__stats');
        const statItems = portfolioCard.querySelectorAll('.portfolio-card__stat');
        const contact = portfolioCard.querySelector('.portfolio-card__contact');

        schedule(() => {
            if (stats) {
                stats.style.opacity = '1';
                stats.style.transform = 'translateY(0)';
            }
        }, 2000);

        statItems.forEach((stat, index) => {
            const label = stat.querySelector('.portfolio-card__stat-label');
            const value = stat.querySelector('.portfolio-card__stat-value');
            
            schedule(() => {
                if (label) {
                    label.style.opacity = '1';
                    label.style.transform = 'translateX(0)';
                }
            }, 2200 + (index * 150));

            schedule(() => {
                if (value) {
                    value.style.opacity = '1';
                    value.style.transform = 'translateY(0)';
                }
            }, 2400 + (index * 150));
        });

        schedule(() => {
            if (contact) {
                contact.style.opacity = '1';
                contact.style.transform = 'translateY(0)';
            }
        }, 2900);

        // Step 4: Gallery
        const gallery = portfolioCard.querySelector('.portfolio-card__gallery');
        const galleryItems = portfolioCard.querySelectorAll('.portfolio-card__gallery-item');

        schedule(() => {
            if (gallery) {
                gallery.style.opacity = '1';
                gallery.style.transform = 'translateY(0)';
            }
        }, 3000);

        galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');
            schedule(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
                if (img) {
                    img.style.filter = 'brightness(1.05) contrast(1.05) grayscale(0)';
                }
            }, 3200 + (index * 120));
        });

        // Step 5: Bio
        const bio = portfolioCard.querySelector('.portfolio-card__bio');
        const bioText = portfolioCard.querySelector('.portfolio-card__bio-text');

        schedule(() => {
            if (bio) {
                bio.style.opacity = '1';
                bio.style.transform = 'translateY(0)';
            }
            if (bioText) {
                bioText.style.opacity = '1';
                bioText.style.transform = 'translateY(0)';
            }
        }, 4000);

        // Fade out email draft
        schedule(() => {
            const emailFields = rawDocument.querySelectorAll('.email-draft__field-value, .email-draft__subject');
            const emailBody = rawDocument.querySelector('.email-draft__body-content');

            emailFields.forEach((el, index) => {
                schedule(() => {
                    el.style.opacity = '0.2';
                    el.style.transform = 'translateX(-15px)';
                }, index * 50);
            });

            if (emailBody) {
                schedule(() => {
                    emailBody.style.opacity = '0.15';
                }, 500);
            }
        }, 1000);

        // Finish animation
        schedule(() => {
            setIsAnimating(false);
            if (transformationZoneRef.current) transformationZoneRef.current.classList.remove('animating');
            if (replayButtonRef.current) replayButtonRef.current.classList.add('visible');
        }, EMAIL_SHOW_DURATION + BUILD_DURATION);
    };

    const resetTransformation = () => {
        setIsAnimating(false);
        if (transformationZoneRef.current) transformationZoneRef.current.classList.remove('animating');
        if (replayButtonRef.current) replayButtonRef.current.classList.remove('visible');

        const rawDocument = rawDocumentRef.current;
        const portfolioCard = portfolioCardRef.current;

        if (!rawDocument || !portfolioCard) return;

        // Reset Email
        const emailFields = rawDocument.querySelectorAll('.email-draft__field-value, .email-draft__subject');
        const emailBody = rawDocument.querySelector('.email-draft__body-content');
        
        emailFields.forEach(el => {
            el.style.transition = 'none';
            el.style.opacity = '1';
            el.style.transform = 'translateX(0)';
        });
        if (emailBody) {
            emailBody.style.transition = 'none';
            emailBody.style.opacity = '1';
        }

        // Reset Portfolio (Hide everything)
        const portfolioSections = portfolioCard.querySelectorAll('.portfolio-card__header, .portfolio-card__hero-image, .portfolio-card__stats, .portfolio-card__gallery, .portfolio-card__bio');
        const portfolioElements = portfolioCard.querySelectorAll('.portfolio-card__name, .portfolio-card__location, .portfolio-card__stat-label, .portfolio-card__stat-value, .portfolio-card__bio-text, .portfolio-card__contact');
        const portfolioItems = portfolioCard.querySelectorAll('.portfolio-card__gallery-item');
        const portfolioImages = portfolioCard.querySelectorAll('.portfolio-card__hero-image img, .portfolio-card__gallery-item img');

        const resetStyle = (el, transform = '') => {
            el.style.transition = 'none';
            el.style.opacity = '0';
            el.style.transform = transform;
        };

        portfolioSections.forEach(el => resetStyle(el));
        portfolioElements.forEach(el => resetStyle(el));
        portfolioItems.forEach(el => resetStyle(el, 'scale(0.9)'));
        portfolioImages.forEach(el => {
            el.style.transition = 'none';
            el.style.filter = 'brightness(0.7) contrast(0.8) grayscale(0.3)';
        });

        // Restore transitions
        setTimeout(() => {
            const restoreTransition = (el) => { el.style.transition = ''; };
            
            emailFields.forEach(restoreTransition);
            if (emailBody) restoreTransition(emailBody);
            
            portfolioSections.forEach(restoreTransition);
            portfolioElements.forEach(restoreTransition);
            portfolioItems.forEach(restoreTransition);
            portfolioImages.forEach(restoreTransition);

            // Restart animation
            setTimeout(startAnimation, EMAIL_SHOW_DURATION);
        }, 100);
    };

    if (!heroTalent) return null;

    return (
        <section className="transformation-hero" id="transformation-hero">
            <div className="transformation-hero__container">
                <div className="transformation-hero__header">
                    <h1 className="transformation-hero__title">
                        From <span className="highlight-raw">Raw Data</span> to <span className="highlight-portfolio">Publication-Ready</span>
                    </h1>
                    <p className="transformation-hero__subtitle">
                        Pholio's AI transforms your raw images and details into a stunning, professional portfolio in seconds.
                    </p>
                </div>

                <div className="transformation-zone" id="transformation-zone" ref={transformationZoneRef}>
                    {/* Raw Document (Left Side) */}
                    <div className="transformation-zone__raw">
                        <div className="email-draft" ref={rawDocumentRef}>
                            <div className="email-draft__header">
                                <div className="email-draft__dots">
                                    <span></span><span></span><span></span>
                                </div>
                                <div className="email-draft__title">New Submission</div>
                            </div>
                            <div className="email-draft__body">
                                <div className="email-draft__field">
                                    <span className="email-draft__field-label">From:</span>
                                    <span className="email-draft__field-value">{heroTalent.first_name} {heroTalent.last_name} &lt;{heroTalent.slug}@gmail.com&gt;</span>
                                </div>
                                <div className="email-draft__field">
                                    <span className="email-draft__field-label">Subject:</span>
                                    <span className="email-draft__subject">Portfolio Submission - {heroTalent.first_name} {heroTalent.last_name}</span>
                                </div>
                                <div className="email-draft__divider"></div>
                                <div className="email-draft__body-content">
                                    <p>Hi there,</p>
                                    <p>I'm {heroTalent.first_name}, a model based in {heroTalent.city}. I'm {Math.floor(heroTalent.height / 12)}'{heroTalent.height % 12}" and my measurements are {heroTalent.measurements}.</p>
                                    <p>I've attached some of my recent work below including digitals and editorial shots. I'm looking for representation and would love to be considered.</p>
                                    <p>Thanks,<br/>{heroTalent.first_name}</p>
                                    
                                    <div className="email-draft__attachments">
                                        <div className="email-draft__attachment">
                                            <div className="email-draft__attachment-icon">📎</div>
                                            <div className="email-draft__attachment-info">
                                                <span className="name">headshot_final.jpg</span>
                                                <span className="size">2.4 MB</span>
                                            </div>
                                        </div>
                                        <div className="email-draft__attachment">
                                            <div className="email-draft__attachment-icon">📎</div>
                                            <div className="email-draft__attachment-info">
                                                <span className="name">full_body_02.jpg</span>
                                                <span className="size">3.1 MB</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transformation Flow (Center) */}
                    <div className="transformation-zone__flow">
                        <div className="flow-arrow">
                            <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 10H35M35 10L28 3M35 10L28 17" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                        <div className="ai-process-indicator">
                            <div className="ai-icon">✨</div>
                            <span className="ai-label">AI Processing</span>
                        </div>
                    </div>

                    {/* Portfolio Card (Right Side) */}
                    <div className="transformation-zone__portfolio">
                        <div className="portfolio-card" ref={portfolioCardRef}>
                            <div className="portfolio-card__header" style={{opacity: 0, transform: 'translateY(-20px)'}}>
                                <h3 className="portfolio-card__name" style={{opacity: 0, transform: 'translateY(10px) scale(0.95)'}}>{heroTalent.first_name} {heroTalent.last_name}</h3>
                                <div className="portfolio-card__location" style={{opacity: 0, transform: 'translateY(5px)'}}>{heroTalent.city.toUpperCase()}</div>
                            </div>
                            
                            <div className="portfolio-card__hero-image" style={{opacity: 0, transform: 'scale(0.98)'}}>
                                <img src={heroTalent.hero_image} alt="Hero" loading="eager" style={{filter: 'brightness(0.7) contrast(0.8) grayscale(0.3)'}} />
                            </div>

                            <div className="portfolio-card__stats" style={{opacity: 0, transform: 'translateY(15px)'}}>
                                <div className="portfolio-card__stat">
                                    <span className="portfolio-card__stat-label" style={{opacity: 0, transform: 'translateX(-10px)'}}>Height</span>
                                    <span className="portfolio-card__stat-value" style={{opacity: 0, transform: 'translateY(5px)'}}>{Math.floor(heroTalent.height / 12)}'{heroTalent.height % 12}"</span>
                                </div>
                                <div className="portfolio-card__stat">
                                    <span className="portfolio-card__stat-label" style={{opacity: 0, transform: 'translateX(-10px)'}}>Bust</span>
                                    <span className="portfolio-card__stat-value" style={{opacity: 0, transform: 'translateY(5px)'}}>{heroTalent.measurements.split('-')[0]}</span>
                                </div>
                                <div className="portfolio-card__stat">
                                    <span className="portfolio-card__stat-label" style={{opacity: 0, transform: 'translateX(-10px)'}}>Waist</span>
                                    <span className="portfolio-card__stat-value" style={{opacity: 0, transform: 'translateY(5px)'}}>{heroTalent.measurements.split('-')[1]}</span>
                                </div>
                                <div className="portfolio-card__stat">
                                    <span className="portfolio-card__stat-label" style={{opacity: 0, transform: 'translateX(-10px)'}}>Hips</span>
                                    <span className="portfolio-card__stat-value" style={{opacity: 0, transform: 'translateY(5px)'}}>{heroTalent.measurements.split('-')[2]}</span>
                                </div>
                            </div>

                            <div className="portfolio-card__bio" style={{opacity: 0, transform: 'translateY(10px)'}}>
                                <p className="portfolio-card__bio-text" style={{opacity: 0, transform: 'translateY(5px)'}}>
                                    {heroTalent.bio}
                                </p>
                            </div>

                            <div className="portfolio-card__gallery" style={{opacity: 0, transform: 'translateY(10px)'}}>
                                {heroTalent.gallery && heroTalent.gallery.slice(0, 3).map((img, i) => (
                                    <div key={i} className="portfolio-card__gallery-item" style={{opacity: 0, transform: 'scale(0.9)'}}>
                                        <img src={img} alt={`Gallery ${i}`} style={{filter: 'brightness(0.7) contrast(0.8) grayscale(0.3)'}} />
                                    </div>
                                ))}
                            </div>
                            
                            <div className="portfolio-card__contact" style={{opacity: 0, transform: 'translateY(5px)'}}>
                                <button className="portfolio-card__contact-btn">Book Talent</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="transformation-controls">
                    <button 
                        id="replay-transformation" 
                        className="replay-button" 
                        ref={replayButtonRef}
                        onClick={resetTransformation}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 4v6h-6M1 20v-6h6"></path>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                        Replay Animation
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TransformationHero;
