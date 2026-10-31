import React from 'react';
import { NavLink } from 'react-router-dom';

export default function NavTabs() {
  const tabClass = ({ isActive }) => `nav-tab${isActive ? ' active' : ''}`;

  return (
    <nav className="app-nav">
      <NavLink to="/"       className={tabClass} end>Home</NavLink>
      <NavLink to="/cpu"    className={tabClass}>CPU Scheduling</NavLink>
      <NavLink to="/memory" className={tabClass}>Memory Paging</NavLink>
      <NavLink to="/disk"   className={tabClass}>Disk Scheduling</NavLink>
    </nav>
  );
}
