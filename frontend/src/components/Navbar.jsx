import { Link, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">
                    <span className="nav-logo">🅿️</span>
                    <span className="nav-title">SmartPark AI</span>
                </Link>
            </div>
            <div className="nav-links">
                {user.role === 'admin' ? (
                    <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>Dashboard</Link>
                ) : (
                    <>
                        <Link to="/" className={`nav-link ${isActive('/')}`}>Dashboard</Link>
                        <Link to="/book" className={`nav-link ${isActive('/book')}`}>Book Slot</Link>
                        <Link to="/my-bookings" className={`nav-link ${isActive('/my-bookings')}`}>My Bookings</Link>
                        <Link to="/entry-exit" className={`nav-link ${isActive('/entry-exit')}`}>Entry/Exit</Link>
                    </>
                )}
            </div>
            <div className="nav-user">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
                <button onClick={onLogout} className="btn btn-sm btn-logout">Logout</button>
            </div>
        </nav>
    );
}

export default Navbar;
