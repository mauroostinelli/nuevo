// script.js

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
    const mainForm = document.getElementById('governance-constructor'); // Referencia al formulario

    // Elementos interactivos específicos
    // NodeList es live, así que no necesita actualizarse si no se añade/quita HTML dinámicamente
    const formElements = document.querySelectorAll('#governance-constructor input, #governance-constructor select, #governance-constructor textarea');
    const otherVotingContainer = document.getElementById('other-voting-description-container');
    const otherVotingInput = document.getElementById('other_voting_description');
    // Los NodeList como votingRadios se mantienen actualizados si no cambia el DOM

    // Elementos de Visualización
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
        // (Sin cambios en la función getFriendlyName)
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

    /** Actualiza el objeto governanceData (Con manejo correcto de booleanos) */
    function updateGovernanceData(event) {
        const element = event.target;
        const name = element.name;
        const type = element.type;
        let value = element.value;

        if (!name || !governanceData.hasOwnProperty(name)) return; // Ignorar si no tiene nombre o no está en el estado

        try {
            // Manejo específico para checkboxes que representan booleanos en el estado
            if (type === 'checkbox' && typeof initialGovernanceData[name] === 'boolean') {
                 governanceData[name] = element.checked;
            }
            // Manejo para checkboxes que representan arrays
            else if (type === 'checkbox') {
                if (!Array.isArray(governanceData[name])) governanceData[name] = []; // Asegurar que es array
                const valueExists = governanceData[name].includes(value);

                // Lógica exclusiva 'ninguno'
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
                } else { // Checkboxes de array estándar
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
             }, 150);
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
        if(resetBtn) resetBtn.disabled = false; // Habilitado siempre

        if (nextBtn) {
             if (currentStep === totalSteps - 1) {
                nextBtn.textContent = 'Finalizar diseño';
                nextBtn.disabled = false;
            } else {
                nextBtn.textContent = 'Siguiente';
                nextBtn.disabled = false;
            }
        }
        // Habilitar descarga sólo en el último paso
        if(downloadBtn) downloadBtn.disabled = currentStep !== totalSteps - 1;
    }

    // --- Funciones de Actualización de Visualizaciones ---

    /** Llama a todas las funciones de actualización visual */
    function updateAllVisualizations() {
        updateMemberListViz();
        updatePurposeBalanceViz();
        updateOpennessViz();
        updateVotingViz();
        updateTransparencyViz(); // Importante incluir esta
        updateAutonomyViz();
        checkDependencyAlert();
        updateKnowledgeTreeViz();
        updateCooperationViz();
        updateImpactViz();
    }

    /** Llama a funciones específicas para eficiencia */
    function updateRelevantVisualizations() {
         // Por simplicidad y dado que no hay cuellos de botella, llamamos a todas
         updateAllVisualizations();
    }

    // (Las funciones updateMemberListViz, updatePurposeBalanceViz, etc. permanecen igual
    // excepto updateTransparencyViz y updateKnowledgeTreeViz que se modificaron abajo)

    /** Actualiza termómetro (CORREGIDO) */
    function updateTransparencyViz() {
        if (!transparencyMercury || !transparencyLevelText) return;
        let score = 0;
        const freqMap = { 'semestral': 1, 'trimestral': 2, 'continua': 3 };
        score += freqMap[governanceData.reporting_frequency] || 0;
        // Acceder a los booleanos correctamente
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

    /** Actualiza Árbol (Determinista - CORREGIDO) */
    function updateKnowledgeTreeViz() {
        if (!treeBranchesViz || !knowledgeImpactText || !knowledgeTreeViz) return;
        const activitiesCount = governanceData.education.length;
        treeBranchesViz.innerHTML = ''; // Limpiar ramas

        // Posiciones predefinidas cerca del tronco (más juntas)
        // Formato: [desplazamiento X desde centro, desplazamiento Y desde arriba] en px
        // Ajustar estos valores si el tamaño del contenedor .tree-branches cambia
        const positions = [
            [0, 10], [-20, 30], [20, 30], [-10, 55], [10, 55], [-30, 75], [30, 75]
        ];

        const branchCount = Math.min(activitiesCount, positions.length);
        const baseLeft = treeBranchesViz.offsetWidth / 2; // Centro X del contenedor de ramas
        const branchSize = 50; // Tamaño aprox de la bola (para centrarla)

        for (let i = 0; i < branchCount; i++) {
            const branch = document.createElement('div');
            branch.className = 'branch';
            const [offsetX, offsetY] = positions[i];

            // Calcular posición final centrando la bola
            branch.style.left = `${baseLeft + offsetX - branchSize / 2}px`;
            branch.style.top = `${offsetY}px`; // Y relativo a la parte superior del contenedor
            branch.style.opacity = `${0.6 + i * 0.05}`;
            branch.style.transform = `scale(${0.8 + i * 0.05})`;
            branch.style.zIndex = i; // Las más nuevas encima
            branch.style.backgroundColor = `hsl(${100 + i*5}, 60%, ${45 + i*2}%)`;

            treeBranchesViz.appendChild(branch);
        }

        let impactText = "Bajo";
        if (activitiesCount >= 4) impactText = "Alto";
        else if (activitiesCount >= 2) impactText = "Moderado";
        knowledgeImpactText.textContent = `Nivel de compromiso educativo: ${impactText}`;
    }

    // (Las funciones updateCooperationViz, updateImpactViz, etc. permanecen igual)
    function updateAutonomyViz() { /* Sin cambios */ }
    function checkDependencyAlert() { /* Sin cambios */ }
    function updateCooperationViz() { /* Sin cambios */ }
    function updateImpactViz() { /* Sin cambios */ }


    // --- Funciones de Generación del Paso Final ---

    function generateDashboard() {
        if (!dashboardOutput) return;
        // (Sin cambios funcionales, usa getFriendlyName)
        let html = '<ul>';
        html += `<li><strong>Propósito principal:</strong> <span>${governanceData.purpose.map(getFriendlyName).join(', ') || 'No definido'} (Balance: ${governanceData.purpose_balance}% comunitario)</span></li>`;
        html += `<li><strong>Tipos miembros:</strong> <span>${governanceData.member_type.map(getFriendlyName).join(', ') || 'No definidos'}</span></li>`;
        html += `<li><strong>Apertura (P1):</strong> <span>Nivel ${governanceData.openness_level}/100. Inclusión: ${getFriendlyName(governanceData.inclusion_strategy)}</span></li>`;
        let votingText = getFriendlyName(governanceData.voting_structure);
        if (governanceData.voting_structure === 'otro' && governanceData.other_voting_description) {
            votingText += `: ${governanceData.other_voting_description}`;
        }
        html += `<li><strong>Voto (P2):</strong> <span>${votingText}. Transparencia: ${transparencyLevelText?.textContent.split(': ')[1] || 'N/A'}</span></li>`;
        html += `<li><strong>Participación econ. (P3):</strong> <span>Contrib.: ${governanceData.contribution.map(getFriendlyName).join(', ')}. Excedentes: ${getFriendlyName(governanceData.surplus_priority)}</span></li>`;
        html += `<li><strong>Autonomía (P4):</strong> <span>Nivel ${autonomyLevelText?.textContent.split(': ')[1] || 'N/A'}. Límite externo: ${governanceData.external_funding_limit}%</span></li>`;
        html += `<li><strong>Educación (P5):</strong> <span>${governanceData.education.length} ${governanceData.education.length === 1 ? 'actividad seleccionada' : 'actividades seleccionadas'}.</span></li>`;
        html += `<li><strong>Cooperación (P6):</strong> <span>Nivel ${getFriendlyName(governanceData.cooperation_level_radio)}. Áreas: ${governanceData.cooperation_area.length}</span></li>`;
        html += `<li><strong>Interés comunidad (P7):</strong> <span>Foco: ${getFriendlyName(governanceData.community_focus_radio)}. Reinversión: ${governanceData.reinvestment.length} ${governanceData.reinvestment.length === 1 ? 'mecanismo' : 'mecanismos'}</span></li>`;
        html += '</ul>';
        dashboardOutput.innerHTML = html;
    }

    function generateDraftOutput() {
        if (!draftOutput) return;
        // (Sin cambios funcionales, usa getFriendlyName y innerHTML)
        let htmlContent = `<h4>BORRADOR PRELIMINAR DE GOBERNANZA</h4>`;
        htmlContent += `<strong>OBJETO Y FINES (Ref. P7):</strong>`;
        htmlContent += `<ul><li>Fines principales: ${governanceData.purpose.map(getFriendlyName).join(', ') || 'Definir'}.</li>`;
        htmlContent += `<li>Énfasis: ${governanceData.purpose_balance}% beneficio comunitario, ${100 - governanceData.purpose_balance}% retorno financiero.</li>`;
        htmlContent += `<li>El interés por la comunidad local es ${getFriendlyName(governanceData.community_focus_radio)}.</li>`;
        htmlContent += `<li>Mecanismos de reinversión comunitaria: ${governanceData.reinvestment.map(getFriendlyName).join(', ') || 'Ninguno definido'}.</li></ul>`;
        htmlContent += `<strong>MIEMBROS (Ref. P1):</strong>`;
        htmlContent += `<ul><li>Tipos de miembros admitidos: ${governanceData.member_type.map(getFriendlyName).join(', ') || 'Definir'}.</li>`;
        htmlContent += `<li>Criterios elegibilidad: ${governanceData.criteria.map(getFriendlyName).join(', ') || 'Abierto (revisar)'}.</li>`;
        htmlContent += `<li>Nivel de apertura/compromiso: ${governanceData.openness_level}/100.</li>`;
        htmlContent += `<li>Estrategia de inclusión: ${getFriendlyName(governanceData.inclusion_strategy)}.</li></ul>`;
        htmlContent += `<strong>CONTROL DEMOCRÁTICO (Ref. P2):</strong>`;
        let votingText = getFriendlyName(governanceData.voting_structure);
        if (governanceData.voting_structure === 'otro' && governanceData.other_voting_description) {
            votingText += `: "${governanceData.other_voting_description}"`;
        }
        htmlContent += `<ul><li>Estructura de voto: ${votingText}.</li>`;
        htmlContent += `<li>Órgano de gobierno elegido por: ${getFriendlyName(governanceData.governing_body)}. ${governanceData.reserved_seats ? 'Con puestos reservados.' : ''}</li>`;
        htmlContent += `<li>Transparencia: Informes ${getFriendlyName(governanceData.reporting_frequency)}. Decisiones ${governanceData.public_access ? 'accesibles' : 'no accesibles'}. Auditoría externa: ${governanceData.external_audit ? 'Sí' : 'No'}.</li></ul>`;
        htmlContent += `<strong>PARTICIPACIÓN ECONÓMICA (Ref. P3):</strong>`;
        htmlContent += `<ul><li>Formas de contribución: ${governanceData.contribution.map(getFriendlyName).join(', ') || 'Definir'}.</li>`;
        htmlContent += `<li>Uso prioritario de excedentes: ${getFriendlyName(governanceData.surplus_priority)}.</li>`;
        htmlContent += `<li>Incentivos a la participación: ${governanceData.incentive.map(getFriendlyName).join(', ') || 'Ninguno'}.</li></ul>`;
        htmlContent += `<strong>AUTONOMÍA E INDEPENDENCIA (Ref. P4):</strong>`;
        htmlContent += `<ul><li>Control estratégico: ${getFriendlyName(governanceData.decision_control)}.</li>`;
        htmlContent += `<li>Límite a participación externa: ${governanceData.external_funding_limit}%.</li>`;
        htmlContent += `<li>${governanceData.veto_rights_members ? 'Con' : 'Sin'} derecho de veto de miembros sobre acuerdos externos.</li>`;
        htmlContent += `<li>${governanceData.autonomy_clause ? 'Se incluirá' : 'No se incluirá'} cláusula explícita de autonomía.</li></ul>`;
        htmlContent += `<strong>EDUCACIÓN E INFORMACIÓN (Ref. P5):</strong>`;
        htmlContent += `<ul><li>Actividades previstas: ${governanceData.education.map(getFriendlyName).join(', ') || 'Ninguna definida'}.</li></ul>`;
        htmlContent += `<strong>COOPERACIÓN (Ref. P6):</strong>`;
        htmlContent += `<ul><li>Nivel de cooperación buscado: ${getFriendlyName(governanceData.cooperation_level_radio)}.</li>`;
        htmlContent += `<li>Áreas de cooperación potenciales: ${governanceData.cooperation_area.map(getFriendlyName).join(', ') || 'Ninguna definida'}.</li></ul>`;
        htmlContent += `<em>--- Fin del Borrador Preliminar ---</em>`;
        draftOutput.innerHTML = htmlContent.replace(/\n/g, ''); // Renderizar como HTML
    }


    function calculateAciScores() { /* Sin cambios */ }
    function updateRadarChart() { /* Sin cambios */ }

    // --- Funciones de Control ---

    /** Resetea el formulario (CORREGIDO Y COMPLETADO) */
    function resetForm() {
        if (confirm('¿Estás seguro de que quieres reiniciar todo el diseño? Se perderán todos los cambios.')) {
            // 1. Resetear Estado Interno
            governanceData = JSON.parse(JSON.stringify(initialGovernanceData));

            // 2. Resetear Formulario HTML Nativamente
            if (mainForm) mainForm.reset(); // Intenta resetear nativamente

            // 3. Iterar y establecer explícitamente valores iniciales VISUALES
            formElements.forEach(element => {
                const name = element.name;
                if (!name || !initialGovernanceData.hasOwnProperty(name)) return;

                const initialValue = initialGovernanceData[name];
                const type = element.type;

                try { // Añadir try-catch por si algún elemento no existe
                    if (type === 'checkbox') {
                        if (typeof initialValue === 'boolean') {
                            element.checked = initialValue;
                        } else if (Array.isArray(initialValue)) {
                            element.checked = initialValue.includes(element.value);
                            // Caso especial 'ninguno'
                            if (name === 'incentive' && initialValue.includes('ninguno')) {
                                element.checked = (element.value === 'ninguno');
                            }
                        } else {
                            element.checked = false; // Default si no es booleano ni array
                        }
                    } else if (type === 'radio') {
                        element.checked = (element.value === initialValue);
                    } else if (element.tagName === 'TEXTAREA') { // Identificar textarea
                        element.value = initialValue;
                    }
                    else { // text, number, range, select-one
                        element.value = initialValue;
                        // Disparar evento 'input' para sliders para actualizar su track visual
                        if (type === 'range') {
                            element.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }
                 } catch(e) {
                     console.warn(`Error reseteando elemento ${name}: ${e}`);
                 }
            });

            // 4. Resetear elementos específicos adicionales
            toggleOtherVotingInput(false);
            if(otherVotingInput) otherVotingInput.value = '';

            // 5. Actualizar todas las visualizaciones al estado reseteado
            // Usar requestAnimationFrame para asegurar que el DOM está listo tras el reset
             requestAnimationFrame(() => {
                updateAllVisualizations();
                 // 6. Ir al Primer Paso (después de actualizar visuales)
                showStep(0);
                 // 7. Scroll al inicio de la página
                 window.scrollTo({ top: 0, behavior: 'smooth' });
             });


        }
    }

    // --- Event Listeners ---

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentStep < totalSteps - 1) {
                showStep(currentStep + 1);
            } else {
                // Ya no se deshabilita, pero podemos mostrar un mensaje final
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
        // Usar 'input' para respuesta inmediata en range, number, textarea
        // Usar 'change' para select, radio, checkbox (cuando pierde el foco o cambia selección)
        const eventType = (element.type === 'range' || element.type === 'number' || element.tagName === 'TEXTAREA') ? 'input' : 'change';
        element.addEventListener(eventType, updateGovernanceData);
    });


    // Listener Descarga PDF (CORREGIDO error $1 y formato)
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            try {
                if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
                    alert('Error: La librería jsPDF no se ha cargado correctamente.'); console.error("jsPDF no está definido."); return;
                }
                const { jsPDF } = jspdf;
                const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                const outputElement = draftOutput;

                if (!outputElement) { alert("Error: No se encontró el contenido del borrador."); return; }

                // Convertir HTML a texto plano mejorado para PDF
                let textContent = outputElement.innerHTML;

                // 1. Reemplazar etiquetas con formato y saltos de línea
                textContent = textContent
                    .replace(/<h4>(.*?)<\/h4>/gi, (match, p1) => `\n\n*** ${p1.toUpperCase().trim()} ***\n\n`)
                    .replace(/<strong>(.*?)<\/strong>/gi, (match, p1) => `\n${p1.trim()}\n${'-'.repeat(p1.trim().length)}\n`)
                    .replace(/<br\s*[\/]?>|<\/p>|<\/ul>/gi, "\n") // BR, fin P, fin UL -> Salto línea
                    .replace(/<\/li>/gi, "\n") // Fin LI -> Salto línea
                    .replace(/<li>/gi, "- ")   // LI -> Guión
                    .replace(/<[^>]*>/g, "")   // Quitar resto de etiquetas HTML
                    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">") // Entidades HTML
                    .replace(/\n{3,}/g, "\n\n") // Normalizar saltos de línea múltiples
                    .trim(); // Limpiar espacios inicio/final

                doc.setFontSize(11);
                const margin = 15;
                const textWidth = doc.internal.pageSize.getWidth() - (margin * 2);

                // Generar texto con auto-wrap
                const splitText = doc.splitTextToSize(textContent, textWidth);
                doc.text(splitText, margin, margin); // Añadir texto con márgenes

                doc.save('borrador_gobernanza_energetica.pdf');

            } catch (error) {
                console.error("Error al generar el PDF:", error);
                alert(`Hubo un error al intentar generar el PDF: ${error.message || error}. Revisa la consola.`);
            }
        });
    }

    // --- Inicialización ---
    updateAllVisualizations(); // Actualizar visuales iniciales
    showStep(0); // Mostrar primer paso

}); // Fin del DOMContentLoaded
