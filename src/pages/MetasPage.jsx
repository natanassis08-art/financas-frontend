// src/pages/MetasPage.jsx

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaBullseye, FaCheckCircle, FaMinusCircle, FaTrophy, FaTimesCircle as FaFailed } from 'react-icons/fa';
import MetaFormModal from '../components/MetaFormModal';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

function MetasPage() {
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metaToEdit, setMetaToEdit] = useState(null);

  const fetchMetas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/metas/`);
      if (!response.ok) throw new Error("Não foi possível carregar as metas.");
      const data = await response.json();
      setMetas(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetas();
  }, []);

  const handleAddMeta = () => {
    setMetaToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditMeta = (meta) => {
    setMetaToEdit(meta);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMetaToEdit(null);
  };

  const handleSaveMeta = (isEditing) => {
    fetchMetas();
    handleCloseModal();
    toast.success(isEditing ? "Meta atualizada com sucesso!" : "Meta adicionada com sucesso!");
  };

  const handleDeleteMeta = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta meta?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/metas/${id}/`, { method: 'DELETE' });
        if (!response.ok) throw new Error("Não foi possível excluir a meta.");
        setMetas(metas.filter(meta => meta.id !== id));
        toast.success("Meta excluída com sucesso!");
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-100px)]">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <h1 className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent drop-shadow-lg flex items-center">
          <FaBullseye className="mr-4 text-3xl lg:text-4xl text-indigo-600" /> Gerenciamento de Metas
        </h1>
        <button onClick={handleAddMeta} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-105 w-full md:w-auto">
          <FaPlus className="mr-2 text-xl" /> Nova Meta
        </button>
      </div>
      
      {metas.length === 0 ? (
          <div className="text-center p-8 bg-white shadow-xl rounded-xl">
            <p className="text-lg mb-6">Nenhuma meta encontrada. Adicione uma!</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {metas.map((meta) => (
            <div key={meta.id} className={`p-6 relative transition-all duration-300 ${meta.concluida ? 'bg-emerald-50' : 'bg-white'} shadow-xl rounded-xl`}>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2">{meta.nome}</h2>
              <p className="text-gray-600 mb-3 text-sm">{meta.descricao || 'Sem descrição'}</p>
              <div className="bg-gray-200 rounded-full h-4 mb-3 overflow-hidden shadow-inner">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" style={{ width: `${Math.min(100, parseFloat(meta.progresso_porcentagem).toFixed(2))}%` }}></div>
              </div>
              <p className="text-sm text-gray-700 text-right mb-4">
                Progresso: <span className="font-bold">{parseFloat(meta.progresso_porcentagem).toFixed(2)}%</span>
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-sm font-semibold mb-4 border-t pt-3">
                <div>
                  <p className="text-xs text-gray-600">Alvo:</p>
                  <p className="font-bold text-blue-700">R$ {parseFloat(meta.valor_alvo).toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Atingido:</p>
                  <p className="font-bold text-emerald-600">R$ {parseFloat(meta.valor_atingido).toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Restante:</p>
                  <p className="font-extrabold text-red-600">R$ {parseFloat(meta.valor_restante).toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button onClick={() => handleEditMeta(meta)} className="text-indigo-600 hover:text-indigo-900" title="Editar Meta">
                  <FaEdit className="text-lg" />
                </button>
                <button onClick={() => handleDeleteMeta(meta.id)} className="text-red-600 hover:text-red-900" title="Excluir Meta">
                  <FaTrash className="text-lg" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MetaFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveMeta} metaToEdit={metaToEdit} />
    </div>
  );
}

export default MetasPage;