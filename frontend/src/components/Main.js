// Main.js
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import './Main.css'; // Asegúrate de crear este archivo para estilos específicos

function Main() {
  const [messages, setMessages] = useState([]); // Estado para almacenar los mensajes
  const [input, setInput] = useState(''); // Estado para el valor del input de texto
  const [loading, setLoading] = useState(false); // Estado para indicar si está cargando
  const messagesEndRef = useRef(null); // Referencia para el scroll

  const peliculas = [
    { nombre: 'Aliens', imagen: '/aliens.jpg' },
    { nombre: 'Drive', imagen: '/drive.jpg' },
    { nombre: 'Jaws', imagen: '/jaws.jpg' },
    { nombre: 'Kill Bill', imagen: '/kill_bill.jpg' },
    { nombre: 'La La Land', imagen: '/la_la_land.jpg' },
    { nombre: 'No Country For Old Men', imagen: '/no_country_for_old_men.jpg' },
    { nombre: 'Pulp Fiction', imagen: '/pulp_fiction.jpg' },
    { nombre: 'The Dark Knight Rises', imagen: '/the_dark_knight_rises.jpg' },
    { nombre: 'The Shawshank Redemption', imagen: '/the_shawshank_redemption.jpg' },
    { nombre: 'The Silence of the Lambs', imagen: '/the_silence_of_the_lambs.jpg' },
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
      <Container className="flex-grow-1 d-flex flex-column position-relative" style={{ maxWidth: '1200px' }}>
        {/* Sección de Películas */}
        <Row className="peliculas-seccion mb-4">
          <Col>
            <h2 className="peliculas-titulo text-center">Películas Disponibles para Consultar</h2>
            <Row className="mt-3">
              {peliculas.map((pelicula, index) => (
                <Col xs={12} sm={6} md={4} lg={3} key={index} className="mb-4">
                  <Card className="pelicula-card h-100" onClick={() => handleSelectPelicula(pelicula.nombre)}>
                    <Card.Img variant="top" src={pelicula.imagen} alt={pelicula.nombre} className="pelicula-imagen" />
                    <Card.Body>
                      <Card.Title className="text-center">{pelicula.nombre}</Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* Sección de Chat */}
        <Row className="flex-grow-1 d-flex align-items-center">
          {/* Imagen Izquierda */}
          <Col xs={12} md={2} className="d-none d-md-block text-center">
            <img src="/left-image.png" alt="Left Decoration" className="side-image" />
          </Col>

          {/* Contenedor del Chat */}
          <Col xs={12} md={8}>
            <div
              className="messages-container mb-3"
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                padding: '15px',
                overflowY: 'auto',
                height: '500px', // Ajusta la altura según necesidad
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

          {/* Imagen Derecha */}
          <Col xs={12} md={2} className="d-none d-md-block text-center">
            <img src="/right-image.png" alt="Right Decoration" className="side-image" />
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