import React, { useState, useMemo } from 'react';

const FilterDemo = () => {
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [minHeight, setMinHeight] = useState(60);
    const [measurements, setMeasurements] = useState('');
    const [specializations, setSpecializations] = useState([]);
    const [sortBy, setSortBy] = useState('name');

    // Sample Data
    const talentData = [
        { name: 'Elara Keats', location: 'LA', height: 71, measurements: '32-25-35', specializations: ['editorial', 'commercial'], image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80' },
        { name: 'Aiko Ren', location: 'NYC', height: 68, measurements: '34-26-36', specializations: ['runway', 'editorial'], image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80' },
        { name: 'Bianca Cole', location: 'LA', height: 70, measurements: '33-24-34', specializations: ['commercial'], image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80' },
        { name: 'Sofia Martinez', location: 'Miami', height: 69, measurements: '32-25-35', specializations: ['editorial', 'runway'], image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80' },
        { name: 'Isabella Chen', location: 'NYC', height: 67, measurements: '31-24-33', specializations: ['commercial', 'editorial'], image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80' },
        { name: 'Maya Patel', location: 'Chicago', height: 72, measurements: '34-26-36', specializations: ['runway'], image: 'https://images.unsplash.com/photo-1503342452485-86b7f54527ef?auto=format&fit=crop&w=400&q=80' },
        { name: 'Luna Rodriguez', location: 'LA', height: 69, measurements: '33-25-35', specializations: ['editorial'], image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80' },
        { name: 'Zoe Kim', location: 'NYC', height: 68, measurements: '32-24-34', specializations: ['commercial', 'runway'], image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80' },
        { name: 'Emma Wilson', location: 'Miami', height: 70, measurements: '33-25-35', specializations: ['editorial', 'commercial'], image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80' },
    ];

    const inchesToFeetInches = (inches) => {
        const feet = Math.floor(inches / 12);
        const remainingInches = inches % 12;
        return `${feet}' ${remainingInches}"`;
    };

    const handleSpecializationChange = (spec) => {
        if (specializations.includes(spec)) {
            setSpecializations(specializations.filter(s => s !== spec));
        } else {
            setSpecializations([...specializations, spec]);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setLocation('');
        setMinHeight(60);
        setMeasurements('');
        setSpecializations([]);
        setSortBy('name');
    };

    const filteredTalents = useMemo(() => {
        let result = talentData.filter(talent => {
            if (search && !talent.name.toLowerCase().includes(search.toLowerCase())) return false;
            if (location && talent.location !== location) return false;
            if (talent.height < minHeight) return false;
            if (measurements && !talent.measurements.includes(measurements.replace(/\s/g, ''))) return false;
            if (specializations.length > 0) {
                const hasSpec = specializations.some(spec => talent.specializations.includes(spec));
                if (!hasSpec) return false;
            }
            return true;
        });

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'height') return b.height - a.height;
            if (sortBy === 'location') return a.location.localeCompare(b.location);
            return 0;
        });

        return result;
    }, [search, location, minHeight, measurements, specializations, sortBy]);

    return (
        <section className="feature-spread feature-spread--alt" id="feature-agency">
            <div className="feature-spread__container">
                <div className="feature-spread__header">
                    <span className="feature-spread__badge">For Agencies</span>
                    <h2 className="feature-spread__title">Powerful Talent Discovery</h2>
                    <p className="feature-spread__description">
                        Agencies use our advanced filtering to find exactly who they need. Optimize your profile to get discovered by top agencies worldwide.
                    </p>
                </div>

                <div className="feature-demo feature-demo--filter">
                    <div className="filter-interface">
                        {/* Sidebar Filters */}
                        <div className="filter-sidebar">
                            <div className="filter-group">
                                <label className="filter-label">Search</label>
                                <input 
                                    type="text" 
                                    className="filter-input" 
                                    id="filter-search" 
                                    placeholder="Name or keyword..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            
                            <div className="filter-group">
                                <label className="filter-label">Location</label>
                                <select 
                                    className="filter-select" 
                                    id="filter-location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                >
                                    <option value="">Any Location</option>
                                    <option value="LA">Los Angeles</option>
                                    <option value="NYC">New York</option>
                                    <option value="Miami">Miami</option>
                                    <option value="Chicago">Chicago</option>
                                    <option value="London">London</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <div className="filter-header">
                                    <label className="filter-label">Min Height</label>
                                    <span className="filter-value" id="height-value">{inchesToFeetInches(minHeight)}</span>
                                </div>
                                <input 
                                    type="range" 
                                    className="filter-range" 
                                    id="filter-height" 
                                    min="60" 
                                    max="80"
                                    value={minHeight}
                                    onChange={(e) => setMinHeight(parseInt(e.target.value))}
                                />
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Specialization</label>
                                <div className="checkbox-group">
                                    {['editorial', 'commercial', 'runway'].map(spec => (
                                        <label className="checkbox-label" key={spec}>
                                            <input 
                                                type="checkbox" 
                                                className="filter-specialization" 
                                                value={spec}
                                                checked={specializations.includes(spec)}
                                                onChange={() => handleSpecializationChange(spec)}
                                            />
                                            {spec.charAt(0).toUpperCase() + spec.slice(1)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            <button className="clear-filters-btn" id="clear-filters" onClick={clearFilters}>
                                Reset Filters
                            </button>
                        </div>

                        {/* Results Grid */}
                        <div className="filter-results">
                            <div className="results-header">
                                <div className="results-count">
                                    <span id="results-count">{filteredTalents.length} {filteredTalents.length === 1 ? 'model' : 'models'}</span>
                                    <span className="results-subtitle" id="results-subtitle">
                                        {filteredTalents.length === talentData.length ? 'All talent' : 'Matching your criteria'}
                                    </span>
                                </div>
                                <div className="results-sort">
                                    <select id="sort-results" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                        <option value="name">Sort by Name</option>
                                        <option value="height">Sort by Height</option>
                                        <option value="location">Sort by Location</option>
                                    </select>
                                </div>
                            </div>

                            <div className="results-grid" id="results-grid">
                                {filteredTalents.length > 0 ? filteredTalents.map((talent, index) => (
                                    <div 
                                        className="feature-demo__talent-card" 
                                        key={index}
                                        style={{animationDelay: `${index * 0.03}s`}}
                                    >
                                        <div className="feature-demo__talent-card-image-wrapper">
                                            <img src={talent.image} alt={talent.name} className="feature-demo__talent-card-image" loading="lazy" />
                                        </div>
                                        <div className="feature-demo__talent-card-info">
                                            <div className="feature-demo__talent-card-name">{talent.name}</div>
                                            <div className="feature-demo__talent-card-details">
                                                <div className="feature-demo__talent-card-location">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                        <circle cx="12" cy="10" r="3"></circle>
                                                    </svg>
                                                    <span>{talent.location === 'NYC' ? 'New York, NY' : talent.location === 'LA' ? 'Los Angeles, CA' : talent.location}</span>
                                                </div>
                                            </div>
                                            <div className="feature-demo__talent-card-stats">
                                                <div className="feature-demo__talent-card-stat">
                                                    <span className="feature-demo__talent-card-stat-label">Height</span>
                                                    <span className="feature-demo__talent-card-stat-value">{inchesToFeetInches(talent.height)}</span>
                                                </div>
                                                <div className="feature-demo__talent-card-stat">
                                                    <span className="feature-demo__talent-card-stat-label">Measurements</span>
                                                    <span className="feature-demo__talent-card-stat-value">{talent.measurements}</span>
                                                </div>
                                            </div>
                                            <div className="feature-demo__talent-card-specializations">
                                                {talent.specializations.map(spec => (
                                                    <span key={spec} className="feature-demo__talent-card-specialization">
                                                        {spec.charAt(0).toUpperCase() + spec.slice(1)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div id="results-empty" style={{textAlign: 'center', padding: '2rem', width: '100%', gridColumn: '1 / -1'}}>
                                        <p style={{color: '#64748b'}}>No models found matching your criteria.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FilterDemo;
