// C:\meu_projeto_financas\frontend\src\components\TransacaoFormModal.jsx

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

function TransacaoFormModal({ isOpen, onClose, onSave, transacaoToEdit }) {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data_transacao: new Date().toISOString().split('T')[0],
    tipo: 'despesa',
    status: 'pendente',
    categoria: '',
  });
  const [allCategorias, setAllCategorias] = useState([]);
  const [filteredCategorias, setFilteredCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoadingCategorias(true);
        const response = await fetch(`${API_BASE_URL}/categorias/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllCategorias(data);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        setError("Não foi possível carregar as categorias.");
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  useEffect(() => {
    if (allCategorias.length > 0) {
      const currentTipo = transacaoToEdit ? transacaoToEdit.tipo : formData.tipo;
      const filtered = allCategorias.filter(cat => cat.tipo_categoria === currentTipo || cat.tipo_categoria === 'ambos');
      setFilteredCategorias(filtered);

      if (transacaoToEdit) {
        setFormData({
          descricao: transacaoToEdit.descricao || '',
          valor: transacaoToEdit.valor || '',
          data_transacao: transacaoToEdit.data_transacao || new Date().toISOString().split('T')[0],
          tipo: transacaoToEdit.tipo || 'despesa',
          status: transacaoToEdit.status || 'pendente',
          categoria: transacaoToEdit.categoria || '',
        });
      } else {
        const defaultCategoria = filtered.length > 0 ? filtered[0].id : '';
        setFormData(prevData => ({
          ...prevData,
          data_transacao: new Date().toISOString().split('T')[0],
          categoria: defaultCategoria
        }));
      }
    }
  }, [allCategorias, transacaoToEdit, formData.tipo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newData = { ...prevData, [name]: value };

      if (name === 'tipo') {
        const newFilteredCategories = allCategorias.filter(cat => cat.tipo_categoria === value || cat.tipo_categoria === 'ambos');
        setFilteredCategorias(newFilteredCategories);
        const isCurrentCategoryValid = newFilteredCategories.some(cat => cat.id === newData.categoria);
        if (!isCurrentCategoryValid) {
          newData.categoria = newFilteredCategories.length > 0 ? newFilteredCategories[0].id : '';
        }
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const method = transacaoToEdit ? 'PUT' : 'POST';
      const url = transacaoToEdit
        ? `${API_BASE_URL}/transacoes/${transacaoToEdit.id}/`
        : `${API_BASE_URL}/transacoes/`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro na resposta da API:", errorData);
        let errorMessage = "Erro ao salvar transação.";
        if (errorData) {
            errorMessage += " Detalhes: " + JSON.stringify(errorData);
        }
        throw new Error(errorMessage);
      }

      const savedTransacao = await response.json();
      onSave(savedTransacao);
      onClose();
    } catch (err) {
      console.error("Erro ao enviar formulário:", err);
      setError(err.message || "Erro desconhecido ao salvar transação.");
    }
  };

  if (!isOpen) return null;

  // Classes de estilo para os inputs e selects
  // Modificado: Aumentado py para 3, adicionado shadow-md
  const inputOrSelectClasses = "block w-full px-5 py-3 border border-indigo-300 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-200 ease-in-out bg-white";

  // Classes de estilo para os labels
  // Modificado: Adicionado mb-2 para espaçamento entre label e input
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors duration-200"
          title="Fechar"
        >
          <FaTimes className="text-xl" />
        </button>

        {/* TÍTULO COM GRADIENTE E ESTILO ELEGANTE */}
        <h2 className="text-3xl font-extrabold text-center pb-4 mb-6
                       bg-gradient-to-r from-indigo-600 to-purple-700
                       bg-clip-text text-transparent tracking-tight leading-none">
          {transacaoToEdit ? 'Editar Transação' : 'Nova Transação'}
        </h2>

        {loadingCategorias && (
            <div className="flex justify-center items-center py-4">
                <FaSpinner className="animate-spin text-2xl text-blue-500 mr-2" />
                <p>Carregando categorias...</p>
            </div>
        )}

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Erro!</strong>
                <span className="block sm:inline ml-2">{error}</span>
            </div>
        )}

        {!loadingCategorias && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="descricao" className={labelClasses}>
                Descrição
              </label>
              <input
                type="text"
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
                className={inputOrSelectClasses}
              />
            </div>

            <div>
              <label htmlFor="valor" className={labelClasses}>
                Valor
              </label>
              <input
                type="number"
                id="valor"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                required
                step="0.01"
                className={inputOrSelectClasses}
              />
            </div>

            <div>
              <label htmlFor="data_transacao" className={labelClasses}>
                Data da Transação
              </label>
              <input
                type="date"
                id="data_transacao"
                name="data_transacao"
                value={formData.data_transacao}
                onChange={handleChange}
                required
                className={inputOrSelectClasses}
              />
            </div>

            <div>
              <label htmlFor="tipo" className={labelClasses}>
                Tipo
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className={inputOrSelectClasses}
              >
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className={labelClasses}>
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputOrSelectClasses}
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Paga</option>
              </select>
            </div>

            {/* Dropdown de Categoria Filtrada */}
            <div>
              <label htmlFor="categoria" className={labelClasses}>
                Categoria
              </label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
                className={inputOrSelectClasses}
              >
                <option value="">Selecione uma categoria</option>
                {filteredCategorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
              {filteredCategorias.length === 0 && !loadingCategorias && (
                <p className="mt-2 text-sm text-red-600">
                  Não há categorias disponíveis para o tipo "{formData.tipo}". Por favor, crie uma na aba "Categorias".
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200 shadow-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md transition duration-300 ease-in-out"
              >
                <FaSave className="mr-2" /> Salvar Transação
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default TransacaoFormModal;