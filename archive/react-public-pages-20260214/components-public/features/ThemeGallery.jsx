import React, { useState } from 'react';

const ThemeGallery = () => {
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const themes = [
        {
            name: "Editorial",
            description: "Clean lines and bold typography for a high-fashion look.",
            image: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=400&q=80",
            pro: false
        },
        {
            name: "Minimalist",
            description: "Structure and simplicity that lets your work speak for itself.",
            image: "https://images.unsplash.com/photo-1445404590072-3f15331c98dd?auto=format&fit=crop&w=400&q=80",
            pro: false
        },
        {
            name: "Vogue",
            description: "Classic magazine layout with elegant serif typography.",
            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
            pro: true
        },
        {
            name: "Noir",
            description: "Dark, moody aesthetic for dramatic portfolios.",
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80",
            pro: true
        }
    ];

    const handleThemeClick = (theme) => {
        if (theme.pro) {
            // In a real app we might redirect or show upgrade modal
            // conforming to JS behavior: confirm dialog
            if (window.confirm('This theme is available for Studio+ members. Upgrade to unlock all themes.')) {
                window.location.href = '/pro/upgrade';
            }
            return;
        }

        setSelectedTheme(theme);
        setShowPreview(true);
    };

    return (
        <section className="feature-spread feature-spread--alt" id="feature-themes">
            <div className="feature-spread__container">
                <div className="feature-spread__header">
                    <span className="feature-spread__number">01</span>
                    <h2 className="feature-spread__title">PDF Comp Card Generator</h2>
                    <p className="feature-spread__description">
                        Create industry-standard comp cards in seconds. Choose from our curated collection of editorial themes, automatically populated with your best shots and vital stats.
                    </p>
                </div>

                <div className="feature-demo feature-demo--themes">
                    <div className="theme-gallery">
                        {themes.map((theme, index) => (
                            <div 
                                key={index} 
                                className={`theme-card ${selectedTheme === theme ? 'is-selected' : ''}`}
                                data-pro={theme.pro}
                                onClick={() => handleThemeClick(theme)}
                            >
                                <div className="theme-card__preview">
                                    <img src={theme.image} alt={`${theme.name} Theme`} loading="lazy" />
                                    {theme.pro && <div className="theme-card__badge">Studio+</div>}
                                </div>
                                <div className="theme-card__info">
                                    <div className="theme-card__name">{theme.name}</div>
                                    <div className="theme-card__desc">{theme.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Full Preview Modal */}
                    {showPreview && selectedTheme && (
                        <div className="theme-preview-full" id="theme-preview-full" onClick={(e) => {
                            if (e.target.className.includes('theme-preview-full')) setShowPreview(false);
                        }}>
                            <button className="theme-preview-close" onClick={() => setShowPreview(false)}>×</button>
                            <div className="theme-preview-content">
                                <h2 style={{fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem'}}>
                                    {selectedTheme.name} Theme
                                </h2>
                                <p style={{fontFamily: 'var(--font-sans)', color: '#475569', lineHeight: 1.7}}>
                                    The {selectedTheme.name} theme features an elegant, editorial layout perfect for professional comp cards.
                                    {selectedTheme.pro ? ' Upgrade to Studio+ to unlock this theme.' : ' This theme is available for free users.'}
                                </p>
                                <div style={{
                                    marginTop: '2rem', 
                                    padding: '2rem', 
                                    background: '#f8fafc', 
                                    border: '1px solid #e2e8f0', 
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    color: '#64748b'
                                }}>
                                    [Preview Placeholder for {selectedTheme.name}]
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ThemeGallery;
