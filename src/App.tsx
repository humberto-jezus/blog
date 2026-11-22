/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';

const Home = lazy(() => import('./pages/Home'));
const Articles = lazy(() => import('./pages/Articles'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminPostEditor = lazy(() => import('./pages/AdminPostEditor'));
const AdminPages = lazy(() => import('./pages/AdminPages'));
const AdminPageEditor = lazy(() => import('./pages/AdminPageEditor'));
const CustomPage = lazy(() => import('./pages/CustomPage'));

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#faf9f8]">
    <div className="animate-pulse text-[#0067b8] font-semibold">Carregando...</div>
  </div>
);

export default function App() {

  return (
    <AuthProvider>
      <I18nProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-[#f8f9fa] font-sans text-[#242424] overflow-x-hidden">
            <Header />
            <main className="flex-grow">
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/post/:id" element={<PostDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/p/:slug" element={<CustomPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/new" element={<AdminPostEditor />} />
                  <Route path="/admin/edit/:id" element={<AdminPostEditor />} />
                  <Route path="/admin/pages" element={<AdminPages />} />
                  <Route path="/admin/pages/new" element={<AdminPageEditor />} />
                  <Route path="/admin/pages/edit/:id" element={<AdminPageEditor />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </Router>
      </I18nProvider>
    </AuthProvider>
  );
}
