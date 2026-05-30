import React, { useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  Gauge,
  LayoutDashboard,
  Pencil,
  QrCode,
  ReceiptText,
  Settings,
  UserRound,
  WalletCards,
} from 'lucide-react';
import {
  buildReceiptSummary,
  filterReportReceipts,
  formatMoney,
  getLatestReceiptPeriodKey,
  getReceiptPeriodKey,
  getReportServices,
  getServiceName,
} from '../utils.js';
import { PageTitle, ServiceBadge, StatCard, StatusBadge, WorkspaceTopbar } from '../components/shared.jsx';

const waterMeterRows = [
  { name: 'ХВС', checkDate: '28.02.2027', previous: '149', current: '200', usage: '6,00 куб. м' },
  { name: 'ГВС', checkDate: '28.02.2027', previous: '73', current: '74', usage: '1,00 куб. м' },
  { name: 'ОДПУ', checkDate: 'по дому', previous: '7151 куб. м', current: '7332 куб. м', usage: '0,19 куб. м' },
];

const waterReceiptTotals = {
  received: 5253.36,
  balance: 5520.73,
  accrued: 4523.67,
  due: 4523.67,
};

const housingChargeRows = [
  { service: 'Содержание общего имущества', rate: 8.16, cost: 342.72, benefit: '-', recalc: '-', total: 342.72 },
  { service: 'Обслуживание лифтов', rate: 5.04, cost: 211.68, benefit: '-', recalc: '-', total: 211.68 },
  { service: 'Уборка мусорных камер', rate: 1.88, cost: 78.96, benefit: '-', recalc: '-', total: 78.96 },
  { service: 'Содержание территории', rate: 3.21, cost: 134.82, benefit: '-', recalc: '-', total: 134.82 },
  { service: 'Уборка МОП', rate: 3.44, cost: 144.48, benefit: '-', recalc: '-', total: 144.48 },
  { service: 'ПЗУ', rate: 0.35, cost: 14.7, benefit: '-', recalc: '-', total: 14.7 },
  { service: 'ТО и ремонт АППЗ', rate: 0.5, cost: 21, benefit: '-', recalc: '-', total: 21 },
  { service: 'ТО ИТП', rate: 1.68, cost: 70.56, benefit: '-', recalc: '-', total: 70.56 },
  { service: 'Тех. обслуживание ОДС', rate: 1.05, cost: 44.1, benefit: '-', recalc: '-', total: 44.1 },
  { service: 'Консьерж/Диспетчер', rate: 8.89, cost: 373.38, benefit: '-', recalc: '-', total: 373.38 },
  { service: 'Админ. управл. расходы', rate: 5.28, cost: 221.76, benefit: '-', recalc: '-', total: 221.76 },
  { service: 'Текущий ремонт', rate: 8.47, cost: 355.74, benefit: '-', recalc: '-', total: 355.74 },
  { service: 'Паспортная служба', rate: 0.4, cost: 16.8, benefit: '-', recalc: '-', total: 16.8 },
  { service: 'ТО видеонаблюдение', rate: 0.4, cost: 16.8, benefit: '-', recalc: '-', total: 16.8 },
  { service: 'Страхование общего имущества', rate: 0.06, cost: 2.52, benefit: '-', recalc: '-', total: 2.52 },
];

const utilityChargeRows = [
  {
    service: 'Отопление',
    unit: 'Гкал',
    tariff: 2466.22,
    volume: '0,5065',
    charge: 1249.14,
    benefit: '-',
    recalc: '-',
    total: 1249.14,
  },
  {
    service: 'ХВС',
    unit: 'куб. м',
    tariff: 43.13,
    volume: '6,00',
    charge: 258.78,
    benefit: '-',
    recalc: -294.15,
    total: -35.37,
  },
  {
    service: 'ГВС',
    unit: 'куб. м',
    tariff: 147.97,
    volume: '1,00',
    charge: 147.97,
    benefit: '-',
    recalc: -147.97,
    total: 0,
  },
  {
    service: 'СОИ водоотведение',
    unit: 'куб. м',
    tariff: 43.13,
    volume: '0,0076',
    charge: 0.33,
    benefit: '-',
    recalc: -0.33,
    total: 0,
  },
  {
    service: 'СОИ горячая вода',
    unit: 'Гкал',
    tariff: 2466.22,
    volume: '0,00046',
    charge: 1.13,
    benefit: '-',
    recalc: -1.13,
    total: 0,
  },
  {
    service: 'Водоотведение',
    unit: 'куб. м',
    tariff: 43.13,
    volume: '7,00',
    charge: 301.91,
    benefit: '-',
    recalc: -337.28,
    total: -35.37,
  },
  {
    service: 'СОИ электроэнергия',
    unit: 'кВтч',
    tariff: 5.31,
    volume: '19,95',
    charge: 105.93,
    benefit: '-',
    recalc: '-',
    total: 105.93,
  },
  {
    service: 'Помывка фасадного остекления',
    unit: 'усл.',
    tariff: '-',
    volume: '-',
    charge: 775.32,
    benefit: '-',
    recalc: '-',
    total: 775.32,
  },
  {
    service: 'ТВ сигнал',
    unit: 'шт.',
    tariff: 279,
    volume: '1',
    charge: 279,
    benefit: '-',
    recalc: '-',
    total: 279,
  },
  {
    service: 'ТО ТВ-приемника',
    unit: 'шт.',
    tariff: 25,
    volume: '1',
    charge: 25,
    benefit: '-',
    recalc: '-',
    total: 25,
  },
  {
    service: 'Радио',
    unit: 'шт.',
    tariff: 110,
    volume: '1',
    charge: 110,
    benefit: '-',
    recalc: '-',
    total: 110,
  },
];

const waterTechnicalRows = [
  'Расход общедомовых счетчиков: Э/э 32300 кВт*ч; УУТЭ 467.04 Гкал; ХВС 2154 куб. м; ГВС 1420.66 куб. м.',
  'Объемы индивидуального потребления: Э/э 14612.87 кВт*ч; ГВС 1414.9 куб. м; ХВС 2335.86 куб. м.',
  'Объемы на ОДН: ХВС 71409 кон.; ГВС 73563 кон.; стоки ХВ 181.86 куб. м; стоки ГВ 5.76 куб. м.',
];

const electricityReceiptTotals = {
  withoutExtra: 1367.4,
  withExtra: 1367.4,
  insurance: 157.5,
};

const electricityPropertyRows = [
  { label: 'Общая площадь помещения', value: '42,00 кв. м' },
  { label: 'Общая площадь жилых помещений МКД/ЖКД', value: '20 671,40 кв. м' },
  { label: 'Общая площадь нежилых помещений МКД', value: '0,00 кв. м' },
  { label: 'Общая площадь помещений с индивидуальным отоплением', value: '0,00 кв. м' },
  { label: 'Площадь мест общего пользования МКД', value: '-' },
];

const electricityMeterRows = [
  {
    service: 'Электроснабжение (день)',
    meter: '54122761',
    nextCheck: '-',
    readingDate: '13.09.2025',
    previous: '637',
    current: '-',
  },
  {
    service: 'Электроснабжение (ночь)',
    meter: '54122761',
    nextCheck: '-',
    readingDate: '13.09.2025',
    previous: '349',
    current: '-',
  },
];

const electricitySettlementRows = [
  {
    code: '034',
    organization: 'АО "ПСК"',
    period: '09.2025',
    dueDate: '20.10.25',
    opening: 529.96,
    paid: 529.96,
    charged: 378.32,
    recalc: 0,
    closing: 378.32,
    toPay: 378.32,
  },
  {
    code: '043',
    organization: 'НО "ФКР МКД СПб"',
    period: '10.2025',
    dueDate: '10.11.25',
    opening: 0,
    paid: 0,
    charged: 576.66,
    recalc: 0,
    closing: 576.66,
    toPay: 576.66,
  },
  {
    code: '090',
    organization: 'АО "НЭО"',
    period: '09.2025',
    dueDate: '20.10.25',
    opening: 412.42,
    paid: 412.42,
    charged: 412.42,
    recalc: 0,
    closing: 412.42,
    toPay: 412.42,
  },
];

const electricityChargeRows = [
  {
    group: 'Коммунальные услуги',
    code: '034',
    service: 'Электроснабжение (день) (до 1200)',
    unit: 'кВт*ч',
    volume: '48,00',
    reason: '2',
    tariff: 5.98,
    excess: '-',
    withoutBenefit: 287.04,
    benefit: 0,
    total: 287.04,
  },
  {
    group: 'Коммунальные услуги',
    code: '034',
    service: 'Электроснабжение (ночь) (до 1200)',
    unit: 'кВт*ч',
    volume: '28,00',
    reason: '2',
    tariff: 3.26,
    excess: '-',
    withoutBenefit: 91.28,
    benefit: 0,
    total: 91.28,
  },
  {
    group: 'Коммунальные услуги',
    code: '090',
    service: 'Обращение с ТКО',
    unit: 'куб. м',
    volume: '0,2695',
    reason: '5',
    tariff: 1530.31,
    excess: '-',
    withoutBenefit: 412.42,
    benefit: 0,
    total: 412.42,
  },
  {
    group: 'Взносы на капитальный ремонт',
    code: '043',
    service: 'Взнос на капитальный ремонт',
    unit: 'кв. м',
    volume: '42,00',
    reason: '5',
    tariff: 13.73,
    excess: '-',
    withoutBenefit: 576.66,
    benefit: 0,
    total: 576.66,
  },
];

const electricityRecipientRows = [
  {
    code: '034',
    account: '3428894',
    organization: 'АО "Петербургская сбытовая компания" / АО "ЕИРЦ СПб"',
    contact: '195009, Санкт-Петербург, ул. Михайлова, д. 11, тел. 679-22-22, lk.pesc.ru',
  },
  {
    code: '043',
    account: '103706311',
    organization: 'НО "ФКР МКД СПб"',
    contact: '194044, Санкт-Петербург, ул. Тобольская, д. 6, тел. 703-57-30, fkr-spb.ru',
  },
  {
    code: '090',
    account: '29160937',
    organization: 'АО "Невский экологический оператор"',
    contact: '190000, Санкт-Петербург, ул. Якубовича, д. 1/2, офис: spb-neo.ru',
  },
];

const gasReceiptTotals = {
  due: 1190.64,
  insurance: 0,
};

const gasMeterRows = [
  {
    device: 'ВК-G4T',
    nextCheck: '23.03.2030',
    lastReadingDate: '22.04.2022',
    previous: '27 125',
    current: '',
    usage: 'поле 5 - поле 4',
  },
];

const gasChargeRows = [
  {
    group: 'Коммунальные услуги',
    service: '02. Газоснабжение',
    detail: 'По счетчику',
    volume: '-',
    unit: 'куб. м',
    tariff: 5.808,
    debt: 1190.64,
    charged: 0,
    recalculation: 0,
    paid: 0,
    total: 1190.64,
  },
];

const receiptMoney = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const sumRows = (rows, field) =>
  rows.reduce((sum, row) => sum + (typeof row[field] === 'number' ? row[field] : 0), 0);

const formatReceiptMoney = (value) => `${receiptMoney.format(value)} ₽`;

const formatReceiptValue = (value) => {
  if (typeof value === 'number') {
    return receiptMoney.format(value);
  }

  return value;
};

function getMeterReadingFields(service) {
  if (service === 'water') {
    return [
      { id: 'coldWater', label: 'ХВС', meter: 'индивидуальный счетчик', previous: '200', unit: 'куб. м' },
      { id: 'hotWater', label: 'ГВС', meter: 'индивидуальный счетчик', previous: '74', unit: 'куб. м' },
    ];
  }

  if (service === 'electricity') {
    return [
      { id: 'electricityDay', label: 'Электроснабжение (день)', meter: '54122761', previous: '637', unit: 'кВт*ч' },
      { id: 'electricityNight', label: 'Электроснабжение (ночь)', meter: '54122761', previous: '349', unit: 'кВт*ч' },
    ];
  }

  if (service === 'gas') {
    return [
      { id: 'gas', label: 'Газоснабжение', meter: 'ВК-G4T', previous: '27 125', unit: 'куб. м' },
    ];
  }

  return [];
}

const parseMeterReadingNumber = (value) =>
  Number(String(value).replace(/\s/g, '').replace(',', '.').replace(/[^\d.-]/g, ''));

function validateMeterReadings(fields, readings) {
  return fields.reduce((errors, field) => {
    const rawValue = String(readings[field.id] ?? '').trim();
    const value = parseMeterReadingNumber(readings[field.id]);
    const previous = parseMeterReadingNumber(field.previous);

    if (!rawValue || !Number.isFinite(value)) {
      errors[field.id] = 'Введите текущие показания';
      return errors;
    }

    if (value <= previous) {
      errors[field.id] = `Показания должны быть больше предыдущих: ${field.previous} ${field.unit}`;
    }

    return errors;
  }, {});
}

function getNearestPaymentsByService(receipts) {
  const unpaidReceipts = receipts
    .filter((item) => item.status === 'unpaid')
    .sort((a, b) => {
      const periodCompare = getReceiptPeriodKey(b.period).localeCompare(getReceiptPeriodKey(a.period));
      return periodCompare || String(a.dueDate).localeCompare(String(b.dueDate));
    });

  return getReportServices()
    .map(([service]) => unpaidReceipts.find((receipt) => receipt.service === service))
    .filter(Boolean);
}

export function PayerLayout({ user, store, logout, updateProfile, payReceipt, theme, setTheme }) {
  const account = store.accounts.find((item) => item.id === user.accountId);
  const receipts = filterReportReceipts(store.receipts).filter((item) => item.accountId === user.accountId);
  const summary = buildReceiptSummary(receipts);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand-link side-brand">
          <span className="brand-mark">
            <Building2 size={22} />
          </span>
          <span>
            <strong>ЖКУ Контроль</strong>
            <small>{account?.number}</small>
          </span>
        </Link>

        <nav className="side-nav">
          <NavLink end to="/app">
            <LayoutDashboard size={18} />
            Главное
          </NavLink>
          <NavLink to="/app/receipts">
            <ReceiptText size={18} />
            Квитанции
          </NavLink>
          <NavLink to="/app/pay">
            <WalletCards size={18} />
            Оплата
          </NavLink>
          <NavLink to="/app/profile">
            <UserRound size={18} />
            Аккаунт
          </NavLink>
          <NavLink to="/app/settings">
            <Settings size={18} />
            Настройки
          </NavLink>
        </nav>
      </aside>

      <main className="workspace">
        <WorkspaceTopbar
          user={user}
          logout={logout}
          theme={theme}
          setTheme={setTheme}
          settingsTo="/app/settings"
        />
        <Outlet context={{ user, account, receipts, summary, updateProfile, payReceipt, theme, setTheme }} />
      </main>
    </div>
  );
}

export function PayerDashboard() {
  const { account, receipts, summary } = useOutletContext();
  const [openSections, setOpenSections] = useState({
    meters: false,
    payments: false,
  });
  const lastPeriodKey = getLatestReceiptPeriodKey(receipts);
  const lastPeriodReceipts = receipts.filter((receipt) => getReceiptPeriodKey(receipt.period) === lastPeriodKey);
  const lastPeriodTitle = lastPeriodReceipts[0]?.period ?? 'прошлый период';
  const serviceRows = getReportServices().map(([code, meta]) => {
    const receipt = lastPeriodReceipts.find((item) => item.service === code);
    return {
      code,
      name: meta.name,
      receipt,
      paid: receipt?.status === 'paid',
      unpaid: receipt?.status === 'unpaid',
    };
  });
  const unpaidRows = serviceRows.filter((row) => row.unpaid);
  const allPaid = serviceRows.every((row) => row.paid);
  const nearestPayments = getNearestPaymentsByService(receipts);
  const toggleSection = (section) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  return (
    <>
      <PageTitle eyebrow="Личный кабинет" title="Главное меню">
        Сводка по лицевому счету {account?.number}
      </PageTitle>

      <section className={`work-panel payer-period-status ${allPaid ? 'success' : 'warning'}`}>
        <div className="period-status-head">
          <span className="big-status-icon">
            {allPaid ? <CheckCircle2 size={54} /> : <AlertCircle size={54} />}
          </span>
          <div>
            <h2>{allPaid ? 'Все оплачено' : 'Есть неоплаченные квитанции'}</h2>
            <p>
              Статус квитанций за {lastPeriodTitle}.
              {!allPaid && ` Не оплачено: ${unpaidRows.map((row) => row.name.toLowerCase()).join(', ')}.`}
            </p>
          </div>
        </div>

        <div className="period-service-list">
          {serviceRows.map((row) => (
            <article className={`period-service-row ${row.paid ? 'paid' : 'unpaid'}`} key={row.code}>
              {row.paid ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
              <div>
                <strong>{row.name}</strong>
                <span>{row.receipt ? formatMoney(row.receipt.amount) : 'Квитанция не выставлена'}</span>
              </div>
              <b>{row.paid ? 'Оплачено' : 'Не оплачено'}</b>
            </article>
          ))}
        </div>

        <Link className="primary-link history-link" to="/app/receipts">
          <ReceiptText size={18} />
          Посмотреть историю платежей
        </Link>
      </section>

      <section className="stats-grid">
        <StatCard icon={AlertCircle} label="Не оплачено" value={formatMoney(summary.unpaidAmount)} tone="danger" />
        <StatCard icon={CheckCircle2} label="Оплачено" value={formatMoney(summary.paidAmount)} tone="success" />
        <StatCard icon={ReceiptText} label="Квитанций" value={receipts.length} />
      </section>

      <CollapsiblePanel
        isOpen={openSections.meters}
        title="Показания счетчиков"
        onToggle={() => toggleSection('meters')}
      >
        <MeterReadingMenu
          title="Показания счетчиков"
          description="Выберите услугу и передайте текущие показания без открытия отдельной квитанции."
          embedded
        />
      </CollapsiblePanel>

      <CollapsiblePanel
        isOpen={openSections.payments}
        title="Ближайшие платежи"
        onToggle={() => toggleSection('payments')}
      >
        {nearestPayments.length > 0 ? (
          <div className="upcoming-payment-list">
            {nearestPayments.map((receipt) => (
              <article className="focus-receipt" key={receipt.id}>
                <ServiceBadge service={receipt.service} />
                <strong>{receipt.period}</strong>
                <span>{formatMoney(receipt.amount)}</span>
                <Link className="primary-link" to={`/app/pay/${receipt.id}`}>
                  <WalletCards size={18} />
                  Оплатить
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <BadgeCheck size={28} />
            <strong>Ближайших платежей нет</strong>
            <span>Все квитанции по текущим демо-данным оплачены.</span>
          </div>
        )}
      </CollapsiblePanel>

      <section className="work-panel">
        <h2>Доступные разделы</h2>
        <div className="action-grid">
          <Link to="/app/receipts">
            <ReceiptText size={22} />
            Квитанции
          </Link>
          <Link to="/app/pay">
            <CreditCard size={22} />
            Оплата
          </Link>
          <Link to="/app/profile">
            <Pencil size={22} />
            Аккаунт
          </Link>
        </div>
      </section>
    </>
  );
}

function CollapsiblePanel({ title, isOpen, onToggle, children }) {
  return (
    <section className={`work-panel collapsible-panel ${isOpen ? 'open' : ''}`}>
      <button className="collapsible-panel-head" type="button" onClick={onToggle} aria-expanded={isOpen}>
        <h2>{title}</h2>
        <ChevronDown size={22} />
      </button>
      {isOpen && <div className="collapsible-panel-body">{children}</div>}
    </section>
  );
}

export function ReceiptsPage() {
  const { receipts } = useOutletContext();
  const [filter, setFilter] = useState('all');

  const filtered = receipts.filter((item) => filter === 'all' || item.status === filter);

  return (
    <>
      <PageTitle eyebrow="Квитанции" title="Платежные документы">
        Периоды, услуги, суммы и текущие статусы оплаты.
      </PageTitle>

      <MeterReadingMenu title="Передача показаний" description="Сначала выберите тип счетчика, затем внесите текущие значения." />

      <div className="toolbar">
        {[
          ['all', 'Все'],
          ['unpaid', 'Не оплачены'],
          ['paid', 'Оплачены'],
        ].map(([value, label]) => (
          <button
            className={filter === value ? 'active' : ''}
            key={value}
            type="button"
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="receipt-list">
        {filtered.map((receipt) => (
          <article className="receipt-card" key={receipt.id}>
            <div className="receipt-main">
              <FileText size={22} />
              <div>
                <strong>{receipt.period}</strong>
                <ServiceBadge service={receipt.service} />
              </div>
            </div>
            <div className="receipt-meta">
              <span>{formatMoney(receipt.amount)}</span>
              <StatusBadge status={receipt.status} />
            </div>
            <div className="receipt-actions">
              <Link to={`/app/receipts/${receipt.id}`} className="ghost-link">
                Детали
              </Link>
              {receipt.status === 'unpaid' && (
                <Link to={`/app/pay/${receipt.id}`} className="primary-link">
                  <CreditCard size={18} />
                  Оплатить
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

export function ReceiptDetailPage() {
  const { receiptId } = useParams();
  const { receipts, account } = useOutletContext();
  const receipt = receipts.find((item) => item.id === receiptId);
  const [showMeterForm, setShowMeterForm] = useState(false);
  const [meterSaved, setMeterSaved] = useState(false);
  const [meterErrors, setMeterErrors] = useState({});
  const meterFields = receipt ? getMeterReadingFields(receipt.service) : [];
  const [meterReadings, setMeterReadings] = useState(() =>
    Object.fromEntries(meterFields.map((field) => [field.id, ''])),
  );

  if (!receipt) {
    return <Navigate to="/app/receipts" replace />;
  }

  const detailAmount = receipt.service === 'water'
    ? formatReceiptMoney(waterReceiptTotals.due)
    : receipt.service === 'electricity'
      ? formatReceiptMoney(electricityReceiptTotals.withExtra)
      : receipt.service === 'gas'
        ? formatReceiptMoney(gasReceiptTotals.due)
        : formatMoney(receipt.amount);

  const updateMeterReading = (field, value) => {
    setMeterSaved(false);
    setMeterErrors((current) => ({ ...current, [field]: '' }));
    setMeterReadings((current) => ({ ...current, [field]: value }));
  };

  const submitMeterReadings = (event) => {
    event.preventDefault();
    const errors = validateMeterReadings(meterFields, meterReadings);
    setMeterErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMeterSaved(false);
      return;
    }

    setMeterSaved(true);
  };

  return (
    <>
      <PageTitle eyebrow="Квитанция" title={receipt.period}>
        Лицевой счет {account?.number}
      </PageTitle>

      <section className="detail-layout">
        <div className="detail-panel">
          <ServiceBadge service={receipt.service} />
          <dl className="detail-list">
            <div>
              <dt>Сумма</dt>
              <dd>{detailAmount}</dd>
            </div>
            <div>
              <dt>Срок оплаты</dt>
              <dd>{receipt.dueDate}</dd>
            </div>
            <div>
              <dt>Статус</dt>
              <dd><StatusBadge status={receipt.status} /></dd>
            </div>
            <div>
              <dt>Способ оплаты</dt>
              <dd>{receipt.method ?? 'Ожидает оплаты'}</dd>
            </div>
          </dl>
        </div>

        <div className="detail-actions">
          <Link to="/app/receipts" className="ghost-link">К списку</Link>
          {receipt.status === 'unpaid' && (
            <Link to={`/app/pay/${receipt.id}`} className="primary-link">
              <WalletCards size={18} />
              Перейти к оплате
            </Link>
          )}
        </div>
      </section>

      <MeterReadingPanel
        fields={meterFields}
        errors={meterErrors}
        readings={meterReadings}
        saved={meterSaved}
        service={receipt.service}
        showForm={showMeterForm}
        onChange={updateMeterReading}
        onSubmit={submitMeterReadings}
        onToggle={() => setShowMeterForm((current) => !current)}
      />

      {receipt.service === 'water' && <WaterReceiptDetails receipt={receipt} account={account} />}
      {receipt.service === 'electricity' && <ElectricityReceiptDetails receipt={receipt} account={account} />}
      {receipt.service === 'gas' && <GasReceiptDetails receipt={receipt} account={account} />}
    </>
  );
}

function MeterReadingMenu({ title, description, embedded = false }) {
  const [selectedService, setSelectedService] = useState('water');
  const [readings, setReadings] = useState({});
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const fields = getMeterReadingFields(selectedService);

  const update = (field, value) => {
    setSaved(false);
    setErrors((current) => ({ ...current, [field]: '' }));
    setReadings((current) => ({ ...current, [field]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validateMeterReadings(fields, readings);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSaved(false);
      return;
    }

    setSaved(true);
  };

  const selectService = (service) => {
    setSelectedService(service);
    setSaved(false);
    setErrors({});
  };

  return (
    <MeterReadingPanel
      controls={(
        <div className="meter-service-menu">
          {getReportServices().map(([service, meta]) => (
            <button
              className={selectedService === service ? 'active' : ''}
              key={service}
              type="button"
              onClick={() => selectService(service)}
            >
              {meta.name}
            </button>
          ))}
        </div>
      )}
      description={description}
      errors={errors}
      fields={fields}
      embedded={embedded}
      readings={readings}
      saved={saved}
      service={selectedService}
      showForm
      showToggle={false}
      title={title}
      onChange={update}
      onSubmit={submit}
    />
  );
}

function MeterReadingPanel({
  controls,
  description,
  errors = {},
  embedded = false,
  fields,
  readings,
  saved,
  service,
  showForm,
  showToggle = true,
  title = 'Передать показания по квитанции',
  onChange,
  onSubmit,
  onToggle,
}) {
  const serviceName = getServiceName(service).toLowerCase();
  const hint = description ?? `Поля соответствуют приборам учета, указанным в текущей квитанции за ${serviceName}.`;

  return (
    <section className={`meter-submit-panel ${embedded ? 'embedded' : ''}`}>
      <div>
        <span className="paper-kicker">Показания счетчиков</span>
        <h2>{title}</h2>
        <p>{hint}</p>
      </div>
      {controls}
      {showToggle && (
        <button className="wide-button meter-toggle-button" type="button" onClick={onToggle}>
          <Gauge size={18} />
          {showForm ? 'Скрыть форму показаний' : 'Подать показания счетчиков'}
        </button>
      )}

      {showForm && (
        <form className="meter-submit-form" onSubmit={onSubmit}>
          <div className="meter-field-grid">
            {fields.map((field) => (
              <label className={`meter-field-card ${errors[field.id] ? 'field-error' : ''}`} key={field.id}>
                <span>{field.label}</span>
                <small>Прибор учета: {field.meter}. Предыдущие: {field.previous} {field.unit}</small>
                <input
                  aria-invalid={Boolean(errors[field.id])}
                  inputMode="decimal"
                  placeholder={`Новые показания, ${field.unit}`}
                  value={readings[field.id] ?? ''}
                  onChange={(event) => onChange(field.id, event.target.value)}
                />
                {errors[field.id] && <small className="meter-error">{errors[field.id]}</small>}
              </label>
            ))}
          </div>
          <button className="wide-button" type="submit">
            <Pencil size={18} />
            Отправить показания
          </button>
          {saved && <div className="inline-success">Показания сохранены в демо-режиме</div>}
        </form>
      )}
    </section>
  );
}

function WaterReceiptDetails({ receipt, account }) {
  const housingTotal = sumRows(housingChargeRows, 'total');
  const utilityTotal = sumRows(utilityChargeRows, 'total');
  const chargeBeforeRecalc = sumRows(housingChargeRows, 'cost') + sumRows(utilityChargeRows, 'charge');
  const recalculationTotal = sumRows(utilityChargeRows, 'recalc');
  const personalArea = '44,20 кв. м';
  const totalArea = '31 661,00 кв. м';
  const residents = '1 чел.';

  return (
    <section className="water-receipt-details">
      <div className="paper-receipt">
        <div className="paper-receipt-head">
          <div>
            <span className="paper-kicker">Счет-квитанция</span>
            <h2>Полная детализация начислений</h2>
            <p>Все строки из бумажной квитанции: содержание дома, коммунальные услуги, перерасчеты и дополнительные начисления.</p>
          </div>
          <div className="paper-receipt-code">
            <QrCode size={82} />
            <span>ИПД № {receipt.id.toUpperCase()}</span>
          </div>
        </div>

        <div className="paper-receipt-grid">
          <article className="paper-receipt-box wide">
            <h3>Получатель</h3>
            <dl>
              <div>
                <dt>Организация</dt>
                <dd>АО "Сервис-Недвижимость"</dd>
              </div>
              <div>
                <dt>ИНН / КПП</dt>
                <dd>7814379550 / 781401001</dd>
              </div>
              <div>
                <dt>Банк</dt>
                <dd>ГПБ (АО), г. Москва</dd>
              </div>
              <div>
                <dt>Р/с и БИК</dt>
                <dd>40702810700000087573 / 044525823</dd>
              </div>
            </dl>
          </article>

          <article className="paper-receipt-box">
            <h3>Плательщик</h3>
            <dl>
              <div>
                <dt>ФИО</dt>
                <dd>{account?.ownerName}</dd>
              </div>
              <div>
                <dt>Адрес</dt>
                <dd>{account?.address ?? 'Санкт-Петербург, Комендантский проспект, д.53, к.1, литера А, кв.94'}</dd>
              </div>
              <div>
                <dt>Лицевой счет</dt>
                <dd>{account?.number}</dd>
              </div>
              <div>
                <dt>Площадь / проживающих</dt>
                <dd>{personalArea}, {residents}</dd>
              </div>
            </dl>
          </article>

          <article className="paper-receipt-box">
            <h3>Выпуск и дом</h3>
            <dl>
              <div>
                <dt>Дата выпуска</dt>
                <dd>14.04.2026</dd>
              </div>
              <div>
                <dt>Период</dt>
                <dd>{receipt.period}</dd>
              </div>
              <div>
                <dt>ЕЛС</dt>
                <dd>70НР683922</dd>
              </div>
              <div>
                <dt>Площадь дома</dt>
                <dd>{totalArea}</dd>
              </div>
              <div>
                <dt>Жилые / нежилые</dt>
                <dd>20 681,00 / 10 980,00 кв. м</dd>
              </div>
              <div>
                <dt>МОП / ОИ</dt>
                <dd>5 168,20 / 6 831,50 кв. м</dd>
              </div>
              <div>
                <dt>Проживает в доме</dt>
                <dd>751 чел.</dd>
              </div>
            </dl>
          </article>
        </div>

        <div className="paper-receipt-summary">
          <div>
            <span>Поступило в марте</span>
            <strong>{formatReceiptMoney(waterReceiptTotals.received)}</strong>
          </div>
          <div>
            <span>Баланс на 01.04.2026</span>
            <strong>{formatReceiptMoney(waterReceiptTotals.balance)}</strong>
          </div>
          <div>
            <span>Начислено за апрель</span>
            <strong>{formatReceiptMoney(waterReceiptTotals.accrued)}</strong>
          </div>
          <div>
            <span>К оплате</span>
            <strong>{formatReceiptMoney(waterReceiptTotals.due)}</strong>
          </div>
        </div>

        <div className="receipt-contact-line">
          <span>Управдом: Комендантский пр., д.53, к.1</span>
          <span>Диспетчер: 389-60-10, 671-01-74</span>
          <span>Радио: ООО "Невалинк", тел. 601-0-701</span>
        </div>

        <div className="water-meter-section">
          <h3>Показания водосчетчиков</h3>
          <div className="meter-grid">
            {waterMeterRows.map((row) => (
              <article key={row.name}>
                <strong>{row.name}</strong>
                <span>Поверить до: {row.checkDate}</span>
                <dl>
                  <div>
                    <dt>Нач.</dt>
                    <dd>{row.previous}</dd>
                  </div>
                  <div>
                    <dt>Кон.</dt>
                    <dd>{row.current}</dd>
                  </div>
                  <div>
                    <dt>Расход</dt>
                    <dd>{row.usage}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>

        <div className="water-charges">
          <h3>Жилищные услуги и содержание общего имущества</h3>
          <div className="water-charges-table-wrap">
            <table className="water-charges-table housing-table">
              <thead>
                <tr>
                  <th>Вид платежа</th>
                  <th>Разм. платы</th>
                  <th>Стоимость</th>
                  <th>Скидка по льг.</th>
                  <th>Перерасчет</th>
                  <th>Итого начисл.</th>
                </tr>
              </thead>
              <tbody>
                {housingChargeRows.map((row) => (
                  <tr key={row.service}>
                    <td>{row.service}</td>
                    <td>{formatReceiptValue(row.rate)}</td>
                    <td>{formatReceiptValue(row.cost)}</td>
                    <td>{row.benefit}</td>
                    <td>{row.recalc}</td>
                    <td>{formatReceiptValue(row.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5}>Итого по жилищным услугам</td>
                  <td>{formatReceiptMoney(housingTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="water-charges">
          <h3>Коммунальные услуги, перерасчеты и дополнительные начисления</h3>
          <div className="water-charges-table-wrap">
            <table className="water-charges-table">
              <thead>
                <tr>
                  <th>Услуга</th>
                  <th>Ед.</th>
                  <th>Тариф</th>
                  <th>Норма/расход</th>
                  <th>Начислено</th>
                  <th>Скидка</th>
                  <th>Перерасчет</th>
                  <th>Итого</th>
                </tr>
              </thead>
              <tbody>
                {utilityChargeRows.map((row) => (
                  <tr key={row.service}>
                    <td>{row.service}</td>
                    <td>{row.unit}</td>
                    <td>{formatReceiptValue(row.tariff)}</td>
                    <td>{row.volume}</td>
                    <td>{formatReceiptValue(row.charge)}</td>
                    <td>{row.benefit}</td>
                    <td className={typeof row.recalc === 'number' && row.recalc < 0 ? 'negative-cell' : ''}>
                      {formatReceiptValue(row.recalc)}
                    </td>
                    <td className={row.total < 0 ? 'negative-cell' : ''}>{formatReceiptValue(row.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={7}>Итого по коммунальным и дополнительным начислениям</td>
                  <td>{formatReceiptMoney(utilityTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="receipt-total-panel">
          <div>
            <span>Начислено до перерасчетов</span>
            <strong>{formatReceiptMoney(chargeBeforeRecalc)}</strong>
          </div>
          <div>
            <span>Перерасчеты</span>
            <strong>{formatReceiptMoney(recalculationTotal)}</strong>
          </div>
          <div>
            <span>Итого по всем строкам</span>
            <strong>{formatReceiptMoney(housingTotal + utilityTotal)}</strong>
          </div>
        </div>

        <div className="receipt-technical">
          <h3>Технические показатели из квитанции</h3>
          {waterTechnicalRows.map((row) => (
            <p key={row}>{row}</p>
          ))}
        </div>

        <div className="paper-receipt-footer">
          <div>
            <h3>Оплата</h3>
            <p>
              Оплатить до 15-го числа следующего месяца. Расчет объема производится с точностью не менее двух
              десятичных знаков. Срок хранения платежного документа 3 года.
            </p>
          </div>
          <div className="demo-barcode" aria-label="Штрихкод оплаты" />
        </div>
      </div>
    </section>
  );
}

function ElectricityReceiptDetails({ receipt, account }) {
  const settlementsTotal = sumRows(electricitySettlementRows, 'toPay');
  const chargesTotal = sumRows(electricityChargeRows, 'total');

  return (
    <section className="water-receipt-details electricity-receipt-details">
      <div className="paper-receipt">
        <div className="paper-receipt-head">
          <div>
            <span className="paper-kicker">Счет на оплату</span>
            <h2>Детализация электроснабжения</h2>
            <p>Реквизиты, приборы учета, взаиморасчеты, начисления за период и получатели платежей.</p>
          </div>
          <div className="paper-receipt-code">
            <QrCode size={82} />
            <span>Счет на 01.10.2025</span>
          </div>
        </div>

        <div className="paper-receipt-grid">
          <article className="paper-receipt-box wide">
            <h3>Реквизиты для оплаты</h3>
            <dl>
              <div>
                <dt>Получатель</dt>
                <dd>АО "ЕИРЦ СПб"</dd>
              </div>
              <div>
                <dt>ИНН / БИК</dt>
                <dd>7804678720 / 044030861</dd>
              </div>
              <div>
                <dt>Р/с</dt>
                <dd>40702810000000005464</dd>
              </div>
              <div>
                <dt>К/с и банк</dt>
                <dd>30101810800000000861 в АО "АБ Россия"</dd>
              </div>
            </dl>
          </article>

          <article className="paper-receipt-box">
            <h3>Плательщик</h3>
            <dl>
              <div>
                <dt>ФИО</dt>
                <dd>{account?.ownerName}</dd>
              </div>
              <div>
                <dt>Адрес</dt>
                <dd>{account?.address ?? 'Санкт-Петербург, Комендантский пр-кт, д. 53 корп. 1 лит. А, кв. 94'}</dd>
              </div>
              <div>
                <dt>Проживающих</dt>
                <dd>1 чел.</dd>
              </div>
            </dl>
          </article>

          <article className="paper-receipt-box">
            <h3>Счет</h3>
            <dl>
              <div>
                <dt>Дата счета</dt>
                <dd>01.10.2025</dd>
              </div>
              <div>
                <dt>Лицевой счет для оплаты</dt>
                <dd>715000398224</dd>
              </div>
              <div>
                <dt>Период</dt>
                <dd>{receipt.period}</dd>
              </div>
            </dl>
          </article>
        </div>

        <div className="paper-receipt-summary">
          <div>
            <span>К оплате без прочих услуг</span>
            <strong>{formatReceiptMoney(electricityReceiptTotals.withoutExtra)}</strong>
          </div>
          <div>
            <span>К оплате с учетом прочих услуг</span>
            <strong>{formatReceiptMoney(electricityReceiptTotals.withExtra)}</strong>
          </div>
          <div>
            <span>Добровольное страхование</span>
            <strong>{formatReceiptMoney(electricityReceiptTotals.insurance)}</strong>
          </div>
          <div>
            <span>Срок хранения</span>
            <strong>3 года</strong>
          </div>
        </div>

        <div className="water-charges">
          <h3>Сведения о помещении и доме</h3>
          <div className="property-list">
            {electricityPropertyRows.map((row) => (
              <div key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="water-charges">
          <h3>Справочная информация о приборах учета</h3>
          <div className="water-charges-table-wrap">
            <table className="water-charges-table meter-table">
              <thead>
                <tr>
                  <th>Услуга</th>
                  <th>Номер ПУ</th>
                  <th>Дата очередной поверки</th>
                  <th>Дата показаний</th>
                  <th>Предыдущие показания</th>
                  <th>Текущие показания</th>
                </tr>
              </thead>
              <tbody>
                {electricityMeterRows.map((row) => (
                  <tr key={row.service}>
                    <td>{row.service}</td>
                    <td>{row.meter}</td>
                    <td>{row.nextCheck}</td>
                    <td>{row.readingDate}</td>
                    <td>{row.previous}</td>
                    <td>{row.current}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="water-charges">
          <h3>Взаиморасчеты с организациями</h3>
          <div className="water-charges-table-wrap">
            <table className="water-charges-table settlement-table">
              <thead>
                <tr>
                  <th>Код</th>
                  <th>Организация</th>
                  <th>Расчетный период</th>
                  <th>Срок оплаты</th>
                  <th>Баланс на начало</th>
                  <th>Оплачено</th>
                  <th>Начислено</th>
                  <th>Перерасчет</th>
                  <th>Исходящий баланс</th>
                  <th>Сумма к оплате</th>
                </tr>
              </thead>
              <tbody>
                {electricitySettlementRows.map((row) => (
                  <tr key={row.code}>
                    <td>{row.code}</td>
                    <td>{row.organization}</td>
                    <td>{row.period}</td>
                    <td>{row.dueDate}</td>
                    <td>{formatReceiptValue(row.opening)}</td>
                    <td>{formatReceiptValue(row.paid)}</td>
                    <td>{formatReceiptValue(row.charged)}</td>
                    <td>{formatReceiptValue(row.recalc)}</td>
                    <td>{formatReceiptValue(row.closing)}</td>
                    <td>{formatReceiptValue(row.toPay)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={9}>К оплате по организациям</td>
                  <td>{formatReceiptMoney(settlementsTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="water-charges">
          <h3>Начисления за расчетный период по услугам и взносам</h3>
          <div className="water-charges-table-wrap">
            <table className="water-charges-table electricity-charge-table">
              <thead>
                <tr>
                  <th>Группа</th>
                  <th>Код</th>
                  <th>Вид услуги</th>
                  <th>Ед. изм.</th>
                  <th>Объем услуги</th>
                  <th>Осн.</th>
                  <th>Тариф</th>
                  <th>Превыш.</th>
                  <th>Начислено без льгот</th>
                  <th>Льгота</th>
                  <th>Начислено</th>
                </tr>
              </thead>
              <tbody>
                {electricityChargeRows.map((row) => (
                  <tr key={`${row.code}-${row.service}`}>
                    <td>{row.group}</td>
                    <td>{row.code}</td>
                    <td>{row.service}</td>
                    <td>{row.unit}</td>
                    <td>{row.volume}</td>
                    <td>{row.reason}</td>
                    <td>{formatReceiptValue(row.tariff)}</td>
                    <td>{row.excess}</td>
                    <td>{formatReceiptValue(row.withoutBenefit)}</td>
                    <td>{formatReceiptValue(row.benefit)}</td>
                    <td>{formatReceiptValue(row.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={10}>Итого начислено за период</td>
                  <td>{formatReceiptMoney(chargesTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="paper-receipt-grid">
          <article className="paper-receipt-box">
            <h3>Сведения о перерасчетах</h3>
            <dl>
              <div>
                <dt>Основание</dt>
                <dd>Перерасчеты, доначисления и уменьшения не указаны</dd>
              </div>
              <div>
                <dt>Сумма</dt>
                <dd>{formatReceiptMoney(0)}</dd>
              </div>
            </dl>
          </article>

          <article className="paper-receipt-box">
            <h3>Справочная информация</h3>
            <dl>
              <div>
                <dt>Текущие показания ОДПУ</dt>
                <dd>-</dd>
              </div>
              <div>
                <dt>Расход</dt>
                <dd>-</dd>
              </div>
              <div>
                <dt>Суммарный объем коммунальных ресурсов</dt>
                <dd>-</dd>
              </div>
            </dl>
          </article>
        </div>

        <div className="water-charges">
          <h3>Персонализированная информация об организациях</h3>
          <div className="water-charges-table-wrap">
            <table className="water-charges-table recipient-table">
              <thead>
                <tr>
                  <th>Код</th>
                  <th>Аб. № / ЛС</th>
                  <th>Организация / получатель платежа</th>
                  <th>Контактная информация</th>
                </tr>
              </thead>
              <tbody>
                {electricityRecipientRows.map((row) => (
                  <tr key={row.code}>
                    <td>{row.code}</td>
                    <td>{row.account}</td>
                    <td>{row.organization}</td>
                    <td>{row.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="water-charges">
          <h3>Добровольное страхование жилья</h3>
          <div className="insurance-row">
            <div>
              <span>Организация</span>
              <strong>АО "СОГАЗ"</strong>
            </div>
            <div>
              <span>Площадь</span>
              <strong>42,000 кв. м</strong>
            </div>
            <div>
              <span>Тариф</span>
              <strong>3,75 ₽ / кв. м</strong>
            </div>
            <div>
              <span>Страховой взнос</span>
              <strong>{formatReceiptMoney(electricityReceiptTotals.insurance)}</strong>
            </div>
            <div>
              <span>К оплате</span>
              <strong>{formatReceiptMoney(electricityReceiptTotals.insurance)}</strong>
            </div>
          </div>
          <p className="receipt-note">
            Услуга страхования добровольная. При оплате счета внимательно проверяйте назначение платежа.
          </p>
        </div>
      </div>
    </section>
  );
}

function GasReceiptDetails({ receipt, account }) {
  const gasTotal = sumRows(gasChargeRows, 'total');

  return (
    <section className="water-receipt-details gas-receipt-details">
      <div className="paper-receipt">
        <div className="paper-receipt-head">
          <div>
            <span className="paper-kicker">Квитанция</span>
            <h2>ООО "Газпром межрегионгаз Тверь"</h2>
            <p>Детализация газоснабжения: получатель платежа, лицевой счет, прибор учета, расход и сумма к оплате.</p>
          </div>
          <div className="paper-receipt-code">
            <QrCode size={82} />
            <span>Для оплаты газоснабжения</span>
          </div>
        </div>

        <div className="paper-receipt-grid">
          <article className="paper-receipt-box">
            <h3>Плательщик</h3>
            <dl>
              <div>
                <dt>ФИО</dt>
                <dd>{account?.ownerName ?? 'Иванов Иван Иванович'}</dd>
              </div>
              <div>
                <dt>Адрес</dt>
                <dd>{account?.address ?? '170000, г. Тверь, ул. Ленина, д.1'}</dd>
              </div>
              <div>
                <dt>Площадь</dt>
                <dd>40 м2</dd>
              </div>
              <div>
                <dt>Проживает</dt>
                <dd>3 чел.</dd>
              </div>
            </dl>
          </article>

          <article className="paper-receipt-box">
            <h3>Расчет</h3>
            <dl>
              <div>
                <dt>Период</dt>
                <dd>{receipt.period}</dd>
              </div>
              <div>
                <dt>К оплате до 10 числа</dt>
                <dd>{formatReceiptMoney(gasReceiptTotals.due)}</dd>
              </div>
              <div>
                <dt>Дата выпуска</dt>
                <dd>04.05.2022</dd>
              </div>
              <div>
                <dt>PIN-код ЛК</dt>
                <dd>QwertY</dd>
              </div>
            </dl>
          </article>
        </div>

        <div className="paper-receipt-summary">
          <div>
            <span>Расчетный период</span>
            <strong>Май 2022 г.</strong>
          </div>
          <div>
            <span>Лицевой счет</span>
            <strong>12345678</strong>
          </div>
          <div>
            <span>ЕЛС</span>
            <strong>100069000001</strong>
          </div>
          <div>
            <span>Сумма к оплате</span>
            <strong>{formatReceiptMoney(gasReceiptTotals.due)}</strong>
          </div>
        </div>

        <div className="water-charges">
          <h3>Получатель платежа</h3>
          <div className="water-charges-table-wrap">
            <table className="water-charges-table gas-payment-table">
              <thead>
                <tr>
                  <th>Получатель платежа</th>
                  <th>Лицевой счет (ЕЛС)</th>
                  <th>Сумма к оплате</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    ООО "Газпром межрегионгаз Тверь", р/с 40702810963020101565 в Тверское отделение № 8607
                    ПАО Сбербанк, БИК 042809679, ИНН 6905062685, КПП 775050001
                  </td>
                  <td>12345678<br />(100069000001)</td>
                  <td>{formatReceiptMoney(gasReceiptTotals.due)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="receipt-note">
            ЕЛС - единый лицевой счет для оплаты по Единому платежному документу. PIN-код для подключения
            расширенной версии личного кабинета: QwertY.
          </p>
        </div>

        <div className="water-charges">
          <h3>Показания приборов учета</h3>
          <div className="water-charges-table-wrap">
            <table className="water-charges-table gas-meter-table">
              <thead>
                <tr>
                  <th>Прибор учета газоснабжения</th>
                  <th>Дата очередной поверки</th>
                  <th>Дата последних показаний</th>
                  <th>Последние показания</th>
                  <th>Текущие показания</th>
                  <th>Расход</th>
                </tr>
              </thead>
              <tbody>
                {gasMeterRows.map((row) => (
                  <tr key={row.device}>
                    <td>{row.device}</td>
                    <td>{row.nextCheck}</td>
                    <td>{row.lastReadingDate}</td>
                    <td>{row.previous}</td>
                    <td>{row.current || '-'}</td>
                    <td>{row.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="receipt-note">Формула расчета расхода: поле 6 = поле 5 - поле 4.</p>
        </div>

        <div className="water-charges">
          <h3>Расшифровка счета по видам оказанных услуг</h3>
          <div className="water-charges-table-wrap">
            <table className="water-charges-table gas-charge-table">
              <thead>
                <tr>
                  <th>Группа</th>
                  <th>Виды услуг</th>
                  <th>Объем</th>
                  <th>Ед. изм.</th>
                  <th>Тариф</th>
                  <th>Долг / аванс</th>
                  <th>Начислено</th>
                  <th>Перерасчеты</th>
                  <th>Оплачено</th>
                  <th>Итого к оплате</th>
                </tr>
              </thead>
              <tbody>
                {gasChargeRows.map((row) => (
                  <tr key={row.service}>
                    <td>{row.group}</td>
                    <td>
                      <strong>{row.service}</strong>
                      <span>{row.detail}</span>
                    </td>
                    <td>{row.volume}</td>
                    <td>{row.unit}</td>
                    <td>{formatReceiptValue(row.tariff)}</td>
                    <td>{formatReceiptValue(row.debt)}</td>
                    <td>{formatReceiptValue(row.charged)}</td>
                    <td>{formatReceiptValue(row.recalculation)}</td>
                    <td>{formatReceiptValue(row.paid)}</td>
                    <td>{formatReceiptValue(row.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={9}>Итого</td>
                  <td>{formatReceiptMoney(gasTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="receipt-note">
            Формула расчета итоговой суммы к оплате: долг/аванс + начислено + перерасчеты - оплачено.
          </p>
        </div>

        <div className="water-charges">
          <h3>Сведения об исполнителе</h3>
          <div className="property-list">
            <div>
              <span>Наименование организации</span>
              <strong>ООО "Газпром межрегионгаз Тверь"</strong>
            </div>
            <div>
              <span>Реквизиты исполнителя</span>
              <strong>
                170001, г. Тверь, тер. Двор Пролетарки, д. 7, офис 106, тел. 8(4822)33-35-55,
                tutver@tverregiongaz.ru, www.tverregiongaz.ru
              </strong>
            </div>
          </div>
          <p className="receipt-note">
            Передать показания можно через личный кабинет "Мой ГАЗ", сайт ООО "Газпром межрегионгаз Тверь",
            по телефону 8(4822)333-555, СМС на +7-915-700-70-20, ГИС ЖКХ или при оплате счета-квитанции.
          </p>
        </div>
      </div>
    </section>
  );
}

export function PaymentPage() {
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const { receipts, payReceipt } = useOutletContext();
  const unpaidReceipts = receipts.filter((item) => item.status === 'unpaid');
  const [selectedId, setSelectedId] = useState(receiptId ?? unpaidReceipts[0]?.id ?? '');
  const [method, setMethod] = useState('МИР');

  const selected = receipts.find((item) => item.id === selectedId);

  const submitPayment = () => {
    if (!selected || selected.status !== 'unpaid') {
      return;
    }

    payReceipt(selected.id, method);
    navigate('/app/receipts');
  };

  return (
    <>
      <PageTitle eyebrow="Оплата" title="Имитация платежа">
        Демо-оплата меняет статус квитанции и обновляет историю в приложении.
      </PageTitle>

      {unpaidReceipts.length === 0 ? (
        <div className="empty-state wide">
          <BadgeCheck size={30} />
          <strong>Нет неоплаченных квитанций</strong>
          <Link to="/app/receipts" className="ghost-link">Открыть список</Link>
        </div>
      ) : (
        <section className="payment-layout">
          <div className="payment-panel">
            <label>
              Квитанция
              <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                {unpaidReceipts.map((receipt) => (
                  <option key={receipt.id} value={receipt.id}>
                    {receipt.period} - {getServiceName(receipt.service)} - {formatMoney(receipt.amount)}
                  </option>
                ))}
              </select>
            </label>

            {selected && (
              <div className="payment-summary">
                <ServiceBadge service={selected.service} />
                <strong>{formatMoney(selected.amount)}</strong>
                <span>Период: {selected.period}</span>
              </div>
            )}
          </div>

          <div className="payment-panel">
            <h2>Способ оплаты</h2>
            <div className="payment-methods">
              <button
                className={method === 'МИР' ? 'selected' : ''}
                type="button"
                onClick={() => setMethod('МИР')}
              >
                <CreditCard size={24} />
                <strong>МИР</strong>
                <span>карта</span>
              </button>
              <button
                className={method === 'СБП' ? 'selected' : ''}
                type="button"
                onClick={() => setMethod('СБП')}
              >
                <QrCode size={24} />
                <strong>СБП</strong>
                <span>QR / банк</span>
              </button>
            </div>
            <button className="wide-button" type="button" onClick={submitPayment}>
              <Banknote size={18} />
              Подтвердить оплату
            </button>
          </div>
        </section>
      )}
    </>
  );
}

export function ProfilePage() {
  const { user, account, updateProfile } = useOutletContext();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
  });
  const [saved, setSaved] = useState(false);

  const update = (field, value) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    updateProfile(form);
    setSaved(true);
  };

  return (
    <>
      <PageTitle eyebrow="Аккаунт" title="Данные аккаунта">
        Лицевой счет {account?.number}
      </PageTitle>

      <form className="profile-form" onSubmit={submit}>
        <label>
          ФИО
          <input value={form.name} onChange={(event) => update('name', event.target.value)} />
        </label>
        <label>
          Почта
          <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} />
        </label>
        <label>
          Телефон
          <input value={form.phone} onChange={(event) => update('phone', event.target.value)} />
        </label>
        <button type="submit" className="wide-button">
          <Pencil size={18} />
          Сохранить
        </button>
        {saved && <div className="inline-success">Данные обновлены</div>}
      </form>
    </>
  );
}
