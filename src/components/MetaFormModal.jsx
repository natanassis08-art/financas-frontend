// C:\meu_projeto_financas\frontend\src\components\MetaFormModal.jsx

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Função auxiliar para formatar a data para YYYY-MM-DD de forma consistente
// Crucial para garantir que o input type="date" exiba a data correta sem problemas de fuso horário.
const formatDateToYYYYMMDD = (dateString) => {
  if (!dateString) return '';
  // Tenta criar um objeto Date. Adiciona 'T00:00:00' para ajudar a interpretar como fuso horário local
  // se a string original for apenas 'YYYY-MM-DD'.
  const date = new Date(dateString + 'T00:00:00'); // Garante que a data seja interpretada no fuso horário local
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mês é base 0
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function MetaFormModal({ isOpen, onClose, onSave, metaToEdit }) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'economizar',
    valor_alvo: '',
    valor_atingido: '0.00',
    // Usar a função de formatação para garantir o formato correto para a data inicial
    data_inicio: formatDateToYYYYMMDD(new Date()),
    data_limite: '', // Será preenchido ou permanecerá vazio para nova meta
    concluida: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Efeito para preencher o formulário se for edição
  useEffect(() => {
    if (metaToEdit) {
      setFormData({
        nome: metaToEdit.nome || '',
        descricao: metaToEdit.descricao || '',
        tipo: metaToEdit.tipo || 'economizar',
        valor_alvo: metaToEdit.valor_alvo || '',
        valor_atingido: metaToEdit.valor_atingido || '0.00',
        // Aplicar a função de formatação aqui também para dados existentes
        data_inicio: formatDateToYYYYMMDD(metaToEdit.data_inicio),
        data_limite: formatDateToYYYYMMDD(metaToEdit.data_limite), // Formatar data_limite
        concluida: metaToEdit.concluida || false,
      });
    } else {
      // Limpar o formulário para uma nova meta
      setFormData({
        nome: '',
        descricao: '',
        tipo: 'economizar',
        valor_alvo: '',
        valor_atingido: '0.00',
        data_inicio: formatDateToYYYYMMDD(new Date()), // Garantir formato correto para nova meta
        data_limite: '', // Vazio para nova meta
        concluida: false,
      });
    }
    setError(null); // Limpa erros ao abrir/mudar meta
  }, [metaToEdit, isOpen]); // Re-executa quando metaToEdit ou isOpen mudar

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = metaToEdit ? 'PUT' : 'POST';
      const url = metaToEdit
        ? `${API_BASE_URL}/metas/${metaToEdit.id}/`
        : `${API_BASE_URL}/metas/`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        // O formData já deve conter a data no formato YYYY-MM-DD
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "Erro ao salvar meta.";
        if (errorData) {
            errorMessage += " Detalhes: " + JSON.stringify(errorData);
        }
        throw new Error(errorMessage);
      }

      const savedMeta = await response.json();
      onSave(savedMeta); // Chama a função onSave para atualizar a lista na página pai
      onClose(); // Fecha o modal
    } catch (err) {
      console.error("Erro ao enviar formulário da meta:", err);
      setError(err.message || "Erro desconhecido ao salvar meta.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Classes de estilo para os inputs e selects (reutilizadas)
  const inputOrSelectClasses = "block w-full px-5 py-3 border border-indigo-300 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-200 ease-in-out bg-white";

  // Classes de estilo para os labels (reutilizadas)
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
          {metaToEdit ? 'Editar Meta' : 'Nova Meta Financeira'}
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
              Nome da Meta
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

          <div>
            <label htmlFor="tipo" className={labelClasses}>
              Tipo de Meta
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className={inputOrSelectClasses}
            >
              <option value="economizar">Economizar</option>
              <option value="investir">Investir</option>
              <option value="abater_divida">Abater Dívida</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <div>
            <label htmlFor="valor_alvo" className={labelClasses}>
              Valor Alvo
            </label>
            <input
              type="number"
              id="valor_alvo"
              name="valor_alvo"
              value={formData.valor_alvo}
              onChange={handleChange}
              required
              step="0.01"
              className={inputOrSelectClasses}
            />
          </div>

          <div>
            <label htmlFor="valor_atingido" className={labelClasses}>
              Valor Atingido (Para controle de progresso)
            </label>
            <input
              type="number"
              id="valor_atingido"
              name="valor_atingido"
              value={formData.valor_atingido}
              onChange={handleChange}
              step="0.01"
              className={inputOrSelectClasses}
            />
          </div>

          <div>
            <label htmlFor="data_limite" className={labelClasses}>
              Data Limite
            </label>
            <input
              type="date"
              id="data_limite"
              name="data_limite"
              value={formData.data_limite}
              onChange={handleChange}
              required
              className={inputOrSelectClasses}
            />
          </div>

          <div className="flex items-center">
            <input
              id="concluida"
              name="concluida"
              type="checkbox"
              checked={formData.concluida}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="concluida" className="ml-2 block text-sm text-gray-900">
              Meta Concluída
            </label>
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
              {loading ? 'Salvando...' : 'Salvar Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MetaFormModal;