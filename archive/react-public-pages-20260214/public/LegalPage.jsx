import React from 'react';

const LegalPage = () => {
    return (
        <div className="legal-page">
            <div className="legal-header">
                <div className="legal-container">
                    <h1>Legal Center</h1>
                    <p>Last updated: January 1, 2026</p>
                </div>
            </div>

            <div className="legal-container legal-content-wrapper">
                <aside className="legal-sidebar">
                    <nav>
                        <a href="#terms" className="active">Terms of Service</a>
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#cookies">Cookie Policy</a>
                        <a href="#acceptable-use">Acceptable Use</a>
                    </nav>
                </aside>
                
                <main className="legal-body">
                    <section id="terms">
                        <h2>Terms of Service</h2>
                        <p>Welcome to Pholio. By using our website and services, you agree to these Terms. Please read them carefully.</p>
                        <h3>1. Acceptance of Terms</h3>
                        <p>By accessing or using the Pholio platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                        <h3>2. User Accounts</h3>
                        <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
                        <h3>3. Content Ownership</h3>
                        <p>You retain all rights to the photos and content you upload to Pholio. By uploading, you grant Pholio a license to display and host this content for the purpose of providing our services.</p>
                    </section>

                    <section id="privacy">
                        <h2>Privacy Policy</h2>
                        <p>Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p>
                        <h3>Information Collection</h3>
                        <p>We collect information you provide directly to us, such as when you create an account, update your profile, or contact support.</p>
                        <h3>Data Usage</h3>
                        <p>We use your data to provide and improve our services, communicate with you, and personalize your experience.</p>
                    </section>

                    <section id="cookies">
                        <h2>Cookie Policy</h2>
                        <p>We use cookies and similar technologies to enhance your experience, analyze usage, and assist with our marketing efforts.</p>
                        <p>You can control cookies through your browser settings and other tools.</p>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default LegalPage;
