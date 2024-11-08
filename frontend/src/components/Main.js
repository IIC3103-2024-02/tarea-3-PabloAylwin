// Main.js
import React, { useState, useEffect, useRef } from 'react';
import { Container, Col, Form, Button } from 'react-bootstrap';
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
      <Container fluid className="flex-grow-1 d-flex" style={{ maxWidth: '1200px' }}>
        {/* Columna Izquierda: Películas */}
        <Col xs={12} md={3} className="peliculas-col">
          <h2 className="peliculas-titulo text-center">Películas Disponibles</h2>
          <div className="peliculas-lista">
            {peliculas.map((pelicula, index) => (
              <Button
                key={index}
                variant="outline-primary"
                className="pelicula-boton mb-2 w-100"
                onClick={() => handleSelectPelicula(pelicula)}
                disabled={loading}
              >
                {pelicula}
              </Button>
            ))}
          </div>
        </Col>

        {/* Columna Central: Chat */}
        <Col xs={12} md={6} className="chat-col d-flex flex-column">
          <div className="messages-container flex-grow-1 mb-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-2`}
              >
                <div
                  className={`message-bubble ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="d-flex justify-content-start mb-2">
                <div className="message-bubble bot-message">
                  Escribiendo...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} /> {/* Referencia para el scroll */}
          </div>
          <div className="input-row">
            <Form.Control
              type="text"
              placeholder="Escribe un mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
              disabled={loading} // Deshabilitar el input mientras carga
            />
            <Button
              onClick={handleSend}
              variant="primary"
              className="mt-2 w-100"
              disabled={loading}
            >
              Enviar
            </Button>
          </div>
        </Col>

        {/* Columna Derecha: Imágenes Laterales */}
        <Col xs={12} md={3} className="images-col d-none d-md-flex flex-column align-items-center">
          {/* Seis imágenes iguales */}
          <img src="/image.png" alt="Decoration 1" className="side-image mb-3" />
          <img src="/image.png" alt="Decoration 2" className="side-image mb-3" />
          <img src="/image.png" alt="Decoration 3" className="side-image mb-3" />
          <img src="/image.png" alt="Decoration 4" className="side-image mb-3" />
          <img src="/image.png" alt="Decoration 5" className="side-image mb-3" />
          <img src="/image.png" alt="Decoration 6" className="side-image" />
        </Col>
      </Container>
    </div>
  );
}

export default Main;