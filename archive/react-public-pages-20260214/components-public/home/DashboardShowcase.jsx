import React, { useEffect, useRef, useState } from 'react';

const DashboardShowcase = () => {
    const sectionRef = useRef(null);
    const progressFillRef = useRef(null);
    const progressPercentageRef = useRef(null);
    const [activeTab, setActiveTab] = useState('talent'); // 'talent' or 'agency'

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    animateProgress();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const animateProgress = () => {
        if (!progressFillRef.current || !progressPercentageRef.current) return;

        const targetProgress = 95;
        const duration = 2000;
        let start = null;

        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min((progress / duration) * targetProgress, targetProgress);

            progressFillRef.current.style.width = `${percentage}%`;
            progressPercentageRef.current.textContent = `${Math.floor(percentage)}%`;

            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    };

    return (
        <section className="dashboard-showcase" id="dashboard-showcase" ref={sectionRef}>
            <div className="dashboard-showcase__container">
                <div className="dashboard-showcase__header">
                    <span className="dashboard-showcase__subtitle">Power in Your Pocket</span>
                    <h2 className="dashboard-showcase__title">Complete Control</h2>
                    <p className="dashboard-showcase__description">
                        Whether you're a talent managing your portfolio or an agency scouting the next big thing, Pholio gives you the tools you need.
                    </p>
                    
                    <div className="dashboard-showcase__toggle">
                        <button 
                            className={`dashboard-showcase__toggle-btn ${activeTab === 'talent' ? 'active' : ''}`}
                            onClick={() => setActiveTab('talent')}
                        >
                            For Talent
                        </button>
                        <button 
                            className={`dashboard-showcase__toggle-btn ${activeTab === 'agency' ? 'active' : ''}`}
                            onClick={() => setActiveTab('agency')}
                        >
                            For Agencies
                        </button>
                    </div>
                </div>

                <div className="dashboard-showcase__content">
                    {/* Talent View */}
                    <div className={`dashboard-showcase__view ${activeTab === 'talent' ? 'active' : ''}`} id="view-talent">
                        <div className="dashboard-showcase__grid">
                            <div className="dashboard-showcase__panel dashboard-showcase__panel--main">
                                <div className="dashboard-showcase__panel-header">
                                    <h3>Profile Strength</h3>
                                    <div className="dashboard-showcase__badge">Pro</div>
                                </div>
                                <div className="dashboard-showcase__progress-container" id="talent-profile-progress">
                                    <div className="dashboard-showcase__progress-bar">
                                        <div className="dashboard-showcase__progress-fill" id="progress-fill" ref={progressFillRef} style={{width: '0%'}}></div>
                                    </div>
                                    <div className="dashboard-showcase__progress-stats">
                                        <span className="label">Profile Completion</span>
                                        <span className="value" id="progress-percentage" ref={progressPercentageRef}>0%</span>
                                    </div>
                                    <div className="dashboard-showcase__completion-list">
                                        <div className="dashboard-showcase__completion-item completed">
                                            <div className="dashboard-showcase__completion-icon">✓</div>
                                            <div className="dashboard-showcase__completion-label">Measurements Added</div>
                                        </div>
                                        <div className="dashboard-showcase__completion-item completed">
                                            <div className="dashboard-showcase__completion-icon">✓</div>
                                            <div className="dashboard-showcase__completion-label">Portfolio Uploaded</div>
                                        </div>
                                        <div className="dashboard-showcase__completion-item completed">
                                            <div className="dashboard-showcase__completion-icon">✓</div>
                                            <div className="dashboard-showcase__completion-label">Bio Generated</div>
                                        </div>
                                        <div className="dashboard-showcase__completion-item pending">
                                            <div className="dashboard-showcase__completion-icon">○</div>
                                            <div className="dashboard-showcase__completion-label">Connect Instagram</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-showcase__panel dashboard-showcase__panel--media">
                                <div className="dashboard-showcase__media-grid">
                                    <div className="dashboard-showcase__media-item" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80)'}}></div>
                                    <div className="dashboard-showcase__media-item" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80)'}}></div>
                                    <div className="dashboard-showcase__media-item" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80)'}}></div>
                                    <div className="dashboard-showcase__media-item add-new">
                                        <span>+</span>
                                    </div>
                                </div>
                                <div className="dashboard-showcase__panel-footer">
                                    <span>Portfolio Assets</span>
                                    <button className="dashboard-showcase__icon-btn">Edit</button>
                                </div>
                            </div>

                            <div className="dashboard-showcase__panel dashboard-showcase__panel--stats">
                                <div className="dashboard-showcase__stat">
                                    <span className="value">1.2k</span>
                                    <span className="label">Profile Views</span>
                                </div>
                                <div className="dashboard-showcase__stat">
                                    <span className="value">48</span>
                                    <span className="label">Agency Saves</span>
                                </div>
                                <div className="dashboard-showcase__stat">
                                    <span className="value">12</span>
                                    <span className="label">Inquiries</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Agency View */}
                    <div className={`dashboard-showcase__view ${activeTab === 'agency' ? 'active' : ''}`} id="view-agency">
                        <div className="dashboard-showcase__agency-interface">
                            <div className="dashboard-showcase__agency-sidebar">
                                <div className="dashboard-showcase__agency-nav-item active">Dashboard</div>
                                <div className="dashboard-showcase__agency-nav-item">Talent Search </div>
                                <div className="dashboard-showcase__agency-nav-item">Applications <span className="badge">3</span></div>
                                <div className="dashboard-showcase__agency-nav-item">Shortlists</div>
                            </div>
                            <div className="dashboard-showcase__agency-main">
                                <div className="dashboard-showcase__agency-header">
                                    <h3>New Applications</h3>
                                    <div className="dashboard-showcase__filter-bar">
                                        <span className="filter active">All</span>
                                        <span className="filter">Pending</span>
                                        <span className="filter">Approved</span>
                                    </div>
                                </div>
                                <div className="dashboard-showcase__talent-list">
                                    <div className="dashboard-showcase__talent-card">
                                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Talent" className="avatar" />
                                        <div className="info">
                                            <span className="name">Sarah J.</span>
                                            <span className="details">5'11" • 32-24-35</span>
                                        </div>
                                        <div className="match-score high">98% Match</div>
                                        <div className="actions">
                                            <button className="btn-approve">✓</button>
                                            <button className="btn-reject">✕</button>
                                        </div>
                                    </div>
                                    <div className="dashboard-showcase__talent-card">
                                        <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80" alt="Talent" className="avatar" />
                                        <div className="info">
                                            <span className="name">Michael C.</span>
                                            <span className="details">6'1" • 40-32-38</span>
                                        </div>
                                        <div className="match-score medium">85% Match</div>
                                        <div className="actions">
                                            <button className="btn-approve">✓</button>
                                            <button className="btn-reject">✕</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DashboardShowcase;
