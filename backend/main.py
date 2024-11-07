from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llm_integration import generate_response

app = FastAPI()

# Configurar CORS
origins = [
    "http://localhost:3000",  # React frontend
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Permitir solicitudes desde estos orígenes
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permitir todos los encabezados
)

class Query(BaseModel):
    query: str

@app.post("/ask")
async def ask(query: Query):
    user_query = query.query
    if not user_query:
        return {"error": "No query provided"}
    try:
        response_text = generate_response(user_query)
        return {"response": response_text}
    except Exception as e:
        print(f"Error al generar la respuesta: {e}")
        return {"error": "Error al procesar tu solicitud."}