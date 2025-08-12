// C:\meu_projeto_financas\frontend\src\pages\ProjecoesPage.jsx

import React, { useState, useEffect } from 'react';
import {
  FaSpinner, FaChartLine, FaInfoCircle, FaDollarSign,
  FaLightbulb, FaExclamationTriangle, FaChartBar, FaCheckCircle,
  FaStar, FaHandHoldingUsd, FaPiggyBank, FaArrowRight,
  FaGrinStars, FaSmile, FaFrownOpen, FaClipboardCheck,
  FaRegLightbulb, FaFire, FaBullseye, FaArrowUp, FaArrowDown, FaCalendarAlt
} from 'react-icons/fa';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, Cell, LabelList } from 'recharts'; // Importar LabelList

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Cores para os gráficos e seções
const CHART_COLORS_RECEITA = '#10B981'; // Esmeralda
const CHART_COLORS_DESPESA = '#EF4444'; // Vermelho
const CHART_COLORS_SALDO = '#6366F1';   // Índigo
const CATEGORY_PROJECTION_COLORS = [
  '#A855F7', '#EC4899', '#3B82F6', '#F59E0B', '#6366F1',
  '#10B981', '#D97706', '#EF4444', '#06B6D4', '#C026D3',
];

const monthNamesFull = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function ProjecoesPage() {
  const [projecoesData, setProjecoesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const fetchProjecoesData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data for the selected year
        const response = await fetch(`${API_BASE_URL}/projecoes/?year=${selectedYear}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProjecoesData(data);
        setAvailableYears(data.available_years);

      } catch (err) {
        console.error("Erro ao buscar dados de projeções:", err);
        setError("Não foi possível carregar as projeções financeiras. Verifique a conexão com o servidor ou os dados disponíveis.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjecoesData();
  }, [selectedYear]); // Re-fetch data when selectedYear changes

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  // Helper functions for rendering
  const formatCurrency = (value) => `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
  const formatPercentage = (value) => `${parseFloat(value).toFixed(2).replace('.', ',')}%`;

  const getFinancialStatusIcon = (status) => {
    switch (status) {
      case 'EXCELLENT': return <FaGrinStars className="text-emerald-500" />;
      case 'GOOD': return <FaSmile className="text-blue-500" />;
      case 'CRITICAL': return <FaFrownOpen className="text-red-500" />;
      default: return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getFinancialStatusColor = (status) => {
    switch (status) {
      case 'EXCELLENT': return 'border-emerald-500';
      case 'GOOD': return 'border-blue-500';
      case 'CRITICAL': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };

  const getFinancialStatusTextColor = (status) => {
    switch (status) {
        case 'EXCELLENT': return 'text-emerald-600';
        case 'GOOD': return 'text-blue-600';
        case 'CRITICAL': return 'text-red-600';
        default: return 'text-gray-600';
    }
  };

  // Lógica aprimorada para ícones de tendência:
  // Para despesas: Aumento (positivo) é ruim (seta para cima), Diminuição (negativo) é bom (seta para baixo)
  // Para receitas: Aumento (positivo) é bom (seta para cima), Diminuição (negativo) é ruim (seta para baixo)
  const getTrendIconForMetric = (trendValue, metricType) => {
    if (trendValue === 0) return <FaChartLine />; // Sem mudança significativa
    if (metricType === 'despesas') {
      return trendValue > 0 ? <FaArrowUp /> : <FaArrowDown />;
    } else if (metricType === 'receitas') {
      return trendValue > 0 ? <FaArrowUp /> : <FaArrowDown />;
    }
    return <FaChartLine />;
  };

  // Lógica aprimorada para cores de tendência:
  // Para despesas: Aumento (positivo) é vermelho, Diminuição (negativo) é verde
  // Para receitas: Aumento (positivo) é verde, Diminuição (negativo) é vermelho
  const getTrendColorForMetric = (trendValue, metricType) => {
    if (trendValue === 0) return 'text-gray-600';
    if (metricType === 'despesas') {
      return trendValue > 0 ? 'text-red-600' : 'text-green-600';
    } else if (metricType === 'receitas') {
      return trendValue > 0 ? 'text-green-600' : 'text-red-600';
    }
    return 'text-gray-600';
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-100px)] bg-white shadow-xl rounded-xl p-6">
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
        <p className="ml-4 text-xl text-gray-700">Carregando projeções financeiras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
        <p>{error}</p>
      </div>
    );
  }

  // Destructure data safely after loading
  const {
    status_financeiro,
    economia_recomendada,
    taxa_atual,
    resumo_financeiro_mensal,
    progresso_meta_economia,
    projecao_despesa_media_mensal_geral,
    media_mensal_receitas_geral,
    media_diaria_despesas,
    media_semanal_despesas,
    projecao_3_meses_despesa,
    projecao_3_meses_receita,
    projecao_3_meses_saldo,
    trend_despesas,
    trend_receitas,
    comparison_period_display, // Novo campo para o período de comparação das tendências
    projecao_despesa_media_mensal_por_categoria,
    alerts,
    suggestions,
    economia_real_no_ano_selecionado,
    available_months_in_selected_year,
    meses_com_transacao_no_periodo,
    selected_year: api_selected_year // Use a selected_year retornada pela API
  } = projecoesData;

  // Modificação aqui: Ordenar os dados antes de passar para o gráfico
  const projecaoDespesasPorCategoriaChartData = projecao_despesa_media_mensal_por_categoria
    .map(item => ({
      name: item.categoria__nome || 'Sem Categoria',
      valor: parseFloat(item.avg_valor),
    }))
    .filter(item => item.valor > 0)
    .sort((a, b) => b.valor - a.valor); // Ordenar por valor decrescente

  const monthNamesShort = available_months_in_selected_year.map(m => m.label.substring(0, 3)).join(', ');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8
               bg-gradient-to-r from-indigo-600 to-purple-700
               bg-clip-text text-transparent tracking-tight leading-none
               drop-shadow-lg flex items-center justify-start">
  <FaChartLine className="mr-4 text-4xl text-indigo-600" /> Projeções Inteligentes
</h1>

      {/* Filtro por Ano */}
      <div className="bg-gradient-to-l from-purple-100 to-indigo-50 shadow-2xl rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 border border-gray-100">
        <label htmlFor="yearFilter" className="block text-xl font-semibold text-gray-800">
          <FaCalendarAlt className="inline-block mr-2 text-indigo-500" /> Analisar Ano:
        </label>
        <select
          id="yearFilter"
          name="yearFilter"
          value={selectedYear}
          onChange={handleYearChange}
          className="block w-full sm:w-auto px-5 py-3 border border-indigo-300 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-800 bg-white transition-all duration-200 ease-in-out"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        {available_months_in_selected_year.length > 0 ? (
          <span className="ml-4 text-gray-600 text-sm">
            Meses com dados em {api_selected_year}: {monthNamesShort}.
          </span>
        ) : (
          <span className="ml-4 text-gray-600 text-sm">Nenhum dado encontrado para {api_selected_year}.</span>
        )}
      </div>

      {/* Avaliação Geral da Saúde Financeira */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <div className={`bg-white p-6 rounded-xl shadow-xl border-b-4 ${getFinancialStatusColor(status_financeiro)} transform hover:scale-105 transition-transform duration-300 ease-in-out`}>
          <div className="flex items-center justify-center text-5xl mb-3">
            {getFinancialStatusIcon(status_financeiro)}
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-700 text-center">Status Financeiro</h2>
          <p className={`text-3xl font-extrabold text-center ${getFinancialStatusTextColor(status_financeiro)}`}>
            {status_financeiro}
          </p>
          <p className="text-gray-500 text-sm mt-2 text-center">Avaliação geral da sua saúde financeira para {api_selected_year}.</p>
        </div>

        {/* Economia Recomendada (Média Mensal) */}
        <div className="bg-white p-6 rounded-xl shadow-xl border-b-4 border-purple-500 transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <div className="flex items-center justify-center text-5xl text-purple-500 mb-3">
            <FaPiggyBank />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-700 text-center">Economia Recomendada</h2>
          <p className="text-3xl font-extrabold text-purple-600 text-center">
            {formatCurrency(economia_recomendada)}
          </p>
          <p className="text-gray-500 text-sm mt-2 text-center">Valor sugerido para você guardar mensalmente com base nos dados de {api_selected_year}.</p>
        </div>

        {/* Taxa de Eficiência */}
        <div className="bg-white p-6 rounded-xl shadow-xl border-b-4 border-yellow-500 transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <div className="flex items-center justify-center text-5xl text-yellow-500 mb-3">
            <FaHandHoldingUsd />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-700 text-center">Taxa de Eficiência ({api_selected_year})</h2>
          <p className="text-3xl font-extrabold text-yellow-600 text-center">
            {formatPercentage(taxa_atual)}
          </p>
          <p className="text-gray-500 text-sm mt-2 text-center">Seu saldo líquido em % da receita total no ano {api_selected_year}.</p>
        </div>
      </div>

      {/* Resumo Financeiro Mensal (Média) */}
      <div className="bg-white p-8 rounded-xl shadow-xl mb-8 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 flex items-center">
          <FaClipboardCheck className="mr-3 text-indigo-500" /> Resumo Financeiro Mensal (Média em {api_selected_year})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-lg text-gray-600 mb-1">Receita Média:</p>
            <p className="font-extrabold text-green-600 text-3xl">{formatCurrency(resumo_financeiro_mensal.receita_media)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-lg text-gray-600 mb-1">Despesa Média:</p>
            <p className="font-extrabold text-red-600 text-3xl">{formatCurrency(resumo_financeiro_mensal.despesa_media)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-lg text-gray-600 mb-1">Lucro/Prejuízo Médio:</p>
            <p className={`font-extrabold text-3xl ${resumo_financeiro_mensal.lucro_prejuizo_medio >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(resumo_financeiro_mensal.lucro_prejuizo_medio)}
            </p>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-4 text-center">
          <FaInfoCircle className="inline-block mr-1 text-gray-400" />
          Média calculada com base em {meses_com_transacao_no_periodo} meses com transações no ano {api_selected_year}.
        </p>
      </div>

      {/* Progresso da Meta de Economia (se houver uma meta ativa) */}
      {progresso_meta_economia && progresso_meta_economia.nome && (
        <div className="bg-white p-8 rounded-xl shadow-xl mb-8 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 flex items-center">
            <FaBullseye className="mr-3 text-purple-500" /> Progresso da Meta: {progresso_meta_economia.nome}
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            Alvo: <span className="font-semibold text-purple-600">{formatCurrency(progresso_meta_economia.valor_alvo)}</span> |
            Atingido: <span className="font-semibold text-green-600">{formatCurrency(progresso_meta_economia.valor_atingido)}</span> |
            Restante: <span className="font-semibold text-red-600">{formatCurrency(progresso_meta_economia.valor_restante)}</span>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-6 mb-2 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full flex items-center justify-center text-white text-sm font-bold transition-all duration-1000 ease-out
                          ${progresso_meta_economia.progresso_porcentagem >= 100
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`}
              style={{ width: `${Math.min(100, parseFloat(progresso_meta_economia.progresso_porcentagem))}%` }}
            >
              {`${Math.min(100, parseFloat(progresso_meta_economia.progresso_porcentagem).toFixed(0))}%`}
            </div>
          </div>
          <p className="text-right text-gray-500 text-sm mt-2">
            Taxa de Progresso: <span className="font-bold text-indigo-600">{formatPercentage(progresso_meta_economia.progresso_porcentagem)}</span>
          </p>
        </div>
      )}

      {/* Projeção de Gastos Futuros */}
      <div className="bg-white shadow-xl rounded-xl p-8 mb-8 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 flex items-center">
          <FaChartLine className="mr-3 text-blue-500" /> Projeção de Gastos Futuros
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          <FaInfoCircle className="inline-block mr-1 text-blue-400" />
          Projeções para os próximos meses baseadas na média mensal de {meses_com_transacao_no_periodo} meses com transações em {api_selected_year}.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-center">
          <div className="p-4 bg-blue-50 rounded-lg shadow-md border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Média Mensal Despesas</h3>
            <p className="text-2xl font-extrabold text-red-600">{formatCurrency(projecao_despesa_media_mensal_geral)}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg shadow-md border border-green-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Média Mensal Receitas</h3>
            <p className="text-2xl font-extrabold text-green-600">{formatCurrency(media_mensal_receitas_geral)}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg shadow-md border border-purple-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Média Diária Despesas</h3>
            <p className="text-2xl font-extrabold text-purple-600">{formatCurrency(media_diaria_despesas)}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg shadow-md border border-orange-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Média Semanal Despesas</h3>
            <p className="text-2xl font-extrabold text-orange-600">{formatCurrency(media_semanal_despesas)}</p>
          </div>
        </div>

        {/* Projeção para os Próximos 3 Meses */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaArrowRight className="mr-2 text-indigo-500" /> Cenário de 3 Meses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-lg text-gray-600">Despesa Projetada:</p>
              <p className="font-extrabold text-red-600 text-3xl">{formatCurrency(projecao_3_meses_despesa)}</p>
            </div>
            <div>
              <p className="text-lg text-gray-600">Receita Projetada:</p>
              <p className="font-extrabold text-green-600 text-3xl">{formatCurrency(projecao_3_meses_receita)}</p>
            </div>
            <div>
              <p className="text-lg text-gray-600">Saldo Projetado:</p>
              <p className={`font-extrabold text-3xl ${projecao_3_meses_saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(projecao_3_meses_saldo)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tendência de Despesas e Receitas */}
      <div className="bg-white shadow-xl rounded-xl p-8 mb-8 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 flex items-center">
          <FaChartBar className="mr-3 text-emerald-500" /> Tendências Financeiras
        </h2>
        {comparison_period_display ? (
            <p className="text-gray-600 mb-4 text-sm">
                <FaInfoCircle className="inline-block mr-1 text-gray-400" />
                Comparativo {comparison_period_display}.
            </p>
        ) : (
            <p className="text-gray-600 mb-4 text-sm">
                <FaInfoCircle className="inline-block mr-1 text-gray-400" />
                Não há dados suficientes para calcular as tendências de meses.
            </p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tendência de Despesas</h3>
            <p className={`text-2xl font-extrabold ${getTrendColorForMetric(trend_despesas, 'despesas')}`}>
              {getTrendIconForMetric(trend_despesas, 'despesas')} {formatPercentage(Math.abs(trend_despesas))}
            </p>
            <p className="text-sm text-gray-500 mt-1">em relação ao período anterior.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tendência de Receitas</h3>
            <p className={`text-2xl font-extrabold ${getTrendColorForMetric(trend_receitas, 'receitas')}`}>
              {getTrendIconForMetric(trend_receitas, 'receitas')} {formatPercentage(Math.abs(trend_receitas))}
            </p>
            <p className="text-sm text-gray-500 mt-1">em relação ao período anterior.</p>
          </div>
        </div>
      </div>

      {/* Projeção de Despesas por Categoria */}
      <div className="bg-white shadow-xl rounded-xl p-8 mb-8 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 flex items-center">
          <FaChartBar className="mr-3 text-purple-500" /> Projeção de Despesas por Categoria (Próximos 3 Meses)
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          <FaInfoCircle className="inline-block mr-1 text-gray-400" />
          Estimativa baseada na média mensal de gastos por categoria em {api_selected_year}.
        </p>
        {projecaoDespesasPorCategoriaChartData.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Nenhuma despesa para projetar por categoria em {api_selected_year}.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Média Mensal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeção 3 Meses</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projecao_despesa_media_mensal_por_categoria.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.categoria__nome || 'Sem Categoria'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatCurrency(item.avg_valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatCurrency(parseFloat(item.avg_valor) * 3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart
                  data={projecaoDespesasPorCategoriaChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#6b7280" angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="#6b7280" formatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                  <Bar dataKey="valor" name="Média Mensal" barSize={50} radius={[10, 10, 0, 0]}>
                    {projecaoDespesasPorCategoriaChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_PROJECTION_COLORS[index % CATEGORY_PROJECTION_COLORS.length]} />
                    ))}
                    <LabelList dataKey="valor" position="top" formatter={(value) => formatCurrency(value)} /> {/* Adicionado LabelList para mostrar valores */}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* Insights e Recomendações Inteligentes */}
      <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 flex items-center">
          <FaRegLightbulb className="mr-3 text-yellow-500" /> Insights e Recomendações
        </h2>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <FaFire className="mr-2 text-red-500" /> Alertas Importantes
          </h3>
          {alerts && alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <p key={index} className={`p-4 mb-2 rounded-lg flex items-center shadow-sm
                                         ${alert.type === 'warning' ? 'bg-orange-50 border border-orange-200 text-orange-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
                {alert.type === 'warning' ? <FaExclamationTriangle className="mr-3 text-xl" /> : <FaInfoCircle className="mr-3 text-xl" />}
                {alert.message}
              </p>
            ))
          ) : (
            <p className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center shadow-sm">
              <FaCheckCircle className="mr-3 text-xl" /> Tudo sob controle! Seus padrões financeiros estão saudáveis.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <FaStar className="mr-2 text-blue-500" /> Sugestões Personalizadas
          </h3>
          {suggestions && suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <p key={index} className={`p-4 mb-2 rounded-lg flex items-center shadow-sm
                                         ${suggestion.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
                {suggestion.type === 'success' ? <FaCheckCircle className="mr-3 text-xl" /> : <FaRegLightbulb className="mr-3 text-xl" />}
                {suggestion.message}
              </p>
            ))
          ) : (
            <p className="p-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg shadow-sm">
              Nenhuma sugestão ou elogio específico no momento. Continue registrando suas transações!
            </p>
          )}
        </div>
      </div>

      {/* Saldo Total no Ano Selecionado */}
      <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 flex items-center justify-center">
          <FaDollarSign className="mr-3 text-green-500" /> Saldo Líquido Total em {api_selected_year}
        </h2>
        <p className={`text-5xl font-extrabold ${economia_real_no_ano_selecionado >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
          {formatCurrency(economia_real_no_ano_selecionado)}
        </p>
        <p className="text-lg text-gray-500 mt-2">Este é o seu saldo final (receitas - despesas) acumulado para o ano {api_selected_year}.</p>
      </div>

    </div>
  );
}

export default ProjecoesPage;