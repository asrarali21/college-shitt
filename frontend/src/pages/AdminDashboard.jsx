import { useState, useEffect } from 'react';
import { getAdminStats, getPrediction, getPricing } from '../utils/api';

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [pricing, setPricing] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, predRes, priceRes] = await Promise.all([
                getAdminStats(),
                getPrediction(),
                getPricing()
            ]);
            setStats(statsRes.data);
            setPrediction(predRes.data);
            setPricing(priceRes.data);
        } catch (err) {
            console.error('Error loading admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner"></div><p>Loading Admin Dashboard...</p></div>;
    }

    if (!stats) {
        return <div className="error-page">Failed to load admin data</div>;
    }

    return (
        <div className="admin-page">
            <div className="dashboard-header">
                <h1>🛡️ Admin Dashboard</h1>
                <p>Real-Time Parking Management Overview</p>
            </div>

            {/* Top Stats */}
            <div className="stats-grid admin-stats">
                <div className="stat-card">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-info">
                        <h3>{stats.slots.total}</h3>
                        <p>Total Slots</p>
                    </div>
                </div>
                <div className="stat-card stat-available">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <h3>{stats.slots.available}</h3>
                        <p>Available</p>
                    </div>
                </div>
                <div className="stat-card stat-occupied">
                    <div className="stat-icon">🚗</div>
                    <div className="stat-info">
                        <h3>{stats.slots.occupied}</h3>
                        <p>Occupied</p>
                    </div>
                </div>
                <div className="stat-card stat-reserved">
                    <div className="stat-icon">📱</div>
                    <div className="stat-info">
                        <h3>{stats.slots.reservedOnline}</h3>
                        <p>Reserved Online</p>
                    </div>
                </div>
            </div>

            {/* Second Row Stats */}
            <div className="stats-grid three-col">
                <div className="stat-card stat-revenue">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>₹{stats.revenue}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <h3>{stats.bookings.total}</h3>
                        <p>Total Bookings</p>
                    </div>
                </div>
                <div className="stat-card stat-active">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-info">
                        <h3>{stats.bookings.active}</h3>
                        <p>Active Now</p>
                    </div>
                </div>
            </div>

            {/* Occupancy Bar */}
            <div className="glass-card occupancy-section">
                <h2>Parking Occupancy</h2>
                <div className="occupancy-bar-container">
                    <div className="occupancy-bar">
                        <div className="occupancy-fill" style={{ width: `${stats.slots.occupancyPercentage}%` }}></div>
                    </div>
                    <span className="occupancy-text">{stats.slots.occupancyPercentage}% Full</span>
                </div>
            </div>

            {/* AI Insights */}
            <div className="ai-section">
                <h2>🤖 AI Insights</h2>
                <div className="ai-grid">
                    {prediction && (
                        <div className="glass-card ai-card prediction-card">
                            <div className="ai-card-header">
                                <span className="ai-badge">AI Prediction</span>
                                <span className={`availability-badge ${prediction.availabilityLevel?.toLowerCase()}`}>
                                    {prediction.availabilityLevel}
                                </span>
                            </div>
                            <div className="prediction-details">
                                <div className="prediction-item">
                                    <span className="label">Predicted Occupancy</span>
                                    <span className="value">{prediction.predictedOccupancy}%</span>
                                </div>
                                <div className="prediction-item">
                                    <span className="label">Trend</span>
                                    <span className="value">{prediction.trend}</span>
                                </div>
                                <div className="prediction-item">
                                    <span className="label">Confidence</span>
                                    <span className="value">{prediction.confidence}%</span>
                                </div>
                            </div>
                            {prediction.suggestion && <div className="ai-suggestion">{prediction.suggestion}</div>}
                        </div>
                    )}
                    {pricing && (
                        <div className="glass-card ai-card pricing-card">
                            <div className="ai-card-header">
                                <span className="ai-badge">Dynamic Pricing</span>
                                <span className={`pricing-badge ${pricing.level}`}>{pricing.level?.toUpperCase()}</span>
                            </div>
                            <div className="pricing-details">
                                <div className="price-multiplier">
                                    <span className="multiplier-value">{pricing.multiplier}x</span>
                                    <span className="multiplier-label">Active Multiplier</span>
                                </div>
                            </div>
                            <div className="ai-suggestion">{pricing.reason}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="glass-card">
                <h2>📋 Recent Bookings</h2>
                {stats.recentBookings.length > 0 ? (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>User</th>
                                    <th>Slot</th>
                                    <th>Status</th>
                                    <th>Fee</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentBookings.map((b) => (
                                    <tr key={b._id}>
                                        <td><span className="booking-code-sm">{b.bookingCode}</span></td>
                                        <td>{b.user?.name || 'N/A'}</td>
                                        <td>{b.slot?.slotNumber || 'N/A'}</td>
                                        <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                                        <td>{b.totalFee > 0 ? `₹${b.totalFee}` : '-'}</td>
                                        <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="no-data">No bookings yet</p>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
