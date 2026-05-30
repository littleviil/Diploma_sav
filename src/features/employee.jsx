import React, { useState } from 'react';
import { Link, NavLink, Outlet, useOutletContext } from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  Building2,
  CheckCircle2,
  CreditCard,
  Database,
  Download,
  FileText,
  FileSpreadsheet,
  House,
  LayoutDashboard,
  MessageSquare,
  ReceiptText,
  Settings,
} from 'lucide-react';
import { defaultCompanyProfile } from '../config.js';
import {
  buildReceiptSummary,
  formatMoney,
  getLastYearPeriodOptions,
  getOrganizations,
  getReceiptPeriodKey,
  getReportServices,
} from '../utils.js';
import { PageTitle, ServiceBadge, StatCard, WorkspaceTopbar } from '../components/shared.jsx';

const dispatcherStatusOptions = ['Новое', 'В работе', 'Выполнено'];

const dispatcherTypeOptions = [
  'Ошибка в квитанции',
  'Детализация счета',
  'Не отображается оплата',
  'Передача показаний',
  'Перерасчет начислений',
  'Вопрос по сроку оплаты',
  'Качество услуги',
  'Другой вопрос',
];

const initialDispatcherTickets = [
  {
    id: 'ticket-1',
    topic: 'Не отображается оплата за водоснабжение',
    type: 'Не отображается оплата',
    service: 'water',
    period: 'Май 2026',
    amount: 4523.67,
    dueDate: '10.06.2026',
    account: '407900000001',
    resident: 'Ирина Волкова',
    status: 'Новое',
    priority: 'Высокий',
    message: 'Оплата прошла через СБП вчера вечером, но в кабинете квитанция до сих пор отмечена как неоплаченная.',
    answer: '',
    answered: false,
  },
  {
    id: 'ticket-2',
    topic: 'Нужна детализация начисления по электроснабжению',
    type: 'Детализация счета',
    service: 'electricity',
    period: 'Май 2026',
    amount: 1367.4,
    dueDate: '10.06.2026',
    account: '407900000002',
    resident: 'Демо-абонент',
    status: 'В работе',
    priority: 'Средний',
    message: 'Пользователь просит объяснить разницу между дневным и ночным тарифом за последний период.',
    answer: 'Проверяем начисления по прибору учета и тарифным зонам.',
    answered: true,
  },
  {
    id: 'ticket-3',
    topic: 'Ошибка в периоде квитанции',
    type: 'Ошибка в квитанции',
    service: 'water',
    period: 'Апрель 2026',
    amount: 1580,
    dueDate: '10.05.2026',
    account: '407900000001',
    resident: 'Ирина Волкова',
    status: 'Выполнено',
    priority: 'Обычный',
    message: 'В истории платежей отображался март вместо апреля.',
    answer: 'Период исправлен, квитанция отображается корректно.',
    answered: true,
  },
  {
    id: 'ticket-4',
    topic: 'Не принимаются показания счетчика газоснабжения',
    type: 'Передача показаний',
    service: 'gas',
    period: 'Май 2026',
    amount: 1190.64,
    dueDate: '10.06.2026',
    account: '407900000001',
    resident: 'Ирина Волкова',
    status: 'Новое',
    priority: 'Средний',
    message: 'Показания выше предыдущих, но форма пишет, что данные некорректны.',
    answer: '',
    answered: false,
  },
  {
    id: 'ticket-5',
    topic: 'Запрос перерасчета начислений за водоснабжение',
    type: 'Перерасчет начислений',
    service: 'water',
    period: 'Май 2026',
    amount: 4523.67,
    dueDate: '10.06.2026',
    account: '407900000001',
    resident: 'Ирина Волкова',
    status: 'В работе',
    priority: 'Высокий',
    message: 'Пользователь считает, что расход горячей воды рассчитан по неверному объему.',
    answer: 'Запрошены контрольные показания и история начислений за предыдущий месяц.',
    answered: true,
  },
  {
    id: 'ticket-6',
    topic: 'Уточнение срока оплаты квитанции',
    type: 'Вопрос по сроку оплаты',
    service: 'electricity',
    period: 'Май 2026',
    amount: 1367.4,
    dueDate: '10.06.2026',
    account: '407900000002',
    resident: 'Демо-абонент',
    status: 'Новое',
    priority: 'Обычный',
    message: 'Нужно уточнить, до какого числа можно оплатить без начисления пени.',
    answer: '',
    answered: false,
  },
  {
    id: 'ticket-7',
    topic: 'Жалоба на качество водоснабжения',
    type: 'Качество услуги',
    service: 'water',
    period: 'Май 2026',
    amount: 4523.67,
    dueDate: '10.06.2026',
    account: '407900000001',
    resident: 'Ирина Волкова',
    status: 'В работе',
    priority: 'Высокий',
    message: 'Пользователь сообщает о слабом напоре и просит проверить начисления за период.',
    answer: 'Заявка передана в техническую службу, начисления будут сверены после проверки.',
    answered: true,
  },
  {
    id: 'ticket-8',
    topic: 'Нужна справка по истории оплат',
    type: 'Другой вопрос',
    service: 'gas',
    period: 'Апрель 2026',
    amount: 980,
    dueDate: '10.05.2026',
    account: '407900000001',
    resident: 'Ирина Волкова',
    status: 'Выполнено',
    priority: 'Обычный',
    message: 'Пользователь просит подсказать, где увидеть оплаты за последние месяцы.',
    answer: 'Историю оплат можно открыть в кабинете плательщика через кнопку "Посмотреть историю платежей".',
    answered: true,
  },
];

const getTicketStatusTone = (status) => {
  if (status === 'Новое') {
    return 'warning';
  }

  if (status === 'Выполнено') {
    return 'success';
  }

  return '';
};

const receiptStatusText = {
  paid: 'Оплачено',
  unpaid: 'Не оплачено',
};

const getAccount = (store, accountId) => store.accounts.find((account) => account.id === accountId);

const getUniquePeriods = (receipts) => [...new Set(receipts.map((receipt) => receipt.period))];

const filterReceipts = (receipts, { period = 'all', service = 'all', status = 'all' } = {}) =>
  receipts.filter((receipt) => {
    const matchesPeriod = period === 'all' || receipt.period === period;
    const matchesService = service === 'all' || receipt.service === service;
    const matchesStatus = status === 'all' || receipt.status === status;

    return matchesPeriod && matchesService && matchesStatus;
  });

const getReceiptRows = (store, filters) =>
  filterReceipts(store.receipts, filters).map((receipt) => {
    const account = getAccount(store, receipt.accountId);

    return {
      ...receipt,
      accountNumber: account?.number ?? receipt.accountId,
      ownerName: account?.ownerName ?? 'Не указан',
      address: account?.address ?? 'Не указан',
    };
  });

const getPaymentRows = (store) =>
  store.payments.map((payment) => {
    const receipt = store.receipts.find((item) => item.id === payment.receiptId);
    const account = receipt ? getAccount(store, receipt.accountId) : null;

    return {
      ...payment,
      period: receipt?.period ?? 'Не указан',
      service: receipt?.service ?? 'unknown',
      accountNumber: account?.number ?? receipt?.accountId ?? 'Не указан',
      ownerName: account?.ownerName ?? 'Не указан',
      address: account?.address ?? 'Не указан',
    };
  });

const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

const toCsv = (headers, rows) => {
  const headerLine = headers.map((header) => csvCell(header.label)).join(';');
  const rowLines = rows.map((row) => headers.map((header) => csvCell(header.value(row))).join(';'));
  return `\uFEFF${[headerLine, ...rowLines].join('\n')}`;
};

const downloadFile = (filename, content, type = 'text/csv;charset=utf-8') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const receiptExportHeaders = [
  { label: 'ID квитанции', value: (row) => row.id },
  { label: 'Период', value: (row) => row.period },
  { label: 'Услуга', value: (row) => row.service },
  { label: 'Лицевой счет', value: (row) => row.accountNumber },
  { label: 'Плательщик', value: (row) => row.ownerName },
  { label: 'Адрес', value: (row) => row.address },
  { label: 'Сумма', value: (row) => row.amount },
  { label: 'Статус', value: (row) => receiptStatusText[row.status] ?? row.status },
  { label: 'Срок оплаты', value: (row) => row.dueDate },
  { label: 'Дата оплаты', value: (row) => row.paidAt },
  { label: 'Способ оплаты', value: (row) => row.method },
];

const paymentExportHeaders = [
  { label: 'ID платежа', value: (row) => row.id },
  { label: 'ID квитанции', value: (row) => row.receiptId },
  { label: 'Период', value: (row) => row.period },
  { label: 'Услуга', value: (row) => row.service },
  { label: 'Лицевой счет', value: (row) => row.accountNumber },
  { label: 'Плательщик', value: (row) => row.ownerName },
  { label: 'Дата оплаты', value: (row) => row.paidAt },
  { label: 'Способ оплаты', value: (row) => row.method },
  { label: 'Сумма', value: (row) => row.amount },
];

const buildRevenueRows = (store) =>
  getLastYearPeriodOptions().map((period) => {
    const receipts = store.receipts.filter((receipt) => getReceiptPeriodKey(receipt.period) === period.key);
    const paid = receipts.filter((receipt) => receipt.status === 'paid');
    const unpaid = receipts.filter((receipt) => receipt.status === 'unpaid');

    return {
      period: period.label,
      accrued: receipts.reduce((sum, receipt) => sum + receipt.amount, 0),
      paid: paid.reduce((sum, receipt) => sum + receipt.amount, 0),
      debt: unpaid.reduce((sum, receipt) => sum + receipt.amount, 0),
      receiptCount: receipts.length,
    };
  });

const buildReconciliationText = (store) => {
  const paid = store.receipts.filter((receipt) => receipt.status === 'paid');
  const unpaid = store.receipts.filter((receipt) => receipt.status === 'unpaid');
  const paidAmount = paid.reduce((sum, receipt) => sum + receipt.amount, 0);
  const unpaidAmount = unpaid.reduce((sum, receipt) => sum + receipt.amount, 0);

  return [
    'Акт сверки оплат ЖКУ',
    `Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`,
    '',
    `Оплачено квитанций: ${paid.length}`,
    `Сумма оплат: ${formatMoney(paidAmount)}`,
    `Неоплачено квитанций: ${unpaid.length}`,
    `Задолженность: ${formatMoney(unpaidAmount)}`,
    '',
    'Документ сформирован автоматически в демонстрационной системе.',
  ].join('\n');
};


const CSS_REPORT = `
body{font-family:Arial,sans-serif;font-size:12px;color:#111;margin:24px}
table{width:100%;border-collapse:collapse;margin:8px 0}
th{background:#f0f4f8;padding:6px 8px;text-align:left;border:1px solid #ccc;font-size:11px}
td{padding:4px 8px;border:1px solid #ddd;vertical-align:top}
h1{font-size:16px;margin:0 0 2px}
h2{font-size:14px;text-transform:uppercase;letter-spacing:0.3px;margin:0}
h3{font-size:12px;margin:14px 0 4px;border-bottom:1px solid #ddd;padding-bottom:3px}
.hdr{text-align:center;border-bottom:2px solid #333;margin-bottom:14px;padding-bottom:10px}
.hdr p{font-size:10px;color:#555;margin:2px 0}
.ttl{text-align:center;margin-bottom:14px}
.ttl p{font-size:10px;color:#666;margin:2px 0}
.sum td:first-child{font-weight:600;width:55%}
.ftr{border-top:1px solid #ddd;margin-top:20px;padding-top:8px;text-align:center;font-size:9px;color:#aaa}
.sign{display:flex;justify-content:space-between;margin-top:32px}
.sign-f{border-top:1px solid #333;padding-top:4px;width:40%;text-align:center;font-size:10px;color:#555}
`;

const buildHTMLReport = (title, org, date, summaryRows, tables, signerName = '') => `
<div class="hdr"><h1>${org.legalShortName}</h1>
<p>ИНН ${org.taxId} &nbsp;·&nbsp; Лицензия ${org.licenseNumber}</p>
<p>${org.legalAddress}</p></div>
<div class="ttl"><h2>${title}</h2><p>Дата формирования: ${date}</p></div>
${summaryRows.length ? `<h3>Итоговая сводка</h3><table class="sum"><tbody>${summaryRows.map(([l, v]) => `<tr><td>${l}</td><td>${v}</td></tr>`).join('')}</tbody></table>` : ''}
${tables.map(({ title: t, cols, rows }) => `<h3>${t}</h3><table><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c ?? '—'}</td>`).join('')}</tr>`).join('')}</tbody></table>`).join('')}
<div class="sign"><div class="sign-f">${signerName || '________________'}<br>Подпись / ФИО</div><div class="sign-f">________________<br>М.П.</div></div>
<div class="ftr">ЖКУ Контроль · ${org.legalShortName} · ${date}</div>`;

const exportToPDF = (title, htmlBody) => {
  const win = window.open('', '_blank', 'width=860,height=720');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${CSS_REPORT}@page{margin:15mm}@media print{body{margin:0}}</style></head><body>${htmlBody}</body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 400);
};

const exportToWord = (title, htmlBody, filename) => {
  const content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${title}</title><style>${CSS_REPORT}</style></head><body>${htmlBody}</body></html>`;
  downloadFile(`${filename}.doc`, content, 'application/msword');
};

const svcLabel = { water: 'Водоснабжение', gas: 'Газоснабжение', electricity: 'Электроснабжение' };

const buildAccrualsHTML = (store, org, user) => {
  const rows = getReceiptRows(store, {});
  const paid = rows.filter((r) => r.status === 'paid');
  const unpaid = rows.filter((r) => r.status === 'unpaid');
  const date = new Date().toLocaleDateString('ru-RU');
  return buildHTMLReport('Реестр начислений', org, date, [
    ['Всего квитанций', rows.length],
    ['Оплачено', `${paid.length} шт. · ${formatMoney(paid.reduce((s, r) => s + r.amount, 0))}`],
    ['Не оплачено', `${unpaid.length} шт. · ${formatMoney(unpaid.reduce((s, r) => s + r.amount, 0))}`],
    ['Итого начислено', formatMoney(rows.reduce((s, r) => s + r.amount, 0))],
  ], [{
    title: 'Квитанции',
    cols: ['Период', 'Услуга', 'Лицевой счет', 'Плательщик', 'Сумма', 'Статус', 'Срок оплаты'],
    rows: rows.map((r) => [r.period, svcLabel[r.service] ?? r.service, r.accountNumber, r.ownerName, formatMoney(r.amount), receiptStatusText[r.status], r.dueDate]),
  }], user?.name);
};

const buildPaymentsHTML = (store, org, user) => {
  const payments = getPaymentRows(store);
  const date = new Date().toLocaleDateString('ru-RU');
  return buildHTMLReport('Реестр оплат', org, date, [
    ['Всего платежей', payments.length],
    ['Общая сумма поступлений', formatMoney(payments.reduce((s, p) => s + p.amount, 0))],
    ['Оплат через МИР', payments.filter((p) => p.method === 'МИР').length],
    ['Оплат через СБП', payments.filter((p) => p.method === 'СБП').length],
  ], [{
    title: 'Платежи',
    cols: ['Дата оплаты', 'Период', 'Услуга', 'Лицевой счет', 'Плательщик', 'Способ', 'Сумма'],
    rows: payments.map((p) => [p.paidAt, p.period, svcLabel[p.service] ?? p.service, p.accountNumber, p.ownerName, p.method, formatMoney(p.amount)]),
  }], user?.name);
};

const buildDebtorsHTML = (store, org, user) => {
  const rows = getReceiptRows(store, { status: 'unpaid' });
  const date = new Date().toLocaleDateString('ru-RU');
  return buildHTMLReport('Реестр должников', org, date, [
    ['Кол-во неоплаченных квитанций', rows.length],
    ['Общая задолженность', formatMoney(rows.reduce((s, r) => s + r.amount, 0))],
    ['Уникальных лицевых счетов', new Set(rows.map((r) => r.accountNumber)).size],
  ], [{
    title: 'Неоплаченные квитанции',
    cols: ['Плательщик', 'Лицевой счет', 'Адрес', 'Услуга', 'Период', 'Сумма', 'Срок оплаты'],
    rows: rows.map((r) => [r.ownerName, r.accountNumber, r.address, svcLabel[r.service] ?? r.service, r.period, formatMoney(r.amount), r.dueDate]),
  }], user?.name);
};

const buildReconciliationHTML = (store, org, user) => {
  const date = new Date().toLocaleDateString('ru-RU');
  const paid = store.receipts.filter((r) => r.status === 'paid');
  const unpaid = store.receipts.filter((r) => r.status === 'unpaid');
  const byService = getReportServices().map(([code, meta]) => {
    const paidAmt = paid.filter((r) => r.service === code).reduce((s, r) => s + r.amount, 0);
    const unpaidAmt = unpaid.filter((r) => r.service === code).reduce((s, r) => s + r.amount, 0);
    return [meta.name, formatMoney(paidAmt + unpaidAmt), formatMoney(paidAmt), formatMoney(unpaidAmt)];
  });
  return buildHTMLReport('Акт сверки оплат', org, date, [
    ['Оплачено квитанций', `${paid.length} шт. · ${formatMoney(paid.reduce((s, r) => s + r.amount, 0))}`],
    ['Задолженность', `${unpaid.length} шт. · ${formatMoney(unpaid.reduce((s, r) => s + r.amount, 0))}`],
    ['Итого начислено', formatMoney(store.receipts.reduce((s, r) => s + r.amount, 0))],
    ['Коэффициент собираемости', `${Math.round((paid.length / Math.max(store.receipts.length, 1)) * 100)} %`],
  ], [{
    title: 'По услугам',
    cols: ['Услуга', 'Начислено', 'Оплачено', 'Задолженность'],
    rows: byService,
  }], user?.name);
};

const buildRevenueHTML = (store, org, user) => {
  const date = new Date().toLocaleDateString('ru-RU');
  const rows = buildRevenueRows(store).filter((r) => r.accrued > 0);
  return buildHTMLReport('Отчет по выручке', org, date, [
    ['Всего за период', formatMoney(rows.reduce((s, r) => s + r.accrued, 0))],
    ['Оплачено', formatMoney(rows.reduce((s, r) => s + r.paid, 0))],
    ['Задолженность', formatMoney(rows.reduce((s, r) => s + r.debt, 0))],
  ], [{
    title: 'По месяцам',
    cols: ['Период', 'Начислено', 'Оплачено', 'Задолженность', 'Квитанций'],
    rows: rows.map((r) => [r.period, formatMoney(r.accrued), formatMoney(r.paid), formatMoney(r.debt), r.receiptCount]),
  }], user?.name);
};

export function EmployeeLayout({ user, store, logout, updateProfile, theme, setTheme }) {
  const summary = buildReceiptSummary(store.receipts);
  const employeeRole = user.employeeRole ?? (user.email.includes('accountant') ? 'Бухгалтер' : 'Диспетчер');
  const isAccountant = employeeRole === 'Бухгалтер';
  const organizations = getOrganizations(store);
  const organization = organizations[0] ?? defaultCompanyProfile;
  const companyStats = {
    houses: organization.houses.length,
    units: organization.houses.reduce((s, h) => s + h.units, 0),
    accounts: organization.houses.reduce((s, h) => s + h.accounts, 0),
    meters: organization.houses.reduce((s, h) => s + h.meters, 0),
    debtors: organization.houses.reduce((s, h) => s + h.debtors, 0),
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand-link side-brand">
          <span className="brand-mark">
            <Building2 size={22} />
          </span>
          <span>
            <strong>ЖКУ Контроль</strong>
            <small>{user.employeeRole ?? 'Диспетчер'}</small>
          </span>
        </Link>

        <nav className="side-nav">
          <NavLink end to="/employee">
            <LayoutDashboard size={18} />
            Главное
          </NavLink>
          {isAccountant ? (
            <>
              <NavLink to="/employee/accruals">
                <ReceiptText size={18} />
                Начисления
              </NavLink>
              <NavLink to="/employee/payments">
                <CreditCard size={18} />
                Оплаты и долги
              </NavLink>
              <NavLink to="/employee/statistics">
                <BarChart3 size={18} />
                Статистика
              </NavLink>
              <NavLink to="/employee/objects">
                <House size={18} />
                Объекты
              </NavLink>
              <NavLink to="/employee/documents">
                <FileSpreadsheet size={18} />
                Документы
              </NavLink>
              <NavLink to="/employee/reports">
                <FileText size={18} />
                Отчеты
              </NavLink>
            </>
          ) : (
            <NavLink to="/employee/requests">
              <MessageSquare size={18} />
              Заявки
            </NavLink>
          )}
          <NavLink to="/employee/settings">
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
          settingsTo="/employee/settings"
        />
        <Outlet context={{ user, store, summary, organization, companyStats, updateProfile, theme, setTheme }} />
      </main>
    </div>
  );
}

export function EmployeeDashboard() {
  const { user, store, summary } = useOutletContext();
  const employeeRole = user.employeeRole ?? (user.email.includes('accountant') ? 'Бухгалтер' : 'Диспетчер');

  if (employeeRole === 'Бухгалтер') {
    return <AccountantDashboard user={user} store={store} summary={summary} />;
  }

  return <DispatcherDashboard user={user} store={store} summary={summary} />;
}

export function DispatcherDashboard({ user, store, summary }) {
  const tickets = initialDispatcherTickets;
  const disputedReceipts = store.receipts
    .filter((receipt) => receipt.status === 'unpaid')
    .slice(0, 5)
    .map((receipt) => ({
      ...receipt,
      accountNumber: store.accounts.find((account) => account.id === receipt.accountId)?.number ?? receipt.accountId,
    }));

  return (
    <>
      <PageTitle title="Кабинет диспетчера">
        Обращения жителей по квитанциям, оплатам, начислениям и спорным периодам.
      </PageTitle>

      <section className="stats-grid">
        <StatCard icon={MessageSquare} label="Новых заявок" value={tickets.filter((item) => item.status === 'Новое').length} />
        <StatCard icon={AlertCircle} label="Спорных квитанций" value={disputedReceipts.length} tone="danger" />
        <StatCard icon={ReceiptText} label="Не оплачено" value={summary.unpaidCount} />
      </section>

      <section className="employee-grid">
        <div className="work-panel">
          <h2>Очередь обращений</h2>
          <div className="ticket-list">
            {tickets.map((ticket) => (
              <article className="ticket-card" key={ticket.id}>
                <div>
                  <strong>{ticket.topic}</strong>
                  <span>{ticket.resident}, лицевой счет {ticket.account}</span>
                </div>
                <span className={`status-chip ${getTicketStatusTone(ticket.status)}`}>
                  {ticket.status}
                </span>
                <small>{ticket.priority}</small>
              </article>
            ))}
          </div>
        </div>

        <div className="work-panel">
          <h2>Квитанции с вопросами</h2>
          <div className="service-table">
            {disputedReceipts.map((receipt) => (
              <div key={receipt.id}>
                <ServiceBadge service={receipt.service} />
                <span>{receipt.period}</span>
                <strong>{receipt.accountNumber}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="module-grid">
        {[
          { icon: ReceiptText, title: 'Проверить квитанцию', text: 'Открыть период, услугу, сумму и историю статусов.' },
          { icon: MessageSquare, title: 'Ответить жителю', text: 'Подготовить комментарий по начислению или оплате.' },
          { icon: Database, title: 'Передать на сверку', text: 'Отправить спорную запись бухгалтерии или администратору.' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="module-card" key={item.title}>
              <Icon size={24} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          );
        })}
      </section>
    </>
  );
}

export function EmployeeRequestsPage() {
  const { user } = useOutletContext();
  const [tickets, setTickets] = useState(initialDispatcherTickets);
  const [typeFilter, setTypeFilter] = useState('Все типы');
  const [statusFilter, setStatusFilter] = useState('Все статусы');
  const [selectedTicketId, setSelectedTicketId] = useState(initialDispatcherTickets[0]?.id ?? null);
  const employeeRole = user.employeeRole ?? (user.email.includes('accountant') ? 'Бухгалтер' : 'Диспетчер');
  const filteredTickets = tickets.filter((ticket) => {
    const matchesType = typeFilter === 'Все типы' || ticket.type === typeFilter;
    const matchesStatus = statusFilter === 'Все статусы' || ticket.status === statusFilter;

    return matchesType && matchesStatus;
  });
  const selectedTicket =
    filteredTickets.find((ticket) => ticket.id === selectedTicketId) ??
    filteredTickets[0] ??
    null;

  const updateTicketStatus = (ticketId, status) => {
    setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? { ...ticket, status } : ticket)));
  };
  const updateTicketAnswer = (ticketId, answer) => {
    setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? { ...ticket, answer, answered: false } : ticket)));
  };
  const saveTicketAnswer = (ticketId) => {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, answered: ticket.answer.trim().length > 0 } : ticket,
      ),
    );
  };

  if (employeeRole === 'Бухгалтер') {
    return (
      <PageTitle title="Заявки пользователей">
        Этот раздел доступен диспетчеру. Для бухгалтера заявки скрыты.
      </PageTitle>
    );
  }

  return (
    <>
      <PageTitle title="Заявки пользователей">
        Ответы пользователям и смена статуса заявки: Новое, В работе или Выполнено.
      </PageTitle>

      <section className="stats-grid">
        <StatCard icon={MessageSquare} label="Новое" value={tickets.filter((item) => item.status === 'Новое').length} />
        <StatCard icon={AlertCircle} label="В работе" value={tickets.filter((item) => item.status === 'В работе').length} />
        <StatCard icon={CheckCircle2} label="Выполнено" value={tickets.filter((item) => item.status === 'Выполнено').length} tone="success" />
      </section>

      <section className="request-workspace">
        <div className="work-panel request-list-panel">
          <div className="request-list-headline">
            <h2>Общий список заявок</h2>
            <span>{filteredTickets.length} из {tickets.length}</span>
          </div>
          <div className="request-filters">
            <label>
              Тип заявки
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option>Все типы</option>
                {dispatcherTypeOptions.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Статус
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>Все статусы</option>
                {dispatcherStatusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="request-list">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <button
                  className={`request-list-item ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                >
                  <span className="request-list-item-head">
                    <strong>{ticket.topic}</strong>
                    <span className={`status-chip ${getTicketStatusTone(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </span>
                  <span>{ticket.type}</span>
                  <small>{ticket.resident} · {ticket.period} · лицевой счет {ticket.account}</small>
                </button>
              ))
            ) : (
              <div className="empty-state">По выбранным фильтрам заявок нет.</div>
            )}
          </div>
        </div>

        <aside className="work-panel request-detail-panel">
          {selectedTicket ? (
            <>
              <div className="request-detail-head">
                <span className="section-kicker">{selectedTicket.type}</span>
                <h2>{selectedTicket.topic}</h2>
                <span className={`status-chip ${getTicketStatusTone(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
              </div>

              <div className="request-detail-meta">
                <div>
                  <span>Плательщик</span>
                  <strong>{selectedTicket.resident}</strong>
                </div>
                <div>
                  <span>Лицевой счет</span>
                  <strong>{selectedTicket.account}</strong>
                </div>
                <div>
                  <span>Услуга</span>
                  <ServiceBadge service={selectedTicket.service} />
                </div>
                <div>
                  <span>Период</span>
                  <strong>{selectedTicket.period}</strong>
                </div>
                <div>
                  <span>Сумма квитанции</span>
                  <strong>{formatMoney(selectedTicket.amount)}</strong>
                </div>
                <div>
                  <span>Срок оплаты</span>
                  <strong>{selectedTicket.dueDate}</strong>
                </div>
              </div>

              <div className="request-message-box">
                <span>Сообщение пользователя</span>
                <p>{selectedTicket.message}</p>
              </div>

              <label>
                Ответ диспетчера
                <textarea
                  value={selectedTicket.answer}
                  onChange={(event) => updateTicketAnswer(selectedTicket.id, event.target.value)}
                  placeholder="Напишите ответ пользователю"
                />
              </label>

              <div className="ticket-controls request-detail-actions">
                <label>
                  Статус заявки
                  <select value={selectedTicket.status} onChange={(event) => updateTicketStatus(selectedTicket.id, event.target.value)}>
                    {dispatcherStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="primary-link" type="button" onClick={() => saveTicketAnswer(selectedTicket.id)}>
                  Ответить
                </button>
              </div>

              {selectedTicket.answered && <div className="inline-success">Ответ сохранен для пользователя.</div>}
            </>
          ) : (
            <div className="empty-state">Выберите заявку из списка слева.</div>
          )}
        </aside>
      </section>
    </>
  );
}

export function AccountantDashboard({ user, store, summary }) {
  const org = getOrganizations(store)[0] ?? defaultCompanyProfile;
  const byService = getReportServices().map(([code, meta]) => {
    const serviceReceipts = store.receipts.filter((item) => item.service === code);
    return {
      code,
      name: meta.name,
      unpaid: serviceReceipts.filter((item) => item.status === 'unpaid').length,
      amount: serviceReceipts.reduce((sum, item) => sum + item.amount, 0),
    };
  });
  const paidReceipts = store.receipts.filter((receipt) => receipt.status === 'paid');
  const monthlyRevenue = getLastYearPeriodOptions()
    .slice(-6)
    .map((period) => {
      const amount = paidReceipts
        .filter((receipt) => getReceiptPeriodKey(receipt.period) === period.key)
        .reduce((sum, receipt) => sum + receipt.amount, 0);

      return { ...period, amount };
    });

  return (
    <>
      <PageTitle title="Кабинет бухгалтера">
        Документы, выгрузки, выручка, задолженность и сверка денежных показателей.
      </PageTitle>

      <section className="stats-grid">
        <StatCard icon={CheckCircle2} label="Выручка" value={formatMoney(summary.paidAmount)} tone="success" />
        <StatCard icon={AlertCircle} label="Дебиторка" value={formatMoney(summary.unpaidAmount)} tone="danger" />
        <StatCard icon={FileSpreadsheet} label="Платежей" value={store.payments.length} />
      </section>

      <section className="employee-grid">
        <div className="work-panel">
          <h2>Денежная сводка</h2>
          <dl className="detail-list compact">
            <div>
              <dt>Оплаченных квитанций</dt>
              <dd>{summary.paidCount}</dd>
            </div>
            <div>
              <dt>Неоплаченных квитанций</dt>
              <dd>{summary.unpaidCount}</dd>
            </div>
            <div>
              <dt>Сотрудник</dt>
              <dd>{user.name}</dd>
            </div>
          </dl>
        </div>

        <div className="work-panel">
          <h2>По услугам</h2>
          <div className="service-table">
            {byService.map((item) => (
              <div key={item.code}>
                <ServiceBadge service={item.code} />
                <span>{formatMoney(item.amount)}</span>
                <strong>{item.unpaid} долг.</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="employee-grid">
        <div className="work-panel">
          <h2>Выручка за последние месяцы</h2>
          <div className="finance-list">
            {monthlyRevenue.map((item) => (
              <div key={item.key}>
                <span>{item.label}</span>
                <strong>{formatMoney(item.amount)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="work-panel">
          <h2>Ключевые документы</h2>
          <div className="export-doc-list">
            {[
              {
                id: 'reconciliation', icon: FileText, title: 'Акт сверки оплат',
                desc: 'Итог: начислено, оплачено, задолженность',
                pdf: () => exportToPDF('Акт сверки оплат', buildReconciliationHTML(store, org, user)),
                word: () => exportToWord('Акт сверки оплат', buildReconciliationHTML(store, org, user), 'akt-sverki'),
              },
              {
                id: 'revenue', icon: FileSpreadsheet, title: 'Отчет по выручке',
                desc: 'Помесячно за последний год',
                pdf: () => exportToPDF('Отчет по выручке', buildRevenueHTML(store, org, user)),
                word: () => exportToWord('Отчет по выручке', buildRevenueHTML(store, org, user), 'otchet-po-vyruchke'),
              },
              {
                id: 'debtors', icon: AlertCircle, title: 'Реестр должников',
                desc: 'Неоплаченные квитанции',
                pdf: () => exportToPDF('Реестр должников', buildDebtorsHTML(store, org, user)),
                word: () => exportToWord('Реестр должников', buildDebtorsHTML(store, org, user), 'reestr-dolzhnikov'),
              },
            ].map((doc) => {
              const Icon = doc.icon;
              return (
                <article className="export-doc-card" key={doc.id}>
                  <div className="export-doc-info">
                    <Icon size={20} />
                    <div>
                      <strong>{doc.title}</strong>
                      <small>{doc.desc}</small>
                    </div>
                  </div>
                  <div className="export-doc-btns">
                    <button type="button" className="export-fmt-btn pdf" onClick={doc.pdf}>
                      <FileText size={13} /> PDF
                    </button>
                    <button type="button" className="export-fmt-btn word" onClick={doc.word}>
                      <FileSpreadsheet size={13} /> Word
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="module-grid">
        {[
          { icon: ReceiptText, title: 'Начисления', text: 'Квитанции по периодам, услугам и статусам.', to: '/employee/accruals' },
          { icon: CreditCard, title: 'Оплаты и долги', text: 'Реестр оплат, должники и сверка поступлений.', to: '/employee/payments' },
          { icon: FileSpreadsheet, title: 'Документы', text: 'Скачивание реестров, отчетов и выгрузок.', to: '/employee/documents' },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Link className="module-card" key={item.title} to={item.to}>
              <Icon size={24} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Link>
          );
        })}
      </section>
    </>
  );
}

export function AccountantAccrualsPage() {
  const { store } = useOutletContext();
  const [periodFilter, setPeriodFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const periods = getUniquePeriods(store.receipts);
  const rows = getReceiptRows(store, {
    period: periodFilter,
    service: serviceFilter,
    status: statusFilter,
  });
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <>
      <PageTitle title="Начисления">
        Реестр квитанций по периодам, услугам, лицевым счетам и статусам оплаты.
      </PageTitle>

      <section className="stats-grid">
        <StatCard icon={ReceiptText} label="Квитанций" value={rows.length} />
        <StatCard icon={FileSpreadsheet} label="Начислено" value={formatMoney(totalAmount)} />
        <StatCard icon={AlertCircle} label="Не оплачено" value={rows.filter((row) => row.status === 'unpaid').length} tone="danger" />
      </section>

      <section className="work-panel accounting-panel">
        <div className="accounting-panel-head">
          <h2>Реестр начислений</h2>
          <button
            className="primary-link"
            type="button"
            onClick={() => downloadFile('reestr-nachisleniy.csv', toCsv(receiptExportHeaders, rows))}
          >
            <Download size={18} />
            Скачать CSV
          </button>
        </div>

        <div className="accounting-filters">
          <label>
            Период
            <select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)}>
              <option value="all">Все периоды</option>
              {periods.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </label>
          <label>
            Услуга
            <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)}>
              <option value="all">Все услуги</option>
              {getReportServices().map(([code, meta]) => (
                <option key={code} value={code}>
                  {meta.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Статус
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Все статусы</option>
              <option value="paid">Оплачено</option>
              <option value="unpaid">Не оплачено</option>
            </select>
          </label>
        </div>

        <div className="accounting-table-wrap">
          <table className="accounting-table">
            <thead>
              <tr>
                <th>Период</th>
                <th>Услуга</th>
                <th>Лицевой счет</th>
                <th>Плательщик</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Срок</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.period}</td>
                  <td><ServiceBadge service={row.service} /></td>
                  <td>{row.accountNumber}</td>
                  <td>{row.ownerName}</td>
                  <td>{formatMoney(row.amount)}</td>
                  <td>{receiptStatusText[row.status]}</td>
                  <td>{row.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export function AccountantPaymentsPage() {
  const { store, summary } = useOutletContext();
  const payments = getPaymentRows(store);
  const debtors = getReceiptRows(store, { status: 'unpaid' });

  return (
    <>
      <PageTitle title="Оплаты и долги">
        Поступившие платежи, задолженность по лицевым счетам и акт сверки оплат.
      </PageTitle>

      <section className="stats-grid">
        <StatCard icon={CheckCircle2} label="Оплачено" value={formatMoney(summary.paidAmount)} tone="success" />
        <StatCard icon={AlertCircle} label="Долг" value={formatMoney(summary.unpaidAmount)} tone="danger" />
        <StatCard icon={CreditCard} label="Платежей" value={payments.length} />
      </section>

      <section className="employee-grid">
        <div className="work-panel accounting-panel">
          <div className="accounting-panel-head">
            <h2>Реестр оплат</h2>
            <button
              className="ghost-button"
              type="button"
              onClick={() => downloadFile('reestr-oplat.csv', toCsv(paymentExportHeaders, payments))}
            >
              <Download size={18} />
              Скачать
            </button>
          </div>
          <div className="finance-list">
            {payments.map((payment) => (
              <div key={payment.id}>
                <span>{payment.period} · {payment.accountNumber} · {payment.method}</span>
                <strong>{formatMoney(payment.amount)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="work-panel accounting-panel">
          <div className="accounting-panel-head">
            <h2>Должники</h2>
            <button
              className="ghost-button"
              type="button"
              onClick={() => downloadFile('reestr-dolzhnikov.csv', toCsv(receiptExportHeaders, debtors))}
            >
              <Download size={18} />
              Скачать
            </button>
          </div>
          <div className="finance-list">
            {debtors.map((receipt) => (
              <div key={receipt.id}>
                <span>{receipt.ownerName} · {receipt.period} · {receipt.accountNumber}</span>
                <strong>{formatMoney(receipt.amount)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="work-panel accounting-panel">
        <div className="accounting-panel-head">
          <h2>Сверка оплат</h2>
          <button
            className="primary-link"
            type="button"
            onClick={() => downloadFile('akt-sverki-oplat.txt', buildReconciliationText(store), 'text/plain;charset=utf-8')}
          >
            <Download size={18} />
            Скачать акт сверки
          </button>
        </div>
        <p className="form-hint">
          Акт сверки собирает итог по оплаченным квитанциям, задолженности и количеству спорных записей.
        </p>
      </section>
    </>
  );
}

export function AccountantDocumentsPage() {
  const { store, user, organization } = useOutletContext();
  const [periodFilter, setPeriodFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const periods = getUniquePeriods(store.receipts);
  const org = organization ?? defaultCompanyProfile;

  const docDefs = [
    {
      id: 'accruals',
      icon: ReceiptText,
      title: 'Реестр начислений',
      desc: 'Квитанции с лицевыми счетами, суммами и статусами',
      pdf: () => exportToPDF('Реестр начислений', buildAccrualsHTML(store, org, user)),
      word: () => exportToWord('Реестр начислений', buildAccrualsHTML(store, org, user), 'reestr-nachisleniy'),
      csv: () => downloadFile('reestr-nachisleniy.csv', toCsv(receiptExportHeaders, getReceiptRows(store, { period: periodFilter, service: serviceFilter }))),
    },
    {
      id: 'payments',
      icon: CreditCard,
      title: 'Реестр оплат',
      desc: 'Платежи, даты, способы оплаты по всем квитанциям',
      pdf: () => exportToPDF('Реестр оплат', buildPaymentsHTML(store, org, user)),
      word: () => exportToWord('Реестр оплат', buildPaymentsHTML(store, org, user), 'reestr-oplat'),
      csv: () => downloadFile('reestr-oplat.csv', toCsv(paymentExportHeaders, getPaymentRows(store))),
    },
    {
      id: 'debtors',
      icon: AlertCircle,
      title: 'Реестр должников',
      desc: 'Неоплаченные квитанции с суммами задолженности',
      pdf: () => exportToPDF('Реестр должников', buildDebtorsHTML(store, org, user)),
      word: () => exportToWord('Реестр должников', buildDebtorsHTML(store, org, user), 'reestr-dolzhnikov'),
      csv: () => downloadFile('reestr-dolzhnikov.csv', toCsv(receiptExportHeaders, getReceiptRows(store, { status: 'unpaid' }))),
    },
    {
      id: 'reconciliation',
      icon: FileText,
      title: 'Акт сверки оплат',
      desc: 'Итоговая сверка: начислено, оплачено, задолженность',
      pdf: () => exportToPDF('Акт сверки оплат', buildReconciliationHTML(store, org, user)),
      word: () => exportToWord('Акт сверки оплат', buildReconciliationHTML(store, org, user), 'akt-sverki'),
      csv: null,
    },
    {
      id: 'revenue',
      icon: FileSpreadsheet,
      title: 'Отчет по выручке',
      desc: 'Помесячная выручка, оплаты и долги за последний год',
      pdf: () => exportToPDF('Отчет по выручке', buildRevenueHTML(store, org, user)),
      word: () => exportToWord('Отчет по выручке', buildRevenueHTML(store, org, user), 'otchet-po-vyruchke'),
      csv: () => downloadFile('otchet-po-vyruchke.csv', toCsv(
        [
          { label: 'Период', value: (r) => r.period },
          { label: 'Начислено', value: (r) => r.accrued },
          { label: 'Оплачено', value: (r) => r.paid },
          { label: 'Долг', value: (r) => r.debt },
          { label: 'Квитанций', value: (r) => r.receiptCount },
        ],
        buildRevenueRows(store),
      )),
    },
    {
      id: 'json',
      icon: Database,
      title: 'Данные квитанций',
      desc: 'JSON-выгрузка для обмена с внешними системами',
      pdf: null,
      word: null,
      csv: () => downloadFile('platezhnye-dokumenty.json', JSON.stringify({ generatedAt: new Date().toISOString(), receipts: getReceiptRows(store, {}) }, null, 2), 'application/json;charset=utf-8'),
    },
  ];

  return (
    <>
      <PageTitle title="Документы и выгрузки">
        Выберите документ и формат: PDF — для печати и подписи, Word — для редактирования, CSV — для таблиц.
      </PageTitle>

      <section className="work-panel accounting-panel">
        <div className="accounting-filters">
          <label>
            Период (для CSV)
            <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
              <option value="all">Все периоды</option>
              {periods.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label>
            Услуга (для CSV)
            <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
              <option value="all">Все услуги</option>
              {getReportServices().map(([code, meta]) => <option key={code} value={code}>{meta.name}</option>)}
            </select>
          </label>
        </div>

        <div className="export-doc-list">
          {docDefs.map((doc) => {
            const Icon = doc.icon;
            return (
              <article className="export-doc-card" key={doc.id}>
                <div className="export-doc-info">
                  <Icon size={22} />
                  <div>
                    <strong>{doc.title}</strong>
                    <small>{doc.desc}</small>
                  </div>
                </div>
                <div className="export-doc-btns">
                  {doc.pdf && (
                    <button type="button" className="export-fmt-btn pdf" onClick={doc.pdf}>
                      <FileText size={14} />
                      PDF
                    </button>
                  )}
                  {doc.word && (
                    <button type="button" className="export-fmt-btn word" onClick={doc.word}>
                      <FileSpreadsheet size={14} />
                      Word
                    </button>
                  )}
                  {doc.csv && (
                    <button type="button" className="export-fmt-btn csv" onClick={doc.csv}>
                      <Download size={14} />
                      CSV
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}

export function AccountantReportsPage() {
  const { store, user, organization } = useOutletContext();
  const org = organization ?? defaultCompanyProfile;
  const revenueRows = buildRevenueRows(store);
  const byService = getReportServices().map(([code, meta]) => {
    const receipts = store.receipts.filter((receipt) => receipt.service === code);
    const paid = receipts.filter((receipt) => receipt.status === 'paid');
    const unpaid = receipts.filter((receipt) => receipt.status === 'unpaid');
    return {
      code,
      name: meta.name,
      paidAmount: paid.reduce((sum, receipt) => sum + receipt.amount, 0),
      debtAmount: unpaid.reduce((sum, receipt) => sum + receipt.amount, 0),
    };
  });

  return (
    <>
      <PageTitle title="Отчеты">
        Сводная аналитика по выручке, начислениям и задолженности.
      </PageTitle>

      <section className="employee-grid">
        <div className="work-panel accounting-panel">
          <div className="accounting-panel-head">
            <h2>Выручка за год</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="export-fmt-btn pdf" onClick={() => exportToPDF('Отчет по выручке', buildRevenueHTML(store, org, user))}>
                <FileText size={13} /> PDF
              </button>
              <button type="button" className="export-fmt-btn word" onClick={() => exportToWord('Отчет по выручке', buildRevenueHTML(store, org, user), 'otchet-po-vyruchke')}>
                <FileSpreadsheet size={13} /> Word
              </button>
            </div>
          </div>
          <div className="finance-list">
            {revenueRows.filter((row) => row.accrued > 0).map((row) => (
              <div key={row.period}>
                <span>{row.period} · начислено {formatMoney(row.accrued)}</span>
                <strong>{formatMoney(row.paid)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="work-panel accounting-panel" style={{ alignSelf: 'start' }}>
          <div className="accounting-panel-head">
            <h2>По услугам</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="export-fmt-btn pdf" onClick={() => exportToPDF('Акт сверки оплат', buildReconciliationHTML(store, org, user))}>
                <FileText size={13} /> PDF
              </button>
              <button type="button" className="export-fmt-btn word" onClick={() => exportToWord('Акт сверки оплат', buildReconciliationHTML(store, org, user), 'akt-sverki')}>
                <FileSpreadsheet size={13} /> Word
              </button>
            </div>
          </div>
          <table className="accounting-table accounting-table--compact">
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Оплачено</th>
                <th>Задолженность</th>
              </tr>
            </thead>
            <tbody>
              {byService.map((row) => (
                <tr key={row.code}>
                  <td><ServiceBadge service={row.code} /></td>
                  <td>{formatMoney(row.paidAmount)}</td>
                  <td style={{ color: row.debtAmount > 0 ? 'var(--red)' : undefined }}>{formatMoney(row.debtAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
