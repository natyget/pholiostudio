import React, { useState, useEffect, useRef } from 'react';
import { publicApi } from '../../api/public';
import TransformationHero from '../../components/public/home/TransformationHero';
import DashboardShowcase from '../../components/public/home/DashboardShowcase';
import PortfolioShowcase from '../../components/public/home/PortfolioShowcase';
import Testimonials from '../../components/public/home/Testimonials';
import PricingSection from '../../components/public/home/PricingSection';

const HomePage = () => {
    const [heroTalent, setHeroTalent] = useState(null);
    const [featuredTalents, setFeaturedTalents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await publicApi.getHome();
                setHeroTalent(response.data.heroTalent);
                setFeaturedTalents(response.data.featuredTalents || []);
            } catch (error) {
                console.error('Failed to fetch home page data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        // Respect reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            document.documentElement.classList.add('reduce-motion');
        }
    }, []);

    // Placeholder until we implement other sections
    if (loading) {
        return <div className="loading-spinner">Loading...</div>; // Replace with proper loading state if needed
    }

    return (
        <div className="homepage">
            {heroTalent && <TransformationHero heroTalent={heroTalent} />}
            
            {/* Value Prop Section */}
            <section className="homepage-value-prop" id="homepage-value-prop">
                <div className="homepage-value-prop__inner">
                    <div className="homepage-value-prop__content">
                        <div className="homepage-value-prop__icon">✨</div>
                        <h2 className="homepage-value-prop__headline">
                            See the magic?<br />
                            That's AI curation.
                        </h2>
                        <p className="homepage-value-prop__description">
                            Pholio's AI transforms raw talent data into publication-ready comp cards. Refined bios, organized stats, and editorial-quality presentation—all in minutes.
                        </p>
                        <div className="homepage-value-prop__benefits">
                            <div className="homepage-value-prop__benefit">
                                <span className="homepage-value-prop__benefit-icon">⚡</span>
                                <span className="homepage-value-prop__benefit-text">Publication-ready in minutes</span>
                            </div>
                            <div className="homepage-value-prop__benefit">
                                <span className="homepage-value-prop__benefit-icon">🎨</span>
                                <span className="homepage-value-prop__benefit-text">Editorial-quality presentation</span>
                            </div>
                            <div className="homepage-value-prop__benefit">
                                <span className="homepage-value-prop__benefit-icon">📊</span>
                                <span className="homepage-value-prop__benefit-text">Organized stats and metrics</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dashboard Showcase */}
            <DashboardShowcase />

            {/* Portfolio Showcase */}
            <PortfolioShowcase featuredTalents={featuredTalents} />

            {/* Agency Partnership */}
            <section className="homepage-agency" id="homepage-agency">
                <div className="homepage-agency__container">
                    <div className="homepage-agency__content">
                        <div className="homepage-agency__header">
                            <span className="homepage-agency__badge">For Agencies</span>
                            <h2 className="homepage-agency__title">Free Talent Management Dashboard</h2>
                            <p className="homepage-agency__description">
                                Pholio provides verified agencies with a free, premium dashboard to manage incoming talent applications. Review, organize, and discover talent with AI-powered insights—all at no cost.
                            </p>
                        </div>
                        
                        <div className="homepage-agency__features">
                            <div className="homepage-agency__feature">
                                <div className="homepage-agency__feature-icon-wrapper">
                                    <span className="homepage-agency__feature-icon">📋</span>
                                </div>
                                <div className="homepage-agency__feature-content">
                                    <h3 className="homepage-agency__feature-title">Application Management</h3>
                                    <p className="homepage-agency__feature-text">Review and organize all incoming talent applications in one place. Use our Kanban board to track applications from submission to acceptance.</p>
                                    <div className="homepage-agency__feature-highlight">
                                        <span>Streamlined review process</span>
                                    </div>
                                </div>
                            </div>
                            <div className="homepage-agency__feature">
                                <div className="homepage-agency__feature-icon-wrapper">
                                    <span className="homepage-agency__feature-icon">🤖</span>
                                </div>
                                <div className="homepage-agency__feature-content">
                                    <h3 className="homepage-agency__feature-title">AI-Powered Insights</h3>
                                    <p className="homepage-agency__feature-text">Get AI-generated match scores and tags to quickly identify talent that fits your agency's needs. Save time on initial screening.</p>
                                    <div className="homepage-agency__feature-highlight">
                                        <span>Smart talent discovery</span>
                                    </div>
                                </div>
                            </div>
                            <div className="homepage-agency__feature">
                                <div className="homepage-agency__feature-icon-wrapper">
                                    <span className="homepage-agency__feature-icon">💼</span>
                                </div>
                                <div className="homepage-agency__feature-content">
                                    <h3 className="homepage-agency__feature-title">100% Free for Agencies</h3>
                                    <p className="homepage-agency__feature-text">Our dashboard is completely free for verified partner agencies. No subscription fees, no hidden costs—just powerful tools to manage your talent pipeline.</p>
                                    <div className="homepage-agency__feature-highlight">
                                        <span>Free forever</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="homepage-agency__cta-wrapper">
                            <a href="/partners" className="homepage-agency__cta">
                                <span className="homepage-agency__cta-text">Become a Partner Agency</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Testimonials />
            <PricingSection />
        </div>
    );
};

export default HomePage;
