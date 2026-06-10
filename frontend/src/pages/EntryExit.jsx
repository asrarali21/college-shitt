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
                
            
                    ) : (
                        <>
                            <
