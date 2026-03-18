import React from 'react';
import PricingSection from '../../components/public/home/PricingSection';

const PricingPage = () => {
    return (
        <div className="pricing-page">
            <div className="pricing-page__header">
                <div className="pricing-page__container">
                    <span className="pricing-page__badge">Plans & Pricing</span>
                    <h1 className="pricing-page__title">Invest in Your Career</h1>
                    <p className="pricing-page__subtitle">
                        Start for free, upgrade when you're ready. No hidden fees.
                    </p>
                </div>
            </div>
            
            <PricingSection />
            
            <section className="pricing-faq">
                <div className="pricing-faq__container">
                    <h2 className="pricing-faq__title">Frequently Asked Questions</h2>
                    <div className="pricing-faq__grid">
                        <div className="pricing-faq__item">
                            <h3>Can I cancel anytime?</h3>
                            <p>Yes, you can cancel your Studio+ subscription at any time. You'll keep access until the end of your billing period.</p>
                        </div>
                        <div className="pricing-faq__item">
                            <h3>What happens to my data if I downgrade?</h3>
                            <p>If you downgrade to Free, your public website will revert to the basic layout and some analytics data may be limited, but your core profile data is safe.</p>
                        </div>
                        <div className="pricing-faq__item">
                            <h3>Do agencies really use Pholio?</h3>
                            <p>Yes! We have over 500 verified agency partners using our dashboard to scout and manage talent applications daily.</p>
                        </div>
                        <div className="pricing-faq__item">
                            <h3>Is there a student discount?</h3>
                            <p>We offer discounts for students with valid IDs. Contact support@pholio.studio for more information.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PricingPage;
