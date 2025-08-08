// C:\meu_projeto_financas\frontend\src\pages\DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { FaSpinner, FaArrowUp, FaArrowDown, FaWallet, FaSearch, FaChartPie, FaChartBar, FaCalendarAlt } from 'react-icons/fa'; // Ícones necessários
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, XAxis, YAxis, CartesianGrid, Legend, Bar, LabelList } from 'recharts'; // Importar LabelList

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Paleta de cores baseada na imagem do gráfico fornecida (mais roxo, verde, laranja, rosa, vermelho)
const CATEGORY_PIE_COLORS_DASHBOARD = [
  '#6366F1', // Roxo/Azul do "Cartão"
  '#10B981', // Verde do "Educação"
  '#F59E0B', // Laranja do "Transporte"
  '#EC4899', // Rosa do "Outras"
  '#EF4444', // Vermelho (pode ser usado para "Contas Fixas" se tiver mais destaque)
  '#A855F7', // Um roxo mais claro
  '#3B82F6', // Um azul vibrante
  '#D97706', // Um laranja mais escuro
  '#C026D3', // Um fúcsia
  '#06B6D4', // Ciano
];

const STATUS_COLORS = { 'pago': '#10B981', 'pendente': '#F59E0B' }; // Esmeralda para pago, Âmbar para pendente

function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPeriodType, setSelectedPeriodType] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthNames = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let apiUrl = `${API_BASE_URL}/dashboard/`;
      if (selectedPeriodType === 'all') {
        apiUrl += '?period=all';
      } else {
        apiUrl += `?month=${selectedMonth}&year=${selectedYear}`;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Erro ao buscar dados do dashboard:", err);
      setError("Não foi possível carregar os dados do dashboard. Verifique a conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriodType, selectedMonth, selectedYear]);

  const handlePeriodTypeChange = (e) => {
    setSelectedPeriodType(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  // Classes de estilo para os inputs e selects nos filtros (reutilizadas de outras páginas)
  const inputOrSelectFilterClasses = "block w-full px-5 py-3 border border-indigo-300 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-800 bg-white transition-all duration-200 ease-in-out";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-2";

  // Função auxiliar para formatar moeda
  const formatCurrency = (value) => `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;

  // Função para customizar o label do gráfico de pizza
  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name, value }) => {
    // Não renderiza labels para fatias muito pequenas para evitar poluição visual
    if (percent * 100 < 2) { // Limite de 2% para mostrar o label diretamente
      return null;
    }
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20; // Distância do centro para o label (um pouco mais afastado)
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#333" // Cor do texto do label
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold" // Ajuste de fonte para o label
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-100px)] bg-white shadow-xl rounded-xl p-6">
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
        <p className="ml-4 text-xl text-gray-700">Carregando Dashboard...</p>
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

  if (!dashboardData) {
    return (
      <div className="text-center p-6 bg-white shadow-lg rounded-lg">
        <p className="text-lg text-gray-600">Nenhum dado de dashboard disponível.</p>
      </div>
    );
  }

  const {
    mes_referencia,
    total_gasto_mes,
    total_despesas_pendentes,
    saldo_final_projetado,
    receitas_mes_atual,
    gastos_por_categoria_mes_atual,
    gastos_por_status_mes_atual,
  } = dashboardData;

  // Lógica aprimorada para o gráfico de pizza: agregando e agrupando em "Outras"
  const rawPieChartData = gastos_por_categoria_mes_atual.reduce((acc, curr) => {
    const categoria = curr.categoria__nome || 'Sem Categoria';
    acc[categoria] = (acc[categoria] || 0) + parseFloat(curr.total);
    return acc;
  }, {});

  const totalGastosPie = Object.values(rawPieChartData).reduce((sum, value) => sum + value, 0);

  const THRESHOLD_PERCENTAGE = 3; // Categorias abaixo de 3% serão agrupadas em "Outras"
  let finalPieChartData = [];
  let othersValue = 0;

  // Converter para array de objetos e calcular porcentagens
  let sortedCategories = Object.keys(rawPieChartData).map(key => ({
    name: key,
    value: rawPieChartData[key],
    percentage: totalGastosPie > 0 ? (rawPieChartData[key] / totalGastosPie) * 100 : 0,
  })).sort((a, b) => b.value - a.value); // Ordenar do maior para o menor

  // Agrupar categorias pequenas em "Outras"
  sortedCategories.forEach(cat => {
    if (cat.percentage < THRESHOLD_PERCENTAGE) {
      othersValue += cat.value;
    } else {
      finalPieChartData.push(cat);
    }
  });

  if (othersValue > 0) {
    finalPieChartData.push({
      name: 'Outras',
      value: othersValue,
      percentage: totalGastosPie > 0 ? (othersValue / totalGastosPie) * 100 : 0,
    });
  }
  
  // Se houver apenas uma categoria "Outras" (caso raro, mas possível se todos os gastos forem minúsculos),
  // e o total de gastos for > 0, ajuste o nome.
  if (finalPieChartData.length === 0 && totalGastosPie > 0) {
    finalPieChartData.push({
      name: 'Outras (100%)',
      value: totalGastosPie,
      percentage: 100,
    });
  }


  const gastosPorStatusChartData = gastos_por_status_mes_atual.map(item => ({
    name: item.status === 'pago' ? 'Pagos' : 'Pendentes',
    value: parseFloat(item.total),
    status: item.status,
  })).filter(item => item.value > 0); // Filtra status com valor 0

  // Dados para o novo gráfico Receitas vs Despesas
  const receitasDespesasChartData = [
    {
      name: 'Receitas',
      valor: parseFloat(receitas_mes_atual),
    },
    {
      name: 'Despesas',
      valor: parseFloat(total_gasto_mes), // total_gasto_mes já inclui pendentes e pagos
    },
  ].filter(item => item.valor > 0); // Filtra barras com valor 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* TÍTULO PRINCIPAL COM GRADIENTE E SOMBRA */}
      <h1 className="text-4xl font-extrabold text-center pb-4 mb-8
                     bg-gradient-to-r from-indigo-600 to-purple-700
                     bg-clip-text text-transparent tracking-tight leading-none
                     drop-shadow-lg flex items-center justify-center">
        <FaChartPie className="mr-4 text-4xl" /> Dashboard Financeiro <span className="text-2xl text-gray-500 ml-3">{mes_referencia}</span>
      </h1>

      {/* Seção de Filtros - Reestilizada */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-100 shadow-2xl rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <FaCalendarAlt className="mr-2 text-indigo-600" /> Visualizar Período:
        </h2>
        <div className="flex-grow flex items-center space-x-4">
          <select
            id="selectPeriodType"
            value={selectedPeriodType}
            onChange={handlePeriodTypeChange}
            className={inputOrSelectFilterClasses}
          >
            <option value="month">Mês Específico</option>
            <option value="all">Todos os Meses</option>
          </select>

          {selectedPeriodType === 'month' && (
            <>
              <select
                id="selectMonth"
                value={selectedMonth}
                onChange={handleMonthChange}
                className={inputOrSelectFilterClasses}
              >
                {monthNames.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                id="selectYear"
                value={selectedYear}
                onChange={handleYearChange}
                className={inputOrSelectFilterClasses}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Cards de Indicadores Principais - Reestilizados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Card de Receitas */}
        <div className="bg-white rounded-xl shadow-xl p-7 text-center transform hover:scale-105 transition-transform duration-300 ease-in-out border-b-4 border-emerald-500">
          <FaArrowUp className="text-6xl text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Receitas do Período</h3>
          <p className="text-4xl font-extrabold text-emerald-600">
            {formatCurrency(receitas_mes_atual)}
          </p>
        </div>

        {/* Card de Despesas Totais */}
        <div className="bg-white rounded-xl shadow-xl p-7 text-center transform hover:scale-105 transition-transform duration-300 ease-in-out border-b-4 border-red-500">
          <FaArrowDown className="text-6xl text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Despesas Totais</h3>
          <p className="text-4xl font-extrabold text-red-600">
            {formatCurrency(total_gasto_mes)}
          </p>
        </div>

        {/* Card de Saldo */}
        <div className="bg-white rounded-xl shadow-xl p-7 text-center transform hover:scale-105 transition-transform duration-300 ease-in-out border-b-4 border-indigo-500">
          <FaWallet className="text-6xl text-indigo-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Saldo</h3>
          <p className={`text-4xl font-extrabold ${saldo_final_projetado >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            {formatCurrency(saldo_final_projetado)}
          </p>
        </div>
      </div>

      {/* Gráficos Reestilizados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Novo Gráfico: Receitas vs Despesas */}
        <div className="bg-white rounded-xl shadow-xl p-7 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center border-b pb-3 border-gray-200">
            <FaChartBar className="mr-3 text-indigo-500" /> Receitas vs Despesas
          </h2>
          {receitasDespesasChartData.length === 0 ? (
            <p className="text-gray-600 text-center py-10">Nenhum dado de receitas ou despesas para exibir no gráfico.</p>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={receitasDespesasChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" formatter={(value) => formatCurrency(value)} />
                  {/* Tooltip modificado para mostrar apenas R$ Valor */}
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="valor" barSize={80} radius={[10, 10, 0, 0]}>
                    {receitasDespesasChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.name === 'Receitas' ? '#10B981' : '#EF4444'} // Verde para Receitas, Vermelho para Despesas
                      />
                    ))}
                    {/* Modificado: LabelList para mostrar SÓ a porcentagem, sem parênteses */}
                    <LabelList 
                      dataKey="valor" 
                      position="top" 
                      formatter={(value, props) => {
                        const total = parseFloat(receitas_mes_atual) + parseFloat(total_gasto_mes);
                        const percentage = total > 0 ? (value / total * 100).toFixed(2) : '0.00';
                        return `${percentage}%`; // Apenas a porcentagem, sem parênteses
                      }} 
                      className="text-sm font-semibold" // Estilo para o label
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>


        {/* Gráfico de Donut: Gastos por Categoria */}
        <div className="bg-white rounded-xl shadow-xl p-7 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center border-b pb-3 border-gray-200">
            <FaChartPie className="mr-3 text-indigo-500" /> Gastos por Categoria
          </h2>
          {finalPieChartData.length === 0 ? (
            <p className="text-gray-600 text-center py-10">Nenhuma despesa para exibir no gráfico.</p>
          ) : (
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={finalPieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80} // Donut
                    outerRadius={120} // Tamanho da rosca
                    fill="#8884d8"
                    paddingAngle={3} // Espaço entre os slices
                    dataKey="value"
                    labelLine={true} // Mostrar linha para o label
                    label={renderCustomizedLabel} // Usar a função de label customizada
                  >
                    {finalPieChartData.map((entry, index) => (
                      <Cell key={`cell-category-${index}`} fill={CATEGORY_PIE_COLORS_DASHBOARD[index % CATEGORY_PIE_COLORS_DASHBOARD.length]} />
                    ))}
                  </Pie>
                  {/* Tooltip com formatação de moeda e porcentagem */}
                  <Tooltip formatter={(value, name, props) => [`${formatCurrency(value)} (${(props.payload.percentage).toFixed(2)}%)`, name]} />
                  {/* Removida a Legenda como solicitado */}
                  {/* <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} /> */}
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Gráfico de Barras: Despesas por Status */}
        <div className="bg-white rounded-xl shadow-xl p-7 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center border-b pb-3 border-gray-200">
            <FaChartBar className="mr-3 text-emerald-500" /> Despesas por Status
          </h2>
          {gastosPorStatusChartData.length === 0 ? (
            <p className="text-gray-600 text-center py-10">Nenhuma despesa para exibir no gráfico.</p>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={gastosPorStatusChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" /> {/* Linhas apenas horizontais e mais suaves */}
                  <XAxis dataKey="name" stroke="#6b7280" /> {/* Cor do texto do eixo X */}
                  <YAxis stroke="#6b7280" formatter={(value) => formatCurrency(value)} /> {/* Cor do texto do eixo Y e formatação */}
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="value" name="Total" barSize={80} radius={[10, 10, 0, 0]}> {/* Largura da barra e bordas arredondadas */}
                    {gastosPorStatusChartData.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={STATUS_COLORS[entry.status]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;