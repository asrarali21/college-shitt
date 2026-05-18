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
