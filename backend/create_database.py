import os
import shutil
import logging
import requests
import json
import time
from datetime import datetime
from typing import List
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.vectorstores import Chroma
from langchain.embeddings.base import Embeddings
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Configuración de logging
log_file = f"embeddings_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Directorios
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BACKEND_DIR, "chroma")
DATA_PATH = os.path.join(BACKEND_DIR, "guiones")

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
        embeddings = []
        for text in texts:
            try:
                embedding = self.embed_query(text)
                embeddings.append(embedding)
            except Exception as e:
                logger.error(f"Error embedding document: {str(e)}")
                embeddings.append(None)
        return embeddings

def main():
    generate_data_store()

def generate_data_store():
    documents = load_documents()
    if not documents:
        logger.error("No hay documentos para procesar.")
        return
    chunks = split_text(documents)

    # Generar embeddings y guardar en Chroma
    save_to_chroma(chunks)

def load_documents():
    logger.info(f"Cargando documentos desde {DATA_PATH}")
    # Verificar que el directorio exista
    if not os.path.exists(DATA_PATH):
        logger.error(f"El directorio {DATA_PATH} no existe.")
        return []
    # Cargar archivos .md
    loader = DirectoryLoader(DATA_PATH, glob="*.md")
    documents = loader.load()
    if not documents:
        logger.error("No se encontraron documentos Markdown para cargar.")
    else:
        logger.info(f"Se cargaron {len(documents)} documentos.")
    return documents

def split_text(documents: List[Document]):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=3000,
        chunk_overlap=300,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    logger.info(f"Divididos {len(documents)} documentos en {len(chunks)} fragmentos.")
    # Opcional: Mostrar un fragmento de ejemplo
    if chunks:
        document = chunks[0]
        logger.info(f"Ejemplo de fragmento:\n{document.page_content}")
        logger.info(f"Metadatos: {document.metadata}")
    return chunks

def save_progress(last_processed_index, file_path="progress.json"):
    """Guardar progreso actual"""
    with open(file_path, 'w') as f:
        json.dump({
            'last_processed_index': last_processed_index
        }, f)
    logger.info(f"Progreso guardado en {file_path}")

def load_progress(file_path="progress.json"):
    """Cargar progreso anterior"""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        logger.info(f"Progreso cargado desde {file_path}")
        return data['last_processed_index']
    except FileNotFoundError:
        return 0

def save_to_chroma(chunks: List[Document]):
    # Inicializar Chroma
    embedding_function = CustomEmbeddings()
    db = Chroma(
        embedding_function=embedding_function,
        persist_directory=CHROMA_PATH
    )

    texts = [chunk.page_content for chunk in chunks]
    metadatas = [chunk.metadata for chunk in chunks]

    # Cargar progreso anterior si existe
    start_index = load_progress()
    total_texts = len(texts)

    logger.info(f"Iniciando procesamiento desde índice {start_index}")

    batch_size = 10  # Ajusta el tamaño del lote según tus necesidades
    max_retries = 10

    for i in range(start_index, total_texts, batch_size):
        end_index = min(i + batch_size, total_texts)
        batch_texts = texts[i:end_index]
        batch_metadatas = metadatas[i:end_index]
        batch_embeddings = []

        for j, text in enumerate(batch_texts):
            retry_count = 0
            embedding = None
            while retry_count < max_retries:
                try:
                    if not text.strip():
                        logger.warning(f"El texto {i + j} está vacío o contiene solo espacios en blanco.")
                        break  # Saltar este texto

                    # Esperar entre solicitudes para no sobrecargar el servidor
                    time.sleep(1)

                    embedding = embedding_function.embed_query(text)
                    # Embedding generado exitosamente
                    break  # Salir del bucle de reintentos

                except Exception as e:
                    retry_count += 1
                    wait_time = min(300, retry_count * 30)  # Máximo 5 minutos de espera
                    logger.error(f"Error en texto {i + j} (intento {retry_count}): {str(e)}")
                    logger.info(f"Esperando {wait_time} segundos antes de reintentar...")
                    time.sleep(wait_time)
                    if retry_count == max_retries:
                        logger.error(f"No se pudo procesar el texto {i + j} después de {max_retries} intentos")
            batch_embeddings.append(embedding)

        # Filtrar embeddings válidos
        data = [
            (text, metadata, embedding)
            for text, metadata, embedding in zip(batch_texts, batch_metadatas, batch_embeddings)
            if embedding is not None
        ]

        if data:
            texts_to_add, metadatas_to_add, embeddings_to_add = zip(*data)
            embeddings_to_add = [list(embedding) for embedding in embeddings_to_add]  # Asegurar que son listas
            db.add_texts(
                texts=list(texts_to_add),
                metadatas=list(metadatas_to_add),
                embeddings=list(embeddings_to_add)
            )
            logger.info(f"Embeddings agregados para textos {i} a {end_index - 1}")
        else:
            logger.warning(f"No se pudieron agregar embeddings para textos {i} a {end_index -1}")

        # Guardar progreso
        save_progress(end_index)

    # Persistir la base de datos
    if hasattr(db, 'persist'):
        db.persist()
    else:
        db._client.persist()
    logger.info(f"Guardados {total_texts} fragmentos en {CHROMA_PATH}.")

    # Limpiar archivo de progreso si todo fue exitoso
    if os.path.exists("progress.json"):
        os.remove("progress.json")

if __name__ == "__main__":
    main()