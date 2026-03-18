import React, { useState, useEffect } from 'react';

const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const testimonials = [
        {
            name: "Sarah Chen",
            role: "Creative Director, Elite Model Management",
            location: "New York City",
            quote: "Pholio transformed how we manage our talent roster. The AI curation maintains editorial standards while saving hours of manual work. Every comp card is publication-ready.",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
        },
        {
            name: "Marcus Jenkins",
            role: "Signed Talent",
            location: "London",
            quote: "I was struggling to format my digital portfolio for months. Pholio's AI took my raw photos and created a stunning comp card in seconds. I'm now signed with my dream agency in London.",
            image: "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&w=400&q=80"
        },
        {
            name: "David Rossi",
            role: "Global Scouting Director, Major Model Management",
            location: "Milan / Paris",
            quote: "We previously spent 15+ hours a week just reformatting submissions. With Pholio, our scouts get auto-curated profiles that are ready for internal review immediately. It's reduced our recruitment cycle by 40%.",
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
            caseStudy: true
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const goToSlide = (index) => setCurrentIndex(index);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);

    return (
        <section className="homepage-testimonials" id="homepage-testimonials">
            <div className="homepage-testimonials__inner">
                <div className="homepage-testimonials__header">
                    <h2 className="homepage-testimonials__title">Trusted by the World's Leading Agencies</h2>
                    <p className="homepage-testimonials__subtitle">Join the professional platform scouts use to discover new faces</p>
                </div>

                {/* Agency Logo Wall */}
                <div className="agency-logos">
                    <p className="agency-logos__text">Trusted by agencies in LA, NYC, London, Paris, Tokyo</p>
                    <div className="agency-logos__grid">
                        {["Elite", "Next", "IMG", "Ford", "Major", "Storm"].map((logo) => (
                            <div className="agency-logo" key={logo}>
                                <svg viewBox="0 0 100 40" fill="currentColor">
                                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="Noto Serif Display" fontWeight="400" fontSize="20">{logo}</text>
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="homepage-testimonials__carousel-wrapper">
                    <div className="homepage-testimonials__carousel" id="testimonial-carousel">
                        {testimonials.map((testimonial, index) => (
                            <div 
                                className={`testimonial-slide ${index === currentIndex ? 'active' : ''} ${testimonial.caseStudy ? 'testimonial-slide--case-study' : ''}`} 
                                key={index} 
                                data-index={index}
                            >
                                <div className="testimonial-slide__content">
                                    <div className="testimonial-slide__image">
                                        <img src={testimonial.image} alt={testimonial.name} />
                                    </div>
                                    <div className="testimonial-slide__text-content">
                                        {testimonial.caseStudy ? (
                                            <>
                                                <div className="case-study-tag">Case Study</div>
                                                <h3 className="case-study-title">Streamlining Global Scouting</h3>
                                                <p className="case-study-excerpt">"{testimonial.quote}"</p>
                                            </>
                                        ) : (
                                            <div className="testimonial-slide__quote">
                                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="quote-icon">
                                                    <path d="M10 25h5l3-7v-8h-10v8h5l-3 7zm15 0h5l3-7v-8h-10v8h5l-3 7z" fill="currentColor"/>
                                                </svg>
                                                <p>"{testimonial.quote}"</p>
                                            </div>
                                        )}
                                        <div className="testimonial-slide__footer">
                                            <span className="testimonial-slide__name">{testimonial.name}</span>
                                            <span className="testimonial-slide__role">{testimonial.role}</span>
                                            <span className="testimonial-slide__location">{testimonial.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="carousel-nav">
                        <button className="carousel-nav__btn carousel-nav__btn--prev" aria-label="Previous testimonial" onClick={prevSlide}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 19l-7-7 7-7"/>
                            </svg>
                        </button>
                        <div className="carousel-indicators">
                            {testimonials.map((_, index) => (
                                <button 
                                    className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`} 
                                    onClick={() => goToSlide(index)} 
                                    key={index}
                                    data-index={index}
                                ></button>
                            ))}
                        </div>
                        <button className="carousel-nav__btn carousel-nav__btn--next" aria-label="Next testimonial" onClick={nextSlide}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
