// C:\meu_projeto_financas\frontend\src\pages\TransacoesPage.jsx

import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSearch, FaTimesCircle, FaArrowUp, FaArrowDown, FaMoneyBillAlt, FaListAlt } from 'react-icons/fa';
import TransacaoFormModal from '../components/TransacaoFormModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Função auxiliar para formatar a data para YYYY-MM-DD
// Adicionada aqui para consistência. Em um projeto maior, moveria para um arquivo de utilitários.
const formatDateToYYYYMMDD = (dateString) => {
  if (!dateString) return '';
  // Cria um objeto Date usando a string e forçando 00:00:00 para evitar problemas de fuso horário
  // ao converter de volta para data local em `input type="date"`
  const date = new Date(dateString + 'T00:00:00');
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function TransacoesPage() {
  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transacaoToEdit, setTransacaoToEdit] = useState(null);

  // Inicialize os filtros de data com a função de formatação
  const [descricaoFilter, setDescricaoFilter] = useState('');
  const [valorMinFilter, setValorMinFilter] = useState('');
  const [valorMaxFilter, setValorMaxFilter] = useState('');
  const [dataInicioFilter, setDataInicioFilter] = useState(''); // Não inicializar com data atual aqui
  const [dataFimFilter, setDataFimFilter] = useState('');     // para que os campos de filtro fiquem vazios por padrão
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [allCategories, setAllCategories] = useState([]);

  const fetchTransacoesAndCategorias = async () => {
    try {
      setLoading(true);
      setError(null);

      const categoriasResponse = await fetch(`${API_BASE_URL}/categorias/`);
      if (!categoriasResponse.ok) {
        throw new Error(`HTTP error! status: ${categoriasResponse.status}`);
      }
      const categoriasData = await categoriasResponse.json();
      const categoriasMap = {};
      categoriasData.forEach(cat => {
        categoriasMap[cat.id] = cat.nome;
      });
      setCategorias(categoriasMap);
      setAllCategories(categoriasData);

      const queryParams = new URLSearchParams();
      if (descricaoFilter) queryParams.append('descricao', descricaoFilter);
      if (valorMinFilter) queryParams.append('valor_min', valorMinFilter);
      if (valorMaxFilter) queryParams.append('valor_max', valorMaxFilter);
      if (dataInicioFilter) queryParams.append('data_inicio', dataInicioFilter);
      if (dataFimFilter) queryParams.append('data_fim', dataFimFilter);
      if (categoriaFilter) queryParams.append('categoria', categoriaFilter);
      if (tipoFilter) queryParams.append('tipo', tipoFilter);
      if (statusFilter) queryParams.append('status', statusFilter);

      const apiUrl = `${API_BASE_URL}/transacoes/?${queryParams.toString()}`;

      const transacoesResponse = await fetch(apiUrl);
      if (!transacoesResponse.ok) {
        throw new Error(`HTTP error! status: ${transacoesResponse.status}`);
      }
      const transacoesData = await transacoesResponse.json();
      setTransacoes(transacoesData);

    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setError("Não foi possível carregar as transações. Verifique a conexão com o servidor ou os parâmetros de filtro.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransacoesAndCategorias();
  }, []);

  const handleApplyFilters = () => {
    fetchTransacoesAndCategorias();
  };

  const handleClearFilters = () => {
    setDescricaoFilter('');
    setValorMinFilter('');
    setValorMaxFilter('');
    setDataInicioFilter('');
    setDataFimFilter('');
    setCategoriaFilter('');
    setTipoFilter('');
    setStatusFilter('');
    // Chame fetchTransacoesAndCategorias() após limpar os filtros
    // ou faça um useEffect que reaja às mudanças dos estados de filtro.
    // Como você já tem um useEffect vazio que será disparado pelo handleApplyFilters,
    // podemos chamar fetchTransacoesAndCategorias diretamente.
    fetchTransacoesAndCategorias();
  };

  const handleAddTransacao = () => {
    setTransacaoToEdit(null);
    setIsModalOpen(true);
  };
  const handleEditTransacao = (transacao) => {
    setTransacaoToEdit(transacao);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTransacaoToEdit(null);
  };
  const handleSaveTransacao = (isEditing) => {
  fetchTransacoesAndCategorias();
  handleCloseModal();
  toast.success(isEditing ? "Transação atualizada com sucesso!" : "Transação adicionada com sucesso!");
};
  const handleDeleteTransacao = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/transacoes/${id}/`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setTransacoes(transacoes.filter(transacao => transacao.id !== id));
toast.success("Transação excluída com sucesso!");

      } catch (err) {
        console.error("Erro ao excluir transação:", err);
        setError("Não foi possível excluir a transação. Tente novamente.");
      }
    }
  };

  const totalReceitaFiltrada = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((sum, t) => sum + parseFloat(t.valor), 0);

  const totalDespesaFiltrada = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((sum, t) => sum + parseFloat(t.valor), 0);

  const quantidadeTransacoes = transacoes.length;

  // Classes de estilo para os inputs e selects nos filtros
  const inputOrSelectFilterClasses = "block w-full px-5 py-3 border border-indigo-300 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-200 ease-in-out bg-white";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-100px)]">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <p className="ml-4 text-xl text-gray-700">Carregando transações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-600 bg-red-100 border border-red-400 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-4xl font-extrabold
               bg-gradient-to-r from-indigo-600 to-purple-700
               bg-clip-text text-transparent tracking-tight leading-none
               drop-shadow-lg flex items-center justify-start">
  <FaListAlt className="mr-4 text-4xl text-indigo-600" /> Gerenciamento de Transações
</h1>
        <button
  onClick={handleAddTransacao}
  className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-lg flex items-center shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
>
  <FaPlus className="mr-2" /> Nova Transação
</button>
      </div>

      {/* SEÇÃO DE FILTROS - DESIGN APRIMORADO COM GRADIENTE E SOMBRAS */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-100 shadow-2xl rounded-xl p-8 mb-8 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b-2 border-indigo-200 pb-4 flex items-center">
          <FaSearch className="mr-3 text-indigo-600" /> Filtrar Transações
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-8">
          {/* Coluna 1: Busca por Texto e Valor */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Texto e Valor</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="descricaoFilter" className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <input
                  type="text"
                  id="descricaoFilter"
                  value={descricaoFilter}
                  onChange={(e) => setDescricaoFilter(e.target.value)}
                  className={inputOrSelectFilterClasses} // Aplicando as classes de filtro
                  placeholder="Buscar por descrição"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="valorMinFilter" className="block text-sm font-semibold text-gray-700 mb-2">Valor Mínimo</label>
                  <input
                    type="number"
                    id="valorMinFilter"
                    value={valorMinFilter}
                    onChange={(e) => setValorMinFilter(e.target.value)}
                    step="0.01"
                    className={inputOrSelectFilterClasses} // Aplicando as classes de filtro
                    placeholder="R$ Mín."
                  />
                </div>
                <div>
                  <label htmlFor="valorMaxFilter" className="block text-sm font-semibold text-gray-700 mb-2">Valor Máximo</label>
                  <input
                    type="number"
                    id="valorMaxFilter"
                    value={valorMaxFilter}
                    onChange={(e) => setValorMaxFilter(e.target.value)}
                    step="0.01"
                    className={inputOrSelectFilterClasses} // Aplicando as classes de filtro
                    placeholder="R$ Máx."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Filtros por Atributos */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Atributos e Datas</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dataInicioFilter" className="block text-sm font-semibold text-gray-700 mb-2">Data Início</label>
                  <input
                    type="date"
                    id="dataInicioFilter"
                    value={dataInicioFilter}
                    onChange={(e) => setDataInicioFilter(e.target.value)}
                    className={inputOrSelectFilterClasses} // Aplicando as classes de filtro
                  />
                </div>
                <div>
                  <label htmlFor="dataFimFilter" className="block text-sm font-semibold text-gray-700 mb-2">Data Fim</label>
                  <input
                    type="date"
                    id="dataFimFilter"
                    value={dataFimFilter}
                    onChange={(e) => setDataFimFilter(e.target.value)}
                    className={inputOrSelectFilterClasses} // Aplicando as classes de filtro
                  />
                </div>
              </div>
              <div>
                <label htmlFor="categoriaFilter" className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                <select
                  id="categoriaFilter"
                  value={categoriaFilter}
                  onChange={(e) => setCategoriaFilter(e.target.value)}
                  className={inputOrSelectFilterClasses} // Aplicando as classes de filtro
                >
                  <option value="">Todas</option>
                  {allCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tipoFilter" className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
                  <select
                    id="tipoFilter"
                    value={tipoFilter}
                    onChange={(e) => setTipoFilter(e.target.value)}
                    className={inputOrSelectFilterClasses} // Aplicando as classes de filtro
                  >
                    <option value="">Todos</option>
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={inputOrSelectFilterClasses} // Aplicando as classes de filtro
                  >
                    <option value="">Todos</option>
                    <option value="pendente">Pendente</option>
                    <option value="pago">Paga</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleClearFilters}
            className="px-8 py-3 border border-gray-300 rounded-lg text-gray-800 font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-md flex items-center transform hover:scale-105"
          >
            <FaTimesCircle className="mr-2 text-gray-500" /> Limpar Filtros
          </button>
          <button
            onClick={handleApplyFilters}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg flex items-center shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            <FaSearch className="mr-2" /> Buscar
          </button>
        </div>
      </div>
      {/* FIM SEÇÃO DE FILTROS */}

      {/* CARD DE RESUMO DOS FILTROS */}
      {quantidadeTransacoes > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-100 shadow-xl rounded-xl p-6 mb-8 border border-emerald-200 grid grid-cols-1 md:grid-cols-2 gap-6 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
          <div className="text-center p-4 bg-white rounded-lg shadow-md transition duration-200 ease-in-out hover:shadow-lg">
            <FaArrowUp className="text-4xl text-emerald-600 mx-auto mb-3" />
            <p className="text-lg font-semibold text-gray-700">Receitas Filtradas</p>
            <p className="text-3xl font-extrabold text-emerald-700">R$ {totalReceitaFiltrada.toFixed(2).replace('.', ',')}</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-md transition duration-200 ease-in-out hover:shadow-lg">
            <FaArrowDown className="text-4xl text-red-600 mx-auto mb-3" />
            <p className="text-lg font-semibold text-gray-700">Despesas Filtradas</p>
            <p className="text-3xl font-extrabold text-red-700">R$ {totalDespesaFiltrada.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      )}
      {/* FIM CARD DE RESUMO */}

      {/* Conteúdo da Tabela de Transações */}
      {transacoes.length === 0 ? (
        <div className="text-center p-6 text-gray-600 bg-white shadow-xl rounded-xl border border-gray-100">
          <p className="text-lg">Nenhuma transação encontrada com os filtros atuais. Tente mudar os filtros ou adicione uma nova transação!</p>
          <button
            onClick={handleAddTransacao}
            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center mx-auto shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            <FaPlus className="mr-2" /> Adicionar Nova Transação
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th scope="col" className="relative px-6 py-3 text-right">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transacoes.map((transacao) => (
                <tr key={transacao.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transacao.descricao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={transacao.tipo === 'despesa' ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                      R$ {parseFloat(transacao.valor).toFixed(2).replace('.', ',')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {/* Alterado para usar a função formatDateToYYYYMMDD para exibir a data corretamente */}
                    {new Date(transacao.data_transacao + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-800">
                    {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transacao.status === 'pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {transacao.status === 'pago' ? 'Paga' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {categorias[transacao.categoria] || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditTransacao(transacao)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3 p-1 rounded-md hover:bg-indigo-50 transition-colors duration-150"
                      title="Editar Transação"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteTransacao(transacao.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors duration-150"
                      title="Excluir Transação"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TransacaoFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTransacao}
        transacaoToEdit={transacaoToEdit}
      />
    </div>
  );
}

export default TransacoesPage;