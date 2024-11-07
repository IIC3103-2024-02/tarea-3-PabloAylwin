[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/O9GgJ1PR)

**Tarantibot**

Este es el repositorio de  **Tarantibot**, una aplicación web que utiliza un modelo de lenguaje (LLM) para responder preguntas sobre películas de Quentin Tarantino. El repositorio contiene el código fuente del  **frontend**, el  **backend**, y los  **guiones de las películas** , que se encuentran dentro de la carpeta **backend/**.

Visita la aplicación en vivo aquí: [https://tarantibot.netlify.app](https://tarantibot.netlify.app)

**Descripción General**

Tarantibot es un chatbot que permite a los usuarios hacer preguntas sobre las películas de Quentin Tarantino. Utiliza un enfoque de  **Recuperación Augmentada Generativa (RAG)** , combinando un modelo de lenguaje (LLM) con una base de datos de conocimientos construida a partir de los guiones de las películas.

La aplicación está compuesta por:

• **Backend** : Construido con FastAPI, maneja las solicitudes del frontend, realiza la búsqueda de información relevante en los guiones, y genera respuestas utilizando el LLM.

**• Frontend** : Construido con React, proporciona una interfaz de chat amigable para que los usuarios interactúen con el bot.

**•** **Guiones de las Películas** : Los guiones están almacenados en la carpeta **backend/** y se utilizan para construir la base de datos de conocimiento.

**Estructura del Proyecto**

```
tarea-3-PabloAylwin/
├── backend/
│   ├── main.py
│   ├── llm_integration.py
│   ├── create_database.py
│   ├── requirements.txt
│   ├── guiones/
│   │   ├── pelicula1.txt
│   │   ├── pelicula2.txt
│   │   └── ...
│   └── ...otros archivos
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...otros archivos
├── README.md
└── ...otros archivos del proyecto
```


**Funcionamiento**

**Backend**

El backend está desarrollado con **FastAPI** y realiza las siguientes funciones:

**•** **Procesamiento de Solicitudes** : Recibe las consultas del usuario desde el frontend.

**• Búsqueda de Contexto** : Utiliza una base de datos ChromaDB para buscar fragmentos relevantes de los guiones en función de la consulta.

**•** **Generación de Respuestas** : Envía el contexto y la consulta al LLM para generar una respuesta.

**•** **Manejo de Errores y Excepciones** : Gestiona los posibles errores en las solicitudes al LLM o en el procesamiento de datos.

**Frontend**

El frontend está construido con **React** y proporciona:

**• Interfaz de Chat** : Una interfaz amigable donde los usuarios pueden ingresar sus consultas y ver las respuestas del bot.

**•** **Diseño Responsivo y Atractivo** : Incluye mejoras visuales como un header personalizado, favicon, y estilos coherentes.

**•** **Manejo de Estados** : Indica al usuario cuando el bot está procesando una solicitud y maneja posibles errores.

**Despliegue**

El backend está desplegado en  **Render**  y el frontend está desplegado en  **Netlify** .

**Uso de la Aplicación**

**1. Acceder a la Aplicación**

    • Visita[https://tarantibot.netlify.app](https://tarantibot.netlify.app).

**2. Realizar Consultas**

    • Escribe una pregunta sobre las películas de Quentin Tarantino en el campo de entrada.

**3. Ver las Respuestas**

    • El bot responderá con información relevante y puede incluir imágenes o afiches de las películas.

**Consideraciones**

**•** **CORS** : El backend está configurado para permitir solicitudes desde el dominio del frontend.

**•** **Variables de Entorno** : Asegúrate de configurar correctamente las variables de entorno tanto en el backend como en el frontend.

**•** **Limitaciones del LLM** : Si el bot tarda en responder o devuelve un error, puede deberse a limitaciones de la API del LLM.
