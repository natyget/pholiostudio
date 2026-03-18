import React from 'react';

const PressPage = () => {
    return (
        <div className="press-page">
            <div className="press-hero">
                <div className="press-hero__container">
                    <span className="press-hero__badge">Newsroom</span>
                    <h1 className="press-hero__title">Pholio in the News</h1>
                    <p className="press-hero__subtitle">
                        Latest updates, media assets, and company news.
                    </p>
                </div>
            </div>

            <section className="press-releases">
                <div className="press-container">
                    <h2 className="section-title">Latest Releases</h2>
                    <div className="press-grid">
                        <div className="press-card">
                            <span className="press-date">October 15, 2025</span>
                            <h3>Pholio Launches Studio+, Bringing Professional Tools to Independent Talent</h3>
                            <p>New subscription tier offers custom domains, advanced analytics, and premium comp card generation.</p>
                            <a href="#" className="read-more">Read Release →</a>
                        </div>
                        <div className="press-card">
                            <span className="press-date">August 2, 2025</span>
                            <h3>Pholio Partners with Top Global Agencies to Streamline Scouting</h3>
                            <p>Direct integration allows agencies to receive standardized digital portfolios, reducing review time by 40%.</p>
                            <a href="#" className="read-more">Read Release →</a>
                        </div>
                        <div className="press-card">
                            <span className="press-date">May 10, 2025</span>
                            <h3>Introducing AI-Powered Bio and Resume Generation</h3>
                            <p>Models can now generate professional bios and formatted resumes in seconds using Pholio's new AI engine.</p>
                            <a href="#" className="read-more">Read Release →</a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="media-kit">
                <div className="media-kit__container">
                    <div className="media-kit__content">
                        <h2>Brand Assets & Media Kit</h2>
                        <p>Download official logos, product screenshots, and executive headshots.</p>
                        <div className="media-kit__actions">
                            <button className="button button-primary">Download Media Kit (ZIP)</button>
                            <button className="button button-secondary">View Brand Guidelines</button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="press-contact">
                <div className="press-container">
                    <div className="contact-box">
                        <h3>Media Inquiries</h3>
                        <p>For press/media inquiries, please contact:</p>
                        <a href="mailto:press@pholio.studio" className="contact-email">press@pholio.studio</a>
                        <p className="contact-note">Please note that this email is for media inquiries only. For support, please visit our Help Center.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PressPage;
