import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SESSION_KEY, STORE_KEY, THEME_KEY } from './config.js';
import { fetchRemoteStore, saveRemoteStore } from './api.js';
import { AuthPage, HomePage, InfoPage, PartnerPage, PrivacyPage } from './pages/PublicPages.jsx';
import { ErrorBoundary, RequireRole, SettingsPage } from './components/shared.jsx';
import { PayerDashboard, PayerLayout, PaymentPage, ProfilePage, ReceiptDetailPage, ReceiptsPage } from './features/payer.jsx';
import {
  AccountantAccrualsPage,
  AccountantDocumentsPage,
  AccountantPaymentsPage,
  AccountantReportsPage,
  EmployeeDashboard,
  EmployeeLayout,
  EmployeeRequestsPage,
} from './features/employee.jsx';
import { CompanyAdminDashboard, CompanyAdminLayout, CompanyEmployeesPage, CompanyObjectsPage, CompanyRegistryPage, CompanyStatisticsPage } from './features/companyAdmin.jsx';
import { buildCompanyFromApplication, ensureDemoData, getOrganizations, loadSession, loadStore, loadTheme, today } from './utils.js';

export default function App() {
  const [store, setStore] = useState(loadStore);
  const [session, setSession] = useState(loadSession);
  const [theme, setTheme] = useState(loadTheme);
  const [remoteReady, setRemoteReady] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchRemoteStore()
      .then((remoteStore) => {
        if (!alive) {
          return;
        }

        setStore(ensureDemoData(remoteStore));
        setRemoteReady(true);
      })
      .catch(() => {
        setRemoteReady(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));

    if (!remoteReady) {
      return undefined;
    }

    const syncTimer = window.setTimeout(() => {
      saveRemoteStore(store).catch(() => {
        setRemoteReady(false);
      });
    }, 300);

    return () => window.clearTimeout(syncTimer);
  }, [store, remoteReady]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const currentUser = useMemo(
    () => store.users.find((item) => item.id === session?.userId) ?? null,
    [session, store.users],
  );

  const login = (email, password, role) => {
    const user = store.users.find(
      (item) => item.email === email.trim() && item.password === password && item.role === role,
    );

    if (!user) {
      return { ok: false, message: 'Проверьте почту, пароль и выбранную роль.' };
    }

    setSession({ userId: user.id, role: user.role });
    return { ok: true };
  };

  const registerPayer = ({ name, email, password, accountNumber, phone }) => {
    if (!email || !password || !accountNumber) {
      return { ok: false, message: 'Заполните почту, пароль и лицевой счет.' };
    }

    if (store.users.some((item) => item.email === email.trim())) {
      return { ok: false, message: 'Пользователь с такой почтой уже есть.' };
    }

    const account =
      store.accounts.find((item) => item.number === accountNumber.trim()) ?? {
        id: `acc-${Date.now()}`,
        number: accountNumber.trim(),
        ownerName: name.trim() || 'Новый плательщик',
        address: 'Адрес будет уточнен',
      };

    const user = {
      id: `payer-${Date.now()}`,
      role: 'payer',
      name: name.trim() || 'Новый плательщик',
      email: email.trim(),
      password,
      phone,
      accountId: account.id,
    };

    setStore((current) => ({
      ...current,
      accounts: current.accounts.some((item) => item.id === account.id)
        ? current.accounts
        : [...current.accounts, account],
      users: [...current.users, user],
    }));
    setSession({ userId: user.id, role: user.role });

    return { ok: true };
  };

  const approvePartnerApplication = (application) => {
    const orgId = application.id ?? `org-${Date.now()}`;
    const adminId = `company-admin-${Date.now()}`;
    const organization = buildCompanyFromApplication(application, orgId);
    const adminUser = {
      id: adminId,
      role: 'companyAdmin',
      orgId,
      name: application.ownerName || 'Администратор компании',
      email: application.ownerEmail || 'owner@company.ru',
      password: 'demo',
      phone: application.ownerPhone || '',
    };

    setStore((current) => ({
      ...current,
      organizations: [
        ...(current.organizations ?? []).filter((item) => item.id !== orgId),
        organization,
      ],
      users: [
        ...current.users.filter((item) => item.email !== adminUser.email || item.role !== 'companyAdmin'),
        adminUser,
      ],
    }));
    setSession({ userId: adminId, role: 'companyAdmin' });
    return { ok: true, orgId };
  };

  const logout = () => setSession(null);

  const updateProfile = (patch) => {
    if (!currentUser) {
      return;
    }

    setStore((current) => ({
      ...current,
      users: current.users.map((item) =>
        item.id === currentUser.id ? { ...item, ...patch } : item,
      ),
    }));
  };

  const updateCompanyEmployeeRole = (orgId, employeeId, role) => {
    setStore((current) => ({
      ...current,
      organizations: getOrganizations(current).map((organization) =>
        organization.id === orgId
          ? {
              ...organization,
              employees: organization.employees.map((employee) =>
                employee.id === employeeId ? { ...employee, role } : employee,
              ),
            }
          : organization,
      ),
    }));
  };

  const addCompanyEmployee = (orgId, employee) => {
    const email = employee.email.trim();
    if (!email) {
      return;
    }

    setStore((current) => ({
      ...current,
      organizations: getOrganizations(current).map((organization) =>
        organization.id === orgId
          ? {
              ...organization,
              employees: [
                ...organization.employees,
                {
                  id: `staff-${Date.now()}`,
                  name: email.split('@')[0],
                  email,
                  phone: '',
                  role: employee.role,
                  status: 'Ожидает приглашение',
                },
              ],
            }
          : organization,
      ),
    }));
  };

  const removeCompanyEmployee = (orgId, employeeId) => {
    setStore((current) => ({
      ...current,
      organizations: getOrganizations(current).map((organization) =>
        organization.id === orgId
          ? {
              ...organization,
              employees: organization.employees.filter((employee) => employee.id !== employeeId),
            }
          : organization,
      ),
    }));
  };

  const payReceipt = (receiptId, method) => {
    const receipt = store.receipts.find((item) => item.id === receiptId);
    if (!receipt) {
      return;
    }

    const payment = {
      id: `pay-${Date.now()}`,
      receiptId,
      method,
      paidAt: today(),
      amount: receipt.amount,
    };

    setStore((current) => ({
      ...current,
      receipts: current.receipts.map((item) =>
        item.id === receiptId
          ? { ...item, status: 'paid', paidAt: payment.paidAt, method }
          : item,
      ),
      payments: [...current.payments, payment],
    }));
  };

  return (
    <ErrorBoundary>
    <Routes>
      <Route path="/" element={<HomePage store={store} user={currentUser} onLogout={logout} />} />
      <Route path="/about" element={<InfoPage user={currentUser} onLogout={logout} />} />
      <Route path="/privacy" element={<PrivacyPage user={currentUser} onLogout={logout} />} />
      <Route
        path="/partner"
        element={
          <PartnerPage
            user={currentUser}
            onLogout={logout}
            approvePartnerApplication={approvePartnerApplication}
          />
        }
      />
      <Route
        path="/auth"
        element={
          <AuthPage
            user={currentUser}
            login={login}
            registerPayer={registerPayer}
            onLogout={logout}
          />
        }
      />
      <Route
        path="/app"
        element={
          <RequireRole user={currentUser} role="payer">
            <PayerLayout
              user={currentUser}
              store={store}
              logout={logout}
              updateProfile={updateProfile}
              payReceipt={payReceipt}
              theme={theme}
              setTheme={setTheme}
            />
          </RequireRole>
        }
      >
        <Route index element={<PayerDashboard />} />
        <Route path="receipts" element={<ReceiptsPage />} />
        <Route path="receipts/:receiptId" element={<ReceiptDetailPage />} />
        <Route path="pay" element={<PaymentPage />} />
        <Route path="pay/:receiptId" element={<PaymentPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage scope="кабинета плательщика" />} />
      </Route>
      <Route
        path="/employee"
        element={
          <RequireRole user={currentUser} role="employee">
            <EmployeeLayout
              user={currentUser}
              store={store}
              logout={logout}
              updateProfile={updateProfile}
              theme={theme}
              setTheme={setTheme}
            />
          </RequireRole>
        }
      >
        <Route index element={<EmployeeDashboard />} />
        <Route path="requests" element={<EmployeeRequestsPage />} />
        <Route path="accruals" element={<AccountantAccrualsPage />} />
        <Route path="payments" element={<AccountantPaymentsPage />} />
        <Route path="statistics" element={<CompanyStatisticsPage />} />
        <Route path="objects" element={<CompanyObjectsPage />} />
        <Route path="documents" element={<AccountantDocumentsPage />} />
        <Route path="reports" element={<AccountantReportsPage />} />
        <Route path="settings" element={<SettingsPage scope="служебного кабинета" />} />
      </Route>
      <Route
        path="/company-admin"
        element={
          <RequireRole user={currentUser} role="companyAdmin">
            <CompanyAdminLayout
              user={currentUser}
              store={store}
              logout={logout}
              updateProfile={updateProfile}
              theme={theme}
              setTheme={setTheme}
              updateCompanyEmployeeRole={updateCompanyEmployeeRole}
              addCompanyEmployee={addCompanyEmployee}
              removeCompanyEmployee={removeCompanyEmployee}
            />
          </RequireRole>
        }
      >
        <Route index element={<CompanyAdminDashboard />} />
        <Route path="company" element={<CompanyRegistryPage />} />
        <Route path="employees" element={<CompanyEmployeesPage />} />
        <Route path="objects" element={<CompanyObjectsPage />} />
        <Route path="statistics" element={<CompanyStatisticsPage />} />
        <Route path="settings" element={<SettingsPage scope="кабинета администратора компании" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ErrorBoundary>
  );
}
