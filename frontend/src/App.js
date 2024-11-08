// App.js
import './App.css';
import React from 'react';
import { Helmet } from 'react-helmet';
import Main from './components/Main';

function App() {
  return (
    <div className="App">
      <Helmet>
        <title>Tarantibot</title>
      </Helmet>
      <header className="app-header">
        <h1>Tarantibot</h1>
        <p className="app-subtitle">Tu asistente experto en películas de Quentin Tarantino</p>
      </header>
      <main className="app-main">
        <Main />
      </main>
    </div>
  );
}

export default App;