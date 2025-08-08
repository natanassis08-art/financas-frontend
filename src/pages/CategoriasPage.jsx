// C:\meu_projeto_financas\frontend\src\pages\CategoriasPage.jsx

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaTags, FaMoneyBillWave, FaCoins } from 'react-icons/fa'; // Adicionado FaMoneyBillWave e FaCoins para badges
import CategoriaFormModal from '../components/CategoriaFormModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = useState(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/categorias/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategorias(data);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
      setError("Não foi possível carregar as categorias. Verifique a conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleAddCategoria = () => {
    setCategoriaToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditCategoria = (categoria) => {
    setCategoriaToEdit(categoria);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoriaToEdit(null);
  };

  const handleSaveCategoria = () => {
    fetchCategorias();
    handleCloseModal();
  };

  const handleDeleteCategoria = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/categorias/${id}/`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = "Não foi possível excluir a categoria. Pode estar em uso por transações.";
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.detail) {
              errorMessage = `Erro: ${errorData.detail}`;
            }
          } catch (jsonError) {
            console.error("Erro ao parsear resposta de erro:", jsonError);
          }
          throw new Error(errorMessage);
        }

        setCategorias(categorias.filter(categoria => categoria.id !== id));
        alert("Categoria excluída com sucesso!");

      } catch (err) {
        console.error("Erro ao excluir categoria:", err);
        setError(err.message || "Erro desconhecido ao excluir categoria.");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        // Conteúdo de carregamento com estilo elegante
        <div className="flex justify-center items-center h-full min-h-[calc(100vh-100px)] bg-white shadow-xl rounded-xl p-6">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
          <p className="ml-4 text-xl text-gray-700">Carregando categorias...</p>
        </div>
      ) : error ? (
        // Conteúdo de erro com estilo elegante
        <div className="text-center p-6 text-red-600 bg-red-100 border border-red-400 rounded-md shadow-lg">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Título e Botão Nova Categoria */}
          <div className="flex justify-between items-center mb-8 border-b-2 border-indigo-200 pb-4">
            <h1 className="text-4xl font-extrabold
                           bg-gradient-to-r from-indigo-600 to-purple-700
                           bg-clip-text text-transparent tracking-tight leading-none
                           drop-shadow-lg flex items-center">
              <FaTags className="mr-3 text-3xl text-indigo-600" /> Gerenciamento de Categorias
            </h1>
            {/* Botão "Nova Categoria" reestilizado */}
            <button
              onClick={handleAddCategoria}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
                         text-white font-bold py-3 px-6 rounded-full flex items-center justify-center
                         shadow-lg transition duration-300 ease-in-out transform hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <FaPlus className="mr-2 text-xl" /> Nova Categoria
            </button>
          </div>

          {categorias.length === 0 ? (
            // Conteúdo quando não há categorias com estilo elegante
            <div className="text-center p-8 text-gray-700 bg-white shadow-xl rounded-xl border border-gray-100">
              <p className="text-lg mb-6">Nenhuma categoria encontrada. Comece adicionando uma!</p>
              <button
                onClick={handleAddCategoria}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center mx-auto shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                <FaPlus className="mr-2" /> Adicionar Primeira Categoria
              </button>
            </div>
          ) : (
            // Contêiner da tabela de categorias com sombra e bordas arredondadas
            <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nome</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Descrição</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tipo</th>
                    <th scope="col" className="relative px-6 py-3 text-right">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {categorias.map((categoria) => (
                    <tr key={categoria.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {categoria.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {categoria.descricao || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                        {/* Indicador de Tipo com Badges e Ícones */}
                        <span className={`inline-flex items-center px-3 py-1 text-xs leading-5 font-semibold rounded-full
                                          transform hover:scale-105 transition-transform duration-200 ease-in-out
                                          ${categoria.tipo_categoria === 'receita'
                                            ? 'bg-green-100 text-green-800'
                                            : categoria.tipo_categoria === 'despesa'
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-blue-100 text-blue-800'
                                          }`}>
                          {categoria.tipo_categoria === 'receita' && <FaCoins className="mr-1 text-sm" />}
                          {categoria.tipo_categoria === 'despesa' && <FaMoneyBillWave className="mr-1 text-sm" />}
                          {categoria.tipo_categoria === 'ambos' && <FaTags className="mr-1 text-sm" />} {/* Ícone para "ambos" */}
                          {categoria.tipo_categoria === 'receita' ? 'Receita' :
                           categoria.tipo_categoria === 'despesa' ? 'Despesa' : 'Ambos'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditCategoria(categoria)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3 p-2 rounded-full hover:bg-indigo-50 transition-colors duration-150"
                          title="Editar"
                        >
                          <FaEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategoria(categoria.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors duration-150"
                          title="Excluir"
                        >
                          <FaTrash className="text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <CategoriaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategoria}
        categoriaToEdit={categoriaToEdit}
      />
    </div>
  );
}

export default CategoriasPage;