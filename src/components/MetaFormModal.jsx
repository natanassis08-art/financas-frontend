// src/components/MetaFormModal.jsx

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Função que garante o formato AAAA-MM-DD, corrigindo problemas de fuso horário
const formatDateToYYYYMMDD = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  // Pega o ano, mês e dia com base no fuso horário local para evitar que a data "volte" um dia
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
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
    data_inicio: new Date().toISOString().split('T')[0],
    data_limite: '',
    concluida: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (metaToEdit) {
        setFormData({
          nome: metaToEdit.nome || '',
          descricao: metaToEdit.descricao || '',
          tipo: metaToEdit.tipo || 'economizar',
          valor_alvo: metaToEdit.valor_alvo || '',
          valor_atingido: metaToEdit.valor_atingido || '0.00',
          data_inicio: formatDateToYYYYMMDD(metaToEdit.data_inicio),
          data_limite: formatDateToYYYYMMDD(metaToEdit.data_limite),
          concluida: metaToEdit.concluida || false,
        });
      } else {
        setFormData({
          nome: '',
          descricao: '',
          tipo: 'economizar',
          valor_alvo: '',
          valor_atingido: '0.00',
          data_inicio: new Date().toISOString().split('T')[0],
          data_limite: '',
          concluida: false,
        });
      }
    }
  }, [metaToEdit, isOpen]);

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

    try {
      const method = metaToEdit ? 'PUT' : 'POST';
      const url = metaToEdit
        ? `${API_BASE_URL}/metas/${metaToEdit.id}/`
        : `${API_BASE_URL}/metas/`;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Constrói uma mensagem de erro a partir da resposta do backend
        const errorMessage = Object.values(errorData).flat().join(' ');
        throw new Error(errorMessage || "Erro ao salvar meta. Verifique os campos.");
      }
      
      onSave(!!metaToEdit); // Passa true se for edição, false se for adição
      onClose();
    } catch (err) {
      console.error("Erro ao enviar formulário da meta:", err);
      toast.error(err.message); // Usa o pop-up para exibir o erro
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputOrSelectClasses = "block w-full px-5 py-3 border border-indigo-300 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">
          <FaTimes className="text-xl" />
        </button>
        <h2 className="text-3xl font-extrabold text-center pb-4 mb-6 bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">
          {metaToEdit ? 'Editar Meta' : 'Nova Meta Financeira'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome" className={labelClasses}>Nome da Meta</label>
            <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required className={inputOrSelectClasses}/>
          </div>
          <div>
            <label htmlFor="descricao" className={labelClasses}>Descrição (Opcional)</label>
            <textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} rows="3" className={inputOrSelectClasses}></textarea>
          </div>
          <div>
            <label htmlFor="tipo" className={labelClasses}>Tipo de Meta</label>
            <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} className={inputOrSelectClasses}>
              <option value="economizar">Economizar</option>
              <option value="investir">Investir</option>
              <option value="abater_divida">Abater Dívida</option>
              <option value="outros">Outros</option>
            </select>
          </div>
          <div>
            <label htmlFor="valor_alvo" className={labelClasses}>Valor Alvo</label>
            <input type="number" id="valor_alvo" name="valor_alvo" value={formData.valor_alvo} onChange={handleChange} required step="0.01" className={inputOrSelectClasses}/>
          </div>
          <div>
            <label htmlFor="valor_atingido" className={labelClasses}>Valor Atingido</label>
            <input type="number" id="valor_atingido" name="valor_atingido" value={formData.valor_atingido} onChange={handleChange} step="0.01" className={inputOrSelectClasses}/>
          </div>
          <div>
            <label htmlFor="data_limite" className={labelClasses}>Data Limite</label>
            <input type="date" id="data_limite" name="data_limite" value={formData.data_limite} onChange={handleChange} required className={inputOrSelectClasses}/>
          </div>
          <div className="flex items-center">
            <input id="concluida" name="concluida" type="checkbox" checked={formData.concluida} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
            <label htmlFor="concluida" className="ml-2 block text-sm text-gray-900">Meta Concluída</label>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 shadow-sm">Cancelar</button>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md disabled:opacity-50">
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