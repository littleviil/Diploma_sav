import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Gauge,
  LogIn,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {
  audienceContent,
  demoCompanies,
  faqByAudience,
  PARTNER_APPLICATIONS_KEY,
} from '../config.js';
import { buildReceiptSummary, formatMoney, getReceiptPeriodKey } from '../utils.js';
import { Header, MinimalFooter, ProjectFooter, ServiceBadge } from '../components/shared.jsx';

export function HomePage({ store, user, onLogout }) {
  const [accountNumber, setAccountNumber] = useState('407900000001');
  const [result, setResult] = useState(null);
  const [activeAudience, setActiveAudience] = useState('citizen');
  const audience = audienceContent[activeAudience];

  const checkDebt = (event) => {
    event.preventDefault();
    const account = store.accounts.find((item) => item.number === accountNumber.trim());

    if (!account) {
      setResult({ type: 'missing' });
      return;
    }

    const all = store.receipts.filter((item) => item.accountId === account.id);
    const byService = {};
    all.forEach((r) => {
      const key = getReceiptPeriodKey(r.period);
      if (!byService[r.service] || key > getReceiptPeriodKey(byService[r.service].period)) {
        byService[r.service] = r;
      }
    });
    const latest = Object.values(byService);
    const unpaid = latest.filter((item) => item.status === 'unpaid');
    const paid = latest.filter((item) => item.status === 'paid');

    setResult({
      type: unpaid.length > 0 ? 'debt' : 'clear',
      accountNumber: account.number,
      unpaid,
      paid,
    });
  };

  return (
    <div className="page">
      <Header user={user} onLogout={onLogout} />

      <main className="home-page">
        <section className="debt-hero check-panel">
          <div className="debt-hero-copy">
            <span className="section-kicker">Без регистрации</span>
            <h1>Проверка задолженности по ЖКУ</h1>
            <p>
              Введите лицевой счет и узнайте, какие прошлые периоды оплачены, а какие
              требуют внимания.
            </p>
          </div>

          <div className="debt-form-column">
            <form className="debt-check-form" onSubmit={checkDebt}>
              <label htmlFor="account">Лицевой счет</label>
              <input
                id="account"
                value={accountNumber}
                onChange={(event) => setAccountNumber(event.target.value)}
                placeholder="407900000001"
              />
              <div className="debt-check-btn-row">
                <button type="submit">
                  <ShieldCheck size={20} />
                  Проверить
                </button>
              </div>
              <small>Демо: 407900000001 — есть долг, 407900000002 — все оплачено.</small>
            </form>

            {result && <PublicCheckResult result={result} />}
          </div>
        </section>

        <section className="intro-block">
          <h2>Оплата ЖКУ, квитанции и задолженности в одном сервисе</h2>
          <p>
            Личный кабинет помогает жителям контролировать начисления, оплачивать
            квитанции и быстро понимать, остались ли неоплаченные периоды. Для
            диспетчера и бухгалтера предусмотрены отдельные рабочие кабинеты.
          </p>
          <div className="hero-actions">
            <Link to="/auth" className="primary-link">
              <UserRound size={18} />
              Войти плательщику
            </Link>
            <Link to="/auth?role=employee" className="primary-link secondary-action">
              <BarChart3 size={18} />
              Войти диспетчеру/бухгалтеру
            </Link>
          </div>
        </section>

        <section className="audience-section">
          <div className="section-heading">
            <span className="section-kicker">Тип пользователя</span>
            <h2>Выберите, для кого смотреть возможности и вопросы</h2>
          </div>

          <div className="audience-switch" role="tablist" aria-label="Тип пользователя">
            <button
              className={activeAudience === 'citizen' ? 'active' : ''}
              type="button"
              onClick={() => setActiveAudience('citizen')}
            >
              Плательщик
            </button>
            <button
              className={activeAudience === 'employee' ? 'active' : ''}
              type="button"
              onClick={() => setActiveAudience('employee')}
            >
              Диспетчер и бухгалтер
            </button>
          </div>

          <div className="section-heading audience-subheading">
            <span className="section-kicker">Наши сервисы</span>
            <h2>Возможности для разных пользователей</h2>
          </div>

          <div className="audience-content" key={activeAudience}>
            <div className="audience-copy">
              <span className="section-kicker">{audience.eyebrow}</span>
              <h3>{audience.title}</h3>
              <p>{audience.text}</p>
              <Link to={audience.href} className="primary-link">
                <LogIn size={18} />
                {audience.action}
              </Link>
            </div>
            <div className="home-card-grid">
              {audience.cards.map((service) => {
                const Icon = service.icon;
                return (
                  <article className="home-card" key={service.title}>
                    <Icon size={24} />
                    <h3>{service.title}</h3>
                    <p>{service.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="section-heading">
            <span className="section-kicker">Вопросы</span>
            <h2>Часто задаваемые вопросы</h2>
          </div>
          <div className="faq-list">
            {faqByAudience[activeAudience].map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <ProjectFooter />
    </div>
  );
}

export function PublicCheckResult({ result }) {
  if (result.type === 'missing') {
    return (
      <div className="result-box result-warning">
        <AlertCircle size={22} />
        <div>
          <strong>Лицевой счет не найден</strong>
          <span>Проверьте номер и попробуйте снова.</span>
        </div>
      </div>
    );
  }

  if (result.type === 'clear') {
    return (
      <div className="result-box result-success">
        <BadgeCheck size={24} />
        <div>
          <strong>Прошлые периоды оплачены</strong>
          <span>По счету {result.accountNumber} задолженность не найдена.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="debt-list">
      <div className="result-box result-debt">
        <AlertCircle size={22} />
        <div>
          <strong>Есть неоплаченные периоды</strong>
          <span>По счету {result.accountNumber}: {result.unpaid.length} не оплачено</span>
        </div>
      </div>

      {result.unpaid.map((receipt) => (
        <div className="debt-row" key={receipt.id}>
          <div>
            <strong>{receipt.period}</strong>
            <ServiceBadge service={receipt.service} />
          </div>
          <span className="debt-amount-red">{formatMoney(receipt.amount)}</span>
        </div>
      ))}

      {(result.paid ?? []).map((receipt) => (
        <div className="debt-row debt-row-paid" key={receipt.id}>
          <div>
            <strong>{receipt.period}</strong>
            <ServiceBadge service={receipt.service} />
          </div>
          <CheckCircle2 size={18} className="debt-paid-icon" />
        </div>
      ))}
    </div>
  );
}

export function InfoPage({ user, onLogout }) {
  return (
    <div className="page">
      <Header user={user} onLogout={onLogout} />
      <main className="static-page">
        <section className="static-panel">
          <span className="section-kicker">О проекте</span>
          <h1>ЖКУ Контроль</h1>
          <p>
            Это дипломное веб-приложение для отслеживания оплаты ЖКУ и задолженностей.
            Идея появилась из-за отсутствия удобного единого места для коммунальных
            платежей: неудобно оплачивать все в разных сервисах, сверять статусы вручную
            и хранить бумажные квитанции дома.
          </p>
          <p>
            В проекте есть публичная проверка задолженности по лицевому счету, личный
            кабинет плательщика, электронные квитанции, имитация оплаты через МИР и СБП,
            а также кабинеты администратора компании, диспетчера и бухгалтера.
          </p>
          <Link to="/" className="primary-link">Вернуться на главную</Link>
        </section>
      </main>
      <ProjectFooter />
    </div>
  );
}

export function PrivacyPage({ user, onLogout }) {
  return (
    <div className="page">
      <Header user={user} onLogout={onLogout} />
      <main className="static-page">
        <section className="static-panel">
          <span className="section-kicker">Политика конфиденциальности</span>
          <h1>Защита данных пользователей</h1>
          <p>
            Демонстрационная версия не передает данные во внешние платежные сервисы и
            использует локальные демо-данные. Публичная проверка задолженности показывает
            только периоды, виды услуг и статус оплаты.
          </p>
          <p>
            Без авторизации сервис не раскрывает ФИО, адрес и другие персональные данные.
            Доступ к личному кабинету плательщика и рабочим кабинетам компании
            разделяется по ролям.
          </p>
          <Link to="/" className="primary-link">Вернуться на главную</Link>
        </section>
      </main>
      <ProjectFooter />
    </div>
  );
}

export function PartnerPage({ user, onLogout, approvePartnerApplication }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [invalidFields, setInvalidFields] = useState([]);
  const [form, setForm] = useState({
    legalFullName: 'Общество с ограниченной ответственностью "Комфортный дом"',
    legalShortName: 'ООО "Комфортный дом"',
    taxId: '1655000000',
    legalAddress: 'г. Казань, ул. Центральная, 10',
    actualAddress: 'г. Казань, ул. Центральная, 10',
    corporatePhone: '+7 843 200-10-20',
    corporateEmail: 'office@comfort-dom.ru',
    licenseNumber: 'ЛМКД-016-2026',
    bankAccount: '40702810000000000001',
    bankBik: '049205000',
    ownerName: 'Иван Петров',
    ownerEmail: 'owner@comfort-dom.ru',
    ownerPhone: '+7 900 555-44-33',
    authMethod: 'Почта и пароль',
  });

  const update = (field, value) => {
    setSaved(false);
    setError('');
    setInvalidFields((current) => current.filter((item) => item !== field));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    const requiredFields = [
      'legalFullName',
      'legalShortName',
      'taxId',
      'legalAddress',
      'actualAddress',
      'corporatePhone',
      'corporateEmail',
      'licenseNumber',
      'bankAccount',
      'bankBik',
      'ownerName',
      'ownerEmail',
      'ownerPhone',
      'authMethod',
    ];
    const missingFields = requiredFields.filter((field) => !String(form[field] ?? '').trim());
    const wrongTaxId = form.taxId.trim() && !/^\d{10}(\d{2})?$/.test(form.taxId.trim());
    const nextInvalidFields = wrongTaxId ? [...missingFields, 'taxId'] : missingFields;

    if (nextInvalidFields.length > 0) {
      setInvalidFields([...new Set(nextInvalidFields)]);
      setError(wrongTaxId ? 'ИНН должен содержать 10 или 12 цифр.' : 'Заполните обязательные поля.');
      return;
    }

    const application = {
      id: `org-${Date.now()}`,
      verificationStatus: 'Одобрена',
      createdAt: new Date().toISOString(),
      firstUserAccess: 'Первый зарегистрировавший компанию пользователь становится администратором',
      ...form,
    };

    const savedApplications = JSON.parse(localStorage.getItem(PARTNER_APPLICATIONS_KEY) ?? '[]');
    localStorage.setItem(
      PARTNER_APPLICATIONS_KEY,
      JSON.stringify([...savedApplications, application]),
    );
    setSaved(true);
    setError('');
    setInvalidFields([]);
    approvePartnerApplication(application);
    navigate('/company-admin');
  };

  const fieldClass = (field) => (invalidFields.includes(field) ? 'field-error' : undefined);

  return (
    <div className="page">
      <Header user={user} onLogout={onLogout} />
      <main className="partner-page">
        <section className="partner-hero">
          <span className="section-kicker">Партнерство</span>
          <h1>Регистрация компании ЖКУ</h1>
          <p>
            Заявка создает профиль юридического лица и первого администратора компании.
            После модерации он сможет продолжить настройку сотрудников в личном кабинете.
          </p>
        </section>

        <form className="partner-form" onSubmit={submit}>
          <section className="form-section">
            <h2>1. Профиль юридического лица</h2>
            <div className="form-grid">
              <label className={fieldClass('legalFullName')}>
                Полное наименование
                <input value={form.legalFullName} onChange={(event) => update('legalFullName', event.target.value)} />
              </label>
              <label className={fieldClass('legalShortName')}>
                Краткое наименование
                <input value={form.legalShortName} onChange={(event) => update('legalShortName', event.target.value)} />
              </label>
              <label className={fieldClass('taxId')}>
                ИНН
                <input inputMode="numeric" value={form.taxId} onChange={(event) => update('taxId', event.target.value)} />
              </label>
              <label className={fieldClass('licenseNumber')}>
                Номер лицензии МКД
                <input value={form.licenseNumber} onChange={(event) => update('licenseNumber', event.target.value)} />
              </label>
              <label className={fieldClass('legalAddress')}>
                Юридический адрес
                <input value={form.legalAddress} onChange={(event) => update('legalAddress', event.target.value)} />
              </label>
              <label className={fieldClass('actualAddress')}>
                Фактический адрес
                <input value={form.actualAddress} onChange={(event) => update('actualAddress', event.target.value)} />
              </label>
              <label className={fieldClass('corporatePhone')}>
                Корпоративный телефон
                <input value={form.corporatePhone} onChange={(event) => update('corporatePhone', event.target.value)} />
              </label>
              <label className={fieldClass('corporateEmail')}>
                Корпоративная почта
                <input value={form.corporateEmail} onChange={(event) => update('corporateEmail', event.target.value)} />
              </label>
              <label className={fieldClass('bankAccount')}>
                Расчетный счет
                <input inputMode="numeric" value={form.bankAccount} onChange={(event) => update('bankAccount', event.target.value)} />
              </label>
              <label className={fieldClass('bankBik')}>
                БИК
                <input inputMode="numeric" value={form.bankBik} onChange={(event) => update('bankBik', event.target.value)} />
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>2. Первый администратор компании</h2>
            <div className="form-grid">
              <label className={fieldClass('ownerName')}>
                ФИО администратора
                <input value={form.ownerName} onChange={(event) => update('ownerName', event.target.value)} />
              </label>
              <label className={fieldClass('ownerEmail')}>
                Почта администратора
                <input value={form.ownerEmail} onChange={(event) => update('ownerEmail', event.target.value)} />
              </label>
              <label className={fieldClass('ownerPhone')}>
                Телефон администратора
                <input value={form.ownerPhone} onChange={(event) => update('ownerPhone', event.target.value)} />
              </label>
              <label className={fieldClass('authMethod')}>
                Способ входа
                <select value={form.authMethod} onChange={(event) => update('authMethod', event.target.value)}>
                  <option>Почта и пароль</option>
                  <option>ЕСИА / госуслуги</option>
                </select>
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>3. Настройка сотрудников</h2>
            <p className="form-hint">
              Первый зарегистрировавший компанию пользователь получает права администратора.
              Выдачу доступов сотрудникам и приглашения лучше заполнить позже в личном
              кабинете компании, когда заявка пройдет модерацию.
            </p>
          </section>

          <button className="wide-button" type="submit">
            <Building2 size={18} />
            Отправить заявку на модерацию
          </button>
          {error && <div className="inline-error">{error}</div>}
          {saved && <div className="inline-success">Заявка сохранена локально и ожидает модерации.</div>}
        </form>
      </main>
      <ProjectFooter />
    </div>
  );
}

export function AuthPage({ user, login, registerPayer, onLogout }) {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const roleParam = params.get('role');
  const initialRole =
    roleParam === 'employee' || roleParam === 'companyAdmin' ? roleParam : 'payer';
  const [role, setRole] = useState(initialRole);
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [invalidFields, setInvalidFields] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [companyQuery, setCompanyQuery] = useState('УК Комфортный дом');
  const [companyListOpen, setCompanyListOpen] = useState(false);
  const companySearchRef = useRef(null);
  const [form, setForm] = useState({
    name: 'Мария Орлова',
    loginName: 'orlovam',
    email: '1@gmail.com',
    password: '111111',
    accountNumber: '407900000001',
    phone: '+7 900 000-00-00',
    company: 'УК Комфортный дом',
  });

  const update = (field, value) => {
    setError('');
    setInvalidFields((current) => current.filter((item) => item !== field));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const filteredCompanies = demoCompanies.filter((company) =>
    company.toLocaleLowerCase('ru-RU').includes(companyQuery.toLocaleLowerCase('ru-RU')),
  );

  const chooseCompany = (company) => {
    setCompanyQuery(company);
    update('company', company);
    setCompanyListOpen(false);
  };

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!companySearchRef.current?.contains(event.target)) {
        setCompanyListOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const submit = (event) => {
    event.preventDefault();
    const requiredFields = mode === 'register'
      ? role !== 'payer'
        ? ['company', 'name', 'loginName', 'phone', 'email', 'password']
        : ['name', 'loginName', 'phone', 'email', 'accountNumber', 'password']
      : role !== 'payer'
        ? ['company', 'loginName', 'email', 'password']
        : ['accountNumber', 'loginName', 'email', 'password'];
    const missingFields = requiredFields.filter((field) => !String(form[field] ?? '').trim());

    if (missingFields.length > 0) {
      setInvalidFields(missingFields);
      setError('Заполните обязательные поля.');
      return;
    }

    if (mode === 'register') {
      if (role !== 'payer') {
        setError('Регистрация сотрудников и администраторов выполняется через заявку компании и приглашение.');
        return;
      }

      const created = registerPayer(form);
      if (!created.ok) {
        setError(created.message);
        return;
      }
      navigate('/app');
      return;
    }

    const signed = login(form.email, form.password, role);
    if (!signed.ok) {
      setError(signed.message);
      return;
    }
    navigate(role === 'companyAdmin' ? '/company-admin' : role === 'employee' ? '/employee' : '/app');
  };

  const switchToEmployee = () => {
    setRole('employee');
    setMode('login');
    setForm((current) => ({
      ...current,
      loginName: 'dispatcher',
      email: '1@gmail.com',
      password: '111111',
      company: 'УК Комфортный дом',
    }));
    setCompanyQuery('УК Комфортный дом');
    setError('');
    setInvalidFields([]);
  };

  const switchToCompanyAdmin = () => {
    setRole('companyAdmin');
    setMode('login');
    setForm((current) => ({
      ...current,
      loginName: 'admin',
      email: '1@gmail.com',
      password: '111111',
      company: 'УК Комфортный дом',
    }));
    setCompanyQuery('УК Комфортный дом');
    setError('');
    setInvalidFields([]);
  };

  const switchToPayer = () => {
    setRole('payer');
    setMode('login');
    setForm((current) => ({
      ...current,
      loginName: 'orlovam',
      email: '1@gmail.com',
      password: '111111',
      accountNumber: '407900000001',
    }));
    setError('');
    setInvalidFields([]);
  };

  const fieldClass = (field) => (invalidFields.includes(field) ? 'field-error' : undefined);

  return (
    <div className="page">
      <Header user={user} onLogout={onLogout} />

      <main className="auth-page">
        <section className="auth-card auth-card-large">
          <span className="section-kicker">Вход в систему</span>
          <h1>
            {role === 'companyAdmin'
              ? 'Вход администратора компании'
              : role === 'employee'
                ? 'Вход диспетчера или бухгалтера'
                : 'Вход плательщика'}
          </h1>
          <p>
            {role !== 'payer'
              ? 'Выберите компанию и войдите по логину, почте и паролю.'
              : 'Войдите по лицевому счету, логину, почте и паролю.'}
          </p>
          <form className="stack-form" onSubmit={submit}>
            {mode === 'register' && (
              <>
                <label className={fieldClass('name')}>
                  ФИО
                  <input value={form.name} onChange={(event) => update('name', event.target.value)} />
                </label>
                <label className={fieldClass('loginName')}>
                  Логин
                  <input value={form.loginName} onChange={(event) => update('loginName', event.target.value)} />
                </label>
                <label className={fieldClass('phone')}>
                  Телефон
                  <input value={form.phone} onChange={(event) => update('phone', event.target.value)} />
                </label>
                <label className={fieldClass('email')}>
                  Почта
                    <input
                    value={form.email}
                    onChange={(event) => update('email', event.target.value)}
                    placeholder="1@gmail.com"
                  />
                </label>
                {role === 'payer' && (
                  <label className={fieldClass('accountNumber')}>
                    Лицевой счет
                    <input
                      value={form.accountNumber}
                      onChange={(event) => update('accountNumber', event.target.value)}
                    />
                  </label>
                )}
              </>
            )}

            {role === 'payer' && mode !== 'register' && (
              <label className={fieldClass('accountNumber')}>
                Лицевой счет
                <input
                  value={form.accountNumber}
                  onChange={(event) => update('accountNumber', event.target.value)}
                />
              </label>
            )}

            {role !== 'payer' && (
              <label className={`company-search ${fieldClass('company') ?? ''}`} ref={companySearchRef}>
                Компания ЖКУ
                <div className="company-input-row">
                  <input
                    value={companyQuery}
                    onChange={(event) => {
                      setCompanyQuery(event.target.value);
                      update('company', event.target.value);
                      setCompanyListOpen(true);
                    }}
                    onFocus={() => setCompanyListOpen(true)}
                    placeholder="Начните вводить название компании"
                  />
                  <button
                    aria-label="Открыть список компаний"
                    type="button"
                    onClick={() => setCompanyListOpen((open) => !open)}
                  >
                    ▾
                  </button>
                </div>
                {companyListOpen && (
                  <div className="company-options">
                    {(filteredCompanies.length > 0 ? filteredCompanies : ['Компания не найдена']).map((company) => (
                      <button
                        disabled={company === 'Компания не найдена'}
                        key={company}
                        type="button"
                        onClick={() => chooseCompany(company)}
                      >
                        {company}
                      </button>
                    ))}
                  </div>
                )}
              </label>
            )}

            {mode !== 'register' && (
              <label className={fieldClass('loginName')}>
                Логин
                <input value={form.loginName} onChange={(event) => update('loginName', event.target.value)} />
              </label>
            )}

            {mode !== 'register' && (
              <label className={fieldClass('email')}>
                Почта
                  <input
                    value={form.email}
                    onChange={(event) => update('email', event.target.value)}
                    placeholder="1@gmail.com"
                  />
              </label>
            )}
            <label className={fieldClass('password')}>
              Пароль
              <div className="password-input-row">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => update('password', event.target.value)}
                />
                <button
                  type="button"
                  className="password-eye-btn"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && <div className="inline-error">{error}</div>}

            <button type="submit" className="wide-button">
              <LogIn size={18} />
              {mode === 'register'
                ? 'Создать кабинет'
                : role === 'companyAdmin'
                  ? 'Войти как администратор'
                  : role === 'employee'
                    ? 'Войти как диспетчер/бухгалтер'
                    : 'Войти'}
            </button>
          </form>

          <div className="auth-text-actions">
            {role === 'payer' ? (
              <>
                <button
                  type="button"
                  className="muted-action"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setInvalidFields([]);
                  }}
                >
                  Регистрация
                </button>
                <button type="button" className="underlined-action" onClick={switchToEmployee}>
                  войти как диспетчер/бухгалтер
                </button>
                <button type="button" className="underlined-action" onClick={switchToCompanyAdmin}>
                  войти как администратор компании
                </button>
              </>
            ) : role === 'employee' ? (
              <>
                <button
                  type="button"
                  className="muted-action"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setInvalidFields([]);
                  }}
                >
                  Регистрация
                </button>
                <button type="button" className="underlined-action" onClick={switchToPayer}>
                  войти как плательщик
                </button>
                <button type="button" className="underlined-action" onClick={switchToCompanyAdmin}>
                  войти как администратор компании
                </button>
              </>
            ) : (
              <>
                <Link to="/partner" className="muted-action">
                  Регистрация компании
                </Link>
                <button type="button" className="underlined-action" onClick={switchToEmployee}>
                  войти как диспетчер/бухгалтер
                </button>
                <button type="button" className="underlined-action" onClick={switchToPayer}>
                  войти как плательщик
                </button>
              </>
            )}
          </div>
        </section>
      </main>
      <MinimalFooter />
    </div>
  );
}
