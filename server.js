const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const CSV_FILE = path.join(__dirname, 'encuesta.csv');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Endpoint para guardar respuestas
app.post('/api/guardar-respuesta', (req, res) => {
    try {
        const { nombre, canciones_conocidas, cancion_bailar, comentario } = req.body;
        
        // Crear nueva respuesta
        const respuesta = {
            id: Date.now(),
            fecha: new Date().toLocaleString('es-ES'),
            nombre,
            canciones_conocidas: canciones_conocidas.join('; '),
            cancion_bailar,
            comentario: comentario.replace(/"/g, '""').replace(/\n/g, ' ')
        };
        
        // Crear línea CSV
        const lineaCSV = `${respuesta.id},"${respuesta.fecha}","${respuesta.nombre}","${respuesta.canciones_conocidas}","${respuesta.cancion_bailar}","${respuesta.comentario}"\n`;
        
        // Escribir al archivo CSV
        fs.appendFileSync(CSV_FILE, lineaCSV);
        
        res.json({ success: true, message: 'Respuesta guardada exitosamente' });
    } catch (error) {
        console.error('Error al guardar:', error);
        res.status(500).json({ success: false, message: 'Error al guardar respuesta' });
    }
});

// Endpoint para leer todas las respuestas
app.get('/api/obtener-respuestas', (req, res) => {
    try {
        if (!fs.existsSync(CSV_FILE)) {
            return res.json([]);
        }
        
        const csvData = fs.readFileSync(CSV_FILE, 'utf8');
        const lines = csvData.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length <= 1) {
            return res.json([]);
        }
        
        // Parsear CSV (simplificado)
        const respuestas = lines.slice(1).map(line => {
            const matches = line.match(/([^,]*(?:,[^,]*)*?)(?=,|$)/g);
            if (matches && matches.length >= 6) {
                return {
                    id: matches[0],
                    fecha: matches[1].replace(/"/g, ''),
                    nombre: matches[2].replace(/"/g, ''),
                    canciones_conocidas: matches[3].replace(/"/g, '').split('; '),
                    cancion_bailar: matches[4].replace(/"/g, ''),
                    comentario: matches[5].replace(/"/g, '')
                };
            }
            return null;
        }).filter(respuesta => respuesta !== null);
        
        res.json(respuestas);
    } catch (error) {
        console.error('Error al leer:', error);
        res.status(500).json({ success: false, message: 'Error al leer respuestas' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📊 Panel de administrador: http://localhost:${PORT}/#admin`);
});
