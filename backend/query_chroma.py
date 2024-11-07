#* Devuelve segmentos que se ajustan a la query

from langchain_community.vectorstores import Chroma
from embedding_utils import CustomEmbeddings, CHROMA_PATH

def main():
    # Inicializa la función de embeddings y carga la base de datos de Chroma
    embedding_function = CustomEmbeddings()
    db = Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=embedding_function
    )

    # Realiza una consulta de ejemplo
    query = "¿De qué hamburguesa hablan en Pulp Fiction en el auto?"
    results = db.similarity_search(query, k=5)

    # Imprime los resultados
    for result in results:
        print("Texto:", result.page_content)
        print("Metadatos:", result.metadata)

if __name__ == "__main__":
    main()