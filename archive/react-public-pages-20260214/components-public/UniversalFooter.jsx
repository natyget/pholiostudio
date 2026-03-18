import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function UniversalFooter() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    // Simulate API call or implement actual subscription if endpoint exists
    try {
      // For now, just simulate success after delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('success');
      setMessage('Thanks for subscribing!');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <footer className="universal-footer" role="contentinfo">
      <div className="universal-footer__container">
        {/* Hero Section: Metrics & Featured Content */}
        <div className="universal-footer__hero">
          {/* Metrics Bar */}
          <div className="footer-metrics">
            <div className="footer-metrics__item">
              <div className="footer-metrics__value" data-target="10000">10k+</div>
              <div className="footer-metrics__label">Portfolios Created</div>
            </div>
            <div className="footer-metrics__divider"></div>
            <div className="footer-metrics__item">
              <div className="footer-metrics__value" data-target="500">500+</div>
              <div className="footer-metrics__label">Agencies</div>
            </div>
            <div className="footer-metrics__divider"></div>
            <div className="footer-metrics__item">
              <div className="footer-metrics__value">2 min</div>
              <div className="footer-metrics__label">AI-Curated</div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="universal-footer__main">
          {/* Brand Section */}
          <div className="universal-footer__brand-section">
            <Link to="/" className="universal-footer__logo">
              <span className="footer-logo__text">PHOLIO</span>
              <span className="footer-logo__accent"></span>
            </Link>
            <p className="universal-footer__tagline">
              Editorial-quality portfolios. AI-curated. Publication-ready.
            </p>
            <div className="universal-footer__quote">
              <blockquote className="footer-quote">
                <span className="footer-quote__text">"Every portfolio tells a story. We make sure it's editorial."</span>
              </blockquote>
            </div>
            
            {/* Social Links */}
            <div className="universal-footer__social">
              <a href="https://instagram.com/pholio" className="footer-social__link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://linkedin.com/company/pholio" className="footer-social__link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href="https://twitter.com/pholio" className="footer-social__link" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Sections (2 Columns) */}
          <div className="universal-footer__nav-sections">
            {/* Product & Resources */}
            <nav className="universal-footer__nav-group" aria-label="Product and resources navigation">
              <h3 className="footer-nav__heading">Product & Resources</h3>
              <ul className="footer-nav__list">
                <li><Link to="/features" className="footer-nav__link">Features</Link></li>
                <li><Link to="/pricing" className="footer-nav__link">Pricing</Link></li>
                <li><Link to="/pro" className="footer-nav__link">Studio+</Link></li>
                <li><a href="/apply" className="footer-nav__link">For Talent</a></li>
                <li><a href="/partners" className="footer-nav__link">For Agencies</a></li>
                <li><Link to="/press" className="footer-nav__link">Blog</Link></li>
              </ul>
            </nav>

            {/* Company & Support */}
            <nav className="universal-footer__nav-group" aria-label="Company and support navigation">
              <h3 className="footer-nav__heading">Company & Support</h3>
              <ul className="footer-nav__list">
                <li><Link to="/press" className="footer-nav__link">Press</Link></li>
                <li><a href="/partners" className="footer-nav__link">Partners</a></li>
                <li><Link to="/legal" className="footer-nav__link">Legal</Link></li>
                <li><a href="mailto:press@pholio.studio" className="footer-nav__link">Contact</a></li>
                <li><a href="/apply" className="footer-nav__link">Get Started</a></li>
              </ul>
            </nav>
          </div>

          {/* Newsletter Section */}
          <div className="universal-footer__newsletter-section">
            <div className="footer-newsletter">
              <h3 className="footer-newsletter__heading">Stay Curated</h3>
              <p className="footer-newsletter__text">
                Join 5,000+ talent professionals getting curated insights, new features, and success stories delivered weekly.
              </p>
              <form className="footer-newsletter__form" onSubmit={handleSubscribe} noValidate>
                <div className="footer-newsletter__input-wrapper">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Enter your email" 
                    className="footer-newsletter__input"
                    aria-label="Email address"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading' || status === 'success'}
                  />
                  <button type="submit" className="footer-newsletter__button" aria-label="Subscribe" disabled={status === 'loading' || status === 'success'}>
                    {status === 'loading' ? (
                      <svg className="footer-newsletter__button-spinner animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                    ) : (
                      <svg className="footer-newsletter__button-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    )}
                  </button>
                </div>
                {message && (
                  <div className={`footer-newsletter__message ${status === 'error' ? 'text-red-500' : 'text-green-500'}`} role="alert">
                    {message}
                  </div>
                )}
              </form>
              <div className="footer-newsletter__benefits">
                <span className="footer-newsletter__benefit">Weekly editorial insights</span>
                <span className="footer-newsletter__benefit">New feature announcements</span>
                <span className="footer-newsletter__benefit">Talent success stories</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="footer-contact">
              <p className="footer-contact__label">Press & Inquiries</p>
              <a href="mailto:press@pholio.studio" className="footer-contact__email">press@pholio.studio</a>
              <p className="footer-contact__label" style={{ marginTop: '1.5rem' }}>Partners</p>
              <a href="mailto:partners@pholio.studio" className="footer-contact__email">partners@pholio.studio</a>
            </div>
          </div>
        </div>

        {/* Trust Signals Section */}
        <div className="universal-footer__trust">
          <div className="footer-trust__label">Trusted by leading agencies</div>
          <div className="footer-trust__logos">
            <div className="footer-trust__logo">True Modeling</div>
            <div className="footer-trust__logo">Elite Talent</div>
            <div className="footer-trust__logo">Next Models</div>
            <div className="footer-trust__logo">Ford Models</div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="universal-footer__bottom">
          <div className="footer-bottom__left">
            <p className="footer-copyright">
              © {currentYear} Pholio. All rights reserved.
            </p>
            <div className="footer-badges">
              <span className="footer-badge footer-badge--ai">
                <span className="badge-icon">✨</span>
                <span className="badge-text">AI-Curated</span>
              </span>
            </div>
          </div>
          
          <div className="footer-bottom__right">
            <nav className="footer-bottom-nav" aria-label="Legal links">
              <Link to="/legal" className="footer-bottom-link">Privacy</Link>
              <span className="footer-separator">•</span>
              <Link to="/legal" className="footer-bottom-link">Terms</Link>
              <span className="footer-separator">•</span>
              <Link to="/legal" className="footer-bottom-link">Cookies</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
