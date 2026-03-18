import React, { useState, useEffect } from 'react';

const PortfolioToggle = () => {
    const [view, setView] = useState('free'); // 'free' or 'pro'

    const handleToggle = (newView) => {
        if (view === newView) return;
        
        // Add active class logic here if needed, or rely on React state
        setView(newView);
    };

    return (
        <section className="feature-spread" id="feature-portfolio">
            <div className="feature-spread__container">
                <div className="feature-spread__header">
                    <span className="feature-spread__number">02</span>
                    <h2 className="feature-spread__title">Live Portfolio Website</h2>
                    <p className="feature-spread__description">
                        Your own professional website, automatically updated. Share your portfolio link on Instagram, with agencies, or anywhere you need to make an impression.
                    </p>
                </div>

                <div className="feature-demo feature-demo--portfolio">
                    <div className="feature-demo__controls">
                        <button 
                            className={`feature-demo__toggle-btn ${view === 'free' ? 'feature-demo__toggle-btn--active' : ''}`}
                            onClick={() => handleToggle('free')}
                        >
                            Free Profile
                        </button>
                        <button 
                            className={`feature-demo__toggle-btn ${view === 'pro' ? 'feature-demo__toggle-btn--active' : ''}`}
                            onClick={() => handleToggle('pro')}
                        >
                            Studio+ Website
                        </button>
                    </div>

                    <div className="portfolio-frame" id="portfolio-frame" data-state={view}>
                        <div className="portfolio-frame__browser-bar">
                            <div className="buttons">
                                <span></span><span></span><span></span>
                            </div>
                            <div className="url-bar">
                                <span className="domain">pholio.studio/</span>
                                <span className="slug">elara-k</span>
                            </div>
                        </div>

                        <div className="portfolio-frame__content">
                            {/* Brand Header */}
                            <div className="feature-demo__portfolio-brand" id="portfolio-brand-zipsite" aria-hidden={view === 'pro'}>
                                Pholio
                            </div>

                            {/* Hero Section */}
                            <div className="feature-demo__portfolio-hero">
                                <img 
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" 
                                    alt="Hero" 
                                    className="feature-demo__portfolio-hero-img"
                                />
                                <div className="feature-demo__portfolio-overlay" id="portfolio-pro-overlay" aria-hidden={view !== 'pro'} style={{
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
                                    opacity: view === 'pro' ? 1 : 0
                                }}></div>
                                
                                <div className="feature-demo__portfolio-info">
                                    <div className="feature-demo__portfolio-name">Elara Keats</div>
                                    <div className="feature-demo__portfolio-stats">
                                        <div className="feature-demo__portfolio-stat">
                                            <span className="label">Height</span>
                                            <span className="value">5' 11"</span>
                                        </div>
                                        <div className="feature-demo__portfolio-stat">
                                            <span className="label">Bust</span>
                                            <span className="value">32"</span>
                                        </div>
                                        <div className="feature-demo__portfolio-stat">
                                            <span className="label">Waist</span>
                                            <span className="value">25"</span>
                                        </div>
                                        <div className="feature-demo__portfolio-stat">
                                            <span className="label">Hips</span>
                                            <span className="value">35"</span>
                                        </div>
                                    </div>
                                    
                                    {/* Pro Features */}
                                    <div className="feature-demo__portfolio-features" id="portfolio-features">
                                        <a href="#" className={`feature-demo__portfolio-feature feature-demo__portfolio-feature--contact ${view === 'pro' ? 'is-visible' : ''} feature-demo__portfolio-feature--pro`} aria-hidden={view !== 'pro'}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                            Contact Me
                                        </a>
                                        <a href="#" className={`feature-demo__portfolio-feature feature-demo__portfolio-feature--social ${view === 'pro' ? 'is-visible' : ''} feature-demo__portfolio-feature--pro`} aria-hidden={view !== 'pro'}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                            Instagram
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Gallery Preview (only visible in Pro sort of, or enhanced) */}
                            <div className="gallery-preview" id="portfolio-gallery-preview" aria-hidden={view !== 'pro'} style={{
                                opacity: view === 'pro' ? 1 : 0, 
                                height: view === 'pro' ? 'auto' : 0,
                                overflow: 'hidden',
                                transition: 'all 0.4s ease'
                            }}>
                                <div className="gallery-preview__grid">
                                    <div className="gallery-preview__item" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80)'}}></div>
                                    <div className="gallery-preview__item" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80)'}}></div>
                                    <div className="gallery-preview__item" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80)'}}></div>
                                </div>
                            </div>

                            {/* Watermark for Free */}
                            {view === 'free' && (
                                <div className="portfolio-badge" id="portfolio-badge">
                                    Powered by Pholio
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PortfolioToggle;
