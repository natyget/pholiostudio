import React, { useState } from 'react';

const ProPage = () => {
    const [copied, setCopied] = useState(false);
    
    const handleCopyUrl = () => {
        navigator.clipboard.writeText('pholio.studio/elara-k');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="pro-page">
            <section className="pro-hero">
                <div className="pro-hero__container">
                    <div className="pro-hero__content">
                        <span className="pro-hero__badge">Studio+</span>
                        <h1 className="pro-hero__title">Your Professional<br/>Digital Presence</h1>
                        <p className="pro-hero__description">
                            Get a custom domain, premium themes, and advanced analytics. The ultimate toolkit for the serious model.
                        </p>
                        <div className="pro-hero__actions">
                            <a href="/pro/upgrade" className="button button-primary button-large">Upgrade to Studio+</a>
                            <a href="#features" className="button button-secondary button-large">Explore Features</a>
                        </div>
                    </div>
                    <div className="pro-hero__visual">
                        <div className="pro-hero__browser-frame">
                            <div className="browser-bar">
                                <div className="dots"><span></span><span></span><span></span></div>
                                <div className="url-container" onClick={handleCopyUrl}>
                                    <span className="lock-icon">🔒</span>
                                    <span className="url-text">pholio.studio/elara-k</span>
                                    <span className="copy-icon" title="Copy URL">
                                        {copied ? '✓' : '📋'}
                                    </span>
                                </div>
                            </div>
                            <div className="browser-content">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" alt="Portfolio Preview" />
                                <div className="browser-overlay">
                                    <div className="browser-card">
                                        <h3>Elara Keats</h3>
                                        <p>Los Angeles • 5'11"</p>
                                        <div className="browser-tags">
                                            <span>Editorial</span>
                                            <span>Runway</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="pro-features">
                <div className="pro-features__container">
                    <div className="pro-feature-grid">
                        <div className="pro-feature-card">
                            <div className="pro-feature-icon">🎨</div>
                            <h3>Premium Themes</h3>
                            <p>Access our full library of editorial-grade portfolio themes. Stand out with layouts designed by industry experts.</p>
                        </div>
                        <div className="pro-feature-card">
                            <div className="pro-feature-icon">📊</div>
                            <h3>Advanced Analytics</h3>
                            <p>See who's viewing your profile, which agencies are interested, and track your application status in real-time.</p>
                        </div>
                        <div className="pro-feature-card">
                            <div className="pro-feature-icon">🌐</div>
                            <h3>Custom Domain</h3>
                            <p>Connect your own domain (yourname.com) or claim a premium pholio.studio handle for a professional link.</p>
                        </div>
                        <div className="pro-feature-card">
                            <div className="pro-feature-icon">⚡</div>
                            <h3>Priority Support</h3>
                            <p>Get your portfolio reviewed by our experts and enjoy priority response times from our support team.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pro-comparison">
                <div className="pro-comparison__container">
                    <h2 className="pro-comparison__title">Why Go Pro?</h2>
                    <div className="comparison-table">
                        <div className="comparison-row header">
                            <div className="col-feature">Feature</div>
                            <div className="col-free">Free</div>
                            <div className="col-pro">Studio+</div>
                        </div>
                        <div className="comparison-row">
                            <div className="col-feature">Portfolio Images</div>
                            <div className="col-free">10</div>
                            <div className="col-pro">Unlimited</div>
                        </div>
                        <div className="comparison-row">
                            <div className="col-feature">Comp Card Themes</div>
                            <div className="col-free">Basic</div>
                            <div className="col-pro">All Premium</div>
                        </div>
                        <div className="comparison-row">
                            <div className="col-feature">Analytics</div>
                            <div className="col-free">7 Days</div>
                            <div className="col-pro">90 Days</div>
                        </div>
                        <div className="comparison-row">
                            <div className="col-feature">Agency Applications</div>
                            <div className="col-free">Limited</div>
                            <div className="col-pro">Unlimited</div>
                        </div>
                    </div>
                    <div className="pro-comparison__cta">
                        <a href="/pro/upgrade" className="button button-gold button-large">Get Studio+ Today</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProPage;
