import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { RequireAdmin } from './components/RequireAdmin.jsx'
import { RequireAuth } from './components/RequireAuth.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { BlogPage } from './pages/BlogPage.jsx'
import { EventsPage } from './pages/EventsPage.jsx'
import { GalleryPage } from './pages/GalleryPage.jsx'
import { ProfilePage } from './pages/ProfilePage.jsx'
import { SignInPage } from './pages/SignInPage.jsx'
import { SetupPage } from './pages/SetupPage.jsx'
import { FundsPage } from './pages/admin/FundsPage.jsx'
import { PlayerProfilesPage } from './pages/admin/PlayerProfilesPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/setup" element={<SetupPage />} />

        <Route
          path="/me"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/funds"
          element={
            <RequireAdmin>
              <FundsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/players"
          element={
            <RequireAdmin>
              <PlayerProfilesPage />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
