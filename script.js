// script.js

// CDNs requeridas en HTML: Chart.js, jsPDF

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
    const mainForm = document.getElementById('governance-constructor'); // Referencia al formulario

    // Elementos interactivos específicos
    const formElements = document.querySelectorAll('#governance-constructor input, #governance-constructor select, #governance-constructor textarea');
    const otherVotingContainer = document.getElementById('other-voting-description-container');
    const otherVotingInput = document.getElementById('other_voting_description');
    const votingRadios = document.querySelectorAll('input[name="voting_structure"]');

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
    const radarChartCanvas = document.getElementById('aciRadarChart');

    // --- Estado ---
    let currentStep = 0;
    const totalSteps = steps.length;
    let aciRadarChartInstance = null;

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
    function getFriendlyName(value) {
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
            'reparto_miembros': 'Reparto a miembros', 'reserva_obligatoria': 'Dotar reservas', 'reinversion_comunidad': 'Reinversión comunidad',
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

    /** Actualiza el objeto governanceData (¡CON CORRECCIÓN PARA BOOLEANOS!) */
    function updateGovernanceData(event) {
        const element = event.target;
        const name = element.name;
        const type = element.type;
        let value = element.value;

        if (!name) return;

        try {
            // CORRECCIÓN: Manejo específico para checkboxes booleanos
            if (type === 'checkbox' && typeof initialGovernanceData[name] === 'boolean') {
                 governanceData[name] = element.checked;
            }
            // Manejo para checkboxes que son arrays
            else if (type === 'checkbox') {
                if (!Array.isArray(governanceData[name])) {
                    governanceData[name] = [];
                }
                const valueExists = governanceData[name].includes(value);

                // Lógica exclusiva para incentivo 'ninguno'
                if (name === 'incentive') {
                    if (element.checked) {
                        if (value === 'ninguno') {
                            governanceData[name] = ['ninguno'];
                            document.querySelectorAll('input[name="incentive"]').forEach(cb => { if (cb !== element) cb.checked = false; });
                        } else {
                            governanceData[name] = governanceData[name].filter(item => item !== 'ninguno');
                            const ningunoCb = document.querySelector('input[name="incentive"][value="ninguno"]');
                            if (ningunoCb) ningunoCb.checked = false;
                            if (!valueExists) governanceData[name].push(value);
                        }
                    } else {
                        governanceData[name] = governanceData[name].filter(item => item !== value);
                        if (governanceData[name].length === 0) {
                            const ningunoCb = document.querySelector('input[name="incentive"][value="ninguno"]');
                            if (ningunoCb) {
                                ningunoCb.checked = true;
                                governanceData[name].push('ninguno');
                            }
                        }
                    }
                } else { // Lógica estándar para checkboxes de array
                    if (element.checked) {
                        if (!valueExists) governanceData[name].push(value);
                    } else {
                        governanceData[name] = governanceData[name].filter(item => item !== value);
                    }
                }
            } else if (type === 'radio') {
                if (element.checked) {
                    governanceData[name] = value;
                    if (name === 'voting_structure') {
                        toggleOtherVotingInput(value === 'otro');
                        if (value !== 'otro') {
                            governanceData.other_voting_description = '';
                            if(otherVotingInput) otherVotingInput.value = '';
                        }
                    }
                }
            } else if (type === 'textarea') {
                governanceData[name] = value;
            } else if (type === 'range' || type === 'number') {
                governanceData[name] = parseFloat(value);
            } else { // select-one, text, etc.
                governanceData[name] = value;
            }

            requestAnimationFrame(updateRelevantVisualizations);

        } catch (error) {
             console.error("Error al actualizar governanceData:", error, "Elemento:", element);
        }
        // console.log('Governance Data Updated:', governanceData);
    }

    /** Muestra/oculta el campo "Otro" */
    function toggleOtherVotingInput(show) {
        if (otherVotingContainer) {
            otherVotingContainer.classList.toggle('hidden', !show);
        }
    }

    /** Muestra el paso especificado */
    function showStep(stepIndex) {
         if (stepIndex < 0 || stepIndex >= totalSteps) return;

        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });

        currentStep = stepIndex;
        updateProgressBar();
        updateStepText();
        updateButtons();

        if (steps[currentStep]) {
            steps[currentStep].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (currentStep === totalSteps - 1) {
             setTimeout(() => {
                generateDashboard();
                generateDraftOutput();
                updateRadarChart();
             }, 150); // Aumentar ligeramente el delay por si acaso
        }
    }

    /** Actualiza barra de progreso */
    function updateProgressBar() {
        const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
        if (progressBar) progressBar.style.width = `${progressPercentage}%`;
    }

    /** Actualiza texto del paso */
    function updateStepText() {
        if (progressStepText) progressStepText.textContent = `Paso ${currentStep + 1} de ${totalSteps}`;
    }

    /** Configura botones de navegación */
    function updateButtons() {
        if(prevBtn) prevBtn.disabled = currentStep === 0;
        // Permitir reiniciar siempre, excepto quizás en el paso 0
        if(resetBtn) resetBtn.disabled = false; // Habilitado siempre (o currentStep === 0;)

        if (nextBtn) {
             if (currentStep === totalSteps - 1) {
                nextBtn.textContent = 'Finalizar diseño';
                nextBtn.disabled = false; // Mantener activo
            } else {
                nextBtn.textContent = 'Siguiente';
                nextBtn.disabled = false;
            }
        }
         if(downloadBtn) downloadBtn.disabled = currentStep !== totalSteps - 1;
    }

    // --- Funciones de Actualización de Visualizaciones ---

    /** Llama a todas las funciones de actualización visual */
    function updateAllVisualizations() {
        updateMemberListViz();
        updatePurposeBalanceViz();
        updateOpennessViz();
        updateVotingViz();
        updateTransparencyViz(); // ¡Importante llamar a esta!
        updateAutonomyViz();
        checkDependencyAlert();
        updateKnowledgeTreeViz();
        updateCooperationViz();
        updateImpactViz();
    }

     /** Actualiza visualizaciones relevantes para eficiencia */
    function updateRelevantVisualizations() {
         // Se puede optimizar más si fuera necesario, pero llamar a todas es más simple ahora
         updateAllVisualizations();
    }

    function updateMemberListViz() { /* Sin cambios */ }
    function updatePurposeBalanceViz() { /* Sin cambios */ }
    function updateOpennessViz() { /* Sin cambios */ }
    function updateVotingViz() { /* Sin cambios */ }

    /** Actualiza termómetro (CORREGIDO para bajar) */
    function updateTransparencyViz() {
        if (!transparencyMercury || !transparencyLevelText) return;
        let score = 0;
        const freqMap = { 'semestral': 1, 'trimestral': 2, 'continua': 3 };
        score += freqMap[governanceData.reporting_frequency] || 0;
         // CORRECCIÓN: Acceder a los booleanos correctamente
        if (governanceData.public_access === true) score += 2;
        if (governanceData.external_audit === true) score += 2;

        const maxScore = 7;
        const percentage = Math.max(10, Math.min(100, (score / maxScore) * 100));
        transparencyMercury.style.height = `${percentage}%`;

        let levelText = "Bajo";
        if (percentage > 66) levelText = "Alto";
        else if (percentage > 33) levelText = "Medio";
        transparencyLevelText.textContent = `Nivel de transparencia: ${levelText}`;
    }

    function updateAutonomyViz() { /* Sin cambios */ }
    function checkDependencyAlert() { /* Sin cambios */ }

    /** Actualiza Árbol (Determinista) */
    function updateKnowledgeTreeViz() {
        if (!treeBranchesViz || !knowledgeImpactText) return;
        const activitiesCount = governanceData.education.length;
        treeBranchesViz.innerHTML = ''; // Limpiar ramas

        // Posiciones predefinidas cerca del tronco (ajustar según tamaño de .tree-branches)
        // Formato: [left%, top%]
        const positions = [
            [40, 15], [60, 25], [30, 35], [70, 45], [50, 55], [35, 65], [65, 75]
        ];

        const branchCount = Math.min(activitiesCount, positions.length); // Limitar a posiciones definidas

        for (let i = 0; i < branchCount; i++) {
            const branch = document.createElement('div');
            branch.className = 'branch';
            const [left, top] = positions[i];

            branch.style.left = `calc(${left}% - 25px)`; // Centrar la bola (50px / 2)
            branch.style.top = `calc(${top}% - 25px)`;  // Centrar la bola
            branch.style.opacity = `${0.6 + i * 0.05}`; // Ligeramente más opaco al añadir
            branch.style.transform = `scale(${0.8 + i * 0.05})`; // Ligeramente más grande
            branch.style.zIndex = i; // Las nuevas encima
             branch.style.backgroundColor = `hsl(${100 + i*5}, 60%, ${45 + i*2}%)`; // Liger cambio de tono

            treeBranchesViz.appendChild(branch);
        }

        let impactText = "Bajo";
        if (activitiesCount >= 4) impactText = "Alto";
        else if (activitiesCount >= 2) impactText = "Moderado";
        knowledgeImpactText.textContent = `Nivel de compromiso educativo: ${impactText}`;
    }

    function updateCooperationViz() { /* Sin cambios */ }
    function updateImpactViz() { /* Sin cambios */ }


    // --- Funciones de Generación del Paso Final ---

    function generateDashboard() { /* Sin cambios funcionales, usa getFriendlyName */ }
    function generateDraftOutput() { /* Sin cambios funcionales, usa getFriendlyName y innerHTML */ }
    function calculateAciScores() { /* Sin cambios funcionales */ }
    function updateRadarChart() { /* Sin cambios funcionales */ }

    // --- Funciones de Control ---

    /** Resetea el formulario (CORREGIDO Y MEJORADO) */
    function resetForm() {
        if (confirm('¿Estás seguro de que quieres reiniciar todo el diseño? Se perderán todos los cambios.')) {
            // 1. Resetear Estado Interno
            governanceData = JSON.parse(JSON.stringify(initialGovernanceData));

            // 2. Resetear Formulario HTML Nativamente (útil para muchos campos)
             if (mainForm) mainForm.reset();

            // 3. Iterar y establecer explícitamente valores iniciales (más robusto)
            formElements.forEach(element => {
                const name = element.name;
                if (!name || !initialGovernanceData.hasOwnProperty(name)) return; // Saltar si no tiene nombre o no está en estado inicial

                const initialValue = initialGovernanceData[name];
                const type = element.type;

                if (type === 'checkbox') {
                    if (typeof initialValue === 'boolean') {
                        element.checked = initialValue;
                    } else if (Array.isArray(initialValue)) {
                        element.checked = initialValue.includes(element.value);
                         // Caso especial 'ninguno' incentivo
                        if (name === 'incentive' && initialValue.includes('ninguno')) {
                             if (element.value === 'ninguno') element.checked = true;
                             else element.checked = false;
                        }
                    } else {
                         element.checked = false; // Default para checkboxes no encontrados
                    }
                } else if (type === 'radio') {
                     element.checked = (element.value === initialValue);
                } else { // Incluye text, number, range, select-one, textarea
                    element.value = initialValue;
                     // Disparar evento input para sliders (actualiza % visual)
                     if (type === 'range') {
                         element.dispatchEvent(new Event('input', { bubbles: true }));
                     }
                }
            });

            // 4. Resetear elementos específicos adicionales
            toggleOtherVotingInput(false); // Ocultar campo "Otro"
            if(otherVotingInput) otherVotingInput.value = ''; // Limpiar textarea

            // 5. Actualizar todas las visualizaciones al estado reseteado
            updateAllVisualizations();

            // 6. Ir al Primer Paso
            showStep(0);

            // 7. Scroll al inicio de la página
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }


    // --- Event Listeners ---

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentStep < totalSteps - 1) {
                showStep(currentStep + 1);
            } else {
                alert('¡Diseño completado! Revisa el resumen y el borrador.\nPuedes descargar el borrador como PDF.');
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 0) {
                showStep(currentStep - 1);
            }
        });
    }

    if (resetBtn) {
         resetBtn.addEventListener('click', resetForm);
    }

    // Listeners para formulario
    formElements.forEach(element => {
        const eventType = (element.type === 'range' || element.type === 'number' || element.type === 'textarea') ? 'input' : 'change';
        element.addEventListener(eventType, updateGovernanceData);
    });

    // Listener Descarga PDF (CORREGIDO error $1)
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            try {
                if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
                    alert('Error: La librería jsPDF no se ha cargado correctamente.');
                    console.error("jsPDF no está definido.");
                    return;
                }
                const { jsPDF } = jspdf;
                const doc = new jsPDF({ // Orientación y formato
                     orientation: 'p', // portrait
                     unit: 'mm', // milímetros
                     format: 'a4' // tamaño A4
                 });
                const outputElement = draftOutput;

                if (!outputElement) {
                     alert("Error: No se encontró el contenido del borrador.");
                     return;
                }

                // Convertir HTML a texto plano para jsPDF (CORREGIDO)
                let textContent = outputElement.innerHTML;

                // Reemplazar etiquetas con formato de texto
                textContent = textContent
                    // Títulos H4 -> *** TÍTULO *** con saltos de línea
                    .replace(/<h4>(.*?)<\/h4>/gi, (match, p1) => `\n*** ${p1.toUpperCase()} ***\n\n`)
                     // Strong -> TÍTULO\n-------\n
                    .replace(/<strong>(.*?)<\/strong>/gi, (match, p1) => `\n${p1}\n${'-'.repeat(p1.length)}\n`)
                    // BR y fin de P/UL/LI -> Salto de línea
                    .replace(/<br\s*[\/]?>|<\/p>|<\/ul>|<\/li>/gi, "\n")
                    // LI -> Guión al inicio
                    .replace(/<li>/gi, "- ")
                    // Quitar el resto de etiquetas HTML
                    .replace(/<[^>]*>/g, "")
                    // Decodificar entidades HTML
                    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                    // Limpiar saltos de línea múltiples y espacios extra
                    .replace(/\n{3,}/g, "\n\n").trim();

                doc.setFontSize(11);
                // Márgenes (izq, sup) en mm
                const margin = 15;
                 // Ancho máximo del texto en mm (A4 width 210mm - 2*margin)
                const textWidth = doc.internal.pageSize.getWidth() - (margin * 2);

                const splitText = doc.splitTextToSize(textContent, textWidth);
                doc.text(splitText, margin, margin); // Añadir texto con margen

                doc.save('borrador_gobernanza_energetica.pdf');

            } catch (error) {
                console.error("Error al generar el PDF:", error);
                // Mostrar un error más específico si es posible
                 alert(`Hubo un error al intentar generar el PDF: ${error.message || error}. Revisa la consola.`);
            }
        });
    }

    // --- Inicialización ---
    updateAllVisualizations(); // Asegurar visualizaciones iniciales correctas
    showStep(0); // Mostrar el primer paso

}); // Fin del DOMContentLoaded
