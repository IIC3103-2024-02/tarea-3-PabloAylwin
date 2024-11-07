import requests
import logging
import tiktoken
from typing import List
from langchain_chroma import Chroma
from embedding_utils import CustomEmbeddings, CHROMA_PATH
import time

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializar la función de embeddings y cargar la base de datos de Chroma
embedding_function = CustomEmbeddings()
db = Chroma(
    persist_directory=CHROMA_PATH,
    embedding_function=embedding_function
)

def num_tokens_from_string(string: str, encoding_name: str = "cl100k_base") -> int:
    """Devuelve el número de tokens en una cadena de texto."""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

def count_tokens_in_messages(messages: List[dict], encoding_name: str = "cl100k_base") -> int:
    """Cuenta el número total de tokens en una lista de mensajes."""
    encoding = tiktoken.get_encoding(encoding_name)
    total_tokens = 0
    for message in messages:
        content = message['content']
        total_tokens += len(encoding.encode(content))
    return total_tokens

def call_llm_api(messages: List[dict]) -> str:
    """Llama a la API del LLM compatible con OpenAI API."""
    url = "http://tormenta.ing.puc.cl/v1/chat/completions"
    
    payload = {
        "model": "integra-LLM",
        "messages": messages,
        "temperature": 0.6,
        "max_tokens": 512,  # Ajusta según necesidad
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers
            #!timeout=120  # Timeout según documentación
        )
        response.raise_for_status()  # Lanzar excepción si hay error HTTP
        
        data = response.json()
        generated_text = data['choices'][0]['message']['content']
        
        return generated_text.strip()
        
    except requests.exceptions.HTTPError as e:
        logger.error(f"Error HTTP al llamar a la API del LLM: {str(e)}")
        response = e.response  # Obtener el objeto response desde la excepción
        if response is not None:
            if response.status_code == 500:
                return ("Error interno del servidor LLM. Por favor, intenta con un "
                        "prompt más corto o espera unos momentos.")
            else:
                return f"Error HTTP: {response.status_code}"
        else:
            return "Error desconocido al llamar a la API del LLM."
    except requests.exceptions.Timeout:
        logger.error("La solicitud a la API del LLM excedió el tiempo límite de 120 segundos.")
        return ("Lo siento, el servidor está tardando mucho en responder. "
                "Intenta con un prompt más corto.")
    except requests.exceptions.RequestException as e:
        logger.error(f"Error al llamar a la API del LLM: {str(e)}")
        return "Lo siento, ocurrió un error al procesar tu solicitud."
    except Exception as e:
        logger.error(f"Error inesperado en call_llm_api: {str(e)}")
        return "Ocurrió un error inesperado al procesar tu solicitud."

def create_messages(context: str, query: str) -> List[dict]:
    """Crea la lista de mensajes para el modelo."""
    system_message = {
        "role": "system",
        "content": "Eres un asistente experto en películas."
    }
    user_message = {
        "role": "user",
        "content": f"Pregunta: {query}\n\nContexto:\n{context}"
    }
    return [system_message, user_message]

def generate_response(user_query: str) -> str:
    """Genera una respuesta a la consulta del usuario utilizando RAG y el LLM."""
    try:
        logger.info(f"Iniciando procesamiento de consulta: {user_query}")
        print("Procesando su consulta, esto puede tomar unos minutos...")
        
        # Recuperar fragmentos relevantes
        start_time = time.time()
        logger.debug("Iniciando búsqueda de similitud...")
        k = 1
        results = db.similarity_search(user_query, k=k)
        logger.debug(f"Búsqueda completada en {time.time() - start_time:.2f} segundos")
        
        context_fragments = [result.page_content for result in results]
        context = "\n\n".join(context_fragments)
        logger.debug(f"Recuperados {len(context_fragments)} fragmentos")
        
        # Crear mensajes para el modelo
        messages = create_messages(context, user_query)
        logger.debug("Mensajes creados")
        
        # Contar tokens y ajustar si es necesario
        max_tokens_model = 2048
        tokens_reserved_for_response = 512  # Tokens reservados para la respuesta
        tokens_used = count_tokens_in_messages(messages)
        logger.info(f"Tokens usados en los mensajes: {tokens_used}")
        
        while tokens_used + tokens_reserved_for_response > max_tokens_model:
            logger.info("El total de tokens excede el límite del modelo. Ajustando el contexto...")
            # Recortar el contexto
            if len(context_fragments) > 1:
                context_fragments.pop()  # Elimina el último fragmento
                context = "\n\n".join(context_fragments)
                messages = create_messages(context, user_query)
                tokens_used = count_tokens_in_messages(messages)
                logger.info(f"Nuevo total de tokens: {tokens_used}")
            else:
                # Si solo queda un fragmento, recortar su contenido
                context = context[:int(len(context) * 1)]  #! Recorta un 50%
                messages = create_messages(context, user_query)
                tokens_used = count_tokens_in_messages(messages)
                logger.info(f"Nuevo total de tokens después de recortar: {tokens_used}")
                if tokens_used + tokens_reserved_for_response <= max_tokens_model:
                    break
                # Si sigue excediendo, reducir más
                continue

        # Verificar tokens finales
        total_tokens = tokens_used + tokens_reserved_for_response
        logger.info(f"Tokens totales (mensajes + respuesta esperada): {total_tokens}")

        # Llamar a la API del LLM
        start_time = time.time()
        logger.debug("Llamando a API del LLM...")
        response = call_llm_api(messages)
        logger.debug(f"LLM respondió en {time.time() - start_time:.2f} segundos")
        
        logger.info("Respuesta generada exitosamente")
        return response

    except Exception as e:
        logger.error(f"Error en generate_response: {str(e)}")
        return "Ocurrió un error inesperado al procesar tu solicitud."

def test_llm_api():
    messages = [
        {"role": "system", "content": "Eres un asistente de prueba."},
        {"role": "user", "content": "quién es el protagonista en the dark knight rises?"}
    ]
    response = call_llm_api(messages)
    print("Respuesta del LLM de prueba:")
    print(response)

if __name__ == '__main__':
    # Prueba rápida
    #test_llm_api()
    user_query = "¿Cuál es la trama principal de La La Land?"
    print("Iniciando consulta, por favor espere...")
    response = generate_response(user_query)
    print("\nRespuesta del LLM:")
    print(response)