// Main.js
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import './Main.css'; // Asegúrate de crear este archivo para estilos específicos

function Main() {
  const [messages, setMessages] = useState([]); // Estado para almacenar los mensajes
  const [input, setInput] = useState(''); // Estado para el valor del input de texto
  const [loading, setLoading] = useState(false); // Estado para indicar si está cargando
  const messagesEndRef = useRef(null); // Referencia para el scroll

  const peliculas = [
    'Aliens',
    'Drive',
    'Jaws',
    'Kill Bill',
    'La La Land',
    'No Country For Old Men',
    'Pulp Fiction',
    'The Dark Knight Rises',
    'The Shawshank Redemption',
    'The Silence of the Lambs',
  ];

  const handleSend = () => {
    if (input.trim()) {
      const userMessage = input.trim();
      setMessages([...messages, { text: userMessage, sender: 'user' }]); // Agrega el mensaje del usuario
      setInput(''); // Limpia el input
      setLoading(true); // Indica que está cargando

      // Hacer una llamada al backend para obtener una respuesta
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/ask`, { query: userMessage })
        .then(response => {
          const botResponse = response.data.response;
          setMessages(prevMessages => [
            ...prevMessages,
            { text: botResponse, sender: 'bot' },
          ]);
        })
        .catch(error => {
          console.error('Error al obtener la respuesta del bot:', error);
          setMessages(prevMessages => [
            ...prevMessages,
            { text: 'Lo siento, ocurrió un error al procesar tu solicitud.', sender: 'bot' },
          ]);
        })
        .finally(() => {
          setLoading(false); // Termina la carga
        });
    }
  };

  const handleSelectPelicula = (nombrePelicula) => {
    const userMessage = `Quiero saber más sobre "${nombrePelicula}".`;
    setMessages([...messages, { text: userMessage, sender: 'user' }]); // Agrega el mensaje del usuario
    setLoading(true); // Indica que está cargando

    // Hacer una llamada al backend para obtener una respuesta
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/ask`, { query: userMessage })
      .then(response => {
        const botResponse = response.data.response;
        setMessages(prevMessages => [
          ...prevMessages,
          { text: botResponse, sender: 'bot' },
        ]);
      })
      .catch(error => {
        console.error('Error al obtener la respuesta del bot:', error);
        setMessages(prevMessages => [
          ...prevMessages,
          { text: 'Lo siento, ocurrió un error al procesar tu solicitud.', sender: 'bot' },
        ]);
      })
      .finally(() => {
        setLoading(false); // Termina la carga
      });
  };

  // Scroll automático al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="main-content flex-grow-1 d-flex flex-column">
      <Container className="flex-grow-1 d-flex flex-column position-relative" style={{ maxWidth: '800px' }}>
        {/* Sección de Películas */}
        <Row className="peliculas-seccion mb-4">
          <Col>
            <h2 className="peliculas-titulo text-center">Películas Disponibles para Consultar</h2>
            <Row className="mt-3 justify-content-center">
              {peliculas.map((pelicula, index) => (
                <Col xs={6} sm={4} md={3} key={index} className="mb-3">
                  <Button
                    variant="outline-primary"
                    className="w-100 pelicula-boton"
                    onClick={() => handleSelectPelicula(pelicula)}
                    disabled={loading}
                  >
                    {pelicula}
                  </Button>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* Sección de Chat */}
        <Row className="flex-grow-1 d-flex align-items-center">
          {/* Contenedor del Chat */}
          <Col xs={12}>
            <div
              className="messages-container mb-3"
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                padding: '15px',
                overflowY: 'auto',
                height: '400px', // Ajusta la altura según necesidad
              }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-2`}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '10px 15px',
                      borderRadius: '15px',
                      backgroundColor: msg.sender === 'user' ? '#007bff' : '#e9ecef',
                      color: msg.sender === 'user' ? 'white' : 'black',
                      textAlign: 'justify',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="d-flex justify-content-start mb-2">
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '10px 15px',
                      borderRadius: '15px',
                      backgroundColor: '#e9ecef',
                      color: 'black',
                    }}
                  >
                    Escribiendo...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} /> {/* Referencia para el scroll */}
            </div>
          </Col>
        </Row>

        {/* Formulario de Entrada de Texto */}
        <Row className="input-row mt-auto">
          <Col xs={10}>
            <Form.Control
              type="text"
              placeholder="Escribe un mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
              disabled={loading} // Deshabilitar el input mientras carga
            />
          </Col>
          <Col xs={2} className="d-flex align-items-center">
            <Button onClick={handleSend} variant="primary" className="w-100" disabled={loading}>
              Enviar
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Main;