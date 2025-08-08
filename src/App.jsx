// C:\meu_projeto_financas\frontend\src\App.jsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// Adicione FaTags aqui para o ícone de categorias na sidebar
import { FaHome, FaListAlt, FaChartPie, FaChartLine, FaPlus, FaDollarSign, FaBars, FaTags } from 'react-icons/fa'; 

import DashboardPage from './pages/DashboardPage';
import TransacoesPage from './pages/transacoesPage';
import AnalisesPage from './pages/AnalisesPage';
import ProjecoesPage from './pages/ProjecoesPage';
import MetasPage from './pages/MetasPage';
import CategoriasPage from './pages/CategoriasPage'; // <<< NOVA IMPORTAÇÃO AQUI


// Certifique-se de que não há placeholders para as páginas já implementadas.
// DashboardPage, TransacoesPage, AnalisesPage, ProjecoesPage, MetasPage já foram removidas acima.


function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out
            w-64 bg-gray-800 text-white flex flex-col z-50 shadow-lg`}
        >
          <div className="p-4 text-center text-2xl font-bold border-b border-gray-700">
            Finanças Pessoais
          </div>
          <nav className="flex-grow p-4">
            <ul>
              <li className="mb-2">
                <Link
                  to="/"
                  className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <FaHome className="mr-3" /> Dashboard
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/transacoes"
                  className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <FaListAlt className="mr-3" /> Transações
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/analises"
                  className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <FaChartPie className="mr-3" /> Análises
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/projecoes"
                  className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <FaChartLine className="mr-3" /> Projeções
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/metas"
                  className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <FaDollarSign className="mr-3" /> Metas
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/categorias"
                  className="flex items-center p-3 rounded-lg text-lg hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <FaTags className="mr-3" /> Categorias {/* <<< NOVA LINHA AQUI */}
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-md p-4 flex items-center justify-between lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-700 focus:outline-none"
            >
              <FaBars className="text-2xl" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Finanças Pessoais</h1>
            <div>{/* Espaço para alinhar */}</div>
          </header>

          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

          {/* Conteúdo das Rotas */}
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transacoes" element={<TransacoesPage />} />
              <Route path="/analises" element={<AnalisesPage />} />
              <Route path="/projecoes" element={<ProjecoesPage />} />
              <Route path="/metas" element={<MetasPage />} />
              <Route path="/categorias" element={<CategoriasPage />} /> {/* <<< NOVA ROTA AQUI */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;