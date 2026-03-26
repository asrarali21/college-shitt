import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAvailability, getPrediction, getPricing, getSuggestions } from '../utils/api';

function Dashboard({ user }) {
    const [availability, setAvailability] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [pricing, setPricing] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [availRes, predRes, priceRes, sugRes] = await Promise.all([
                getAvailability(),
                getPrediction(),
                getPricing(),
                getSuggestions()
            ]);
            setAvailability(availRes.data);
            setPrediction(predRes.data);
            setPricing(priceRes.data);
            setSuggestions(sugRes.data.suggestions);
        } catch (err) {
            console.error('Error loading dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner"></div><p>Loading Dashboard...</p></div>;
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Welcome, {user.name}! 👋</h1>
                <p>Smart AI-Powered Parking Management System</p>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <Link to="/book" className="action-card action-book">
                    <span className="action-icon">🅿️</span>
                    <span className="action-text">Book a Slot</span>
                </Link>
                <Link to="/my-bookings" className="action-card action-bookings">
                    <span className="action-icon">📋</span>
                    <span className="action-text">My Bookings</span>
                </Link>
                <Link to="/entry-exit" className="action-card action-entry">
                    <span className="action-icon">🔄</span>
                    <span className="action-text">Entry / Exit</span>
                </Link>
            </div>

            {/* Stats Cards */}
            {availability && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🏢</div>
                        <div className="stat-info">
                            <h3>{availability.total}</h3>
                            <p>Total Slots</p>
                        </div>
                    </div>
                    <div className="stat-card stat-available">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>{availability.available}</h3>
                            <p>Available</p>
                        </div>
                    </div>
                    <div className="stat-card stat-occupied">
                        <div className="stat-icon">🚗</div>
                        <div className="stat-info">
                            <h3>{availability.occupied}</h3>
                            <p>Occupied</p>
                        </div>
                    </div>
                    <div className="stat-card stat-reserved">
                        <div className="stat-icon">📱</div>
                        <div className="stat-info">
                            <h3>{availability.reservedOnline}</h3>
                            <p>Reserved Online</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Occupancy Bar */}
            {availability && (
                <div className="occupancy-section glass-card">
                    <h2>🏗️ Parking Occupancy</h2>
                    <div className="occupancy-bar-container">
                        <div className="occupancy-bar">
                            <div
                                className="occupancy-fill"
                                style={{ width: `${availability.occupancyPercentage}%` }}
                            ></div>
                        </div>
                        <span className="occupancy-text">{availability.occupancyPercentage}% Full</span>
                    </div>
                    <p className="online-limit">
                        Online Booking: {availability.onlineSlotsUsed}/{availability.maxOnlineSlots} used (40% limit)
                    </p>
                </div>
            )}

            {/* AI Section */}
            <div className="ai-section">
                <h2>🤖 AI Insights</h2>
                <div className="ai-grid">
                    {/* Prediction Card */}
                    {prediction && (
                        <div className="glass-card ai-card prediction-card">
                            <div className="ai-card-header">
                                <span className="ai-badge">AI Prediction</span>
                                <span className={`availability-badge ${prediction.availabilityLevel?.toLowerCase()}`}>
                                    {prediction.availabilityLevel} Availability
                                </span>
                            </div>
                            <div className="prediction-details">
                                <div className="prediction-item">
                                    <span className="label">Predicted Occupancy</span>
                                    <span className="value">{prediction.predictedOccupancy}%</span>
                                </div>
                                <div className="prediction-item">
                                    <span className="label">Trend</span>
                                    <span className="value">{prediction.trend} {prediction.trend === 'increasing' ? '📈' : prediction.trend === 'decreasing' ? '📉' : '➡️'}</span>
                                </div>
                                <div className="prediction-item">
                                    <span className="label">Best Time to Park</span>
                                    <span className="value small">{prediction.bestTimeToPark}</span>
                                </div>
                                {prediction.confidence && (
                                    <div className="prediction-item">
                                        <span className="label">AI Confidence</span>
                                        <span className="value">{prediction.confidence}%</span>
                                    </div>
                                )}
                            </div>
                            {prediction.suggestion && (
                                <div className="ai-suggestion">{prediction.suggestion}</div>
                            )}
                        </div>
                    )}

                    {/* Pricing Card */}
                    {pricing && (
                        <div className="glass-card ai-card pricing-card">
                            <div className="ai-card-header">
                                <span className="ai-badge">Dynamic Pricing</span>
                                <span className={`pricing-badge ${pricing.level}`}>{pricing.level?.toUpperCase()}</span>
                            </div>
                            <div className="pricing-details">
                                <div className="price-multiplier">
                                    <span className="multiplier-value">{pricing.multiplier}x</span>
                                    <span className="multiplier-label">Price Multiplier</span>
                                </div>
                                <div className="price-breakdown">
                                    <div className="price-item">
                                        <span>Base Rate</span>
                                        <span>₹{pricing.baseRate}</span>
                                    </div>
                                    <div className="price-item">
                                        <span>Hourly Rate</span>
                                        <span>₹{pricing.effectiveHourlyRate}/hr</span>
                                    </div>
                                </div>
                            </div>
                            <div className="ai-suggestion">{pricing.reason}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Smart Suggestions */}
            {suggestions.length > 0 && (
                <div className="suggestions-section glass-card">
                    <h2>💡 Smart Suggestions</h2>
                    <div className="suggestions-list">
                        {suggestions.map((s, i) => (
                            <div key={i} className={`suggestion-item ${s.type}`}>
                                <span className="suggestion-icon">{s.icon}</span>
                                <span>{s.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
