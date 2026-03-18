import React, { useEffect } from 'react';
import BioTransformationDemo from '../../components/public/features/BioTransformationDemo';
import ThemeGallery from '../../components/public/features/ThemeGallery';
import PortfolioToggle from '../../components/public/features/PortfolioToggle';
import FilterDemo from '../../components/public/features/FilterDemo';

const FeaturesPage = () => {
    useEffect(() => {
        // Init scroll animations for headers
        const headers = document.querySelectorAll('.feature-spread__header');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        });

        headers.forEach(header => observer.observe(header));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="features-page">
            <BioTransformationDemo />
            <ThemeGallery />
            <PortfolioToggle />
            <FilterDemo />

            {/* CTA Section */}
            <section className="feature-cta">
                <div className="feature-cta__container">
                    <h2 className="feature-cta__title">Ready to Launch Your Career?</h2>
                    <p className="feature-cta__subtitle">Join thousands of models using Pholio to get signed.</p>
                    <a href="/apply" className="button button-primary button-large">Start Your 3-Minute Setup</a>
                </div>
            </section>
        </div>
    );
};

export default FeaturesPage;
