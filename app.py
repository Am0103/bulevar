from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import csv
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

CSV_FILE = 'encuesta.csv'

# Servir archivos estáticos
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

# API para guardar respuestas
@app.route('/api/guardar-respuesta', methods=['POST'])
def guardar_respuesta():
    try:
        data = request.json
        
        # Crear registro
        respuesta = {
            'id': str(int(datetime.now().timestamp() * 1000)),
            'fecha': datetime.now().strftime('%d/%m/%Y %H:%M:%S'),
            'nombre': data.get('nombre', ''),
            'canciones_conocidas': '; '.join(data.get('canciones_conocidas', [])),
            'cancion_bailar': data.get('cancion_bailar', ''),
            'comentario': data.get('comentario', '').replace('\n', ' ').replace('"', '""')
        }
        
        # Verificar si el archivo existe, si no, crear encabezados
        file_exists = os.path.isfile(CSV_FILE)
        
        with open(CSV_FILE, 'a', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['ID', 'Fecha', 'Nombre', 'Canciones Conocidas', 'Canción para Bailar', 'Comentario Creativo']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            if not file_exists:
                writer.writeheader()
            
            writer.writerow({
                'ID': respuesta['id'],
                'Fecha': respuesta['fecha'],
                'Nombre': respuesta['nombre'],
                'Canciones Conocidas': respuesta['canciones_conocidas'],
                'Canción para Bailar': respuesta['cancion_bailar'],
                'Comentario Creativo': respuesta['comentario']
            })
        
        return jsonify({'success': True, 'message': 'Respuesta guardada exitosamente'})
    
    except Exception as e:
        print(f'Error: {e}')
        return jsonify({'success': False, 'message': 'Error al guardar respuesta'}), 500

# API para obtener respuestas
@app.route('/api/obtener-respuestas', methods=['GET'])
def obtener_respuestas():
    try:
        if not os.path.isfile(CSV_FILE):
            return jsonify([])
        
        respuestas = []
        with open(CSV_FILE, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                respuestas.append({
                    'id': row['ID'],
                    'fecha': row['Fecha'],
                    'nombre': row['Nombre'],
                    'canciones_conocidas': row['Canciones Conocidas'].split('; ') if row['Canciones Conocidas'] else [],
                    'cancion_bailar': row['Canción para Bailar'],
                    'comentario': row['Comentario Creativo']
                })
        
        return jsonify(respuestas)
    
    except Exception as e:
        print(f'Error: {e}')
        return jsonify({'success': False, 'message': 'Error al leer respuestas'}), 500

# API para obtener estadísticas
@app.route('/api/estadisticas', methods=['GET'])
def obtener_estadisticas():
    try:
        if not os.path.isfile(CSV_FILE):
            return jsonify({'total': 0, 'canciones_populares': [], 'canciones_bailar': []})
        
        canciones_conteo = {}
        bailar_conteo = {}
        total = 0
        
        with open(CSV_FILE, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                total += 1
                
                # Contar canciones conocidas
                canciones = row['Canciones Conocidas'].split('; ')
                for cancion in canciones:
                    if cancion.strip():
                        canciones_conteo[cancion.strip()] = canciones_conteo.get(cancion.strip(), 0) + 1
                
                # Contar canciones para bailar
                bailar = row['Canción para Bailar'].strip().lower()
                if bailar:
                    bailar_conteo[bailar] = bailar_conteo.get(bailar, 0) + 1
        
        # Ordenar por popularidad
        canciones_populares = sorted(canciones_conteo.items(), key=lambda x: x[1], reverse=True)
        canciones_bailar = sorted(bailar_conteo.items(), key=lambda x: x[1], reverse=True)
        
        return jsonify({
            'total': total,
            'canciones_populares': [{'cancion': k, 'count': v} for k, v in canciones_populares[:10]],
            'canciones_bailar': [{'cancion': k, 'count': v} for k, v in canciones_bailar[:10]]
        })
    
    except Exception as e:
        print(f'Error: {e}')
        return jsonify({'success': False, 'message': 'Error al calcular estadísticas'}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    print("🎵 Servidor de Encuesta Rock 80s iniciando...")
    print("📂 Los datos se guardan en: encuesta.csv")
    print(f"🌐 Puerto: {port}")
    print("🔐 Panel Admin: usuario: admin, contraseña: fiesta2025")
    app.run(debug=False, host='0.0.0.0', port=port)
