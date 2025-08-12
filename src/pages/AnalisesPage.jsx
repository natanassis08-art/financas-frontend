// C:\meu_projeto_financas\frontend\src\pages\AnalisesPage.jsx

import React, { useState, useEffect } from 'react';
import { FaSpinner, FaChartLine, FaChartPie, FaChartBar, FaFilter, FaSearch, FaTimesCircle } from 'react-icons/fa';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Cores mais elegantes para os gráficos
const CHART_COLORS_RECEITA = '#10B981'; // Esmeralda
const CHART_COLORS_DESPESA = '#EF4444'; // Vermelho
const CHART_COLORS_SALDO = '#6366F1';   // Índigo

// Cores para o gráfico de pizza de categorias
const CATEGORY_PIE_COLORS = [
  '#6366F1', // Indigo-500
  '#10B981', // Emerald-500
  '#F59E0B', // Amber-500
  '#EF4444', // Red-500
  '#8B5CF6', // Violet-500
  '#EC4899', // Pink-500
  '#3B82F6', // Blue-500
  '#A855F7', // Purple-500
  '#D97706', // Orange-500
  '#06B6D4', // Cyan-500
  '#C026D3', // Fuchsia-600
];

// Mapeamento de números de mês para nomes em português (completo e abreviado)
const monthMap = new Map([
  [1, 'Janeiro'], [2, 'Fevereiro'], [3, 'Março'], [4, 'Abril'],
  [5, 'Maio'], [6, 'Junho'], [7, 'Julho'], [8, 'Agosto'],
  [9, 'Setembro'], [10, 'Outubro'], [11, 'Novembro'], [12, 'Dezembro']
]);

// Função auxiliar para obter o nome abreviado do mês
const getShortMonthName = (monthNumber) => {
  if (!monthNumber) return '';
  const monthName = monthMap.get(monthNumber);
  return monthName ? monthName.slice(0, 3) : ''; // Retorna os 3 primeiros caracteres ou vazio
};

function AnalisesPage() {
  const [analisesData, setAnalisesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [allCategories, setAllCategories] = useState([]);

  // Usar o monthMap para gerar as opções do filtro de mês
  const monthFilterOptions = [
    { value: '', label: 'Todos os Meses' },
    ...Array.from(monthMap.entries()).map(([value, label]) => ({ value, label }))
  ];

 useEffect(() => {
  // Verificação de segurança para o mês. Garante que o mês, se existir, seja um número válido.
  if (selectedMonth && (parseInt(selectedMonth, 10) < 1 || parseInt(selectedMonth, 10) > 12)) {
    console.error("Mês inválido em Análises, requisição abortada:", selectedMonth);
    setError("Filtro de mês inválido selecionado.");
    setLoading(false);
    return; // Aborta a busca de dados
  }
  // <<< FIM DA CORREÇÃO >>>

  const fetchAnalisesAndCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const categoriasResponse = await fetch(`${API_BASE_URL}/categorias/`);
      if (!categoriasResponse.ok) {
        throw new Error(`HTTP error! status: ${categoriasResponse.status} ao buscar categorias`);
      }
      const categoriasData = await categoriasResponse.json();
      setAllCategories(categoriasData);

      const queryParams = new URLSearchParams();
      if (selectedMonth) queryParams.append('month', selectedMonth);
      if (selectedCategory) queryParams.append('categoria', selectedCategory);

      const apiUrl = `${API_BASE_URL}/analises/?${queryParams.toString()}`;

      const analisesResponse = await fetch(apiUrl);
      if (!analisesResponse.ok) {
        throw new Error(`HTTP error! status: ${analisesResponse.status} ao buscar análises`);
      }
      const data = await analisesResponse.json();
      setAnalisesData(data);

    } catch (err) {
      console.error("Erro ao buscar dados de análises:", err);
      setError("Não foi possível carregar os dados de análises. Verifique a conexão com o servidor ou os filtros.");
    } finally {
      setLoading(false);
    }
  };

  fetchAnalisesAndCategories();
}, [selectedMonth, selectedCategory]);

  const handleClearFilters = () => {
    setSelectedMonth('');
    setSelectedCategory('');
  };

  // Re-escrita da lógica de ordenação para ser mais robusta
  const saldoMensalChartData = analisesData?.saldo_mensal?.map(item => {
    const shortMonthName = getShortMonthName(item.mes); // Usar a função consistente
    return {
      name: `${shortMonthName}/${item.ano.toString().slice(-2)}`,
      receita: parseFloat(item.receita_total),
      despesa: parseFloat(item.despesa_total),
      saldo: parseFloat(item.saldo_final),
    };
  }).sort((a, b) => {
    // Extrair ano e mês do nome formatado
    const [monthAStr, yearAStr] = a.name.split('/');
    const [monthBStr, yearBStr] = b.name.split('/');

    // Mapear nome abreviado do mês para número para ordenação
    const getMonthNumFromShortName = (shortName) => {
      for (let [num, fullName] of monthMap.entries()) {
        if (fullName.slice(0, 3).toLowerCase() === shortName.toLowerCase()) {
          return num;
        }
      }
      return 0; // Retorna 0 ou outro valor para meses desconhecidos, ou joga um erro se for essencial
    };

    const monthA = getMonthNumFromShortName(monthAStr);
    const monthB = getMonthNumFromShortName(monthBStr);

    const fullYearA = parseInt(`20${yearAStr}`, 10);
    const fullYearB = parseInt(`20${yearBStr}`, 10);

    // Comparar por ano, depois por mês
    if (fullYearA !== fullYearB) {
      return fullYearA - fullYearB;
    }
    return monthA - monthB;
  }) || [];


  // Lógica aprimorada para o gráfico de pizza: agregando e agrupando em "Outras"
  const rawPieChartData = analisesData?.gastos_por_categoria_mes?.reduce((acc, curr) => {
    const categoria = curr.categoria_nome || 'Sem Categoria';
    acc[categoria] = (acc[categoria] || 0) + parseFloat(curr.total);
    return acc;
  }, {}) || {};

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

  // Se houver apenas uma categoria "Outras", talvez não queiramos um gráfico
  if (finalPieChartData.length === 0 && totalGastosPie > 0) {
    // Caso especial onde todos os gastos são minúsculos e viram "Outras"
    finalPieChartData.push({
      name: 'Outras (100%)',
      value: totalGastosPie,
      percentage: 100,
    });
  }
  
  // Função para customizar o label do gráfico de pizza
  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 10; // Distância do centro para o label
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const percentageText = (percent * 100).toFixed(0);
    if (percentageText === '0') return null; // Não mostrar labels para 0%

    return (
      <text
        x={x}
        y={y}
        fill="#333" // Cor do texto do label (pode ser ajustado)
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${name} (${percentageText}%)`}
      </text>
    );
  };


  const inputOrSelectFilterClasses = "block w-full px-5 py-3 border border-indigo-300 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-gray-800 bg-white transition-all duration-200 ease-in-out";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-2";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-100px)] bg-white shadow-xl rounded-xl p-6">
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
        <p className="ml-4 text-xl text-gray-700">Carregando análises financeiras...</p>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-center pb-4 mb-8
                     bg-gradient-to-r from-indigo-600 to-purple-700
                     bg-clip-text text-transparent tracking-tight leading-none
                     drop-shadow-lg flex items-center justify-start">
        <FaChartPie className="mr-4 text-4xl text-indigo-600" /> Análises Financeiras
      </h1>

      {/* SEÇÃO DE FILTROS */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-100 shadow-2xl rounded-xl p-8 mb-8 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b-2 border-indigo-200 pb-4 flex items-center">
          <FaFilter className="mr-3 text-indigo-600" /> Filtrar Análises
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-8">
          <div>
            <label htmlFor="monthFilter" className={labelClasses}>Mês</label>
            <select
              id="monthFilter"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={inputOrSelectFilterClasses}
            >
              {monthFilterOptions.map(m => ( // Usar monthFilterOptions
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="categoryFilter" className={labelClasses}>Categoria</label>
            <select
              id="categoryFilter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={inputOrSelectFilterClasses}
            >
              <option value="">Todas as Categorias</option>
              {allCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
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
            // Este botão não precisa de um onClick que chame o fetch, pois o useEffect já reage aos estados de filtro.
            // Ele serve mais como um feedback visual de "aplicar".
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg flex items-center shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            <FaSearch className="mr-2" /> Buscar
          </button>
        </div>
      </div>

      {/* Saldo Mensal */}
      <div className="bg-white shadow-xl rounded-xl p-8 mb-8 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 flex items-center">
          <FaChartLine className="mr-3 text-blue-500" /> Saldo Mensal
        </h2>
        {analisesData?.saldo_mensal?.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Nenhum dado de saldo mensal disponível para os filtros atuais.</p>
        ) : (
          <>
            <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ano</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receita Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Despesa Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Final</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analisesData?.saldo_mensal?.map((item, index) => (
                    <tr key={`${item.ano}-${item.mes}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.ano}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 capitalize">{monthMap.get(item.mes)}</td> {/* Usar monthMap aqui */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">R$ {parseFloat(item.receita_total).toFixed(2).replace('.', ',')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">R$ {parseFloat(item.despesa_total).toFixed(2).replace('.', ',')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        <span className={item.saldo_final >= 0 ? 'text-green-700' : 'text-red-700'}>
                          R$ {parseFloat(item.saldo_final).toFixed(2).replace('.', ',')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FaChartBar className="mr-2 text-indigo-500" /> Comparativo de Saldo Mensal
            </h3>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart
                  data={saldoMensalChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" formatter={(value) => `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`} />
                  <Tooltip formatter={(value, name) => [`R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`, name]} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="receita" fill={CHART_COLORS_RECEITA} name="Receita" barSize={30} radius={[10, 10, 0, 0]} />
                  <Bar dataKey="despesa" fill={CHART_COLORS_DESPESA} name="Despesa" barSize={30} radius={[10, 10, 0, 0]} />
                  <Bar dataKey="saldo" fill={CHART_COLORS_SALDO} name="Saldo Final" barSize={30} radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* Gastos por Categoria por Mês */}
      <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100 transform hover:scale-[1.005] transition-transform duration-300 ease-in-out">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 flex items-center">
          <FaChartPie className="mr-3 text-purple-500" /> Gastos por Categoria por Mês
        </h2>
        {analisesData?.gastos_por_categoria_mes?.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Nenhum dado de gastos por categoria disponível para os filtros atuais.</p>
        ) : (
          <>
            <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ano</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Gasto</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analisesData?.gastos_por_categoria_mes?.map((item, index) => (
                    <tr key={`${item.ano}-${item.mes}-${item.categoria_nome}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.ano}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 capitalize">{monthMap.get(item.mes)}</td> {/* Usar monthMap aqui */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.categoria_nome || 'Sem Categoria'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">R$ {parseFloat(item.total).toFixed(2).replace('.', ',')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <FaChartPie className="mr-2 text-red-500" /> Distribuição de Gastos por Categoria
            </h3>
            {/* Lógica para carregar o gráfico mesmo que a tabela esteja vazia */}
            {finalPieChartData.length === 0 ? (
                <p className="text-gray-600 text-center py-10">Nenhuma despesa para exibir no gráfico de pizza com os filtros atuais.</p>
            ) : (
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={finalPieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60} // Donut
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        labelLine={false} // Não mostra as linhas de label padrão
                        label={renderCustomizedLabel} // Usar o label customizado
                        paddingAngle={3}
                      >
                        {finalPieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_PIE_COLORS[index % CATEGORY_PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`, name]} />
                      {/* Removida a Legenda padrão se o label for customizado para não duplicar informação */}
                      {/* <Legend wrapperStyle={{ paddingTop: '20px' }} /> */}
                    </PieChart>
                  </ResponsiveContainer>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AnalisesPage;