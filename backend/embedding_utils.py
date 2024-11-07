import os
import requests
import logging
from typing import List
from langchain.embeddings.base import Embeddings
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Configuración de logging (opcional)
logger = logging.getLogger(__name__)

# Directorio de Chroma
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BACKEND_DIR, "chroma")

# Clase para usar la API de tormenta
class CustomEmbeddings(Embeddings):
    def __init__(self):
        self.api_url = "http://tormenta.ing.puc.cl/api/embed"
        self.session = requests.Session()
        # Configurar reintentos
        retry_strategy = Retry(
            total=5,
            backoff_factor=10,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["POST"]
            )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

    def embed_query(self, text: str) -> List[float]:
        response = self.session.post(
            self.api_url,
            json={"model": "nomic-embed-text", "input": text},
            timeout=60
        )
        response.raise_for_status()
        embedding = response.json().get("embeddings", [])[0]
        return embedding

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        # Implementación requerida, pero no utilizada
        raise NotImplementedError("Este método no se utiliza.")