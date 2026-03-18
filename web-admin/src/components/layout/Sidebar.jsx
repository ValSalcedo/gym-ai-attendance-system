import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Camera,
  Dumbbell,
  Activity,
  User,
  Settings,
  BarChart,
  ClipboardList,
} from 'lucide-react';
import logo from '../../assets/logo.png';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: Camera },

  // ✅ NEW
  { to: '/attendance-logs', label: 'Attendance Logs', icon: ClipboardList },
  { to: '/reports', label: 'Reports', icon: BarChart },

  { to: '/routines', label: 'Routines', icon: Dumbbell },
  { to: '/exercises', label: 'Exercises', icon: Activity },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img src={logo} alt="Double Alpha Logo" className="brand-image" />
        <div>
          <h2>Double Alpha</h2>
          <p>Fitness Gym</p>
        </div>
      </div>

      <nav className="nav-links">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}