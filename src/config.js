import {
  BarChart3,
  Building2,
  Droplets,
  Flame,
  Gauge,
  ReceiptText,
  ShieldCheck,
  WalletCards,
  Zap,
} from 'lucide-react';

export const STORE_KEY = 'zhku-demo-store';

export const SESSION_KEY = 'zhku-demo-session';

export const PARTNER_APPLICATIONS_KEY = 'zhku-partner-applications';

export const THEME_KEY = 'zhku-theme';

export const serviceIcons = {
  water: Droplets,
  gas: Flame,
  electricity: Zap,
};

export const employeeRoleOptions = ['Администратор', 'Диспетчер', 'Бухгалтер'];

export const reportServiceCodes = ['water', 'gas', 'electricity'];

export const monthNames = [
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

export const monthShortNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export const objectDistricts = {
  'house-1': 'Советский район',
  'house-2': 'Вахитовский район',
  'house-3': 'Приволжский район',
};

export const registryCheckVariants = [
  {
    type: 'success',
    title: 'Данные совпадают',
    text: 'Сведения компании, лицензия, адреса и реквизиты соответствуют данным реестра.',
    details: ['Новых записей нет', 'Конфликтов не найдено'],
  },
  {
    type: 'warning',
    title: 'Есть новые данные',
    text: 'В реестре появились сведения, которых пока нет в кабинете.',
    details: ['Новый контактный телефон: +7 843 210-40-50', 'Конфликтов с текущими реквизитами нет'],
  },
  {
    type: 'warning',
    title: 'Найдены расхождения',
    text: 'Часть новых сведений конфликтует с текущими данными кабинета.',
    details: ['Юридический адрес отличается от сохраненного', 'Лицензия совпадает', 'Перед обновлением нужна ручная проверка'],
  },
];

export const demoEmployeeAccounts = [
  {
    label: 'Бухгалтер',
    email: '1@gmail.com',
    password: '111111',
    loginName: 'accountant',
    name: 'Ольга Миронова',
    employeeRole: 'Бухгалтер',
    position: 'Бухгалтер по начислениям',
  },
  {
    label: 'Диспетчер',
    email: '1@gmail.com',
    password: '111111',
    loginName: 'dispatcher',
    name: 'Анна Сергеева',
    employeeRole: 'Диспетчер',
    position: 'Диспетчер абонентской службы',
  },
];

export const demoReceiptSeed = [
  ['2025-06', 'acc-1', 'water', 1260, 'paid'],
  ['2025-06', 'acc-1', 'gas', 820, 'paid'],
  ['2025-06', 'acc-2', 'electricity', 2040, 'paid'],
  ['2025-07', 'acc-1', 'water', 1310, 'paid'],
  ['2025-07', 'acc-1', 'electricity', 2290, 'paid'],
  ['2025-07', 'acc-2', 'gas', 790, 'paid'],
  ['2025-08', 'acc-1', 'water', 1370, 'paid'],
  ['2025-08', 'acc-2', 'electricity', 2180, 'paid'],
  ['2025-08', 'acc-2', 'gas', 840, 'paid'],
  ['2025-09', 'acc-1', 'water', 1290, 'paid'],
  ['2025-09', 'acc-1', 'electricity', 2410, 'paid'],
  ['2025-09', 'acc-2', 'gas', 860, 'paid'],
  ['2025-10', 'acc-1', 'water', 1440, 'paid'],
  ['2025-10', 'acc-2', 'electricity', 2320, 'paid'],
  ['2025-10', 'acc-2', 'water', 1190, 'paid'],
  ['2025-11', 'acc-1', 'water', 1490, 'paid'],
  ['2025-11', 'acc-1', 'gas', 910, 'paid'],
  ['2025-11', 'acc-2', 'electricity', 2510, 'paid'],
  ['2025-12', 'acc-1', 'water', 1530, 'paid'],
  ['2025-12', 'acc-1', 'electricity', 2660, 'paid'],
  ['2025-12', 'acc-2', 'gas', 930, 'paid'],
  ['2026-04', 'acc-1', 'water', 1580, 'paid'],
  ['2026-04', 'acc-1', 'gas', 980, 'paid'],
  ['2026-04', 'acc-2', 'electricity', 2440, 'paid'],
  ['2026-05', 'acc-1', 'water', 4523.67, 'unpaid'],
  ['2026-05', 'acc-1', 'electricity', 1367.4, 'paid'],
  ['2026-05', 'acc-1', 'gas', 1190.64, 'paid'],
  ['2026-05', 'acc-2', 'gas', 940, 'paid'],
];

export const defaultCompanyProfile = {
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

export const audienceContent = {
  citizen: {
    eyebrow: 'Для плательщика',
    title: 'Все платежи ЖКУ рядом, без бумажной путаницы',
    text: 'Плательщик видит квитанции по периодам, быстро проверяет долги и имитирует оплату через понятные способы.',
    action: 'Войти',
    href: '/auth',
    cards: [
      {
        icon: ShieldCheck,
        title: 'Проверка без регистрации',
        text: 'Введите лицевой счет и увидьте, какие периоды оплачены, а какие требуют внимания.',
      },
      {
        icon: ReceiptText,
        title: 'Квитанции по услугам',
        text: 'Водоснабжение, электроснабжение и газоснабжение собраны в одном личном кабинете.',
      },
      {
        icon: WalletCards,
        title: 'Оплата МИР и СБП',
        text: 'В дипломной версии платеж имитируется, но статус квитанции обновляется как в реальном сценарии.',
      },
    ],
  },
  employee: {
    eyebrow: 'Для диспетчера и бухгалтера',
    title: 'Рабочие кабинеты компании',
    text: 'Диспетчер работает с заявками пользователей, а бухгалтер видит документы, выгрузки, выручку и задолженности.',
    action: 'Войти',
    href: '/auth?role=employee',
    cards: [
      {
        icon: BarChart3,
        title: 'Сводка оплат',
        text: 'Количество и сумма оплаченных и неоплаченных квитанций отображаются в служебном кабинете.',
      },
      {
        icon: Gauge,
        title: 'Контроль задолженности',
        text: 'Статистика строится по фактическим статусам платежей из данных приложения.',
      },
      {
        icon: Building2,
        title: 'Основа для компаний',
        text: 'Регистрация компаний и расширенные отчеты запланированы следующими этапами.',
      },
    ],
  },
};

export const faqByAudience = {
  citizen: [
    {
      question: 'Можно ли проверить задолженность без регистрации?',
      answer: 'Да. На главной странице достаточно ввести лицевой счет. Сервис покажет только статус задолженности, периоды и виды услуг.',
    },
    {
      question: 'Почему оплата пока называется имитацией?',
      answer: 'Для дипломного v1 реальная платежная интеграция не нужна. Интерфейс показывает сценарий оплаты, а статус квитанции меняется внутри приложения.',
    },
    {
      question: 'Какие данные скрыты при публичной проверке?',
      answer: 'Без входа не выводятся ФИО, адрес и другие персональные данные. Это сделано, чтобы проверка была полезной, но аккуратной.',
    },
  ],
  employee: [
    {
      question: 'Как компании начать работу на сайте?',
      answer: 'Компания подает заявку на странице партнерства, указывает юридические данные, банковские реквизиты, лицензию и данные первого администратора.',
    },
    {
      question: 'Какие роли сотрудников предусмотрены?',
      answer: 'В кабинете компании доступны три роли: администратор компании, диспетчер и бухгалтер.',
    },
    {
      question: 'Можно ли приглашать сотрудников по почте?',
      answer: 'Да. После модерации компании администратор сможет отправлять сотрудникам приглашения на почту, а они будут заполнять свои данные и создавать пароль.',
    },
  ],
};

export const demoCompanies = [
  'УК Комфортный дом',
  'Городские коммунальные системы',
  'Единый расчетный центр ЖКУ',
  'ЖКХ СЕРВИС ПЛЮС',
  'ДомСервис Казань',
  'Управдом Онлайн',
];
