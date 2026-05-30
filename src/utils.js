import { getFreshStore, serviceMeta } from './data.js';
import {
  defaultCompanyProfile,
  demoEmployeeAccounts,
  demoReceiptSeed,
  employeeRoleOptions,
  monthNames,
  monthShortNames,
  objectDistricts,
  reportServiceCodes,
  STORE_KEY,
  SESSION_KEY,
  THEME_KEY,
} from './config.js';

export const formatMoney = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(value);

export const today = () => new Date().toISOString().slice(0, 10);

export function buildDemoReceipt(id, [periodKey, accountId, service, amount, status]) {
  const { year, monthIndex } = parseMonthKey(periodKey);
  const paid = status === 'paid';
  const due = new Date(year, monthIndex + 1, 10);
  const paidAt = new Date(year, monthIndex + 1, 5);

  return {
    id,
    accountId,
    period: `${monthNames[monthIndex]} ${year}`,
    service,
    amount,
    status,
    dueDate: `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-10`,
    paidAt: paid ? `${paidAt.getFullYear()}-${String(paidAt.getMonth() + 1).padStart(2, '0')}-05` : null,
    method: paid ? (Number(id.replace(/\D/g, '')) % 2 === 0 ? 'МИР' : 'СБП') : null,
  };
}

export function ensureDemoData(store) {
  const FIXED_RECEIPT_IDS = ['rcp-3', 'rcp-4', 'rcp-5'];
  const FIXED_RECEIPT_PATCHES = {
    'rcp-3': { status: 'paid', paidAt: '2026-03-07', method: 'СБП' },
    'rcp-4': { status: 'paid', paidAt: '2026-04-08', method: 'МИР' },
    'rcp-5': { status: 'paid', paidAt: '2026-04-09', method: 'СБП' },
  };
  const nextUsers = (store.users ?? []).filter((user) => !(user.role === 'employee' && user.email === 'employee@demo.ru'));
  const payerDemo = nextUsers.find((user) => user.id === 'payer-1');
  if (payerDemo) { payerDemo.email = '1@gmail.com'; payerDemo.password = '111111'; }
  const normalizeRequestStatus = (status) => {
    if (status === 'Новая' || status === 'Новый') {
      return 'Новое';
    }

    if (status === 'Закрыта' || status === 'Закрыто' || status === 'Ожидает ответа') {
      return status === 'Ожидает ответа' ? 'В работе' : 'Выполнено';
    }

    return status;
  };
  const nextOrganizations = (store.organizations ?? []).map((organization) => ({
    ...organization,
    employees: (organization.employees ?? [])
      .filter((employee) => employee.email !== 'master@comfort-dom.ru')
      .filter((employee) => employeeRoleOptions.includes(employee.role)),
    requests: (organization.requests ?? []).map((request) => ({
      ...request,
      status: normalizeRequestStatus(request.status),
    })),
  }));

  demoEmployeeAccounts.forEach((account) => {
    const existing = nextUsers.find((user) => user.role === 'employee' && user.loginName === account.loginName);
    if (existing) {
      existing.email = account.email;
      existing.password = account.password;
      existing.employeeRole = existing.employeeRole ?? account.employeeRole;
      existing.position = existing.position ?? account.position;
      return;
    }

    nextUsers.push({
      id: `employee-${account.loginName}`,
      role: 'employee',
      name: account.name,
      email: account.email,
      password: account.password,
      position: account.position,
      employeeRole: account.employeeRole,
      loginName: account.loginName,
    });
  });

  const adminDemo = nextUsers.find((user) => user.id === 'company-admin-demo');
  if (adminDemo) {
    adminDemo.email = '1@gmail.com';
    adminDemo.password = '111111';
  } else {
    nextUsers.push({
      id: 'company-admin-demo',
      role: 'companyAdmin',
      orgId: 'org-demo',
      name: 'Иван Петров',
      email: '1@gmail.com',
      password: '111111',
      phone: '+7 900 555-44-33',
    });
  }

  const nextReceipts = (store.receipts ?? []).map((receipt) =>
    FIXED_RECEIPT_IDS.includes(receipt.id)
      ? { ...receipt, ...FIXED_RECEIPT_PATCHES[receipt.id] }
      : receipt
  );
  demoReceiptSeed.forEach((seed, index) => {
    const [periodKey, accountId, service] = seed;
    const receiptId = `demo-rcp-${periodKey}-${accountId}-${service}`;
    const demoReceipt = buildDemoReceipt(receiptId, seed);
    const existingReceipt = nextReceipts.find((receipt) => receipt.id === receiptId);
    if (existingReceipt) {
      Object.assign(existingReceipt, demoReceipt);
    } else {
      nextReceipts.push(demoReceipt);
    }
  });
  const visibleReceipts = nextReceipts.filter((receipt) => isReportService(receipt.service));
  const visibleReceiptIds = new Set(visibleReceipts.map((receipt) => receipt.id));

  const nextPayments = [...(store.payments ?? [])];
  FIXED_RECEIPT_IDS.forEach((id) => {
    const patch = FIXED_RECEIPT_PATCHES[id];
    const receipt = visibleReceipts.find((r) => r.id === id);
    if (!receipt) return;
    const paymentId = `pay-${id}`;
    const existing = nextPayments.find((p) => p.id === paymentId);
    if (existing) {
      Object.assign(existing, { method: patch.method, paidAt: patch.paidAt });
    } else {
      nextPayments.push({ id: paymentId, receiptId: id, method: patch.method, paidAt: patch.paidAt, amount: receipt.amount });
    }
  });
  visibleReceipts
    .filter((receipt) => receipt.id.startsWith('demo-rcp-') && receipt.status === 'paid')
    .forEach((receipt) => {
      const paymentId = `pay-${receipt.id}`;
      if (!nextPayments.some((payment) => payment.id === paymentId)) {
        nextPayments.push({
          id: paymentId,
          receiptId: receipt.id,
          method: receipt.method,
          paidAt: receipt.paidAt,
          amount: receipt.amount,
        });
      }
    });

  return {
    ...store,
    users: nextUsers,
    organizations: nextOrganizations,
    receipts: visibleReceipts,
    payments: nextPayments.filter((payment) => visibleReceiptIds.has(payment.receiptId)),
  };
}

export function loadStore() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    return ensureDemoData(saved ? JSON.parse(saved) : getFreshStore());
  } catch {
    return ensureDemoData(getFreshStore());
  }
}

export function loadSession() {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function buildReceiptSummary(receipts) {
  const visibleReceipts = filterReportReceipts(receipts);
  const paid = visibleReceipts.filter((item) => item.status === 'paid');
  const unpaid = visibleReceipts.filter((item) => item.status === 'unpaid');

  return {
    paidCount: paid.length,
    unpaidCount: unpaid.length,
    paidAmount: paid.reduce((sum, item) => sum + item.amount, 0),
    unpaidAmount: unpaid.reduce((sum, item) => sum + item.amount, 0),
    totalAmount: visibleReceipts.reduce((sum, item) => sum + item.amount, 0),
  };
}

export function getServiceName(code) {
  return serviceMeta[code]?.name ?? code;
}

export function getReportServices() {
  return reportServiceCodes
    .filter((code) => serviceMeta[code])
    .map((code) => [code, serviceMeta[code]]);
}

export function isReportService(service) {
  return reportServiceCodes.includes(service);
}

export function filterReportReceipts(receipts) {
  return receipts.filter((receipt) => isReportService(receipt.service));
}

export function normalizeEmployeeRole(role) {
  return employeeRoleOptions.includes(role) ? role : 'Диспетчер';
}

export function getOrganizations(store) {
  return store.organizations?.length ? store.organizations : [defaultCompanyProfile];
}

export function getHousePaymentStats(house) {
  return {
    paid: Math.max(house.accounts - house.debtors, 0),
    unpaid: house.debtors,
  };
}

export function getObjectTree(organization) {
  const cities = new Map();

  organization.houses.forEach((house) => {
    const city = house.address.split(',')[0]?.replace('г. ', '').trim() || 'Город не указан';
    const district = objectDistricts[house.id] ?? 'Район не указан';
    const stats = getHousePaymentStats(house);

    if (!cities.has(city)) {
      cities.set(city, { name: city, paid: 0, unpaid: 0, districts: new Map() });
    }

    const cityItem = cities.get(city);
    if (!cityItem.districts.has(district)) {
      cityItem.districts.set(district, { name: district, paid: 0, unpaid: 0, houses: [] });
    }

    const districtItem = cityItem.districts.get(district);
    const enrichedHouse = { ...house, paid: stats.paid, unpaid: stats.unpaid };
    districtItem.houses.push(enrichedHouse);
    districtItem.paid += stats.paid;
    districtItem.unpaid += stats.unpaid;
    cityItem.paid += stats.paid;
    cityItem.unpaid += stats.unpaid;
  });

  return Array.from(cities.values()).map((city) => ({
    ...city,
    districts: Array.from(city.districts.values()),
  }));
}

export function makeMonthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

export function parseMonthKey(key) {
  const [year, month] = key.split('-').map(Number);
  return { year, monthIndex: month - 1 };
}

export function getLastYearPeriodOptions() {
  const now = new Date();

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return {
      key: makeMonthKey(year, monthIndex),
      label: `${monthNames[monthIndex]} ${year}`,
    };
  });
}

export function getThreeMonthWindow(periodKey) {
  const { year, monthIndex } = parseMonthKey(periodKey);

  return Array.from({ length: 3 }, (_, index) => {
    const date = new Date(year, monthIndex - 2 + index, 1);
    const itemMonthIndex = date.getMonth();
    const itemYear = date.getFullYear();

    return {
      key: makeMonthKey(itemYear, itemMonthIndex),
      label: monthShortNames[itemMonthIndex],
      fullLabel: `${monthNames[itemMonthIndex]} ${itemYear}`,
    };
  });
}

export function getReceiptPeriodKey(period) {
  const [monthName, yearText] = period.split(' ');
  const monthIndex = monthNames.findIndex((name) => name.toLowerCase() === monthName?.toLowerCase());
  const year = Number(yearText);

  if (monthIndex < 0 || !year) {
    return '';
  }

  return makeMonthKey(year, monthIndex);
}

export function getLatestReceiptPeriodKey(receipts) {
  return receipts
    .map((receipt) => getReceiptPeriodKey(receipt.period))
    .filter(Boolean)
    .sort()
    .at(-1);
}

export function buildCompanyFromApplication(application, orgId) {
  return {
    ...defaultCompanyProfile,
    ...application,
    id: orgId,
    status: 'Одобрена',
    registryUpdatedAt: today(),
    houses: defaultCompanyProfile.houses,
    employees: [
      {
        id: `staff-${Date.now()}`,
        name: application.ownerName || 'Администратор компании',
        email: application.ownerEmail || 'owner@company.ru',
        phone: application.ownerPhone || '',
        role: 'Администратор',
        status: 'Активен',
      },
      ...defaultCompanyProfile.employees.slice(1),
    ],
    requests: defaultCompanyProfile.requests,
    registryEvents: [
      'Заявка компании одобрена',
      'Профиль организации создан по данным заявки',
      'Сведения из реестра подготовлены к сверке',
    ],
  };
}
