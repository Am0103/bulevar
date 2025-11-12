document.addEventListener('DOMContentLoaded', function() {
    // Configuración
    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: 'fiesta2025'
    };
    
    // Detectar si estamos en producción o desarrollo
    const API_BASE = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : `${window.location.origin}/api`;

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
        
        const formData = new FormData(form);
        const respuesta = {
            nombre: formData.get('nombre'),
            canciones_conocidas: formData.getAll('canciones_conocidas'),
            cancion_bailar: formData.get('cancion_bailar'),
            comentario: formData.get('comentario')
        };
        
        // Enviar a la API de Python
        guardarEnAPI(respuesta);
    });

    // Funciones de API
    async function guardarEnAPI(respuesta) {
        try {
            const response = await fetch(`${API_BASE}/guardar-respuesta`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(respuesta)
            });
            
            const result = await response.json();
            
            if (result.success) {
                mostrarMensajeExito();
                form.reset();
                // Recargar datos si el panel está abierto
                if (!adminPanel.classList.contains('hidden')) {
                    cargarDatosDeAPI();
                }
            } else {
                mostrarError('Error al guardar la respuesta');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de conexión con el servidor Python');
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
        const error = document.createElement('div');
        error.innerHTML = `❌ ${mensaje}`;
        error.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            text-align: center;
            font-weight: bold;
            z-index: 10000;
            animation: aparecer 0.3s ease-out;
        `;
        
        document.body.appendChild(error);
        
        setTimeout(() => {
            error.style.animation = 'desaparecer 0.3s ease-out';
            setTimeout(() => error.remove(), 300);
        }, 3000);
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

    // Exportar datos (ahora desde la API)
    exportDataBtn.addEventListener('click', async function() {
        try {
            await cargarDatosDeAPI();
            
            if (respuestasEncuesta.length === 0) {
                alert('No hay datos para exportar.');
                return;
            }
            
            let csvContent = 'ID,Fecha,Nombre,Canciones Conocidas,Canción para Bailar,Comentario Creativo\n';
            
            respuestasEncuesta.forEach(respuesta => {
                const cancionesConocidas = Array.isArray(respuesta.canciones_conocidas) 
                    ? respuesta.canciones_conocidas.join('; ') 
                    : respuesta.canciones_conocidas;
                const comentario = respuesta.comentario.replace(/"/g, '""').replace(/\n/g, ' ');
                
                csvContent += `${respuesta.id},"${respuesta.fecha}","${respuesta.nombre}","${cancionesConocidas}","${respuesta.cancion_bailar}","${comentario}"\n`;
            });
            
            // Crear y descargar archivo CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `encuesta_rock_80s_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            mostrarError('Error al exportar datos');
        }
    });

    // Exportar PDF
    exportPDFBtn.addEventListener('click', function() {
        if (respuestasEncuesta.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurar fuente
        doc.setFont('helvetica');
        
        // Título
        doc.setFontSize(20);
        doc.text('🎵 Encuesta Rock en Español de los 80s', 20, 30);
        
        // Fecha del reporte
        doc.setFontSize(12);
        doc.text(`Reporte generado: ${new Date().toLocaleString('es-ES')}`, 20, 45);
        doc.text(`Total de respuestas: ${respuestasEncuesta.length}`, 20, 55);
        
        let yPosition = 70;
        
        // Estadísticas
        const cancionesMasConocidas = calcularCancionesMasConocidas();
        doc.setFontSize(14);
        doc.text('📊 Top 5 Canciones Más Conocidas:', 20, yPosition);
        yPosition += 15;
        
        doc.setFontSize(10);
        cancionesMasConocidas.slice(0, 5).forEach((item, index) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(`${index + 1}. ${item.cancion} (${item.count} votos)`, 25, yPosition);
            yPosition += 8;
        });
        
        // Descargar PDF
        doc.save(`encuesta_rock_80s_reporte_${new Date().toISOString().split('T')[0]}.pdf`);
    });

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
