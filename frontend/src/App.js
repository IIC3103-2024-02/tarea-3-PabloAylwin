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
      <Main />
    </div>
  );
}

export default App;

