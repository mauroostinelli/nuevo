/* INICIO: Código JavaScript Completo Final (script.js) */

// CDNs requeridas en HTML: Chart.js, jsPDF
// <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de Elementos DOM ---
    const steps = document.querySelectorAll('.step');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const resetBtn = document.getElementById('reset-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressStepText = document.getElementById('progress-step-text');
    const stepsContainer = document.getElementById('steps-container');
    const downloadBtn = document.getElementById('download-draft-btn');
    // CORRECCIÓN: Apuntar al <form> para que .reset() funcione
    const mainForm = document.getElementById('governance-form');

    // Elementos interactivos específicos
    const formElements = document.querySelectorAll('#governance-form input, #governance-form select, #governance-form textarea');
    const otherVotingContainer = document.getElementById('other-voting-description-container');
    const otherVotingInput = document.getElementById('other_voting_description');

    // Elementos de Visualización (sin cambios en selección)
    const memberListViz = document.getElementById('member-list-viz');
    const purposeBalanceSlider = document.getElementById('purpose-balance-slider');
    const purposeBalanceValue = document.getElementById('purpose-balance-value');
    const opennessSlider = document.getElementById('openness-level');
    const opennessLevelText = document.getElementById('openness-level-text');
    const votingVizText = document.getElementById('voting-viz-text');
    const voteBeam = document.getElementById('vote-beam');
    const transparencyMercury = document.getElementById('transparency-mercury');
    const transparencyLevelText = document.getElementById('transparency-level-text');
    const autonomyShieldViz = document.getElementById('autonomy-shield-viz');
    const autonomyLevelText = document.getElementById('autonomy-level-text');
    const dependencyAlert = document.getElementById('dependency-alert');
    const externalFundingLimitInput = document.getElementById('external_funding_limit');
    const knowledgeTreeViz = document.getElementById('knowledge-tree-viz');
    const treeBranchesViz = document.getElementById('tree-branches-viz');
    const knowledgeImpactText = document.getElementById('knowledge-impact-text');
    const cooperationMapViz = document.querySelector('.cooperation-map');
    const coopNodes = cooperationMapViz?.querySelectorAll('.map-node.other');
    const coopLinks = cooperationMapViz?.querySelectorAll('.map-link');
    const cooperationVizText = document.getElementById('cooperation-viz-text');
    const impactNeedle = document.getElementById('impact-needle');
    const impactLevelText = document.getElementById('impact-level-text');

    // Elementos del Paso Final
    const dashboardOutput = document.getElementById('governance-dashboard');
    const draftOutput = document.getElementById('draft-output');
    const radarChartCanvas = document.getElementById('aciRadarChart'); // Selector del canvas

    // --- Estado ---
    let currentStep = 0;
    const totalSteps = steps.length;
    let aciRadarChartInstance = null; // Instancia del gráfico

    // Estado Inicial Inmutable
    const initialGovernanceData = Object.freeze({
        purpose: [], purpose_balance: 70, member_type: [], activity: [],
        openness_level: 60, criteria: [], inclusion_strategy: 'ninguna',
        voting_structure: '1m1v', other_voting_description: '', governing_body: 'asamblea_general', reserved_seats: false, reporting_frequency: 'semestral', public_access: true, external_audit: false,
        contribution: ['cuota_entrada'], surplus_priority: 'reinversion_comunidad', incentive: ['ninguno'],
        decision_control: 'miembros_exclusivo', external_funding_limit: 25, veto_rights_members: false, autonomy_clause: true,
        education: ['info_miembros'],
        cooperation_level_radio: 'media', cooperation_area: [],
        community_focus_radio: 'primario', reinvestment: ['proyectos_locales'],
    });

    // Estado de ejecución (copia profunda)
    let governanceData = JSON.parse(JSON.stringify(initialGovernanceData));

    // --- Funciones Auxiliares ---

    /** Convierte valor interno a texto legible en español. */
    function getFriendlyName(value) {
        // (Sin cambios en esta función)
        const nameMap = {
            'reducir_facturas': 'Reducir facturas', 'energia_limpia': 'Energía limpia local', 'desarrollo_local': 'Desarrollo local', 'lucha_pobreza': 'Lucha pobreza energética', 'infraestructura': 'Infraestructura pública', 'educacion': 'Educación ambiental', 'flexibilidad': 'Flexibilidad al sistema',
            'hogares': 'Hogares', 'hogares_vulnerables': 'Hogares vulnerables', 'pymes': 'PYMEs', 'municipio': 'Ayuntamiento', 'otros': 'Otros',
            'generacion_fv': 'Generación FV', 'autoconsumo': 'Autoconsumo compartido', 'recarga_ve': 'Recarga VE', 'red_calor': 'Red calor/frío', 'eficiencia': 'Asesoramiento eficiencia', 'almacenamiento': 'Almacenamiento',
            'geografico': 'Geográfico', 'tecnico': 'Técnico', 'inversion': 'Inversión mínima', 'consumo': 'Ser consumidor', 'participacion': 'Participación activa',
            'ninguna': 'Ninguna específica', 'basica': 'Básica', 'activa': 'Activa',
            '1m1v': 'Un miembro, un voto', 'ponderado_tipo': 'Ponderado por tipo', 'ponderado_aportacion': 'Ponderado por aportación', 'otro': 'Otro sistema',
            'asamblea_general': 'Asamblea general', 'representantes_bloque': 'Bloques/tipos miembro', 'combinado': 'Combinado',
            'anual': 'Anual', 'semestral': 'Semestral', 'trimestral': 'Trimestral', 'continua': 'Continua',
            'cuota_entrada': 'Cuota entrada', 'aportacion_capital': 'Aportación capital', 'cuota_periodica': 'Cuota periódica', 'aportacion_especie': 'Aportación especie', 'voluntariado': 'Voluntariado',
            'reparto_miembros': 'Reparto a miembros', 'reserva_obligatoria': 'Dotar reservas', 'reinversion_comunidad': 'Reinversión comunidad', 'combinado': 'Combinado',
            'descuento_factura': 'Descuento factura', 'prioridad_servicios': 'Prioridad servicios', 'retorno_diferenciado': 'Retorno diferenciado', 'reconocimiento': 'Reconocimiento', 'ninguno': 'Ninguno específico',
            'miembros_exclusivo': 'Exclusivo miembros', 'miembros_mayoritario': 'Mayoritario miembros', 'externos_consultivo': 'Externos consultivo',
            'info_miembros': 'Info a miembros', 'formacion_gobierno': 'Formación gobierno', 'talleres_publico': 'Talleres públicos', 'material_divulgativo': 'Material divulgativo', 'colaboracion_escuelas': 'Colab. escuelas',
            'baja': 'Baja', 'media': 'Media', 'alta': 'Alta',
            'conocimiento': 'Conocimiento', 'compras_conjuntas': 'Compras conjuntas', 'proyectos_conjuntos': 'Proyectos conjuntos', 'representacion': 'Representación', 'servicios_compartidos': 'Servicios compartidos',
            'secundario': 'Secundario', 'importante': 'Importante', 'primario': 'Primario',
            'proyectos_locales': 'Proyectos locales', 'tarifas_sociales': 'Tarifas sociales', 'infraestructura_publica': 'Infraestructura pública', 'fondo_social': 'Fondo social', 'empleo_local': 'Empleo local',
             default: value ? String(value).replace(/_/g, ' ') : ''
        };
        return nameMap[value] || (typeof value === 'string' ? value.replace(/_/g, ' ') : value);
    }

    // --- Funciones Principales ---

    /** Actualiza el objeto governanceData según cambios en el formulario. */
    function updateGovernanceData(event) {
        const element = event.target;
        const name = element.name;
        const type = element.type;
        let value = element.value;

        if (!name || !initialGovernanceData.hasOwnProperty(name)) return;

        try {
            // Manejo específico para checkboxes booleanos
            if (type === 'checkbox' && typeof initialGovernanceData[name] === 'boolean') {
                 governanceData[name] = element.checked;
            }
            // Manejo para checkboxes de array
            else if (type === 'checkbox') {
                if (!Array.isArray(governanceData[name])) governanceData[name] = [];
                const valueExists = governanceData[name].includes(value);

                // Lógica 'ninguno' (sin cambios)
                if (name === 'incentive') { /* ... */ }
                else { // Checkboxes de array estándar
                    if (element.checked) { if (!valueExists) governanceData[name].push(value); }
                    else { governanceData[name] = governanceData[name].filter(item => item !== value); }
                }
            } else if (type === 'radio') {
                if (element.checked) {
                    governanceData[name] = value;
                    if (name === 'voting_structure') {
                        toggleOtherVotingInput(value === 'otro');
                        if (value !== 'otro' && otherVotingInput) {
                            governanceData.other_voting_description = ''; otherVotingInput.value = '';
                        }
                    }
                }
            } else if (type === 'textarea') {
                governanceData[name] = value;
            } else if (type === 'range' || type === 'number') {
                governanceData[name] = parseFloat(value);
            } else {
                governanceData[name] = value;
            }
            // Actualizar visualizaciones después de cambiar el estado
            requestAnimationFrame(updateRelevantVisualizations);

        } catch (error) {
             console.error("Error al actualizar governanceData para:", name, error);
        }
        // console.log('Governance Data Updated:', governanceData);
    }

    /** Muestra/oculta el campo "Otro". */
    function toggleOtherVotingInput(show) {
        if (otherVotingContainer) otherVotingContainer.classList.toggle('hidden', !show);
    }

    /** Muestra el paso especificado y actualiza UI. */
    function showStep(stepIndex) {
         if (stepIndex < 0 || stepIndex >= totalSteps) return;

        steps.forEach((step, index) => step.classList.toggle('active', index === stepIndex));

        currentStep = stepIndex;
        updateProgressBar();
        updateStepText();
        updateButtons();

        if (steps[currentStep]) steps[currentStep].scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Generar resultados y gráfico en el último paso
        if (currentStep === totalSteps - 1) {
             // Delay para asegurar renderizado del canvas antes de dibujar
             setTimeout(() => {
                 try {
                     // Asegurarse que el gráfico se genera/actualiza ANTES de intentar usarlo para PDF
                     updateRadarChart();
                     generateDashboard();
                     generateDraftOutput();
                 } catch (error) { console.error("Error generando contenido final:", error); }
             }, 200); // Aumentar ligeramente delay si el gráfico tarda en aparecer
        } else {
             // Si salimos del último paso, destruir el gráfico para liberar memoria (opcional)
             if (aciRadarChartInstance) {
                 // aciRadarChartInstance.destroy();
                 // aciRadarChartInstance = null;
                 // Considerar si es necesario, puede causar un pequeño parpadeo al volver
             }
        }
    }

    /** Actualiza barra de progreso. */
    function updateProgressBar() { /* Sin cambios */ }
    /** Actualiza texto del paso. */
    function updateStepText() { /* Sin cambios */ }
    /** Configura botones de navegación. */
    function updateButtons() { /* Sin cambios */ }

    // --- Funciones de Actualización de Visualizaciones ---

    /** Llama a todas las funciones de actualización visual. */
    function updateAllVisualizations() {
        updateMemberListViz();
        updatePurposeBalanceViz();
        updateOpennessViz();
        updateVotingViz();
        updateTransparencyViz(); // Asegurar llamada
        updateAutonomyViz();
        checkDependencyAlert();
        updateKnowledgeTreeViz(); // Asegurar llamada
        updateCooperationViz();
        updateImpactViz();
    }

    /** Llama a funciones de actualización relevantes. */
    function updateRelevantVisualizations() { updateAllVisualizations(); }

    // (Las funciones de actualización individual permanecen igual que en la última versión:
    // updateMemberListViz, updatePurposeBalanceViz, updateOpennessViz, updateVotingViz,
    // updateTransparencyViz (ya corregida), updateAutonomyViz, checkDependencyAlert,
    // updateKnowledgeTreeViz (ya determinista), updateCooperationViz, updateImpactViz)
    function updateMemberListViz() { /* Sin cambios */ }
    function updatePurposeBalanceViz() { /* Sin cambios */ }
    function updateOpennessViz() { /* Sin cambios */ }
    function updateVotingViz() { /* Sin cambios */ }
    function updateTransparencyViz() { /* Sin cambios */ }
    function updateAutonomyViz() { /* Sin cambios */ }
    function checkDependencyAlert() { /* Sin cambios */ }
    function updateKnowledgeTreeViz() { /* Sin cambios */ }
    function updateCooperationViz() { /* Sin cambios */ }
    function updateImpactViz() { /* Sin cambios */ }


    // --- Funciones de Generación del Paso Final ---

    /** Genera el resumen del dashboard. */
    function generateDashboard() { /* Sin cambios funcionales */ }

    /** Genera el texto del borrador (SIN línea "Fin"). */
    function generateDraftOutput() {
        if (!draftOutput) return;
        let htmlContent = `<h4>BORRADOR PRELIMINAR DE GOBERNANZA</h4>`;
        // (Concatenación del resto del contenido igual que antes...)
        htmlContent += `<strong>OBJETO Y FINES (Ref. P7):</strong>`;
        htmlContent += `<ul><li>Fines principales: ${governanceData.purpose.map(getFriendlyName).join(', ') || 'Definir'}.</li>`;
        htmlContent += `<li>Énfasis: ${governanceData.purpose_balance}% beneficio comunitario, ${100 - governanceData.purpose_balance}% retorno financiero.</li>`;
        htmlContent += `<li>El interés por la comunidad local es ${getFriendlyName(governanceData.community_focus_radio)}.</li>`;
        htmlContent += `<li>Mecanismos de reinversión comunitaria: ${governanceData.reinvestment.map(getFriendlyName).join(', ') || 'Ninguno definido'}.</li></ul>`;
        // ... (resto de secciones igual) ...
        htmlContent += `<strong>COOPERACIÓN (Ref. P6):</strong>`;
        htmlContent += `<ul><li>Nivel de cooperación buscado: ${getFriendlyName(governanceData.cooperation_level_radio)}.</li>`;
        htmlContent += `<li>Áreas de cooperación potenciales: ${governanceData.cooperation_area.map(getFriendlyName).join(', ') || 'Ninguna definida'}.</li></ul>`;
        // ¡LA LÍNEA 'Fin del Borrador' HA SIDO ELIMINADA!
        draftOutput.innerHTML = htmlContent;
    }


    /** Calcula puntuaciones ACI ilustrativas. */
    function calculateAciScores() { /* Sin cambios en lógica */ }

    /** Actualiza o crea el gráfico radar (CORREGIDO para visibilidad). */
    function updateRadarChart() {
        // Verificar si el canvas existe y si Chart.js está cargado
        if (!radarChartCanvas || typeof Chart === 'undefined') {
            console.warn("Canvas del gráfico no encontrado o Chart.js no cargado.");
            // Podríamos mostrar un mensaje en lugar del gráfico
            const container = document.getElementById('aci-alignment-score');
            if (container) container.innerHTML = '<p style="color: red; text-align: center;">No se pudo cargar el gráfico.</p>';
            return;
        }
         // Destruir instancia anterior si existe
        if (aciRadarChartInstance) {
            try {
                 aciRadarChartInstance.destroy();
                 aciRadarChartInstance = null;
                 console.log("Gráfico anterior destruido.");
            } catch (e) {
                console.error("Error destruyendo gráfico anterior:", e)
            }
        }


        console.log("Intentando crear/actualizar gráfico radar..."); // Log para depuración
        const scores = calculateAciScores();
        const chartData = {
            labels: ['P1 Adhesión', 'P2 Democracia', 'P3 Part. Econ.', 'P4 Autonomía', 'P5 Educación', 'P6 Cooperación', 'P7 Comunidad'], // Etiquetas más cortas
            datasets: [{
                label: 'Alineación Principios ACI (1-5)',
                data: [scores.P1, scores.P2, scores.P3, scores.P4, scores.P5, scores.P6, scores.P7],
                fill: true,
                backgroundColor: 'rgba(0, 187, 169, 0.3)', // Más transparencia
                borderColor: 'rgb(0, 187, 169)',
                pointBackgroundColor: 'rgb(0, 187, 169)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(0, 187, 169)',
                borderWidth: 2, // Grosor línea
                pointRadius: 4, // Tamaño puntos
                pointHoverRadius: 6 // Tamaño puntos hover
            }]
        };
        const chartConfig = {
            type: 'radar',
            data: chartData,
            options: {
                elements: { line: { borderWidth: 2 } }, // Redundante con dataset?
                scales: {
                    r: { // Configuración escala radial (0 a 5)
                        angleLines: { display: true, color: 'rgba(0, 0, 0, 0.1)' }, // Líneas de ángulo más suaves
                        suggestedMin: 0,
                        suggestedMax: 5,
                        pointLabels: { font: { size: 10 } }, // Tamaño fuente etiquetas principios
                        ticks: { display: true, stepSize: 1, backdropColor: 'rgba(255, 255, 255, 0.7)' }, // Ticks visibles
                         grid: { color: 'rgba(0, 0, 0, 0.1)' } // Color rejilla radial
                    }
                },
                plugins: { legend: { position: 'bottom', labels:{ font: {size: 11}} } }, // Leyenda abajo
                maintainAspectRatio: false, // Permitir que el contenedor defina el tamaño
                responsive: true
            }
        };

        // Crear nueva instancia del gráfico
        try {
            const ctx = radarChartCanvas.getContext('2d');
             if (!ctx) {
                 throw new Error("No se pudo obtener el contexto 2D del canvas.");
             }
            aciRadarChartInstance = new Chart(ctx, chartConfig);
            console.log("Gráfico radar creado/actualizado exitosamente.");
        } catch (error) {
            console.error("Error al crear el gráfico Chart.js:", error);
            const container = document.getElementById('aci-alignment-score');
            if (container) container.innerHTML = `<p style="color: red; text-align: center;">Error al mostrar gráfico: ${error.message}</p>`;
        }
    }


    // --- Funciones de Control ---

    /** Resetea el formulario y el estado (CORREGIDO). */
    function resetForm() {
        if (confirm('¿Estás seguro de que quieres reiniciar todo el diseño? Se perderán todos los cambios.')) {
            console.log("Reseteando formulario...");
            // 1. Resetear Estado Interno
            governanceData = JSON.parse(JSON.stringify(initialGovernanceData));
            console.log("Estado interno reseteado.");

            // 2. Resetear Formulario HTML Nativamente (¡USANDO EL SELECTOR CORRECTO!)
            if (mainForm && typeof mainForm.reset === 'function') {
                 mainForm.reset();
                 console.log("Formulario reseteado nativamente.");
            } else {
                 console.warn("Elemento 'mainForm' no encontrado o no es un formulario.");
                 // Si falla el reset nativo, intentar reset manual igualmente
            }


            // 3. Iterar y establecer explícitamente valores iniciales VISUALES (Refuerzo)
            formElements.forEach(element => {
                const name = element.name;
                if (!name || !initialGovernanceData.hasOwnProperty(name)) return;
                const initialValue = initialGovernanceData[name];
                const type = element.type;
                try {
                    if (type === 'checkbox') {
                        element.checked = (typeof initialValue === 'boolean') ? initialValue : (Array.isArray(initialValue) && initialValue.includes(element.value));
                    } else if (type === 'radio') {
                        element.checked = (element.value === initialValue);
                    } else {
                        element.value = initialValue;
                        if (type === 'range') element.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                 } catch(e) { console.warn(`Error reseteando visualmente ${name}: ${e}`); }
            });
            console.log("Elementos individuales reseteados visualmente.");

            // 4. Resetear elementos específicos adicionales
            toggleOtherVotingInput(false);
            if(otherVotingInput) otherVotingInput.value = '';

            // 5. Actualizar todas las visualizaciones
             requestAnimationFrame(() => {
                 console.log("Actualizando visualizaciones post-reset...");
                 updateAllVisualizations();
                 console.log("Visualizaciones actualizadas.");
                 // 6. Ir al Primer Paso
                 showStep(0);
                 // 7. Scroll al inicio
                 window.scrollTo({ top: 0, behavior: 'smooth' });
                 console.log("Navegado al primer paso post-reset.");
             });
        }
    }


    // --- Event Listeners ---

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentStep < totalSteps - 1) { showStep(currentStep + 1); }
            else { alert('¡Diseño completado! Revisa el resumen y el borrador.'); }
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => { if (currentStep > 0) showStep(currentStep - 1); });
    }
    if (resetBtn) {
         resetBtn.addEventListener('click', resetForm);
    }

    // Listeners para formulario
    formElements.forEach(element => {
        const eventType = (element.type === 'range' || element.type === 'number' || element.tagName === 'TEXTAREA') ? 'input' : 'change';
        element.addEventListener(eventType, updateGovernanceData);
    });

    // Listener Descarga PDF (con imagen del gráfico)
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            try {
                if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
                    throw new Error('La librería jsPDF no está cargada.');
                }
                if (typeof Chart === 'undefined') {
                    throw new Error('La librería Chart.js no está cargada (necesaria para imagen).');
                }

                const { jsPDF } = jspdf;
                const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                const outputElement = draftOutput;
                const chartCanvas = radarChartCanvas; // El canvas del gráfico

                if (!outputElement) throw new Error("No se encontró el contenido del borrador.");
                if (!chartCanvas) throw new Error("No se encontró el canvas del gráfico.");
                if (!aciRadarChartInstance) { // Asegurarse que el gráfico existe
                    console.warn("Instancia del gráfico no encontrada, intentando actualizar...");
                    updateRadarChart(); // Intentar generar/actualizar ahora
                    if (!aciRadarChartInstance) throw new Error("No se pudo generar la instancia del gráfico ACI.");
                }

                // --- Página 1: Texto del Borrador ---
                console.log("Generando texto para PDF...");
                 // Convertir HTML a texto plano mejorado
                 let textContent = outputElement.innerHTML;
                 textContent = textContent
                     .replace(/<h4>(.*?)<\/h4>/gi, (match, p1) => `\n\n*** ${p1.toUpperCase().trim()} ***\n\n`)
                     .replace(/<strong>(.*?)<\/strong>/gi, (match, p1) => `\n${p1.trim()}\n${'-'.repeat(p1.trim().length)}\n`)
                     .replace(/<br\s*\/?>|<\/p>|<\/ul>/gi, "\n")
                     .replace(/<\/li>/gi, "\n")
                     .replace(/<li>/gi, "  - ") // Indentar listas
                     .replace(/<[^>]*>/g, "") // Quitar HTML restante
                     .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                     .replace(/\n{3,}/g, "\n\n").trim();

                doc.setFontSize(10); // Tamaño fuente más pequeño para texto
                const margin = 15;
                const textWidth = doc.internal.pageSize.getWidth() - (margin * 2);
                const splitText = doc.splitTextToSize(textContent, textWidth);
                doc.text(splitText, margin, margin);
                console.log("Texto añadido al PDF.");

                // --- Página 2: Imagen del Gráfico ---
                console.log("Intentando añadir imagen del gráfico al PDF...");
                try {
                    // Obtener imagen del canvas como Data URL (PNG)
                     const imageDataUrl = chartCanvas.toDataURL('image/png');
                    // const imageDataUrl = aciRadarChartInstance.toBase64Image(); // Método Chart.js (puede variar versión)

                    if (!imageDataUrl || !imageDataUrl.startsWith('data:image/png')) {
                        throw new Error("No se pudo generar la imagen del gráfico (toDataURL falló).");
                    }

                    doc.addPage(); // Añadir nueva página para el gráfico
                    doc.setFontSize(12);
                    doc.text("Puntuación de Alineación con Principios ACI (Ilustrativa)", margin, margin);

                    // Calcular dimensiones y posición de la imagen
                    const imgWidthMax = doc.internal.pageSize.getWidth() - (margin * 2);
                    const imgHeightMax = doc.internal.pageSize.getHeight() - (margin * 3); // Más margen inferior
                    const canvasWidth = chartCanvas.width;
                    const canvasHeight = chartCanvas.height;
                    const ratio = Math.min(imgWidthMax / canvasWidth, imgHeightMax / canvasHeight);
                    const imgWidth = canvasWidth * ratio;
                    const imgHeight = canvasHeight * ratio;
                    const imgX = (doc.internal.pageSize.getWidth() - imgWidth) / 2; // Centrado horizontal
                    const imgY = margin + 10; // Posición Y debajo del título

                    doc.addImage(imageDataUrl, 'PNG', imgX, imgY, imgWidth, imgHeight);
                    console.log("Imagen del gráfico añadida al PDF.");

                } catch (imgError) {
                     console.error("Error al añadir la imagen del gráfico al PDF:", imgError);
                     // Añadir nota en PDF indicando el error de la imagen
                     doc.addPage();
                     doc.setTextColor(255, 0, 0); // Color rojo
                     doc.text("Error: No se pudo incluir la imagen del gráfico.", margin, margin);
                     doc.setTextColor(0, 0, 0); // Restaurar color
                }

                // Guardar el PDF completo
                doc.save('borrador_gobernanza_energetica_con_grafico.pdf');

            } catch (error) {
                console.error("Error al generar el PDF:", error);
                alert(`Hubo un error al intentar generar el PDF: ${error.message || error}.\nRevisa la consola.`);
            }
        });
    }

    // --- Inicialización ---
    try {
        // Asegurar que las visualizaciones iniciales se muestran correctamente
        requestAnimationFrame(updateAllVisualizations);
        // Mostrar el primer paso
        showStep(0);
    } catch(initError) {
        console.error("Error durante la inicialización:", initError);
        // Considerar mostrar un mensaje al usuario
        const body = document.querySelector('body');
        if (body) {
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'red';
            errorDiv.style.backgroundColor = 'lightyellow';
            errorDiv.style.padding = '10px';
            errorDiv.style.border = '1px solid red';
            errorDiv.textContent = `Error al iniciar la aplicación: ${initError.message}. Intenta recargar la página.`;
            body.prepend(errorDiv);
        }
    }

}); // Fin del DOMContentLoaded

/* FIN: Código JavaScript Completo Final (script.js) */
