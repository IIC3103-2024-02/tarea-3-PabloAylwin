import re

def clean_script(file_path, output_path):
    # Leer el archivo de guion
    with open(file_path, 'r', encoding='utf-8') as file:
        script = file.read()

    # 1. Eliminar etiquetas HTML
    script = re.sub(r'<.*?>', '', script)

    # 2. Eliminar caracteres especiales innecesarios (e.g., tabulaciones)
    script = re.sub(r'\t+', ' ', script)

    # 3. Eliminar metadatos (e.g., encabezados, pie de página, información extraña al inicio o final)
    # Ejemplo: puedes adaptar este filtro según el tipo de datos extraños que encuentres
    script = re.sub(r'(\[.*?\]|\(.*?\))', '', script)  # Elimina metadatos entre [] o ()

    # 4. Limpiar caracteres no alfabéticos que pueden ser irrelevantes para análisis textual
    script = re.sub(r'[^a-zA-Z0-9\s.,;?!:\'\"]+', ' ', script)  # Mantener solo texto y puntuación básica

    # 5. Eliminar espacios en blanco adicionales sin colapsar los saltos de línea simples
    script = re.sub(r' +', ' ', script)  # Reemplaza múltiples espacios por uno solo
    script = re.sub(r'\n{3,}', '\n\n', script)  # Limita los saltos de línea consecutivos a dos

    # Guardar el texto procesado en un nuevo archivo
    with open(output_path, 'w', encoding='utf-8') as file:
        file.write(script)

    print(f'Guion limpiado y guardado en: {output_path}')

# Uso del script
input_file = 'guiones/the_silence_of_the_lambs.md'  # Ruta del archivo original
output_file = 'guiones/the_silence_of_the_lambs.md'  # Ruta donde se guardará el archivo limpio
clean_script(input_file, output_file)