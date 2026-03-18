import React, { useEffect, useRef, useState } from 'react';

const BioTransformationDemo = () => {
    const [inputValue, setInputValue] = useState('');
    const [outputValue, setOutputValue] = useState('');
    const [height, setHeight] = useState("5' 11\" / 180cm");
    const [measurements, setMeasurements] = useState("32-25-35");
    const [isSparkling, setIsSparkling] = useState(false);
    
    const refinedBio = "Elara Keats brings a refined editorial sensibility to every project. Based in Los Angeles, she seamlessly transitions between high-fashion editorials and commercial campaigns, delivering versatile performance with consistent professionalism.";
    
    const timeoutRef = useRef(null);
    const typeWriterTimeoutRef = useRef(null);

    // Initial Auto Demo
    useEffect(() => {
        let index = 0;
        
        const typeWriter = () => {
            if (index < refinedBio.length) {
                setOutputValue(prev => prev + refinedBio.charAt(index));
                index++;
                typeWriterTimeoutRef.current = setTimeout(typeWriter, 30);
            } else {
                setHeight("5' 11\" / 180cm");
                setMeasurements("32-25-35");
                triggerSparkle();
            }
        };

        const timer = setTimeout(() => {
            setOutputValue('');
            typeWriter();
        }, 1000);

        return () => {
            clearTimeout(timer);
            if (typeWriterTimeoutRef.current) clearTimeout(typeWriterTimeoutRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const triggerSparkle = () => {
        setIsSparkling(true);
        setTimeout(() => setIsSparkling(false), 1000);
    };

    const handleInput = (e) => {
        const value = e.target.value;
        setInputValue(value);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (typeWriterTimeoutRef.current) clearTimeout(typeWriterTimeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            if (value.trim().length === 0) {
                setOutputValue('');
                return;
            }

            // Simple AI transformation simulation
            let transformed = value.trim()
                .replace(/i'm/gi, 'She is')
                .replace(/i /gi, 'She ')
                .replace(/i love/gi, 'specializes in')
                .replace(/i'm based/gi, 'Based')
                .replace(/available for bookings/gi, 'available for professional bookings')
                .replace(/\./g, '. ')
                .trim();
            
            if (transformed.length > 0) {
                transformed = transformed.charAt(0).toUpperCase() + transformed.slice(1);
            }

            setOutputValue('');
            let index = 0;
            
            const typeWriter = () => {
                if (index < transformed.length) {
                    setOutputValue(prev => prev + transformed.charAt(index));
                    index++;
                    typeWriterTimeoutRef.current = setTimeout(typeWriter, 20);
                } else {
                    triggerSparkle();
                }
            };
            
            typeWriter();
        }, 500);
    };

    return (
        <section className="features-hero">
            <div className="features-hero__container">
                <div className="features-hero__header">
                    <span className="features-hero__badge">The AI Brain</span>
                    <h1 className="features-hero__title">More Than Just a Website Builder</h1>
                    <p className="features-hero__description">
                        Pholio's AI doesn't just display your content—it understands it. From refining your bio to organizing your measurements, we handle the professional details so you can focus on your craft.
                    </p>
                </div>

                <div className="feature-demo feature-demo--bio">
                    <div className="feature-demo__content">
                        <div className="feature-demo__split">
                            <div className="feature-demo__input-side">
                                <div className="feature-demo__label">Raw Input</div>
                                <textarea 
                                    className="feature-demo__textarea" 
                                    id="bio-input" 
                                    placeholder="Type something like: I'm Elara, based in LA. I love editorial work..."
                                    value={inputValue}
                                    onChange={handleInput}
                                ></textarea>
                            </div>
                            
                            <div className="feature-demo__arrow">
                                <div className="feature-demo__arrow-line"></div>
                                <div className="feature-demo__arrow-head"></div>
                                <div className={`feature-demo__sparkle ${isSparkling ? 'is-active' : ''}`} id="transformation-sparkle">✨</div>
                            </div>

                            <div className="feature-demo__output-side">
                                <div className="feature-demo__label">Polished Output</div>
                                <div className="feature-demo__output-card">
                                    <div className="feature-demo__output-header">
                                        <div className="feature-demo__output-avatar"></div>
                                        <div className="feature-demo__output-info">
                                            <div className="feature-demo__output-name">Elara Keats</div>
                                            <div className="feature-demo__output-role">Professional Model</div>
                                        </div>
                                    </div>
                                    <div className="feature-demo__output-body" id="bio-output-text">
                                        {outputValue}
                                    </div>
                                    <div className="feature-demo__output-stats">
                                        <div className="feature-demo__stat">
                                            <span className="label">Height</span>
                                            <span className="value" id="height-output">{height}</span>
                                        </div>
                                        <div className="feature-demo__stat">
                                            <span className="label">Measurements</span>
                                            <span className="value" id="measurements-output">{measurements}</span>
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

export default BioTransformationDemo;
