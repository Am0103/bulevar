document.addEventListener('DOMContentLoaded', function() {
    // Configuración
    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: 'fiesta2025'
    };
    
    // Detectar el entorno automáticamente
    let API_BASE;
    const hostname = window.location.hostname;
    
    if (hostname.includes('replit') || hostname.includes('repl.co')) {
        API_BASE = `${window.location.origin}/api`;
        console.log('Detectado entorno Replit');
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        API_BASE = 'http://localhost:5000/api';
        console.log('Detectado entorno local');
    } else {
        API_BASE = `${window.location.origin}/api`;
        console.log('Detectado entorno de producción');
    }
    
    console.log('API Base URL:', API_BASE);
    console.log('Hostname actual:', hostname);

    // Array para almacenar las respuestas
    let respuestasEncuesta = [];

    // Elementos del DOM
    const form = document.getElementById('encuestaForm');
    const adminBtn = document.getElementById('adminBtn');
    const loginModal = document.getElementById('loginModal');
    const adminPanel = document.getElementById('adminPanel');
    const closeLogin = document.getElementById('closeLogin');
    const closeAdmin = document.getElementById('closeAdmin');
    const loginForm = document.getElementById('loginForm');
    const exportDataBtn = document.getElementById('exportData');
    const exportPDFBtn = document.getElementById('exportPDF');
    const loginError = document.getElementById('loginError');

    // Cargar datos guardados al inicializar
    document.addEventListener('DOMContentLoaded', function() {
        cargarDatos();
    });

    // Manejar envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Formulario enviado');
        
        const formData = new FormData(form);
        const respuesta = {
            nombre: formData.get('nombre'),
            canciones_conocidas: formData.getAll('canciones_conocidas'),
            cancion_bailar: formData.get('cancion_bailar'),
            comentario: formData.get('comentario')
        };
        
        console.log('Datos a enviar:', respuesta);
        guardarEnAPI(respuesta);
    });

    // Funciones de API con mejor manejo de errores
    async function guardarEnAPI(respuesta) {
        try {
            console.log('Enviando a:', `${API_BASE}/guardar-respuesta`);
            
            const response = await fetch(`${API_BASE}/guardar-respuesta`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(respuesta)
            });
            
            console.log('Respuesta del servidor:', response.status);
            
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Resultado:', result);
            
            if (result.success) {
                mostrarMensajeExito();
                setTimeout(() => {
                    form.reset();
                }, 2000);
                
                // Recargar datos si el panel está abierto
                if (!adminPanel.classList.contains('hidden')) {
                    cargarDatosDeAPI();
                }
            } else {
                mostrarError(result.message || 'Error al guardar la respuesta');
            }
        } catch (error) {
            console.error('Error completo:', error);
            mostrarError(`Error de conexión: ${error.message}. Verifica que el servidor Python esté funcionando.`);
        }
    }

    async function cargarDatosDeAPI() {
        try {
            const response = await fetch(`${API_BASE}/obtener-respuestas`);
            const datos = await response.json();
            respuestasEncuesta = datos;
            
            if (!adminPanel.classList.contains('hidden')) {
                mostrarEstadisticas();
                mostrarRespuestas();
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            mostrarError('Error al cargar los datos del servidor');
        }
    }

    function mostrarError(mensaje) {
        console.error('Error:', mensaje);
        const error = document.createElement('div');
        error.innerHTML = `❌ ${mensaje}`;
        error.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #dc3545;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            font-weight: bold;
            z-index: 10000;
            animation: aparecer 0.3s ease-out;
            max-width: 90%;
            font-size: 1rem;
        `;
        
        document.body.appendChild(error);
        
        setTimeout(() => {
            error.style.animation = 'desaparecer 0.3s ease-out';
            setTimeout(() => error.remove(), 300);
        }, 5000);
    }

    // Funciones de guardado y carga
    function guardarDatos() {
        localStorage.setItem('encuestaRock80s', JSON.stringify(respuestasEncuesta));
    }

    function cargarDatos() {
        const datosGuardados = localStorage.getItem('encuestaRock80s');
        if (datosGuardados) {
            respuestasEncuesta = JSON.parse(datosGuardados);
        }
    }

    function actualizarCSV() {
        let csvContent = 'ID,Fecha,Nombre,Canciones Conocidas,Canción para Bailar,Comentario Creativo\n';
        
        respuestasEncuesta.forEach(respuesta => {
            const fecha = new Date(respuesta.timestamp).toLocaleString('es-ES');
            const cancionesConocidas = respuesta.canciones_conocidas.join('; ');
            const comentario = respuesta.comentario.replace(/"/g, '""').replace(/\n/g, ' ');
            
            csvContent += `${respuesta.id},"${fecha}","${respuesta.nombre}","${cancionesConocidas}","${respuesta.cancion_bailar}","${comentario}"\n`;
        });
        
        // Guardar automáticamente el CSV actualizado
        descargarCSVAutomatico(csvContent);
        console.log('CSV actualizado:', csvContent);
    }

    function descargarCSVAutomatico(csvContent) {
        // Crear blob y descargar automáticamente
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'encuesta.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Mostrar notificación de que se actualizó el CSV
        mostrarNotificacionCSV();
    }

    function mostrarNotificacionCSV() {
        const notificacion = document.createElement('div');
        notificacion.innerHTML = '💾 CSV actualizado automáticamente';
        notificacion.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 10001;
            animation: aparecer 0.3s ease-out;
        `;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.animation = 'desaparecer 0.3s ease-out';
            setTimeout(() => notificacion.remove(), 300);
        }, 2000);
    }

    function mostrarMensajeExito() {
        const mensaje = document.createElement('div');
        mensaje.className = 'mensaje-exito';
        mensaje.innerHTML = '🎉 ¡Respuesta enviada exitosamente! ¡Gracias por participar! 🎵';
        mensaje.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: aparecer 0.5s ease-out;
        `;
        
        document.body.appendChild(mensaje);
        
        setTimeout(() => {
            mensaje.style.animation = 'desaparecer 0.5s ease-out';
            setTimeout(() => mensaje.remove(), 500);
        }, 3000);
    }

    // Panel de administrador
    adminBtn.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
    });

    closeLogin.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        loginError.classList.add('hidden');
        loginForm.reset();
    });

    closeAdmin.addEventListener('click', () => {
        adminPanel.classList.add('hidden');
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUser').value;
        const password = document.getElementById('adminPass').value;
        
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            loginModal.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            cargarPanelAdministrador();
            loginError.classList.add('hidden');
            loginForm.reset();
        } else {
            loginError.classList.remove('hidden');
        }
    });

    function cargarPanelAdministrador() {
        cargarDatosDeAPI();
    }

    function mostrarEstadisticas() {
        const estadisticasContainer = document.getElementById('estadisticas');
        
        if (respuestasEncuesta.length === 0) {
            estadisticasContainer.innerHTML = '<p>No hay respuestas registradas aún.</p>';
            return;
        }
        
        // Calcular estadísticas
        const totalRespuestas = respuestasEncuesta.length;
        const cancionesMasConocidas = calcularCancionesMasConocidas();
        const cancionesMasDeseadas = calcularCancionesMasDeseadas();
        
        estadisticasContainer.innerHTML = `
            <div class="estadisticas-grid">
                <div class="stat-card">
                    <h3>📊 Total de Respuestas</h3>
                    <p class="stat-numero">${totalRespuestas}</p>
                </div>
                <div class="stat-card">
                    <h3>🎵 Canción Más Conocida</h3>
                    <p class="stat-cancion">${cancionesMasConocidas[0]?.cancion || 'N/A'}</p>
                    <p class="stat-numero">(${cancionesMasConocidas[0]?.count || 0} votos)</p>
                </div>
                <div class="stat-card">
                    <h3>💃 Canción Más Deseada</h3>
                    <p class="stat-cancion">${cancionesMasDeseadas[0]?.cancion || 'N/A'}</p>
                    <p class="stat-numero">(${cancionesMasDeseadas[0]?.count || 0} votos)</p>
                </div>
            </div>
            
            <div class="top-canciones">
                <h3>🏆 Top 5 Canciones Más Conocidas</h3>
                <ol>
                    ${cancionesMasConocidas.slice(0, 5).map(item => 
                        `<li>${item.cancion} - <strong>${item.count} votos</strong></li>`
                    ).join('')}
                </ol>
            </div>
        `;
    }

    function calcularCancionesMasConocidas() {
        const conteo = {};
        
        respuestasEncuesta.forEach(respuesta => {
            respuesta.canciones_conocidas.forEach(cancion => {
                conteo[cancion] = (conteo[cancion] || 0) + 1;
            });
        });
        
        return Object.entries(conteo)
            .map(([cancion, count]) => ({ cancion, count }))
            .sort((a, b) => b.count - a.count);
    }

    function calcularCancionesMasDeseadas() {
        const conteo = {};
        
        respuestasEncuesta.forEach(respuesta => {
            const cancion = respuesta.cancion_bailar.toLowerCase().trim();
            conteo[cancion] = (conteo[cancion] || 0) + 1;
        });
        
        return Object.entries(conteo)
            .map(([cancion, count]) => ({ cancion, count }))
            .sort((a, b) => b.count - a.count);
    }

    function mostrarRespuestas() {
        const respuestasContainer = document.getElementById('respuestas');
        
        if (respuestasEncuesta.length === 0) {
            respuestasContainer.innerHTML = '<p>No hay respuestas registradas aún.</p>';
            return;
        }
        
        const respuestasHTML = respuestasEncuesta.map((respuesta, index) => `
            <div class="respuesta-item">
                <div class="respuesta-header">
                    <h4>📝 Respuesta ${index + 1}</h4>
                    <span class="fecha">${new Date(respuesta.timestamp).toLocaleString('es-ES')}</span>
                </div>
                <div class="respuesta-content">
                    <p><strong>👤 Nombre:</strong> ${respuesta.nombre}</p>
                    <p><strong>🎵 Canciones que conoce:</strong></p>
                    <ul class="canciones-lista">
                        ${respuesta.canciones_conocidas.map(cancion => `<li>♪ ${cancion}</li>`).join('')}
                    </ul>
                    <p><strong>💃 Canción para bailar:</strong> ${respuesta.cancion_bailar}</p>
                    <p><strong>🎭 Historia creativa:</strong></p>
                    <div class="comentario-box">${respuesta.comentario}</div>
                </div>
            </div>
        `).join('');
        
        respuestasContainer.innerHTML = `
            <h3>📋 Todas las Respuestas (${respuestasEncuesta.length})</h3>
            ${respuestasHTML}
        `;
    }

    // Exportar datos
    exportDataBtn.addEventListener('click', async function() {
        try {
            await cargarDatosDeAPI();
            
            if (respuestasEncuesta.length === 0) {
                alert('No hay datos para exportar.');
                return;
            }
            
            let csvContent = 'ID,Fecha Completa,Nombre,Cantidad Canciones Conocidas,Lista Completa Canciones Conocidas,Canción para Bailar,Historia Creativa Completa,Duración Historia (caracteres)\n';
            
            respuestasEncuesta.forEach(respuesta => {
                const cancionesConocidas = Array.isArray(respuesta.canciones_conocidas) 
                    ? respuesta.canciones_conocidas.join(' | ') 
                    : respuesta.canciones_conocidas;
                
                const cantidadCanciones = Array.isArray(respuesta.canciones_conocidas) 
                    ? respuesta.canciones_conocidas.length 
                    : (respuesta.canciones_conocidas ? respuesta.canciones_conocidas.split(';').length : 0);
                
                const comentarioCompleto = respuesta.comentario ? respuesta.comentario.replace(/"/g, '""').replace(/\n/g, ' ') : 'Sin comentario';
                const duracionComentario = respuesta.comentario ? respuesta.comentario.length : 0;
                
                csvContent += `"${respuesta.id}","${respuesta.fecha}","${respuesta.nombre}","${cantidadCanciones}","${cancionesConocidas}","${respuesta.cancion_bailar}","${comentarioCompleto}","${duracionComentario}"\n`;
            });
            
            // Agregar resumen estadístico al final
            csvContent += '\n\n=== RESUMEN ESTADÍSTICO ===\n';
            csvContent += `Total de Participantes,${respuestasEncuesta.length}\n`;
            csvContent += `Fecha de Exportación,"${new Date().toLocaleString('es-ES')}"\n`;
            
            // Canciones más populares
            const cancionesMasConocidas = calcularCancionesMasConocidas();
            csvContent += '\n=== TOP 10 CANCIONES MÁS CONOCIDAS ===\n';
            csvContent += 'Posición,Canción,Número de Votos,Porcentaje\n';
            cancionesMasConocidas.slice(0, 10).forEach((item, index) => {
                const porcentaje = ((item.count / respuestasEncuesta.length) * 100).toFixed(1);
                csvContent += `"${index + 1}","${item.cancion}","${item.count}","${porcentaje}%"\n`;
            });
            
            // Canciones para bailar más deseadas
            const cancionesMasDeseadas = calcularCancionesMasDeseadas();
            csvContent += '\n=== TOP 10 CANCIONES MÁS DESEADAS PARA BAILAR ===\n';
            csvContent += 'Posición,Canción,Número de Menciones,Porcentaje\n';
            cancionesMasDeseadas.slice(0, 10).forEach((item, index) => {
                const porcentaje = ((item.count / respuestasEncuesta.length) * 100).toFixed(1);
                csvContent += `"${index + 1}","${item.cancion}","${item.count}","${porcentaje}%"\n`;
            });
            
            // Crear y descargar archivo CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `encuesta_rock_80s_completa_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            mostrarError('Error al exportar datos');
        }
    });

    // Exportar PDF
    exportPDFBtn.addEventListener('click', async function() {
        try {
            await cargarDatosDeAPI();
            
            if (respuestasEncuesta.length === 0) {
                alert('No hay datos para exportar.');
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configurar fuente
            doc.setFont('helvetica');
            
            // Título
            doc.setFontSize(18);
            doc.text('🎵 REPORTE COMPLETO - ENCUESTA ROCK 80s', 20, 25);
            
            // Información general
            doc.setFontSize(12);
            doc.text(`Fecha del reporte: ${new Date().toLocaleString('es-ES')}`, 20, 40);
            doc.text(`Total de participantes: ${respuestasEncuesta.length}`, 20, 50);
            doc.text(`Promedio de canciones conocidas: ${calcularPromedioCanciones().toFixed(1)}`, 20, 60);
            
            let yPosition = 80;
            
            // Estadísticas generales
            doc.setFontSize(14);
            doc.text('📊 ESTADÍSTICAS GENERALES', 20, yPosition);
            yPosition += 15;
            
            const cancionesMasConocidas = calcularCancionesMasConocidas();
            const cancionesMasDeseadas = calcularCancionesMasDeseadas();
            
            doc.setFontSize(10);
            doc.text(`Canción más conocida: ${cancionesMasConocidas[0]?.cancion || 'N/A'} (${cancionesMasConocidas[0]?.count || 0} votos)`, 20, yPosition);
            yPosition += 8;
            doc.text(`Canción más deseada para bailar: ${cancionesMasDeseadas[0]?.cancion || 'N/A'} (${cancionesMasDeseadas[0]?.count || 0} menciones)`, 20, yPosition);
            yPosition += 15;
            
            // Top 10 canciones más conocidas
            doc.setFontSize(12);
            doc.text('🏆 TOP 10 CANCIONES MÁS CONOCIDAS', 20, yPosition);
            yPosition += 10;
            
            doc.setFontSize(9);
            cancionesMasConocidas.slice(0, 10).forEach((item, index) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                const porcentaje = ((item.count / respuestasEncuesta.length) * 100).toFixed(1);
                doc.text(`${index + 1}. ${item.cancion.substring(0, 60)}... (${item.count} votos - ${porcentaje}%)`, 25, yPosition);
                yPosition += 7;
            });
            
            yPosition += 10;
            
            // Detalles de cada participante
            if (yPosition > 200) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(12);
            doc.text('👥 DETALLE POR PARTICIPANTE', 20, yPosition);
            yPosition += 15;
            
            respuestasEncuesta.forEach((respuesta, index) => {
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                doc.setFontSize(10);
                doc.text(`PARTICIPANTE ${index + 1}:`, 20, yPosition);
                yPosition += 8;
                
                doc.setFontSize(9);
                doc.text(`• Nombre: ${respuesta.nombre}`, 25, yPosition);
                yPosition += 6;
                doc.text(`• Fecha: ${respuesta.fecha}`, 25, yPosition);
                yPosition += 6;
                
                const cantidadCanciones = Array.isArray(respuesta.canciones_conocidas) 
                    ? respuesta.canciones_conocidas.length 
                    : (respuesta.canciones_conocidas ? respuesta.canciones_conocidas.split(';').length : 0);
                
                doc.text(`• Canciones que conoce (${cantidadCanciones}):`, 25, yPosition);
                yPosition += 6;
                
                const canciones = Array.isArray(respuesta.canciones_conocidas) 
                    ? respuesta.canciones_conocidas 
                    : respuesta.canciones_conocidas.split(';');
                
                canciones.slice(0, 8).forEach(cancion => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(`  - ${cancion.trim().substring(0, 70)}`, 30, yPosition);
                    yPosition += 5;
                });
                
                if (canciones.length > 8) {
                    doc.text(`  ... y ${canciones.length - 8} más`, 30, yPosition);
                    yPosition += 5;
                }
                
                doc.text(`• Canción para bailar: ${respuesta.cancion_bailar}`, 25, yPosition);
                yPosition += 6;
                
                if (respuesta.comentario) {
                    doc.text(`• Historia creativa:`, 25, yPosition);
                    yPosition += 6;
                    const comentarioCorto = respuesta.comentario.substring(0, 200);
                    const lineasComentario = doc.splitTextToSize(comentarioCorto + '...', 160);
                    lineasComentario.slice(0, 3).forEach(linea => {
                        if (yPosition > 270) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        doc.text(linea, 30, yPosition);
                        yPosition += 5;
                    });
                }
                
                yPosition += 10;
            });
            
            // Descargar PDF
            doc.save(`encuesta_rock_80s_reporte_completo_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            mostrarError('Error al exportar PDF');
        }
    });

    function calcularPromedioCanciones() {
        if (respuestasEncuesta.length === 0) return 0;
        
        const totalCanciones = respuestasEncuesta.reduce((total, respuesta) => {
            const cantidad = Array.isArray(respuesta.canciones_conocidas) 
                ? respuesta.canciones_conocidas.length 
                : (respuesta.canciones_conocidas ? respuesta.canciones_conocidas.split(';').length : 0);
            return total + cantidad;
        }, 0);
        
        return totalCanciones / respuestasEncuesta.length;
    }

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.classList.add('hidden');
        }
        if (e.target === adminPanel) {
            adminPanel.classList.add('hidden');
        }
    });

    // Animaciones CSS dinámicas
    const style = document.createElement('style');
    style.textContent = `
        @keyframes aparecer {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        
        @keyframes desaparecer {
            from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
        
        .estadisticas-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
        }
        
        .stat-numero {
            font-size: 2rem;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .stat-cancion {
            font-weight: bold;
            margin: 5px 0;
        }
        
        .top-canciones {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .respuesta-item {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 10px;
            margin-bottom: 15px;
            overflow: hidden;
        }
        
        .respuesta-header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 10px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .respuesta-content {
            padding: 15px;
        }
        
        .canciones-lista {
            background: white;
            padding: 10px;
            border-radius: 5px;
            margin: 5px 0;
        }
        
        .comentario-box {
            background: white;
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #667eea;
            font-style: italic;
            margin-top: 5px;
        }
        
        @media (max-width: 768px) {
            .estadisticas-grid {
                grid-template-columns: 1fr;
            }
            
            .respuesta-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
            
            .fecha {
                font-size: 0.9rem;
                opacity: 0.9;
            }
        }
    `;
    document.head.appendChild(style);
});
