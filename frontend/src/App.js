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
      </header>
      <Main />
    </div>
  );
}

export default App;

