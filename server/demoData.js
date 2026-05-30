import { initialStore } from '../src/data.js';

const monthNames = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const demoReceiptSeed = [
  ['2025-06', 'acc-1', 'water', 1260, 'paid'],
  ['2025-06', 'acc-1', 'gas', 820, 'paid'],
  ['2025-06', 'acc-2', 'electricity', 2040, 'paid'],
  ['2025-07', 'acc-1', 'water', 1310, 'paid'],
  ['2025-07', 'acc-1', 'electricity', 2290, 'paid'],
  ['2025-07', 'acc-2', 'gas', 790, 'paid'],
  ['2025-08', 'acc-1', 'water', 1370, 'paid'],
  ['2025-08', 'acc-2', 'electricity', 2180, 'unpaid'],
  ['2025-08', 'acc-2', 'gas', 840, 'paid'],
  ['2025-09', 'acc-1', 'water', 1290, 'paid'],
  ['2025-09', 'acc-1', 'electricity', 2410, 'paid'],
  ['2025-09', 'acc-2', 'gas', 860, 'unpaid'],
  ['2025-10', 'acc-1', 'water', 1440, 'paid'],
  ['2025-10', 'acc-2', 'electricity', 2320, 'paid'],
  ['2025-10', 'acc-2', 'water', 1190, 'paid'],
  ['2025-11', 'acc-1', 'water', 1490, 'paid'],
  ['2025-11', 'acc-1', 'gas', 910, 'paid'],
  ['2025-11', 'acc-2', 'electricity', 2510, 'unpaid'],
  ['2025-12', 'acc-1', 'water', 1530, 'paid'],
  ['2025-12', 'acc-1', 'electricity', 2660, 'paid'],
  ['2025-12', 'acc-2', 'gas', 930, 'paid'],
  ['2026-04', 'acc-1', 'water', 1580, 'paid'],
  ['2026-04', 'acc-1', 'gas', 980, 'unpaid'],
  ['2026-04', 'acc-2', 'electricity', 2440, 'paid'],
  ['2026-05', 'acc-1', 'water', 4523.67, 'unpaid'],
  ['2026-05', 'acc-1', 'electricity', 1367.4, 'paid'],
  ['2026-05', 'acc-1', 'gas', 1190.64, 'paid'],
  ['2026-05', 'acc-2', 'gas', 940, 'paid'],
];

function parseMonthKey(periodKey) {
  const [year, month] = periodKey.split('-').map(Number);
  return { year, monthIndex: month - 1 };
}

function buildDemoReceipt(id, [periodKey, accountId, service, amount, status]) {
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

const defaultCompanyProfile = {
  id: 'org-demo',
  status: 'Одобрена',
  legalFullName: 'Общество с ограниченной ответственностью "Комфортный дом"',
  legalShortName: 'ООО "Комфортный дом"',
  taxId: '1655000000',
  kpp: '165501001',
  ogrn: '1261600000000',
  legalAddress: 'г. Казань, ул. Центральная, 10',
  actualAddress: 'г. Казань, ул. Центральная, 10',
  corporatePhone: '+7 843 200-10-20',
  corporateEmail: 'office@comfort-dom.ru',
  licenseNumber: 'ЛМКД-016-2026',
  bankAccount: '40702810000000000001',
  bankBik: '049205000',
  registryUpdatedAt: '2026-05-08',
  houses: [
    { id: 'house-1', address: 'г. Казань, ул. Светлая, 18', units: 124, accounts: 118, meters: 236, debtors: 18 },
    { id: 'house-2', address: 'г. Казань, ул. Центральная, 10', units: 96, accounts: 91, meters: 188, debtors: 11 },
    { id: 'house-3', address: 'г. Казань, ул. Озерная, 6', units: 72, accounts: 70, meters: 142, debtors: 6 },
  ],
  employees: [
    { id: 'staff-1', name: 'Иван Петров', email: 'owner@comfort-dom.ru', phone: '+7 900 555-44-33', role: 'Администратор', status: 'Активен' },
    { id: 'staff-2', name: 'Анна Сергеева', email: 'operator@comfort-dom.ru', phone: '+7 900 222-14-15', role: 'Диспетчер', status: 'Активен' },
    { id: 'staff-3', name: 'Ольга Миронова', email: 'accountant@comfort-dom.ru', phone: '+7 900 777-11-21', role: 'Бухгалтер', status: 'Ожидает приглашение' },
  ],
  requests: [
    { id: 'req-1', topic: 'Протечка в подъезде', house: 'ул. Светлая, 18', status: 'В работе', assignee: 'Анна Сергеева' },
    { id: 'req-2', topic: 'Перерасчет начисления', house: 'ул. Центральная, 10', status: 'Новое', assignee: 'Не назначен' },
    { id: 'req-3', topic: 'Проверка счетчика воды', house: 'ул. Озерная, 6', status: 'Выполнено', assignee: 'Анна Сергеева' },
  ],
  registryEvents: [
    'Обновлены сведения о домах из реестра',
    'Подтверждена лицензия управляющей организации',
    'Загружены лицевые счета для сверки начислений',
  ],
};

export function createDemoStore() {
  const receiptMap = new Map(initialStore.receipts.map((receipt) => [receipt.id, receipt]));
  demoReceiptSeed.forEach((seed) => {
    const [periodKey, accountId, service] = seed;
    const receiptId = `demo-rcp-${periodKey}-${accountId}-${service}`;
    receiptMap.set(receiptId, buildDemoReceipt(receiptId, seed));
  });

  const receipts = [...receiptMap.values()];
  const paymentMap = new Map(initialStore.payments.map((payment) => [payment.id, payment]));
  receipts
    .filter((receipt) => receipt.id.startsWith('demo-rcp-') && receipt.status === 'paid')
    .forEach((receipt) => {
      paymentMap.set(`pay-${receipt.id}`, {
        id: `pay-${receipt.id}`,
        receiptId: receipt.id,
        method: receipt.method,
        paidAt: receipt.paidAt,
        amount: receipt.amount,
      });
    });

  return {
    users: [
      ...initialStore.users,
      {
        id: 'employee-accountant',
        role: 'employee',
        name: 'Ольга Миронова',
        email: 'accountant@demo.ru',
        password: 'demo',
        loginName: 'accountant',
        employeeRole: 'Бухгалтер',
        position: 'Бухгалтер по начислениям',
      },
      {
        id: 'company-admin-demo',
        role: 'companyAdmin',
        orgId: 'org-demo',
        name: 'Иван Петров',
        email: 'owner@comfort-dom.ru',
        password: 'demo',
        phone: '+7 900 555-44-33',
      },
    ],
    accounts: initialStore.accounts,
    receipts,
    payments: [...paymentMap.values()],
    organizations: [defaultCompanyProfile],
  };
}
