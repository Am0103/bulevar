document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('encuestaForm');
    const adminBtn = document.getElementById('adminBtn');
    const adminPanel = document.getElementById('adminPanel');
    const closeAdmin = document.getElementById('closeAdmin');
    const exportBtn = document.getElementById('exportData');
    const exportPDFBtn = document.getElementById('exportPDF');
    const respuestasContainer = document.getElementById('respuestas');
    const estadisticasContainer = document.getElementById('estadisticas');
    
    // Elementos del login
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const closeLogin = document.getElementById('closeLogin');
    const loginError = document.getElementById('loginError');
    
    // Credenciales de administrador (en un proyecto real, estas estarían en el servidor)
    const ADMIN_CREDENTIALS = {
        usuario: 'admin',
        password: 'fiesta2025'
    };

    // Manejar envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar que todas las preguntas obligatorias estén respondidas
        if (!validarFormularioCompleto()) {
            mostrarMensajeError();
            return;
        }
        
        const formData = new FormData(form);
        const respuesta = {
            id: Date.now(),
            fecha: new Date().toLocaleString('es-ES'),
            nombre: formData.get('nombre'),
            cancionesConocidas: formData.getAll('canciones_conocidas'),
            cancionBailar: formData.get('cancion_bailar'),
            comentario: formData.get('comentario') || 'Sin comentarios'
        };

        // Guardar en localStorage
        let respuestas = JSON.parse(localStorage.getItem('encuestaRespuestas') || '[]');
        respuestas.push(respuesta);
        localStorage.setItem('encuestaRespuestas', JSON.stringify(respuestas));

        // Mostrar mensaje de éxito
        mostrarMensajeExito();
        
        // Limpiar formulario
        form.reset();
    });

    // Mostrar modal de login
    adminBtn.addEventListener('click', function() {
        loginModal.classList.remove('hidden');
        loginError.classList.add('hidden');
    });

    // Manejar login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('adminUser').value;
        const password = document.getElementById('adminPass').value;
        
        if (usuario === ADMIN_CREDENTIALS.usuario && password === ADMIN_CREDENTIALS.password) {
            loginModal.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            cargarRespuestas();
            loginForm.reset();
            loginError.classList.add('hidden');
        } else {
            loginError.classList.remove('hidden');
            // Limpiar campos después de error
            setTimeout(() => {
                loginForm.reset();
            }, 1000);
        }
    });

    // Cerrar modals
    closeLogin.addEventListener('click', function() {
        loginModal.classList.add('hidden');
        loginForm.reset();
        loginError.classList.add('hidden');
    });

    closeAdmin.addEventListener('click', function() {
        adminPanel.classList.add('hidden');
    });

    // Exportar datos
    exportBtn.addEventListener('click', function() {
        exportarDatos();
    });

    // Exportar PDF
    exportPDFBtn.addEventListener('click', function() {
        exportarPDF();
    });

    // Función para mostrar mensaje de éxito
    function mostrarMensajeExito() {
        const mensaje = document.createElement('div');
        mensaje.className = 'mensaje-exito';
        mensaje.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(45deg, #ff006e, #8338ec);
                padding: 2rem;
                border-radius: 20px;
                color: white;
                text-align: center;
                z-index: 2000;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                animation: aparecer 0.5s ease;
            ">
                <h3>🎉 ¡Gracias por participar! 🎉</h3>
                <p>Tu respuesta ha sido guardada exitosamente</p>
                <p style="margin-top: 1rem; font-size: 2rem;">🕺💃🎶</p>
            </div>
        `;

        document.body.appendChild(mensaje);

        setTimeout(() => {
            document.body.removeChild(mensaje);
        }, 3000);
    }

    // Función para cargar respuestas en el panel de admin
    function cargarRespuestas() {
        const respuestas = JSON.parse(localStorage.getItem('encuestaRespuestas') || '[]');
        
        // Cargar estadísticas
        cargarEstadisticas(respuestas);
        
        if (respuestas.length === 0) {
            respuestasContainer.innerHTML = '<p style="text-align: center; color: #8338ec; font-style: italic;">No hay respuestas aún.</p>';
            return;
        }

        let html = '';
        respuestas.forEach((respuesta, index) => {
            html += `
                <div class="respuesta-item">
                    <div class="respuesta-header">
                        <span class="respuesta-numero">Respuesta #${index + 1}</span>
                        <span class="respuesta-fecha">${respuesta.fecha}</span>
                    </div>
                    <div class="respuesta-contenido">
                        <p><strong>👤 Nombre:</strong> ${respuesta.nombre}</p>
                        <p><strong>🎵 Canciones que conoce:</strong></p>
                        <ul style="margin-left: 1rem; color: #ffffff;">
                            ${respuesta.cancionesConocidas.length > 0 ? 
                                respuesta.cancionesConocidas.map(c => `<li>${c}</li>`).join('') :
                                '<li style="color: #ff6b6b;">No seleccionó ninguna</li>'
                            }
                        </ul>
                        <p><strong>💃 Canción para bailar:</strong> ${respuesta.cancionBailar || 'No especificó'}</p>
                        <p><strong>👗 Outfit planeado:</strong> ${respuesta.comentario}</p>
                    </div>
                </div>
            `;
        });

        respuestasContainer.innerHTML = html;
    }

    // Función para cargar estadísticas
    function cargarEstadisticas(respuestas) {
        const totalRespuestas = respuestas.length;
        const cancionesMasConocidas = obtenerCancionesMasConocidas(respuestas);
        const cancionesBailar = obtenerCancionesBailar(respuestas);

        const html = `
            <div class="stat-card">
                <span class="stat-number">${totalRespuestas}</span>
                <span>Total Respuestas</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${cancionesMasConocidas.length}</span>
                <span>Canciones Únicas</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${cancionesBailar.length}</span>
                <span>Canciones para Bailar</span>
            </div>
        `;

        estadisticasContainer.innerHTML = html;
    }

    // Función para obtener estadísticas de canciones conocidas
    function obtenerCancionesMasConocidas(respuestas) {
        const contador = {};
        respuestas.forEach(respuesta => {
            respuesta.cancionesConocidas.forEach(cancion => {
                contador[cancion] = (contador[cancion] || 0) + 1;
            });
        });
        return Object.entries(contador).sort((a, b) => b[1] - a[1]);
    }

    // Función para obtener estadísticas de canciones para bailar
    function obtenerCancionesBailar(respuestas) {
        const contador = {};
        respuestas.forEach(respuesta => {
            if (respuesta.cancionBailar) {
                contador[respuesta.cancionBailar] = (contador[respuesta.cancionBailar] || 0) + 1;
            }
        });
        return Object.entries(contador).sort((a, b) => b[1] - a[1]);
    }

    // Función para exportar datos
    function exportarDatos() {
        const respuestas = JSON.parse(localStorage.getItem('encuestaRespuestas') || '[]');
        
        if (respuestas.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        // Crear CSV
        let csv = 'Fecha,Nombre,Canciones Conocidas,Cancion para Bailar,Outfit\n';
        
        respuestas.forEach(respuesta => {
            csv += `"${respuesta.fecha}","${respuesta.nombre}","${respuesta.cancionesConocidas.join('; ')}","${respuesta.cancionBailar}","${respuesta.comentario}"\n`;
        });

        // Descargar archivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `encuesta-años-80-${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Función para exportar PDF
    function exportarPDF() {
        const respuestas = JSON.parse(localStorage.getItem('encuestaRespuestas') || '[]');
        
        if (respuestas.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configuración
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        let yPosition = 30;
        
        // Título
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('🎵 ENCUESTA AÑOS 80 - RESULTADOS 🎵', pageWidth / 2, yPosition, { align: 'center' });
        
        yPosition += 20;
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Fecha de exportación: ${new Date().toLocaleString('es-ES')}`, pageWidth / 2, yPosition, { align: 'center' });
        doc.text(`Total de respuestas: ${respuestas.length}`, pageWidth / 2, yPosition + 10, { align: 'center' });
        
        yPosition += 30;
        
        // Respuestas
        respuestas.forEach((respuesta, index) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFont(undefined, 'bold');
            doc.text(`Respuesta #${index + 1}`, margin, yPosition);
            yPosition += 10;
            
            doc.setFont(undefined, 'normal');
            doc.text(`Fecha: ${respuesta.fecha}`, margin, yPosition);
            yPosition += 8;
            doc.text(`Nombre: ${respuesta.nombre}`, margin, yPosition);
            yPosition += 8;
            
            doc.text('Canciones conocidas:', margin, yPosition);
            yPosition += 6;
            respuesta.cancionesConocidas.forEach(cancion => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(`- ${cancion}`, margin + 10, yPosition);
                yPosition += 6;
            });
            
            yPosition += 4;
            doc.text(`Canción para bailar: ${respuesta.cancionBailar}`, margin, yPosition);
            yPosition += 8;
            
            // Outfit (con salto de línea si es muy largo)
            const outfitText = `Outfit: ${respuesta.comentario}`;
            const splitText = doc.splitTextToSize(outfitText, pageWidth - 2 * margin);
            doc.text(splitText, margin, yPosition);
            yPosition += splitText.length * 6;
            
            yPosition += 10;
            
            // Línea separadora
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 15;
        });
        
        // Guardar PDF
        const fechaActual = new Date().toISOString().split('T')[0];
        doc.save(`encuesta-años-80-${fechaActual}.pdf`);
    }

    // Función para validar que el formulario esté completo
    function validarFormularioCompleto() {
        const nombre = document.getElementById('nombre').value.trim();
        const cancionBailar = document.getElementById('cancion_bailar').value.trim();
        const cancionesConocidas = document.querySelectorAll('input[name="canciones_conocidas"]:checked');
        const comentario = document.getElementById('comentario').value.trim();
        
        // Validar nombre
        if (!nombre) {
            resaltarCampo('nombre');
            return false;
        }
        
        // Validar que al menos una canción sea seleccionada
        if (cancionesConocidas.length === 0) {
            resaltarSeccion('checkbox-grid');
            return false;
        }
        
        // Validar canción para bailar
        if (!cancionBailar) {
            resaltarCampo('cancion_bailar');
            return false;
        }
        
        // Validar comentario del outfit
        if (!comentario) {
            resaltarCampo('comentario');
            return false;
        }
        
        return true;
    }

    // Función para resaltar campos obligatorios vacíos
    function resaltarCampo(fieldId) {
        const campo = document.getElementById(fieldId);
        campo.style.border = '2px solid #ff0066';
        campo.style.boxShadow = '0 0 10px rgba(255, 0, 102, 0.5)';
        
        // Remover el resaltado después de que el usuario escriba
        campo.addEventListener('input', function() {
            this.style.border = '2px solid #8338ec';
            this.style.boxShadow = '';
        });
        
        // Hacer scroll al campo
        campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Función para resaltar sección de checkboxes
    function resaltarSeccion(className) {
        const seccion = document.querySelector('.' + className);
        seccion.style.border = '2px solid #ff0066';
        seccion.style.borderRadius = '10px';
        seccion.style.padding = '1rem';
        
        // Remover el resaltado cuando seleccionen algo
        const checkboxes = seccion.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (document.querySelectorAll('input[name="canciones_conocidas"]:checked').length > 0) {
                    seccion.style.border = '';
                    seccion.style.padding = '';
                }
            });
        });
        
        // Hacer scroll a la sección
        seccion.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Función para mostrar mensaje de error
    function mostrarMensajeError() {
        const mensaje = document.createElement('div');
        mensaje.className = 'mensaje-error';
        mensaje.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(45deg, #ff0066, #ff6b6b);
                padding: 2rem;
                border-radius: 20px;
                color: white;
                text-align: center;
                z-index: 2000;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                animation: shake 0.5s ease;
                border: 2px solid #fff;
            ">
                <h3>⚠️ ¡Faltan datos! ⚠️</h3>
                <p>Por favor completa todas las preguntas:</p>
                <ul style="text-align: left; margin: 1rem 0;">
                    <li>✓ Nombre completo</li>
                    <li>✓ Al menos una canción conocida</li>
                    <li>✓ Canción para bailar</li>
                    <li>✓ Descripción del outfit</li>
                </ul>
                <p style="margin-top: 1rem; font-size: 1.5rem;">📝✨</p>
            </div>
        `;

        document.body.appendChild(mensaje);

        setTimeout(() => {
            document.body.removeChild(mensaje);
        }, 4000);
    }

    // Agregar efectos de sonido (opcional)
    function agregarEfectosSonido() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
        
        checkboxes.forEach(input => {
            input.addEventListener('change', function() {
                // Aquí podrías agregar sonidos de los años 80
                console.log('🎵 Efecto de sonido');
            });
        });
    }

    agregarEfectosSonido();

    // Agregar animaciones cuando se seleccionan elementos
    const formItems = document.querySelectorAll('.checkbox-item, .radio-item');
    formItems.forEach(item => {
        item.addEventListener('click', function() {
            const input = this.querySelector('input');
            if (input.type === 'checkbox' || input.checked) {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 5px 15px rgba(255, 0, 110, 0.4)';
                
                setTimeout(() => {
                    this.style.transform = '';
                    this.style.boxShadow = '';
                }, 200);
            }
        });
    });

    // Cerrar modals al hacer click fuera
    loginModal.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.classList.add('hidden');
            loginForm.reset();
            loginError.classList.add('hidden');
        }
    });

    adminPanel.addEventListener('click', function(e) {
        if (e.target === adminPanel) {
            adminPanel.classList.add('hidden');
        }
    });
});
