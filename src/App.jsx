// C:\meu_projeto_financas\frontend\src\App.jsx

import React, { useState, useEffect } from 'react'; // <<< CORREÇÃO AQUI
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaHome, FaListAlt, FaChartPie, FaChartLine, FaDollarSign, FaBars, FaTags } from 'react-icons/fa';

import DashboardPage from './pages/DashboardPage';
import TransacoesPage from './pages/transacoesPage';
import AnalisesPage from './pages/AnalisesPage';
import ProjecoesPage from './pages/ProjecoesPage';
import MetasPage from './pages/MetasPage';
import CategoriasPage from './pages/CategoriasPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const location = useLocation();
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarVisible(false);
    }
  }, [location]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="flex min-h-screen bg-gray-100">
        <aside
          className={`
            bg-gray-800 text-white flex flex-col z-50 shadow-lg
            transition-all duration-300 ease-in-out
            fixed inset-y-0 left-0 transform lg:relative lg:translate-x-0
            ${isSidebarVisible ? 'translate-x-0 lg:w-64' : '-translate-x-full lg:w-0'}
            overflow-hidden
          `}
        >
          <div className="p-4 text-center text-2xl font-bold border-b border-gray-700 min-w-max">
            Finanças Pessoais
          </div>
          <nav className="flex-grow p-4 min-w-max">
            <ul>
              <li className="mb-2"><Link to="/" className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700"><FaHome className="mr-3" /> Dashboard</Link></li>
              <li className="mb-2"><Link to="/transacoes" className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700"><FaListAlt className="mr-3" /> Transações</Link></li>
              <li className="mb-2"><Link to="/analises" className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700"><FaChartPie className="mr-3" /> Análises</Link></li>
              <li className="mb-2"><Link to="/projecoes" className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700"><FaChartLine className="mr-3" /> Projeções</Link></li>
              <li className="mb-2"><Link to="/metas" className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700"><FaDollarSign className="mr-3" /> Metas</Link></li>
              <li className="mb-2"><Link to="/categorias" className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700"><FaTags className="mr-3" /> Categorias</Link></li>
            </ul>
          </nav>
        </aside>

        {isSidebarVisible && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarVisible(false)}
          ></div>
        )}

        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-md p-4 flex items-center">
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="text-gray-700 focus:outline-none p-2 rounded-full hover:bg-gray-200 transition-colors"
              title={isSidebarVisible ? "Ocultar Menu" : "Mostrar Menu"}
            >
              <FaBars className="text-2xl" />
            </button>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transacoes" element={<TransacoesPage />} />
              <Route path="/analises" element={<AnalisesPage />} />
              <Route path="/projecoes" element={<ProjecoesPage />} />
              <Route path="/metas" element={<MetasPage />} />
              <Route path="/categorias" element={<CategoriasPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;