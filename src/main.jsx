// C:\meu_projeto_financas\frontend\src\main.jsx

import React from 'react' // Mantenha a importação de React
import ReactDOM from 'react-dom/client'
import AppWrapper from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper /> {/* MUDANÇA AQUI */}
  </React.StrictMode>,
)