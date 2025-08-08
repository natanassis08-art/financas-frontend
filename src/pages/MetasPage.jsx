// C:\meu_projeto_financas\frontend\src\pages\MetasPage.jsx

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaBullseye, FaCheckCircle, FaMinusCircle, FaCalendarAlt, FaTrophy, FaTimesCircle as FaFailed, FaMoneyBillWave } from 'react-icons/fa';
import MetaFormModal from '../components/MetaFormModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

function MetasPage() {
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metaToEdit, setMetaToEdit] = useState(null);

  const fetchMetas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/metas/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMetas(data);
    } catch (err) {
      console.error("Erro ao buscar metas:", err);
      setError("Não foi possível carregar as metas. Verifique a conexão com o servidor.");
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

  const handleSaveMeta = () => {
    fetchMetas();
    handleCloseModal();
  };

  const handleDeleteMeta = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta meta?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/metas/${id}/`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setMetas(metas.filter(meta => meta.id !== id));
        alert("Meta excluída com sucesso!");

      } catch (err) {
        console.error("Erro ao excluir meta:", err);
        setError("Não foi possível excluir a meta. Tente novamente.");
      }
    }
  };

  // Função para calcular dias restantes - Melhorada e corrigida para fuso horário
  const calculateDaysRemaining = (dateLimit) => {
    if (!dateLimit) return 'N/A';
    const today = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00'); 
    const limitDate = new Date(dateLimit + 'T00:00:00');

    const diffTime = limitDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expirada!';
    } else if (diffDays === 0) {
      return 'Hoje!';
    } else if (diffDays === 1) {
      return '1 dia';
    }
    return `${diffDays} dias`;
  };

  // Função para determinar o status de conclusão da meta
  const getCompletionStatus = (meta) => {
    if (!meta.concluida) {
      return null;
    }

    const valorAtingido = parseFloat(meta.valor_atingido);
    const valorAlvo = parseFloat(meta.valor_alvo);

    if (valorAtingido >= valorAlvo) {
      return {
        message: 'Concluída com Sucesso!',
        color: 'text-emerald-700',
        icon: FaTrophy
      };
    } else {
      return {
        message: `Concluída Parcialmente: ${((valorAtingido / valorAlvo) * 100).toFixed(0)}%`,
        color: 'text-orange-600',
        icon: FaFailed
      };
    }
  };

  // Ícone ilustrativo para o nome da meta (simulação, pode ser mais dinâmico)
  const getMetaIcon = (tipo) => {
    switch (tipo) {
      case 'economizar': return <FaCoins className="mr-3 text-2xl text-yellow-600" />;
      case 'investir': return <FaChartLine className="mr-3 text-2xl text-green-600" />;
      case 'abater_divida': return <FaMoneyBillWave className="mr-3 text-2xl text-red-600" />;
      default: return <FaBullseye className="mr-3 text-2xl text-purple-600" />;
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-full min-h-[calc(100vh-100px)] bg-white shadow-xl rounded-xl p-6">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
          <p className="ml-4 text-xl text-gray-700">Carregando metas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-6 text-red-600 bg-red-100 border border-red-400 rounded-md shadow-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <>
        <div className="flex justify-between items-center mb-8 border-b-2 border-indigo-200 pb-4">
          <h1 className="text-4xl font-extrabold
                           bg-gradient-to-r from-indigo-600 to-purple-700
                           bg-clip-text text-transparent tracking-tight leading-none
                           drop-shadow-lg">
            Gerenciamento de Metas
          </h1>
          {/* APENAS ESTE BOTÃO: Botão "Nova Meta" posicionado no canto superior direito */}
          <button
            onClick={handleAddMeta}
            // Classes atualizadas para o botão do canto superior direito
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
                       text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center
                       shadow-lg transition duration-300 ease-in-out transform hover:scale-105
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <FaPlus className="mr-2 text-xl" /> Nova Meta
          </button>
        </div>

        {metas.length === 0 ? (
          <div className="text-center p-8 text-gray-700 bg-white shadow-xl rounded-xl border border-gray-100">
            <p className="text-lg mb-6">Nenhuma meta encontrada. Comece adicionando uma para organizar suas finanças!</p>
            <button
              onClick={handleAddMeta}
              className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center mx-auto shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              <FaPlus className="mr-2" /> Adicionar Primeira Meta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {metas.map((meta) => {
              const completionStatus = getCompletionStatus(meta);
              return (
                // Cartão de Meta
                <div key={meta.id}
                     className={`p-6 relative transition-all duration-300 ease-in-out
                                 ${meta.concluida
                                   ? 'bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 shadow-lg scale-[0.98] cursor-default'
                                   : 'bg-gradient-to-br from-white to-indigo-50 border border-gray-100 shadow-xl hover:scale-[1.01]'
                                 }
                                 rounded-xl`}
                >
                  {/* Ícones de status da meta (Concluída/Expirada) */}
                  {meta.concluida && (
                    <div className="absolute top-3 right-3 text-emerald-500">
                      <FaCheckCircle className="text-3xl" title="Meta Concluída" />
                    </div>
                  )}
                  {!meta.concluida && new Date(meta.data_limite) < new Date() && (
                    <div className="absolute top-3 right-3 text-red-500">
                      <FaMinusCircle className="text-3xl" title="Data Limite Expirada" />
                    </div>
                  )}

                  {/* Ícone ilustrativo à esquerda do nome da meta */}
                  <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                    {getMetaIcon(meta.tipo)} {meta.nome}
                  </h2>
                  <p className="text-gray-600 mb-3 text-sm">{meta.descricao || 'Sem descrição'}</p>
                  
                  {/* Informações de Prazo */}
                  <div className="mb-4 space-y-1">
                    <p className="text-sm text-gray-700">Tipo: <span className="font-semibold capitalize">{meta.tipo.replace('_', ' ')}</span></p>
                    <p className="text-sm text-gray-700 flex items-center">
                      <FaCalendarAlt className="mr-2 text-base text-gray-500" /> Data Limite: <span className="font-semibold ml-1">{new Date(meta.data_limite + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </p>
                    {!meta.concluida && (
                      <p className={`text-sm font-semibold flex items-center transition-colors duration-200
                                    ${calculateDaysRemaining(meta.data_limite) === 'Expirada!'
                                      ? 'text-red-600 bg-red-50 rounded-full px-2 py-1'
                                      : (parseInt(calculateDaysRemaining(meta.data_limite)) < 10 && parseInt(calculateDaysRemaining(meta.data_limite)) >= 0)
                                        ? 'text-purple-700 bg-purple-100 rounded-full px-2 py-1'
                                        : 'text-indigo-600'
                                    }`}>
                        <FaCalendarAlt className="mr-2 text-base" /> Dias Restantes: {calculateDaysRemaining(meta.data_limite)}
                      </p>
                    )}
                  </div>

                  {/* Barra de Progresso Animada */}
                  <div className="bg-gray-200 rounded-full h-4 mb-3 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-1000 ease-out
                                  ${meta.progresso_porcentagem >= 100
                                    ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                  }`}
                      style={{ width: `${Math.min(100, parseFloat(meta.progresso_porcentagem).toFixed(2))}%` }}
                    >
                      {`${Math.min(100, parseFloat(meta.progresso_porcentagem).toFixed(0))}%`}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 text-right mb-2">
                    Progresso: <span className="font-bold">{parseFloat(meta.progresso_porcentagem).toFixed(2)}%</span>
                  </p>

                  {/* Status de conclusão da meta */}
                  {completionStatus && (
                    <p className={`text-center font-bold text-lg mt-4 ${completionStatus.color} flex items-center justify-center`}>
                      {completionStatus.icon && <completionStatus.icon className="mr-2 text-xl" />}
                      {completionStatus.message}
                    </p>
                  )}

                  {/* Valores (Alvo, Atingido, Restante) em 3 Colunas */}
                  <div className="grid grid-cols-3 gap-2 text-center text-sm font-semibold mb-4 border-t border-b border-gray-100 py-3">
                    <div className="p-1 rounded-md">
                      <p className="text-xs text-gray-600">Alvo:</p>
                      <p className="font-bold text-blue-700">R$ {parseFloat(meta.valor_alvo).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="p-1 rounded-md">
                      <p className="text-xs text-gray-600">Atingido:</p>
                      <p className="font-bold text-emerald-600">R$ {parseFloat(meta.valor_atingido).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="p-1 rounded-md">
                      <p className="text-xs text-gray-600">Restante:</p>
                      <p className="font-extrabold text-red-600">R$ {parseFloat(meta.valor_restante).toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>

                  {/* Ícones de Ação (Editar/Excluir) */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEditMeta(meta)}
                      className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors duration-150 group"
                      title="Editar Meta"
                    >
                      <FaEdit className="text-lg group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeta(meta.id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors duration-150 group"
                      title="Excluir Meta"
                    >
                      <FaTrash className="text-lg group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <MetaFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveMeta}
          metaToEdit={metaToEdit}
        />
      </>
    </div>
  );
}

export default MetasPage;