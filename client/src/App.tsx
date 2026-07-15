import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import InvoiceList from './pages/invoices/InvoiceList'
import InvoiceCreate from './pages/invoices/InvoiceCreate'
import InvoiceDetail from './pages/invoices/InvoiceDetail'
import BillList from './pages/bills/BillList'
import BillCreate from './pages/bills/BillCreate'
import BillDetail from './pages/bills/BillDetail'
import ProductList from './pages/inventory/ProductList'
import ShipmentList from './pages/inventory/ShipmentList'
import ShipmentCreate from './pages/inventory/ShipmentCreate'
import CustomerList from './pages/customers/CustomerList'
import CustomerDetail from './pages/customers/CustomerDetail'
import Ledger from './pages/accounts/Ledger'
import Reports from './pages/reports/Reports'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invoices" element={<InvoiceList />} />
        <Route path="/invoices/new" element={<InvoiceCreate />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/bills" element={<BillList />} />
        <Route path="/bills/new" element={<BillCreate />} />
        <Route path="/bills/:id" element={<BillDetail />} />
        <Route path="/inventory" element={<ProductList />} />
        <Route path="/inventory/shipments" element={<ShipmentList />} />
        <Route path="/inventory/shipments/new" element={<ShipmentCreate />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/accounts" element={<Ledger />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
