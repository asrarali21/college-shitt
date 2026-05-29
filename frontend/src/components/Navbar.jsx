import { Link, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return 
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
