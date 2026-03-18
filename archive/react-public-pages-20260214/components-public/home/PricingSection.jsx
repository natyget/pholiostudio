import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PricingSection = () => {
    const [isMonthly, setIsMonthly] = useState(true);

    return (
        <section className="pricing-spread" id="homepage-pricing-bottom" style={{position: 'relative', padding: '4rem 2rem', background: 'linear-gradient(135deg, #faf9f7 0%, #f5f4f2 100%)', overflow: 'hidden'}}>
            <div style={{maxWidth: '1200px', margin: '0 auto'}}>
                {/* Header */}
                <div style={{textAlign: 'center', marginBottom: '3rem'}}>
                    <h1 style={{fontSize: '3rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.02em'}}>
                        Choose Your Plan
                    </h1>
                    <p style={{fontSize: '1.125rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 2rem'}}>
                        Elevate your portfolio with Studio+. Cancel anytime.
                    </p>
                    
                    {/* Billing Toggle */}
                    <div style={{display: 'inline-flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
                        <button 
                            className="billing-toggle" 
                            onClick={() => setIsMonthly(true)}
                            style={{
                                padding: '0.625rem 1.25rem', 
                                borderRadius: '8px', 
                                background: isMonthly ? '#C9A55A' : 'transparent', 
                                color: isMonthly ? 'white' : '#64748b', 
                                border: 'none', 
                                fontSize: '0.875rem', 
                                fontWeight: 600, 
                                cursor: 'pointer', 
                                transition: 'all 0.2s'
                            }}
                        >
                            Monthly
                        </button>
                        <button 
                            className="billing-toggle" 
                            onClick={() => setIsMonthly(false)}
                            style={{
                                padding: '0.625rem 1.25rem', 
                                borderRadius: '8px', 
                                background: !isMonthly ? '#C9A55A' : 'transparent', 
                                color: !isMonthly ? 'white' : '#64748b', 
                                border: 'none', 
                                fontSize: '0.875rem', 
                                fontWeight: 600, 
                                cursor: 'pointer', 
                                transition: 'all 0.2s', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem'
                            }}
                        >
                            Annual
                            <span style={{padding: '0.125rem 0.5rem', background: '#dcfce7', color: '#16a34a', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600}}>
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto'}}>
                    {/* Free Plan */}
                    <div className="pricing-card pricing-card--free" style={{background: '#ffffff', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 4px 12px -4px rgba(0, 0, 0, 0.08)', position: 'relative', transform: 'scale(1)', transition: 'all 0.3s ease'}}>
                        <h2 style={{fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem'}}>
                            Free
                        </h2>
                        <p style={{fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem'}}>
                            Perfect for getting started
                        </p>
                        <div style={{marginBottom: '2rem'}}>
                            <span style={{fontSize: '3rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em'}}>
                                $0
                            </span>
                            <span style={{fontSize: '0.875rem', color: '#64748b', marginLeft: '0.5rem'}}>
                                forever
                            </span>
                        </div>
                        <ul style={{listStyle: 'none', padding: 0, margin: '0 0 2rem 0'}}>
                             {[
                                "Professional portfolio page",
                                "Basic comp card download",
                                "Up to 10 portfolio images",
                                "7-day analytics",
                                "Profile strength tracker",
                                "Agency applications"
                            ].map((item, i) => (
                                <li key={i} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', fontSize: '0.875rem', color: '#0f172a', borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none'}}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A55A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/apply" style={{width: '100%', padding: '0.875rem 1.5rem', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'block', textAlign: 'center', textDecoration: 'none'}}>
                            Get Started Free
                        </Link>
                    </div>

                    {/* Studio+ Plan */}
                    <div className="pricing-card pricing-card--pro" style={{background: '#ffffff', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 20px 40px -10px rgba(201, 165, 90, 0.2), 0 0 0 2px #C9A55A', position: 'relative', transform: 'scale(1.05)', transition: 'all 0.3s ease'}}>
                        <div style={{position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #C9A55A 0%, #b08d45 100%)', color: '#ffffff', padding: '0.375rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem', letterSpacing: '0.05em', textTransform: 'uppercase'}}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            Recommended
                        </div>
                        <h2 style={{fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem'}}>
                            Studio+
                        </h2>
                        <p style={{fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem'}}>
                            For serious talent
                        </p>
                        
                        <div style={{marginBottom: '2rem'}}>
                            {isMonthly ? (
                                <div className="price-display">
                                    <span style={{fontSize: '3rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em'}}>$9.99</span>
                                    <span style={{fontSize: '0.875rem', color: '#64748b', marginLeft: '0.5rem'}}>per month</span>
                                </div>
                            ) : (
                                <div className="price-display">
                                    <span style={{fontSize: '3rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em'}}>$95.90</span>
                                    <span style={{fontSize: '0.875rem', color: '#64748b', marginLeft: '0.5rem'}}>per year</span>
                                    <div style={{marginTop: '0.5rem'}}>
                                        <span style={{fontSize: '0.75rem', color: '#16a34a', fontWeight: 600}}>Save $23.98 annually</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <ul style={{listStyle: 'none', padding: 0, margin: '0 0 2rem 0'}}>
                            <li style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', fontSize: '0.875rem', color: '#0f172a', borderBottom: '1px solid #f1f5f9'}}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A55A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <strong>Everything in Free, plus:</strong>
                            </li>
                            {[
                                "Live portfolio website with custom domain",
                                "Full agency database & unlimited applications",
                                "AI agency matching & profile optimization",
                                "Smart portfolio builder with AI photo selection",
                                "Professional comp cards with multiple layouts",
                                "Full analytics dashboard & engagement tracking",
                                "Unlimited photo uploads with vector support",
                                "Push recommendations to matched agencies"
                            ].map((item, i) => (
                                <li key={i} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', fontSize: '0.875rem', color: '#0f172a', borderBottom: i < 7 ? '1px solid #f1f5f9' : 'none'}}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A55A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Link to="/pro/upgrade" style={{width: '100%', padding: '0.875rem 1.5rem', background: '#C9A55A', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'block', textAlign: 'center', textDecoration: 'none'}}>
                            Upgrade to Studio+
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
