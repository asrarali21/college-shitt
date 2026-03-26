import { useState } from 'react';
import { simulateEntry, simulateExit } from '../utils/api';

function EntryExit() {
    const [mode, setMode] = useState('entry'); // 'entry' or 'exit'
    const [bookingCode, setBookingCode] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        try {
            const res = mode === 'entry'
                ? await simulateEntry({ bookingCode })
                : await simulateExit({ bookingCode });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.message || `${mode} simulation failed`);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError('');
        setBookingCode('');
    };

    return (
        <div className="entry-exit-page">
            <div className="page-header">
                <h1>🔄 Entry / Exit Simulation</h1>
                <p>Simulate QR code scanning at parking gates</p>
            </div>

            <div className="mode-toggle">
                <button
                    className={`toggle-btn ${mode === 'entry' ? 'active entry' : ''}`}
                    onClick={() => { setMode('entry'); reset(); }}
                >
                    🚗 Entry Gate
                </button>
                <button
                    className={`toggle-btn ${mode === 'exit' ? 'active exit' : ''}`}
                    onClick={() => { setMode('exit'); reset(); }}
                >
                    🚪 Exit Gate
                </button>
            </div>

            {!result ? (
                <div className="gate-simulation glass-card">
                    <div className="gate-icon">
                        {mode === 'entry' ? '🚧' : '🏁'}
                    </div>
                    <h2>{mode === 'entry' ? 'Entry Gate' : 'Exit Gate'}</h2>
                    <p>{mode === 'entry' ? 'Scan QR code or enter booking code to enter' : 'Scan QR code or enter booking code to exit and get receipt'}</p>

                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleSubmit} className="gate-form">
                        <div className="form-group">
                            <label>Booking Code</label>
                            <input
                                type="text"
                                value={bookingCode}
                                onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                                placeholder="e.g., PK-ABC123"
                                required
                                className="code-input"
                            />
                        </div>
                        <button type="submit" className={`btn btn-primary ${mode}`} disabled={loading}>
                            {loading ? 'Processing...' : mode === 'entry' ? '🚗 Simulate Entry' : '🚪 Simulate Exit'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="gate-result glass-card">
                    {mode === 'entry' ? (
                        <>
                            <div className="result-icon success">✅</div>
                            <h2>Entry Recorded!</h2>
                            <div className="result-details">
                                <div className="detail-row">
                                    <span>Booking Code</span>
                                    <strong>{result.booking.bookingCode}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>Slot</span>
                                    <strong>{result.booking.slot} (Floor {result.booking.floor})</strong>
                                </div>
                                <div className="detail-row">
                                    <span>Entry Time</span>
                                    <strong>{new Date(result.booking.entryTime).toLocaleString()}</strong>
                                </div>
                            </div>
                            <p className="result-message">Your vehicle is now parked. Drive safely!</p>
                        </>
                    ) : (
                        <>
                            <div className="result-icon receipt">🧾</div>
                            <h2>Parking Receipt</h2>
                            <div className="receipt-card">
                                <div className="receipt-header">
                                    <h3>Smart Parking</h3>
                                    <p>AI-Powered Parking Management</p>
                                </div>
                                <div className="receipt-body">
                                    <div className="detail-row">
                                        <span>Booking Code</span>
                                        <strong>{result.receipt.bookingCode}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Slot</span>
                                        <strong>{result.receipt.slot} (Floor {result.receipt.floor})</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Entry</span>
                                        <strong>{new Date(result.receipt.entryTime).toLocaleString()}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Exit</span>
                                        <strong>{new Date(result.receipt.exitTime).toLocaleString()}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Duration</span>
                                        <strong>{result.receipt.duration}</strong>
                                    </div>
                                    <hr />
                                    <div className="detail-row">
                                        <span>Base Rate</span>
                                        <strong>{result.receipt.baseRate}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Hourly Charge</span>
                                        <strong>{result.receipt.hourlyCharge}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Pricing Multiplier</span>
                                        <strong>{result.receipt.pricingMultiplier}</strong>
                                    </div>
                                    <div className="detail-row total">
                                        <span>TOTAL FEE</span>
                                        <strong>{result.receipt.totalFee}</strong>
                                    </div>
                                </div>
                            </div>
                            <p className="result-message">Thank you for using Smart Parking! 🚗</p>
                        </>
                    )}
                    <button onClick={reset} className="btn btn-secondary">
                        Process Another Vehicle
                    </button>
                </div>
            )}
        </div>
    );
}

export default EntryExit;
