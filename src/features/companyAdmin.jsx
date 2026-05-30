import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useOutletContext, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  Bell,
  CalendarDays,
  Building2,
  CheckCircle2,
  ClipboardList,
  ChevronDown,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Gauge,
  House,
  LayoutDashboard,
  MessageSquare,
  Pencil,
  ReceiptText,
  Settings,
  Trash2,
  UserCog,
  Users,
} from 'lucide-react';
import { defaultCompanyProfile, employeeRoleOptions, monthShortNames, registryCheckVariants } from '../config.js';
import {
  buildReceiptSummary,
  formatMoney,
  getObjectTree,
  getOrganizations,
  getReceiptPeriodKey,
  getReportServices,
  getServiceName,
  makeMonthKey,
  normalizeEmployeeRole,
} from '../utils.js';
import { PageTitle, ServiceBadge, StatCard, WorkspaceTopbar } from '../components/shared.jsx';

export function CompanyAdminLayout({
  user,
  store,
  logout,
  updateProfile,
  theme,
  setTheme,
  updateCompanyEmployeeRole,
  addCompanyEmployee,
  removeCompanyEmployee,
}) {
  const organizations = getOrganizations(store);
  const organization =
    organizations.find((item) => item.id === user.orgId) ?? organizations[0] ?? defaultCompanyProfile;
  const summary = buildReceiptSummary(store.receipts);
  const companyStats = {
    houses: organization.houses.reduce((sum, item) => sum + 1, 0),
    units: organization.houses.reduce((sum, item) => sum + item.units, 0),
    accounts: organization.houses.reduce((sum, item) => sum + item.accounts, 0),
    meters: organization.houses.reduce((sum, item) => sum + item.meters, 0),
    debtors: organization.houses.reduce((sum, item) => sum + item.debtors, 0),
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
            <small>{organization.legalShortName}</small>
          </span>
        </Link>

        <nav className="side-nav">
          <NavLink end to="/company-admin">
            <LayoutDashboard size={18} />
            Главное
          </NavLink>
          <NavLink to="/company-admin/company">
            <Database size={18} />
            Реестр
          </NavLink>
          <NavLink to="/company-admin/employees">
            <Users size={18} />
            Сотрудники
          </NavLink>
          <NavLink to="/company-admin/objects">
            <House size={18} />
            Объекты
          </NavLink>
          <NavLink to="/company-admin/statistics">
            <BarChart3 size={18} />
            Статистика
          </NavLink>
          <NavLink to="/company-admin/settings">
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
          settingsTo="/company-admin/settings"
        />
        <Outlet
          context={{
            user,
            store,
            organization,
            summary,
            companyStats,
            updateProfile,
            theme,
            setTheme,
            updateCompanyEmployeeRole,
            addCompanyEmployee,
            removeCompanyEmployee,
          }}
        />
      </main>
    </div>
  );
}

export function CompanyAdminDashboard() {
  const { organization, summary, companyStats } = useOutletContext();
  const unpaidPercent = Math.round((summary.unpaidCount / Math.max(summary.paidCount + summary.unpaidCount, 1)) * 100);

  const cabinetModules = [
    { icon: Database, title: 'Данные из реестра', text: 'Название, ИНН, лицензия, реквизиты и дата последней сверки.', to: '/company-admin/company' },
    { icon: Users, title: 'Сотрудники и доступ', text: 'Назначение ролей и контроль приглашений сотрудников компании.', to: '/company-admin/employees' },
    { icon: House, title: 'Объекты управления', text: 'Дома, помещения, лицевые счета и приборы учета по адресам.', to: '/company-admin/objects' },
    { icon: MessageSquare, title: 'Обращения жителей', text: 'Заявки, статусы, ответственные и история обработки обращений.', to: '/company-admin/objects' },
    { icon: FileSpreadsheet, title: 'Отчеты и выгрузки', text: 'Статистика оплат, должники, начисления и файлы для дальнейшей обработки.', to: '/company-admin/statistics' },
    { icon: Bell, title: 'Журнал событий', text: 'Уведомления о загрузках, изменениях данных и действиях сотрудников.', to: '/company-admin/settings' },
  ];

  return (
    <>
      <PageTitle title="Кабинет администратора">
        {organization.legalShortName}
      </PageTitle>

      <section className="stats-grid">
        <StatCard icon={House} label="Домов в управлении" value={companyStats.houses} />
        <StatCard icon={ReceiptText} label="Лицевых счетов" value={companyStats.accounts} />
        <StatCard icon={AlertCircle} label="Доля неоплаты" value={`${unpaidPercent}%`} tone="danger" />
      </section>

      <section className="dashboard-grid">
        <div className="work-panel">
          <h2>Данные из реестра</h2>
          <dl className="detail-list compact">
            <div>
              <dt>Статус компании</dt>
              <dd>{organization.status}</dd>
            </div>
            <div>
              <dt>ИНН</dt>
              <dd>{organization.taxId}</dd>
            </div>
            <div>
              <dt>Лицензия</dt>
              <dd>{organization.licenseNumber}</dd>
            </div>
            <div>
              <dt>Последняя сверка</dt>
              <dd>{organization.registryUpdatedAt}</dd>
            </div>
          </dl>
        </div>

        <div className="work-panel">
          <h2>Что требует внимания</h2>
          <div className="attention-list">
            <span><AlertCircle size={18} /> {companyStats.debtors} лицевых счетов с задолженностью</span>
            <span><MessageSquare size={18} /> 2 обращения ждут назначения ответственного</span>
            <span><Users size={18} /> 1 сотрудник ожидает подтверждение приглашения</span>
          </div>
        </div>
      </section>

      <section className="module-grid">
        {cabinetModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link className="module-card" key={module.title} to={module.to}>
              <Icon size={24} />
              <h3>{module.title}</h3>
              <p>{module.text}</p>
            </Link>
          );
        })}
      </section>
    </>
  );
}

export function CompanyRegistryPage() {
  const { organization } = useOutletContext();
  const [checkResult, setCheckResult] = useState(null);

  const runRegistryCheck = () => {
    setCheckResult(registryCheckVariants[Math.floor(Math.random() * registryCheckVariants.length)]);
  };

  return (
    <>
      <PageTitle title="Сведения о компании">
        Данные отображаются так, как будто они прошли сверку с реестром.
      </PageTitle>

      <section className="company-registry-grid">
        <div className="work-panel">
          <h2>Юридические сведения</h2>
          <dl className="detail-list compact">
            <div><dt>Полное наименование</dt><dd>{organization.legalFullName}</dd></div>
            <div><dt>Краткое наименование</dt><dd>{organization.legalShortName}</dd></div>
            <div><dt>ИНН</dt><dd>{organization.taxId}</dd></div>
            <div><dt>КПП</dt><dd>{organization.kpp}</dd></div>
            <div><dt>ОГРН</dt><dd>{organization.ogrn}</dd></div>
            <div><dt>Лицензия</dt><dd>{organization.licenseNumber}</dd></div>
            <div><dt>Статус заявки</dt><dd><span className="status-chip success registry-status">{organization.status}</span></dd></div>
          </dl>
        </div>

        <div className="work-panel">
          <h2>Контакты и реквизиты</h2>
          <dl className="detail-list compact">
            <div><dt>Юридический адрес</dt><dd>{organization.legalAddress}</dd></div>
            <div><dt>Фактический адрес</dt><dd>{organization.actualAddress}</dd></div>
            <div><dt>Телефон</dt><dd>{organization.corporatePhone}</dd></div>
            <div><dt>Почта</dt><dd>{organization.corporateEmail}</dd></div>
            <div><dt>Расчетный счет</dt><dd>{organization.bankAccount}</dd></div>
            <div><dt>БИК</dt><dd>{organization.bankBik}</dd></div>
          </dl>
        </div>
      </section>

      <section className="work-panel">
        <div className="panel-heading-row">
          <h2>Последние события сверки</h2>
          <button className="ghost-button" type="button" onClick={runRegistryCheck}>
            <Database size={18} />
            Сверить с реестром
          </button>
        </div>
        {checkResult && (
          <div className={`result-box ${checkResult.type === 'success' ? 'result-success' : 'result-warning'}`}>
            {checkResult.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
            <div>
              <strong>{checkResult.title}</strong>
              <span>{checkResult.text}</span>
              <ul className="registry-check-list">
                {checkResult.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <div className="timeline-list">
          {organization.registryEvents.map((event) => (
            <span key={event}><CheckCircle2 size={18} /> {event}</span>
          ))}
        </div>
      </section>
    </>
  );
}

export function CompanyEmployeesPage() {
  const { user, organization, updateCompanyEmployeeRole, addCompanyEmployee, removeCompanyEmployee } = useOutletContext();
  const [draftRoles, setDraftRoles] = useState(() =>
    Object.fromEntries(organization.employees.map((employee) => [employee.id, normalizeEmployeeRole(employee.role)])),
  );
  const [newEmployee, setNewEmployee] = useState({ email: '', role: employeeRoleOptions[1] });
  const [openRoles, setOpenRoles] = useState(() =>
    Object.fromEntries(employeeRoleOptions.map((role) => [
      role,
      organization.employees.some((employee) => normalizeEmployeeRole(employee.role) === role),
    ])),
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraftRoles(Object.fromEntries(organization.employees.map((employee) => [employee.id, normalizeEmployeeRole(employee.role)])));
  }, [organization.employees]);

  const changeDraftRole = (employeeId, role) => {
    setSaved(false);
    setDraftRoles((current) => ({ ...current, [employeeId]: role }));
  };

  const saveRoles = () => {
    organization.employees.forEach((employee) => {
      const nextRole = draftRoles[employee.id];
      if (employee.email !== user.email && nextRole && nextRole !== employee.role) {
        updateCompanyEmployeeRole(organization.id, employee.id, nextRole);
      }
    });
    setSaved(true);
  };

  const addEmployee = (event) => {
    event.preventDefault();
    if (!newEmployee.email.trim()) {
      return;
    }
    addCompanyEmployee(organization.id, newEmployee);
    setNewEmployee({ email: '', role: employeeRoleOptions[1] });
    setOpenRoles((current) => ({ ...current, [newEmployee.role]: true }));
    setSaved(true);
  };

  const toggleRole = (role) => {
    setOpenRoles((current) => ({ ...current, [role]: !current[role] }));
  };

  const deleteEmployee = (employee) => {
    if (employee.email === user.email) {
      return;
    }
    removeCompanyEmployee(organization.id, employee.id);
    setSaved(true);
  };

  return (
    <>
      <PageTitle title="Роли и доступы">
        Добавление сотрудника по почте и изменение ролей применяются только после сохранения.
      </PageTitle>

      <form className="work-panel employee-add-form" onSubmit={addEmployee}>
        <h2>Добавить сотрудника</h2>
        <label>
          Почта
          <input
            type="email"
            value={newEmployee.email}
            onChange={(event) => setNewEmployee((current) => ({ ...current, email: event.target.value }))}
            placeholder="employee@company.ru"
          />
        </label>
        <label>
          Роль
          <select
            value={newEmployee.role}
            onChange={(event) => setNewEmployee((current) => ({ ...current, role: event.target.value }))}
          >
            {employeeRoleOptions.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
        <button className="wide-button" type="submit">
          <Users size={18} />
          Добавить
        </button>
      </form>

      <section className="employee-role-groups">
        {employeeRoleOptions.map((role) => {
          const employees = organization.employees.filter((employee) => normalizeEmployeeRole(employee.role) === role);
          const isOpen = openRoles[role] ?? false;

          return (
            <article className={`role-details ${isOpen ? 'open' : ''}`} key={role}>
              <div className="role-summary">
                <b className="role-count">{employees.length}</b>
                <span>{role}</span>
                <button
                  aria-label={`${isOpen ? 'Свернуть' : 'Развернуть'} роль ${role}`}
                  className="role-toggle-button"
                  type="button"
                  onClick={() => toggleRole(role)}
                >
                  <ChevronDown size={18} />
                </button>
              </div>
              {isOpen && (
                <div className="employee-role-list">
                {employees.length === 0 ? (
                  <div className="empty-state">Сотрудников с этой ролью пока нет</div>
                ) : (
                  employees.map((employee) => {
                    const isSelf = employee.email === user.email;

                    return (
                    <article className="employee-role-card" key={employee.id}>
                      <div className="employee-avatar">
                        <UserCog size={22} />
                      </div>
                      <div>
                        <strong>{employee.name}</strong>
                        <span>{employee.email}</span>
                        <small>{employee.phone || 'Телефон не указан'}</small>
                      </div>
                      <label>
                        Роль
                        <select
                          disabled={isSelf}
                          value={draftRoles[employee.id] ?? normalizeEmployeeRole(employee.role)}
                          onChange={(event) => changeDraftRole(employee.id, event.target.value)}
                        >
                          {employeeRoleOptions.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                      <span className={`status-chip ${employee.status === 'Активен' ? 'success' : 'warning'}`}>
                        {employee.status}
                      </span>
                      <button
                        className="ghost-button danger-action"
                        disabled={isSelf}
                        type="button"
                        onClick={() => deleteEmployee(employee)}
                      >
                        <Trash2 size={18} />
                        Удалить
                      </button>
                    </article>
                    );
                  })
                )}
                </div>
              )}
            </article>
          );
        })}
      </section>

      <div className="employee-save-row">
        <button className="wide-button" type="button" onClick={saveRoles}>
          <Pencil size={18} />
          Сохранить роли
        </button>
        {saved && <span className="inline-success">Изменения сохранены</span>}
      </div>
    </>
  );
}

export function CompanyObjectsPage() {
  const { organization, companyStats } = useOutletContext();
  const location = useLocation();
  const statsBase = location.pathname.startsWith('/employee') ? '/employee' : '/company-admin';
  const objectTree = getObjectTree(organization);

  return (
    <>
      <PageTitle title="Дома, помещения и лицевые счета">
        Сводка по объектам управления, которые подгружаются из реестра.
      </PageTitle>

      <section className="stats-grid">
        <StatCard icon={House} label="Помещений" value={companyStats.units} />
        <StatCard icon={ReceiptText} label="Лицевых счетов" value={companyStats.accounts} />
        <StatCard icon={Gauge} label="Приборов учета" value={companyStats.meters} />
      </section>

      <section className="object-tree">
        {objectTree.map((city) => (
          <details className="object-details city-details" key={city.name} open>
            <summary>
              <span>{city.name}</span>
              <ObjectSummaryStats paid={city.paid} unpaid={city.unpaid} />
              <Link className="ghost-link compact-link" to={`${statsBase}/statistics?scope=city&value=${encodeURIComponent(city.name)}`}>
                <BarChart3 size={16} />
                Статистика
              </Link>
            </summary>
            {city.districts.map((district) => (
              <details className="object-details district-details" key={district.name}>
                <summary>
                  <span>{district.name}</span>
                  <ObjectSummaryStats paid={district.paid} unpaid={district.unpaid} />
                  <Link className="ghost-link compact-link" to={`${statsBase}/statistics?scope=district&value=${encodeURIComponent(district.name)}`}>
                    <BarChart3 size={16} />
                    Статистика
                  </Link>
                </summary>
                <div className="object-list">
                  {district.houses.map((house) => (
                    <article className="object-card" key={house.id}>
                      <House size={24} />
                      <div>
                        <strong>{house.address}</strong>
                        <span>{house.units} помещений, {house.accounts} лицевых счетов</span>
                      </div>
                      <ObjectSummaryStats paid={house.paid} unpaid={house.unpaid} />
                      <Link className="ghost-link compact-link" to={`${statsBase}/statistics?scope=house&value=${encodeURIComponent(house.address)}`}>
                        <BarChart3 size={16} />
                        Статистика
                      </Link>
                    </article>
                  ))}
                </div>
              </details>
            ))}
          </details>
        ))}
      </section>
    </>
  );
}

export function ObjectSummaryStats({ paid, unpaid }) {
  return (
    <span className="object-payment-stats">
      <b>{paid}</b> оплачено
      <b>{unpaid}</b> не оплачено
    </span>
  );
}

const REPORT_CSS = `body{font-family:Arial,sans-serif;font-size:12px;color:#111;margin:24px}table{width:100%;border-collapse:collapse;margin:8px 0}th{background:#f0f4f8;padding:6px 8px;text-align:left;border:1px solid #ccc;font-size:11px}td{padding:4px 8px;border:1px solid #ddd}h1{font-size:16px;margin:0 0 2px}h2{font-size:13px;text-transform:uppercase;letter-spacing:.3px;margin:0}h3{font-size:12px;border-bottom:1px solid #ddd;padding-bottom:3px;margin:14px 0 6px}.hdr{text-align:center;border-bottom:2px solid #333;margin-bottom:14px;padding-bottom:10px}.hdr p{font-size:10px;color:#555;margin:2px 0}.ttl{text-align:center;margin-bottom:14px}.ttl p{font-size:10px;color:#666;margin:2px 0}.ftr{border-top:1px solid #ddd;margin-top:20px;padding-top:8px;text-align:center;font-size:9px;color:#aaa}@page{margin:15mm}@media print{body{margin:0}}`;

function reportDownload(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function exportChartPDF(title, html) {
  const win = window.open('', '_blank', 'width=860,height=720');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${REPORT_CSS}</style></head><body>${html}</body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

function exportChartWord(title, html, filename) {
  const content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${title}</title><style>${REPORT_CSS}</style></head><body>${html}</body></html>`;
  reportDownload(`${filename}.doc`, content, 'application/msword');
}

function buildChartReportHTML(org, rangeStart, rangeEnd, chartData) {
  const fmt = (iso) => { const [y, m, d] = iso.split('-'); return `${d}.${m}.${y}`; };
  const date = new Date().toLocaleDateString('ru-RU');
  const totalPaid = chartData.reduce((s, d) => s + d.paid, 0);
  const totalUnpaid = chartData.reduce((s, d) => s + d.unpaid, 0);
  const coef = totalPaid + totalUnpaid > 0 ? Math.round((totalPaid / (totalPaid + totalUnpaid)) * 100) : 0;
  const rows = chartData.map((d) =>
    `<tr><td>${d.label}</td><td>${formatMoney(d.paid)}</td><td>${formatMoney(d.unpaid)}</td><td>${formatMoney(d.paid + d.unpaid)}</td></tr>`).join('');
  return `<div class="hdr"><h1>${org.legalShortName}</h1><p>ИНН ${org.taxId} &nbsp;·&nbsp; Лицензия ${org.licenseNumber}</p><p>${org.legalAddress}</p></div>
<div class="ttl"><h2>Отчет по оплатам</h2><p>Период: ${fmt(rangeStart)} — ${fmt(rangeEnd)} · Дата формирования: ${date}</p></div>
<h3>Сводка</h3><table><tbody><tr><td><b>Оплачено</b></td><td>${formatMoney(totalPaid)}</td></tr><tr><td><b>Задолженность</b></td><td>${formatMoney(totalUnpaid)}</td></tr><tr><td><b>Итого начислено</b></td><td>${formatMoney(totalPaid + totalUnpaid)}</td></tr><tr><td><b>Коэффициент оплаты</b></td><td>${coef}%</td></tr></tbody></table>
<h3>По месяцам</h3><table><thead><tr><th>Месяц</th><th>Оплачено</th><th>Задолженность</th><th>Итого</th></tr></thead><tbody>${rows}</tbody></table>
<div class="ftr">ЖКУ Контроль · ${org.legalShortName} · ${date}</div>`;
}

function buildDebtorsReportHTML(org, receipts, accounts) {
  const date = new Date().toLocaleDateString('ru-RU');
  const unpaid = receipts.filter((r) => r.status === 'unpaid');
  const totalDebt = unpaid.reduce((s, r) => s + r.amount, 0);
  const rows = unpaid.map((r) => {
    const acct = accounts.find((a) => a.id === r.accountId);
    return `<tr><td>${acct?.ownerName ?? '—'}</td><td>${acct?.number ?? r.accountId}</td><td>${acct?.address ?? '—'}</td><td>${getServiceName(r.service)}</td><td>${r.period}</td><td>${formatMoney(r.amount)}</td></tr>`;
  }).join('');
  return `<div class="hdr"><h1>${org.legalShortName}</h1><p>ИНН ${org.taxId} &nbsp;·&nbsp; Лицензия ${org.licenseNumber}</p><p>${org.legalAddress}</p></div>
<div class="ttl"><h2>Реестр должников</h2><p>Дата формирования: ${date}</p></div>
<h3>Сводка</h3><table><tbody><tr><td><b>Неоплаченных квитанций</b></td><td>${unpaid.length}</td></tr><tr><td><b>Общая задолженность</b></td><td>${formatMoney(totalDebt)}</td></tr><tr><td><b>Уникальных лицевых счетов</b></td><td>${new Set(unpaid.map((r) => r.accountId)).size}</td></tr></tbody></table>
<h3>Список должников</h3><table><thead><tr><th>Плательщик</th><th>Лицевой счет</th><th>Адрес</th><th>Услуга</th><th>Период</th><th>Задолженность</th></tr></thead><tbody>${rows || '<tr><td colspan="6" style="color:#888">Должников нет</td></tr>'}</tbody></table>
<div class="ftr">ЖКУ Контроль · ${org.legalShortName} · ${date}</div>`;
}

function buildRequestsReportHTML(org) {
  const date = new Date().toLocaleDateString('ru-RU');
  const requests = org.requests ?? [];
  const counts = { 'Новое': 0, 'В работе': 0, 'Выполнено': 0 };
  requests.forEach((r) => { if (r.status in counts) counts[r.status]++; });
  const rows = requests.map((r) =>
    `<tr><td>${r.type ?? r.category ?? '—'}</td><td>${r.address ?? '—'}</td><td>${r.date ?? '—'}</td><td>${r.status ?? '—'}</td></tr>`
  ).join('');
  return `<div class="hdr"><h1>${org.legalShortName}</h1><p>ИНН ${org.taxId} &nbsp;·&nbsp; Лицензия ${org.licenseNumber}</p><p>${org.legalAddress}</p></div>
<div class="ttl"><h2>Сводка обращений жителей</h2><p>Дата формирования: ${date}</p></div>
<h3>Статистика</h3><table><tbody><tr><td><b>Всего обращений</b></td><td>${requests.length}</td></tr><tr><td><b>Новые</b></td><td>${counts['Новое']}</td></tr><tr><td><b>В работе</b></td><td>${counts['В работе']}</td></tr><tr><td><b>Выполнено</b></td><td>${counts['Выполнено']}</td></tr></tbody></table>
${rows ? `<h3>Список обращений</h3><table><thead><tr><th>Тип</th><th>Адрес</th><th>Дата</th><th>Статус</th></tr></thead><tbody>${rows}</tbody></table>` : ''}
<div class="ftr">ЖКУ Контроль · ${org.legalShortName} · ${date}</div>`;
}

function niceMax(value) {
  if (value <= 0) return 10000;
  const mag = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / mag;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * mag;
}

function formatYLabel(value) {
  if (value === 0) return '0';
  if (value >= 1_000_000) return new Intl.NumberFormat('ru-RU').format(value);
  return new Intl.NumberFormat('ru-RU').format(value);
}

function ReceiptsBarChart({ data }) {
  const TICKS = 4;
  const maxRaw = Math.max(...data.map((d) => Math.max(d.paid, d.unpaid)), 1);
  const top = niceMax(maxRaw);
  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => Math.round((top / TICKS) * i));

  return (
    <div className="receipts-chart">
      <div className="receipts-chart-y">
        {[...ticks].reverse().map((t) => (
          <span key={t}>{formatYLabel(t)}</span>
        ))}
      </div>
      <div className="receipts-chart-main">
        <div className="receipts-chart-bars">
          {ticks.slice(1).map((t) => (
            <div
              key={t}
              className="receipts-chart-gridline"
              style={{ bottom: `${(t / top) * 100}%` }}
            />
          ))}
          {data.map((d) => (
            <div key={d.key} className="receipts-chart-col">
              <span
                className="receipts-bar paid-bar"
                style={{ height: `${Math.max((d.paid / top) * 100, d.paid > 0 ? 3 : 0)}%` }}
              />
              <span
                className="receipts-bar unpaid-bar"
                style={{ height: `${Math.max((d.unpaid / top) * 100, 4)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="receipts-chart-x">
          {data.map((d) => (
            <div key={d.key} className="receipts-chart-x-label">
              {d.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PICKER_MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const PICKER_DAYS = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'];

function DateRangePicker({ rangeStart, rangeEnd, onApply }) {
  const [draftStart, setDraftStart] = useState(rangeStart);
  const [draftEnd, setDraftEnd] = useState(rangeEnd);
  const [clicking, setClicking] = useState(false);
  const [hoverISO, setHoverISO] = useState(null);
  const [viewYear, setViewYear] = useState(() => new Date(rangeEnd || new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date(rangeEnd || new Date()).getMonth());

  const toISO = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startOffset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const cells = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const dayISO = (day) => toISO(viewYear, viewMonth, day);

  const handleDayClick = (day) => {
    if (!day) return;
    const iso = dayISO(day);
    if (!clicking) {
      setDraftStart(iso);
      setDraftEnd(iso);
      setClicking(true);
    } else {
      if (iso < draftStart) {
        setDraftEnd(draftStart);
        setDraftStart(iso);
      } else {
        setDraftEnd(iso);
      }
      setClicking(false);
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const fmt = (iso) => {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
  };

  const applyDays = (days) => {
    const now = new Date();
    const end = toISO(now.getFullYear(), now.getMonth(), now.getDate());
    const s = new Date(now); s.setDate(s.getDate() - (days - 1));
    const start = toISO(s.getFullYear(), s.getMonth(), s.getDate());
    setDraftStart(start); setDraftEnd(end); setClicking(false);
    setViewYear(s.getFullYear()); setViewMonth(s.getMonth());
  };

  const applyMonths = (months) => {
    const now = new Date();
    const end = toISO(now.getFullYear(), now.getMonth(), now.getDate());
    const s = new Date(now); s.setMonth(s.getMonth() - (months - 1));
    const start = toISO(s.getFullYear(), s.getMonth(), 1);
    setDraftStart(start); setDraftEnd(end); setClicking(false);
    setViewYear(s.getFullYear()); setViewMonth(s.getMonth());
  };

  return (
    <div className="date-picker-popup">
      <div className="date-picker-left">
        <div className="date-picker-nav">
          <button type="button" onClick={prevMonth}>‹</button>
          <strong>{PICKER_MONTHS[viewMonth]} {viewYear}</strong>
          <button type="button" onClick={nextMonth}>›</button>
        </div>
        <div className="date-picker-grid" onMouseLeave={() => setHoverISO(null)}>
          {PICKER_DAYS.map((d, i) => (
            <span key={d} className={`date-picker-weekday${i >= 5 ? ' weekend' : ''}`}>{d}</span>
          ))}
          {cells.map((day, i) => {
            if (!day) return <span key={`e${i}`} className="date-picker-day empty" />;
            const iso = dayISO(day);
            const effStart = clicking && hoverISO
              ? (hoverISO < draftStart ? hoverISO : draftStart)
              : draftStart;
            const effEnd = clicking && hoverISO
              ? (hoverISO >= draftStart ? hoverISO : draftStart)
              : draftEnd;
            const isS = iso === effStart;
            const isE = iso === effEnd;
            const inRange = iso > effStart && iso < effEnd;
            return (
              <span
                key={day}
                className={[
                  'date-picker-day',
                  isS && !isE ? 'range-start' : '',
                  isE && !isS ? 'range-end' : '',
                  isS && isE ? 'range-single' : '',
                  inRange ? 'in-range' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => clicking && setHoverISO(iso)}
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>
      <div className="date-picker-right">
        <button type="button" className="date-preset-btn" onClick={() => applyDays(7)}>Неделя</button>
        <button type="button" className="date-preset-btn" onClick={() => applyDays(14)}>2 недели</button>
        <button type="button" className="date-preset-btn" onClick={() => applyMonths(1)}>Месяц</button>
        <button type="button" className="date-preset-btn" onClick={() => applyMonths(3)}>Квартал</button>
        <div className="date-picker-fields">
          <div className="date-picker-field">
            <span>Начало периода</span>
            <strong>{fmt(draftStart)}</strong>
          </div>
          <div className="date-picker-field">
            <span>Конец периода</span>
            <strong>{fmt(draftEnd)}</strong>
          </div>
        </div>
        <button
          type="button"
          className="ghost-button"
          onClick={() => { setDraftStart(rangeStart); setDraftEnd(rangeEnd); setClicking(false); }}
        >
          Сбросить
        </button>
        <button type="button" className="wide-button picker-save-btn" onClick={() => onApply(draftStart, draftEnd)}>
          Сохранить
        </button>
      </div>
    </div>
  );
}

function ChartSummaryPanel({ paid, unpaid, debtors }) {
  const total = paid + unpaid;
  const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;
  const unpaidPct = total > 0 ? Math.round((unpaid / total) * 100) : 0;

  return (
    <div className="chart-summary">
      {[
        { label: 'Оплачено', color: 'green', pct: paidPct, value: formatMoney(paid) },
        { label: 'Неоплачено', color: 'red', pct: unpaidPct, value: formatMoney(unpaid) },
      ].map((row) => (
        <div className="chart-summary-row" key={row.label}>
          <span className={`chart-summary-label color-${row.color}`}>{row.label}</span>
          <span className="chart-summary-pct">{row.pct}%</span>
          <div className="chart-summary-bar">
            <div className={`chart-summary-bar-fill fill-${row.color}`} style={{ width: `${row.pct}%` }} />
          </div>
          <span className="chart-summary-value">{row.value}</span>
        </div>
      ))}
      <div className="chart-summary-row chart-summary-debtors">
        <span className="chart-summary-label color-muted">Должников</span>
        <span className="chart-summary-value">{debtors} чел.</span>
      </div>
    </div>
  );
}

export function CompanyStatisticsPage() {
  const { store, organization, companyStats } = useOutletContext();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('overview');
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);
  const [objectFilter, setObjectFilter] = useState(() => {
    const scope = searchParams.get('scope');
    const value = searchParams.get('value');
    if (scope === 'house' && value) return `house:${decodeURIComponent(value)}`;
    return 'all';
  });

  const [rangeEnd, setRangeEnd] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [rangeStart, setRangeStart] = useState(() => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });

  useEffect(() => {
    if (!pickerOpen) return;
    const handle = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [pickerOpen]);

  const fmtDate = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
  };

  const filteredReceipts = (() => {
    if (objectFilter === 'all') return store.receipts;
    const colon = objectFilter.indexOf(':');
    const houseAddress = objectFilter.slice(colon + 1);
    const accountIds = new Set(
      store.accounts.filter((a) => a.address === houseAddress).map((a) => a.id),
    );
    return accountIds.size > 0 ? store.receipts.filter((r) => accountIds.has(r.accountId)) : store.receipts;
  })();

  const filteredSummary = buildReceiptSummary(filteredReceipts);

  const filteredDebtors = (() => {
    if (objectFilter === 'all') return companyStats.debtors;
    const colon = objectFilter.indexOf(':');
    const houseAddress = objectFilter.slice(colon + 1);
    const house = organization.houses.find((h) => h.address === houseAddress);
    return house?.debtors ?? 0;
  })();

  const byService = getReportServices().map(([code]) => {
    const serviceReceipts = filteredReceipts.filter((item) => item.service === code);
    return {
      code,
      paid: serviceReceipts.filter((item) => item.status === 'paid').length,
      unpaid: serviceReceipts.filter((item) => item.status === 'unpaid').length,
      amount: serviceReceipts.reduce((sum, item) => sum + item.amount, 0),
    };
  });

  const chartData = (() => {
    const start = new Date(rangeStart);
    const endD = new Date(rangeEnd);
    const months = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(endD.getFullYear(), endD.getMonth(), 1);
    while (cur <= endMonth && months.length < 13) {
      const key = makeMonthKey(cur.getFullYear(), cur.getMonth());
      const receipts = filteredReceipts.filter((r) => getReceiptPeriodKey(r.period) === key);
      months.push({
        key,
        label: monthShortNames[cur.getMonth()],
        paid: receipts.filter((r) => r.status === 'paid').reduce((s, r) => s + r.amount, 0),
        unpaid: receipts.filter((r) => r.status === 'unpaid').reduce((s, r) => s + r.amount, 0),
      });
      cur.setMonth(cur.getMonth() + 1);
    }
    return months;
  })();

  const chartTotalPaid = chartData.reduce((s, d) => s + d.paid, 0);
  const chartTotalUnpaid = chartData.reduce((s, d) => s + d.unpaid, 0);

  return (
    <>
      <PageTitle title="Оплаты, долги и выгрузки">
        Сводка для администратора {organization.legalShortName}.
      </PageTitle>

      <div className="stats-filter-row">
        <div className="mode-switch">
          <button
            className={mode === 'overview' ? 'active' : ''}
            type="button"
            onClick={() => setMode('overview')}
          >
            Общая статистика
          </button>
          <button
            className={mode === 'chart' ? 'active' : ''}
            type="button"
            onClick={() => setMode('chart')}
          >
            График
          </button>
        </div>
        <label className="object-filter-label">
          Объект
          <select value={objectFilter} onChange={(e) => setObjectFilter(e.target.value)}>
            <option value="all">Все объекты</option>
            {organization.houses.map((house) => (
              <option key={house.id} value={`house:${house.address}`}>
                {house.address}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mode === 'overview' ? (
        <section className="stats-grid">
          <StatCard icon={CheckCircle2} label="Оплачено" value={formatMoney(filteredSummary.paidAmount)} tone="success" />
          <StatCard icon={AlertCircle} label="Не оплачено" value={formatMoney(filteredSummary.unpaidAmount)} tone="danger" />
          <StatCard icon={Users} label="Должников" value={filteredDebtors} />
        </section>
      ) : (
        <section className="work-panel chart-panel">
          <div className="panel-heading-row">
            <h2>График оплат по месяцам</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                className="export-fmt-btn pdf"
                onClick={() => exportChartPDF('Отчет по оплатам', buildChartReportHTML(organization, rangeStart, rangeEnd, chartData))}
              >
                <FileText size={13} /> PDF
              </button>
              <button
                type="button"
                className="export-fmt-btn word"
                onClick={() => exportChartWord('Отчет по оплатам', buildChartReportHTML(organization, rangeStart, rangeEnd, chartData), 'otchet-po-oplatam')}
              >
                <FileSpreadsheet size={13} /> Word
              </button>
              <div className="date-range-trigger-wrap" ref={pickerRef}>
              <button
                className="date-range-trigger"
                type="button"
                onClick={() => setPickerOpen((o) => !o)}
              >
                <span>{fmtDate(rangeStart)} — {fmtDate(rangeEnd)}</span>
                <CalendarDays size={16} />
              </button>
              {pickerOpen && (
                <DateRangePicker
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  onApply={(s, e) => { setRangeStart(s); setRangeEnd(e); setPickerOpen(false); }}
                />
              )}
            </div>
            </div>
          </div>
          <div className="chart-with-summary">
            <ChartSummaryPanel paid={chartTotalPaid} unpaid={chartTotalUnpaid} debtors={filteredDebtors} />
            <div className="chart-summary-right">
              <ReceiptsBarChart data={chartData} />
              <div className="chart-legend">
                <span className="chart-legend-paid">■ Оплачено</span>
                <span className="chart-legend-unpaid">■ Задолженность</span>
                <span className="chart-period-label">{fmtDate(rangeStart)} — {fmtDate(rangeEnd)}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="employee-grid">
        <div className="work-panel">
          <h2>По услугам</h2>
          <div className="service-table">
            {byService.map((item) => (
              <div key={item.code}>
                <ServiceBadge service={item.code} />
                <span>{formatMoney(item.amount)}</span>
                <strong>{item.unpaid} не оплачено</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="work-panel" style={{ alignSelf: 'start' }}>
          <h2>Выгрузки</h2>
          <div className="export-doc-list">
            {[
              {
                id: 'payments-report',
                icon: FileSpreadsheet,
                title: 'Отчет по оплатам',
                desc: 'График оплат и задолженности за выбранный период',
                pdf: () => exportChartPDF('Отчет по оплатам', buildChartReportHTML(organization, rangeStart, rangeEnd, chartData)),
                word: () => exportChartWord('Отчет по оплатам', buildChartReportHTML(organization, rangeStart, rangeEnd, chartData), 'otchet-po-oplatam'),
              },
              {
                id: 'debtors',
                icon: AlertCircle,
                title: 'Реестр должников',
                desc: 'Неоплаченные квитанции по выбранному объекту',
                pdf: () => exportChartPDF('Реестр должников', buildDebtorsReportHTML(organization, filteredReceipts, store.accounts)),
                word: () => exportChartWord('Реестр должников', buildDebtorsReportHTML(organization, filteredReceipts, store.accounts), 'reestr-dolzhnikov'),
              },
              {
                id: 'requests',
                icon: ClipboardList,
                title: 'Сводка обращений',
                desc: 'Статистика и список обращений жителей',
                pdf: () => exportChartPDF('Сводка обращений', buildRequestsReportHTML(organization)),
                word: () => exportChartWord('Сводка обращений', buildRequestsReportHTML(organization), 'svodka-obrashcheniy'),
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
    </>
  );
}
