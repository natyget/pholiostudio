import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function UniversalHeader() {
  const location = useLocation();
  const { user, profile } = useAuth({ skipRedirect: true }); // Don't redirect if not logged in
  
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHomepage = location.pathname === '/';
  
  // Close menus on route change
  useEffect(() => {
    setIsNavOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Handle scroll for homepage transparency
  useEffect(() => {
    if (!isHomepage) {
      setScrolled(false);
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);

  // Toggle body scroll when nav is open
  useEffect(() => {
    if (isNavOpen) {
      document.body.classList.add('nav-open');
    } else {
      document.body.classList.remove('nav-open');
    }
    return () => document.body.classList.remove('nav-open');
  }, [isNavOpen]);

  // User display logic
  let displayName = '';
  let userInitial = 'U';
  if (profile && profile.first_name) {
    displayName = profile.first_name + (profile.last_name ? ' ' + profile.last_name : '');
    userInitial = profile.first_name.charAt(0).toUpperCase();
  } else if (user && user.email) {
    displayName = user.email.split('@')[0];
    userInitial = user.email.charAt(0).toUpperCase();
  }
  
  const dashboardHref = user?.role === 'AGENCY' ? '/dashboard/agency' : '/dashboard/talent';
  const roleLabel = user?.role === 'AGENCY' ? 'Agency' : 'Talent';

  return (
    <>
      <header className={`universal-header ${isHomepage ? 'universal-header--homepage' : ''} ${scrolled ? 'scrolled' : ''}`} role="banner">
        <div className="universal-header__inner">
          <Link className="universal-header__logo" to="/">
            <img src="/assets/PHOLIO_LOGO.png" alt="Pholio" height="32" style={{ height: '32px', width: 'auto' }} />
          </Link>
          
          <button 
            className="universal-header__menu-toggle" 
            aria-expanded={isNavOpen} 
            aria-controls="universalNav" 
            aria-label="Toggle navigation"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <nav className="universal-header__nav" aria-label="Primary">
            <ul>
              <li><Link to="/" aria-current={location.pathname === '/' ? 'page' : undefined}>Home</Link></li>
              <li><Link to="/features" aria-current={location.pathname === '/features' ? 'page' : undefined}>Features</Link></li>
              <li><Link to="/pricing" aria-current={location.pathname === '/pricing' ? 'page' : undefined}>Pricing</Link></li>
              <li><Link to="/pro" aria-current={location.pathname === '/pro' ? 'page' : undefined}>Studio+</Link></li>
              <li><Link to="/press" aria-current={location.pathname === '/press' ? 'page' : undefined}>Press</Link></li>
            </ul>
          </nav>

          <div className="universal-header__actions">
            {user ? (
              <div className="universal-header__user-wrapper">
                <div className="universal-header__user-dropdown" aria-expanded={isUserMenuOpen}>
                  <button 
                    type="button" 
                    className="universal-header__user" 
                    data-initial={userInitial} 
                    aria-label="User menu" 
                    aria-expanded={isUserMenuOpen}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <span className="universal-header__user-name">{displayName}</span>
                    <span className="universal-header__badge universal-header__badge--role">{roleLabel}</span>
                    {profile && profile.is_pro ? (
                      <span className="universal-header__badge universal-header__badge--pro">Studio+</span>
                    ) : (
                      <span className="universal-header__badge universal-header__badge--free">Free</span>
                    )}
                    <svg className="universal-header__user-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <div className={`universal-header__user-menu ${isUserMenuOpen ? 'is-open' : ''}`} style={{ visibility: isUserMenuOpen ? 'visible' : 'hidden', opacity: isUserMenuOpen ? 1 : 0, transform: isUserMenuOpen ? 'translateY(0)' : 'translateY(-8px)' }}>
                    <div className="universal-header__user-menu-header">
                      <div className="universal-header__user-menu-avatar" data-initial={userInitial}></div>
                      <div className="universal-header__user-menu-info">
                        <div className="universal-header__user-menu-name">{displayName}</div>
                        <div className="universal-header__user-menu-email">{user.email}</div>
                        <div className="universal-header__user-menu-role">{roleLabel}</div>
                      </div>
                    </div>
                    <div className="universal-header__user-menu-divider"></div>
                    <Link to={dashboardHref} className="universal-header__user-menu-item">
                      <svg className="universal-header__user-menu-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 8C2 10.2091 3.79086 12 6 12C7.86384 12 9.42994 10.7252 9.87398 9H14V7H9.87398C9.42994 5.27477 7.86384 4 6 4C3.79086 4 2 5.79086 2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 8C14 10.2091 12.2091 12 10 12C8.13616 12 6.57006 10.7252 6.12602 9H2V7H6.12602C6.57006 5.27477 8.13616 4 10 4C12.2091 4 14 5.79086 14 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/dashboard/settings" className="universal-header__user-menu-item">
                      <svg className="universal-header__user-menu-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.6569 10.3431C13.8447 10.5309 13.9492 10.7852 13.9492 11.0503C13.9492 11.3153 13.8447 11.5696 13.6569 11.7574L11.7574 13.6569C11.5696 13.8447 11.3153 13.9492 11.0503 13.9492C10.7852 13.9492 10.5309 13.8447 10.3431 13.6569L2.34315 5.65685C2.15536 5.46906 2.05086 5.21481 2.05086 4.94975C2.05086 4.68469 2.15536 4.43044 2.34315 4.24264L4.24264 2.34315C4.43044 2.15536 4.68469 2.05086 4.94975 2.05086C5.21481 2.05086 5.46906 2.15536 5.65685 2.34315L13.6569 10.3431Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Settings</span>
                    </Link>
                    <form method="post" action="/logout" className="universal-header__user-menu-item-form">
                      {/* Note: In React we should manually handle logout, but form post works too if backend handles it */}
                      <button type="submit" className="universal-header__user-menu-item universal-header__user-menu-item--logout">
                        <svg className="universal-header__user-menu-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 14H3.33333C2.59695 14 2 13.403 2 12.6667V3.33333C2 2.59695 2.59695 2 3.33333 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 11.3333L14 8L10 4.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Logout</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <a className="universal-header__link" href="/login">Login</a>
                <a className="universal-header__cta universal-header__cta--primary" href="/apply">Start Creating</a>
              </>
            )}
          </div>
        </div>
        
        <div className="universal-header__nav-panel" id="universalNav" aria-hidden={!isNavOpen} hidden={!isNavOpen}>
          <div className="universal-header__nav-panel-inner">
            <div className="universal-header__nav-panel-top">
              <span className="universal-header__nav-panel-logo">
                <img src="/assets/PHOLIO_LOGO.png" alt="Pholio" height="28" style={{ height: '28px', width: 'auto' }} />
              </span>
              <button 
                className="universal-header__close" 
                type="button" 
                aria-label="Close menu"
                onClick={() => setIsNavOpen(false)}
              >
                <span></span>
                <span></span>
              </button>
            </div>

            {user && (
              <div className="universal-header__mobile-user">
                <div className="universal-header__mobile-avatar" data-initial={userInitial}></div>
                <div className="universal-header__mobile-user-info">
                  <span className="universal-header__mobile-user-name">{displayName}</span>
                  <span className="universal-header__mobile-user-email">{user.email}</span>
                  <div className="universal-header__mobile-user-badges">
                    <span className="universal-header__badge universal-header__badge--role">{roleLabel}</span>
                    {profile && profile.is_pro ? (
                      <span className="universal-header__badge universal-header__badge--pro">Studio+</span>
                    ) : (
                      <span className="universal-header__badge universal-header__badge--free">Free</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <nav className="universal-header__mobile-nav" aria-label="Primary">
              <ul>
                <li>
                  <Link to="/" aria-current={location.pathname === '/' ? 'page' : undefined}>
                    <svg className="universal-header__mobile-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link to="/features" aria-current={location.pathname === '/features' ? 'page' : undefined}>
                    <svg className="universal-header__mobile-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <span>Features</span>
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" aria-current={location.pathname === '/pricing' ? 'page' : undefined}>
                    <svg className="universal-header__mobile-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span>Pricing</span>
                  </Link>
                </li>
                <li>
                  <Link to="/pro" aria-current={location.pathname === '/pro' ? 'page' : undefined}>
                    <svg className="universal-header__mobile-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span>Studio+</span>
                  </Link>
                </li>
                <li>
                  <Link to="/press" aria-current={location.pathname === '/press' ? 'page' : undefined}>
                    <svg className="universal-header__mobile-nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    <span>Press</span>
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="universal-header__mobile-actions">
              {user ? (
                <>
                  <Link to={dashboardHref} className="universal-header__mobile-link">Go to Dashboard</Link>
                  <Link to="/dashboard/settings" className="universal-header__mobile-link">Settings</Link>
                  <form method="post" action="/logout" className="universal-header__mobile-logout">
                    <button type="submit">Logout</button>
                  </form>
                </>
              ) : (
                <>
                  <a href="/login" className="universal-header__mobile-link">Login</a>
                  <a className="universal-header__cta universal-header__cta--primary universal-header__mobile-cta" href="/apply">Start Creating</a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="universal-header__overlay" id="universalNavOverlay" hidden={!isNavOpen} aria-hidden={!isNavOpen} onClick={() => setIsNavOpen(false)}></div>
    </>
  );
}
