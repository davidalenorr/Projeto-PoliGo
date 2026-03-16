import { Navigate, Route, Routes } from 'react-router-dom'
import ShellLayout from './layouts/ShellLayout'
import HomePage from './pages/HomePage'
import HubPage from './pages/HubPage'
import LabPage from './pages/LabPage'

function App() {
  return (
    <Routes>
      <Route element={<ShellLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/hub" element={<HubPage />} />
        <Route path="/laboratorio" element={<LabPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
