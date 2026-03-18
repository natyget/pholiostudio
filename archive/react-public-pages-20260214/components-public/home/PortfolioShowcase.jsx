import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const PortfolioShowcase = ({ featuredTalents = [] }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger animation Logic if we were animating individual cards here
                    // But for now just animate the section or use the CSS transition logic
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        // Also observe individual cards if needed, but let's stick to simple section visibility for now
        // or iterate over cards ref

        return () => observer.disconnect();
    }, []);

    return (
        <section className="homepage-portfolio-showcase" id="homepage-portfolio-showcase" ref={sectionRef}>
            <div className="homepage-portfolio-showcase__container">
                <div className="homepage-portfolio-showcase__intro">
                    <h2 className="homepage-portfolio-showcase__title">See Pholio in Action</h2>
                    <p className="homepage-portfolio-showcase__subtitle">Real portfolios from our community</p>
                    <p className="homepage-portfolio-showcase__description">
                        Explore how Pholio transforms talent profiles into publication-ready portfolios. Each portfolio showcases AI-curated bios, organized stats, and editorial-quality presentation.
                    </p>
                </div>
                
                <div className="homepage-portfolio-showcase__grid">
                    {featuredTalents.slice(0, 8).map((talent, index) => (
                        <Link 
                            to={`/portfolio/${talent.slug}`} 
                            key={talent.id || index}
                            className="homepage-portfolio-showcase__card"
                            data-index={index}
                        >
                            <div className="homepage-portfolio-showcase__image-wrapper">
                                <img 
                                    src={talent.hero_image} 
                                    alt={`${talent.first_name} ${talent.last_name}`}
                                    className="homepage-portfolio-showcase__image"
                                    loading="lazy"
                                />
                                <div className="homepage-portfolio-showcase__overlay">
                                    <div className="homepage-portfolio-showcase__overlay-content">
                                        <h3 className="homepage-portfolio-showcase__name">
                                            {talent.first_name} {talent.last_name}
                                        </h3>
                                        <p className="homepage-portfolio-showcase__location">
                                            {talent.city}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PortfolioShowcase;
