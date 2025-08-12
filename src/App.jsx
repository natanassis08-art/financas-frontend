// C:\meu_projeto_financas\frontend\src\App.jsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
  // O estado agora controla a visibilidade em todas as telas. Começa visível (true).
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <Router>
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
        {/* === SIDEBAR MODIFICADO === */}
        <aside
          className={`
            bg-gray-800 text-white flex flex-col z-50 shadow-lg
            transition-all duration-300 ease-in-out
            
            ${isSidebarVisible ? 'w-64' : 'w-0'}
            
            lg:relative lg:translate-x-0 
            
            ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}
            fixed inset-y-0 left-0 transform 
            
            overflow-hidden 
          `}
        >
          <div className="p-4 text-center text-2xl font-bold border-b border-gray-700 min-w-max">
            Finanças Pessoais
          </div>
          <nav className="flex-grow p-4 min-w-max">
            <ul>
              <li className="mb-2">
                <Link to="/" className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200">
                  <FaHome className="mr-3" /> Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/transacoes" className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200">
                  <FaListAlt className="mr-3" /> Transações
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/analises" className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200">
                  <FaChartPie className="mr-3" /> Análises
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/projecoes" className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200">
                  <FaChartLine className="mr-3" /> Projeções
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/metas" className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200">
                  <FaDollarSign className="mr-3" /> Metas
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/categorias" className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200">
                  <FaTags className="mr-3" /> Categorias
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* === CONTEÚDO PRINCIPAL MODIFICADO === */}
        <div className="flex-1 flex flex-col">
          {/* Header agora tem o botão para todas as telas */}
          <header className="bg-white shadow-md p-4 flex items-center">
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="text-gray-700 focus:outline-none p-2 rounded-full hover:bg-gray-200 transition-colors"
              title={isSidebarVisible ? "Ocultar Menu" : "Mostrar Menu"}
            >
              <FaBars className="text-2xl" />
            </button>
            {/* Você pode adicionar outros itens no header aqui, como o nome do usuário, etc. */}
          </header>

          {/* Conteúdo das Rotas */}
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
    </Router>
  );
}

export default App;