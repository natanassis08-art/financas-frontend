// C:\meu_projeto_financas\frontend\src\components\CategoriaFormModal.jsx

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

function CategoriaFormModal({ isOpen, onClose, onSave, categoriaToEdit }) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo_categoria: 'despesa',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Efeito para preencher o formulário se for edição
  useEffect(() => {
    if (categoriaToEdit) {
      setFormData({
        nome: categoriaToEdit.nome || '',
        descricao: categoriaToEdit.descricao || '',
        tipo_categoria: categoriaToEdit.tipo_categoria || 'despesa',
      });
    } else {
      // Limpar o formulário para uma nova categoria
      setFormData({
        nome: '',
        descricao: '',
        tipo_categoria: 'despesa',
      });
    }
    setError(null);
  }, [categoriaToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = categoriaToEdit ? 'PUT' : 'POST';
      const url = categoriaToEdit
        ? `${API_BASE_URL}/categorias/${categoriaToEdit.id}/`
        : `${API_BASE_URL}/categorias/`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "Erro ao salvar categoria.";
        if (errorData && errorData.nome && errorData.nome.includes('already exists')) {
            errorMessage = "Erro: Já existe uma categoria com este nome.";
        } else if (errorData) {
            errorMessage += " Detalhes: " + JSON.stringify(errorData);
        }
        throw new Error(errorMessage);
      }

      const savedCategoria = await response.json();
      onSave(savedCategoria);
      onClose();
    } catch (err) {
      console.error("Erro ao enviar formulário da categoria:", err);
      setError(err.message || "Erro desconhecido ao salvar categoria.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Classes de estilo para os inputs e selects (reutilizadas de outros modais)
  const inputOrSelectClasses = "block w-full px-5 py-3 border border-indigo-300 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-200 ease-in-out bg-white";

  // Classes de estilo para os labels (reutilizadas de outros modais)
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
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
          {categoriaToEdit ? 'Editar Categoria' : 'Nova Categoria'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Erro!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className={labelClasses}>
              Nome da Categoria
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className={inputOrSelectClasses}
            />
          </div>

          <div>
            <label htmlFor="descricao" className={labelClasses}>
              Descrição (Opcional)
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows="3"
              className={inputOrSelectClasses}
            ></textarea>
          </div>

          {/* NOVO CAMPO: TIPO DE CATEGORIA */}
          <div>
            <label htmlFor="tipo_categoria" className={labelClasses}>
              Tipo de Categoria
            </label>
            <select
              id="tipo_categoria"
              name="tipo_categoria"
              value={formData.tipo_categoria}
              onChange={handleChange}
              required
              className={inputOrSelectClasses}
            >
              <option value="despesa">Despesa</option>
              <option value="receita">Receita</option>
              <option value="ambos">Ambos</option>
            </select>
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
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md transition duration-300 ease-in-out disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
              {loading ? 'Salvando...' : 'Salvar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoriaFormModal;