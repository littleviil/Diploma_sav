import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, useOutletContext } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  Building2,
  ChevronDown,
  CheckCircle2,
  Landmark,
  LogIn,
  LogOut,
  Moon,
  ReceiptText,
  Settings,
  Sun,
  UserRound,
} from 'lucide-react';
import { serviceMeta } from '../data.js';
import { serviceIcons } from '../config.js';
import { getServiceName } from '../utils.js';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="static-page">
          <section className="static-panel">
            <span className="section-kicker">Ошибка интерфейса</span>
            <h1>Раздел временно не загрузился</h1>
            <p>{this.state.error.message}</p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export function ServiceBadge({ service }) {
  const Icon = serviceIcons[service] ?? ReceiptText;

  return (
    <span className={`service-badge service-${serviceMeta[service]?.accent ?? 'blue'}`}>
      <Icon size={16} />
      {getServiceName(service)}
    </span>
  );
}

export function StatusBadge({ status }) {
  const paid = status === 'paid';

  return (
    <span className={`status-badge ${paid ? 'status-paid' : 'status-unpaid'}`}>
      {paid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {paid ? 'Оплачено' : 'Не оплачено'}
    </span>
  );
}

export function Header({ user, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand-link" aria-label="На главную">
          <span className="brand-mark">
            <Building2 size={22} />
          </span>
          <span>
            <strong>ЖКУ Контроль</strong>
            <small>учет оплат</small>
          </span>
        </Link>

        <nav className="top-nav">
          <NavLink to="/">Главная</NavLink>
          <NavLink to="/partner">Стать партнером</NavLink>
          {user?.role === 'payer' && <NavLink to="/app">Кабинет</NavLink>}
          {user?.role === 'employee' && <NavLink to="/employee">Сотрудник</NavLink>}
          {user?.role === 'companyAdmin' && <NavLink to="/company-admin">Компания</NavLink>}
          {user ? (
            <button className="ghost-button" type="button" onClick={onLogout}>
              <LogOut size={18} />
              Выйти
            </button>
          ) : (
            <Link to="/auth" className="primary-link login-link">
              <LogIn size={18} />
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function ProjectFooter() {
  return (
    <footer className="footer-shell">
      <div className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand-link" aria-label="На главную">
              <span className="brand-mark">
                <Building2 size={22} />
              </span>
              <span>
                <strong>ЖКУ Контроль</strong>
                <small>учет коммунальных платежей</small>
              </span>
            </Link>
          </div>
          <div className="footer-links">
            <Link to="/about">
              Информация о проекте
            </Link>
            <a href="/downloads/zhku-control-desktop.txt" download>
              Скачать для компьютера
            </a>
            <a href="/downloads/zhku-control-mobile.txt" download>
              Скачать для телефона
            </a>
            <Link to="/partner">
              Стать партнером
            </Link>
            <Link to="/privacy">
              Политика конфиденциальности
            </Link>
          </div>
          <div className="footer-contact">
            <div className="footer-contact-title">
              <Landmark size={24} />
              <strong>Абонентский отдел</strong>
            </div>
            <span>Пн-Пт 9:00-18:00</span>
            <span>support@zhku-demo.ru</span>
            <span>+7 800 250-10-20</span>
          </div>
        </div>
        <div className="footer-note">
          <span>© 2026 ЖКУ Контроль. Все права защищены.</span>
          <span>Сделано для учета коммунальных платежей</span>
        </div>
      </div>
    </footer>
  );
}

export function MinimalFooter() {
  return (
    <footer className="minimal-footer">
      <span>© 2026 ЖКУ Контроль. Все права защищены.</span>
      <span>Сделано для учета коммунальных платежей</span>
    </footer>
  );
}

export function ThemeSwitch({ theme, setTheme }) {
  const dark = theme === 'dark';

  return (
    <label className="theme-switch">
      <input
        checked={dark}
        type="checkbox"
        onChange={(event) => setTheme(event.target.checked ? 'dark' : 'light')}
      />
      <span className="theme-track">
        <span className="theme-thumb">{dark ? <Moon size={14} /> : <Sun size={14} />}</span>
      </span>
      <small>{dark ? 'Темная тема' : 'Светлая тема'}</small>
    </label>
  );
}

export function UserMenu({ user, logout, theme, setTheme, settingsTo }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="profile-button" type="button" onClick={() => setOpen((current) => !current)}>
        <UserRound size={20} />
        <span>{user.name}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="profile-menu">
          <div className="profile-menu-head">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <ThemeSwitch theme={theme} setTheme={setTheme} />
          <Link className="profile-menu-link" to={settingsTo} onClick={() => setOpen(false)}>
            <Settings size={18} />
            Настройки
          </Link>
          <button className="profile-menu-link danger-link" type="button" onClick={logout}>
            <LogOut size={18} />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}

export function WorkspaceTopbar({ user, logout, theme, setTheme, settingsTo }) {
  return (
    <header className="workspace-topbar">
      <div>
        <span className="section-kicker">Рабочая область</span>
        <strong>{user.role === 'companyAdmin' ? 'Администратор компании' : user.name}</strong>
      </div>
      <UserMenu
        user={user}
        logout={logout}
        theme={theme}
        setTheme={setTheme}
        settingsTo={settingsTo}
      />
    </header>
  );
}

export function RequireRole({ user, role, children }) {
  if (!user || user.role !== role) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export function PageTitle({ eyebrow, title, children }) {
  return (
    <div className="page-title">
      <div className="page-title-main">
        {eyebrow && <span className="section-kicker">{eyebrow}</span>}
        <h1>{title}</h1>
      </div>
      {children && <p>{children}</p>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className={`stat-card ${tone ?? ''}`}>
      <span className="stat-icon">
        <Icon size={22} />
      </span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function SettingsPage({ scope = 'личного кабинета' }) {
  const { theme, setTheme } = useOutletContext();
  const [saved, setSaved] = useState(false);

  return (
    <>
      <PageTitle title="Параметры кабинета">
        Настройка внешнего вида и уведомлений {scope}.
      </PageTitle>

      <section className="settings-grid">
        <div className="work-panel">
          <h2>Внешний вид</h2>
          <div className="settings-row">
            <div>
              <strong>Тема интерфейса</strong>
              <span>Переключение применяется ко всему сайту.</span>
            </div>
            <ThemeSwitch theme={theme} setTheme={setTheme} />
          </div>
        </div>

        <div className="work-panel">
          <h2>Уведомления</h2>
          <div className="settings-row">
            <div>
              <strong>Важные события</strong>
              <span>Оплаты, новые квитанции, заявки и изменения профиля.</span>
            </div>
            <button className="ghost-button" type="button" onClick={() => setSaved(true)}>
              <Bell size={18} />
              Включены
            </button>
          </div>
        </div>

      </section>
      {saved && <div className="inline-success settings-saved">Изменения сохранены</div>}
    </>
  );
}
