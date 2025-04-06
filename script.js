// script.js

// Asegúrate de que las CDNs de Chart.js y jsPDF están en el HTML:
// <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de Elementos DOM ---
    const steps = document.querySelectorAll('.step');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const resetBtn = document.getElementById('reset-btn'); // Botón Reiniciar
    const progressBar = document.getElementById('progress-bar');
    const progressStepText = document.getElementById('progress-step-text');
    const stepsContainer = document.getElementById('steps-container');
    const downloadBtn = document.getElementById('download-draft-btn');
    const mainForm = document.getElementById('governance-constructor'); // El contenedor principal como formulario

    // Elementos interactivos específicos
    const formElements = document.querySelectorAll('#governance-constructor input, #governance-constructor select, #governance-constructor textarea');
    const otherVotingContainer = document.getElementById('other-voting-description-container');
    const otherVotingInput = document.getElementById('other_voting_description');
    const votingRadios = document.querySelectorAll('input[name="voting_structure"]');

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
    const coopNodes = cooperationMapViz?.querySelectorAll('.map-node.other'); // Añadir ? por si no existe
    const coopLinks = cooperationMapViz?.querySelectorAll('.map-link'); // Añadir ? por si no existe
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

    // Estado Inicial - Definido para la función de reinicio
    const initialGovernanceData = Object.freeze({ // Usar Object.freeze para asegurar inmutabilidad
        purpose: [], purpose_balance: 70, member_type: [], activity: [],
        openness_level: 60, criteria: [], inclusion_strategy: 'ninguna',
        voting_structure: '1m1v', other_voting_description: '', governing_body: 'asamblea_general', reserved_seats: false, reporting_frequency: 'semestral', public_access: true, external_audit: false,
        contribution: ['cuota_entrada'], surplus_priority: 'reinversion_comunidad', incentive: ['ninguno'],
        decision_control: 'miembros_exclusivo', external_funding_limit: 25, veto_rights_members: false, autonomy_clause: true,
        education: ['info_miembros'],
        cooperation_level_radio: 'media', cooperation_area: [],
        community_focus_radio: 'primario', reinvestment: ['proyectos_locales'],
    });

    // Copia profunda del estado inicial para el estado de ejecución
    let governanceData = JSON.parse(JSON.stringify(initialGovernanceData));

    // --- Funciones Auxiliares ---

    /**
     * Convierte valor interno a texto legible en español.
     * @param {string} value - Valor interno (ej. 'hogares_vulnerables').
     * @returns {string} - Nombre legible (ej. 'Hogares vulnerables').
     */
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
             default: value ? value.replace(/_/g, ' ') : '' // Fallback
        };
        // Devuelve el mapeo o el valor procesado si no se encuentra
        return nameMap[value] || (typeof value === 'string' ? value.replace(/_/g, ' ') : value);
    }

    // --- Funciones Principales ---

    /** Actualiza el objeto governanceData según cambios en el formulario */
    function updateGovernanceData(event) {
        const element = event.target;
        const name = element.name;
        const type = element.type;
        let value = element.value;

        if (!name) return; // Ignorar elementos sin nombre

        try {
            if (type === 'checkbox') {
                if (!Array.isArray(governanceData[name])) {
                    governanceData[name] = []; // Inicializa si no es array
                }
                const valueExists = governanceData[name].includes(value);

                // Lógica exclusiva para incentivo 'ninguno'
                if (name === 'incentive') {
                    if (element.checked) {
                        if (value === 'ninguno') {
                            governanceData[name] = ['ninguno'];
                            document.querySelectorAll('input[name="incentive"]').forEach(cb => {
                                if (cb !== element) cb.checked = false;
                            });
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
                } else { // Lógica estándar para checkboxes
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
                governanceData[name] = parseFloat(value); // Usar parseFloat
            } else { // select-one, text, etc.
                governanceData[name] = value;
            }

            // Dispara actualizaciones visuales de forma eficiente
            requestAnimationFrame(updateRelevantVisualizations);

        } catch (error) {
             console.error("Error al actualizar governanceData:", error, "Elemento:", element);
        }
        // console.log('Governance Data Updated:', governanceData); // Para depuración
    }

    /** Muestra/oculta el campo de texto para "Otro" sistema de voto */
    function toggleOtherVotingInput(show) {
        if (otherVotingContainer) {
            otherVotingContainer.classList.toggle('hidden', !show);
        }
    }

    /** Muestra el paso especificado y actualiza UI */
    function showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= totalSteps) {
            console.error("Índice de paso inválido:", stepIndex);
            return;
        }

        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });

        currentStep = stepIndex;
        updateProgressBar();
        updateStepText();
        updateButtons();

        // Scroll suave al inicio del paso para mejor visibilidad
        if (steps[currentStep]) {
            steps[currentStep].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Generar resultados si es el último paso
        if (currentStep === totalSteps - 1) {
             // Espera un poco para que la animación del paso termine antes de generar
             setTimeout(() => {
                generateDashboard();
                generateDraftOutput();
                updateRadarChart();
             }, 100); // Pequeño delay
        }
    }

    /** Actualiza la barra de progreso */
    function updateProgressBar() {
        const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
        if (progressBar) {
             progressBar.style.width = `${progressPercentage}%`;
        }
    }

    /** Actualiza el texto del indicador de paso */
    function updateStepText() {
        if (progressStepText) {
             progressStepText.textContent = `Paso ${currentStep + 1} de ${totalSteps}`;
        }
    }

    /** Configura el estado de los botones de navegación */
    function updateButtons() {
        if(prevBtn) prevBtn.disabled = currentStep === 0;
        if(resetBtn) resetBtn.disabled = currentStep === 0; // Deshabilitar Reset en el primer paso

        if (nextBtn) {
             if (currentStep === totalSteps - 1) {
                nextBtn.textContent = 'Finalizar diseño';
                nextBtn.disabled = false; // Mantener activo en el último paso
            } else {
                nextBtn.textContent = 'Siguiente';
                nextBtn.disabled = false;
            }
        }
         if(downloadBtn) downloadBtn.disabled = currentStep !== totalSteps - 1; // Habilitar sólo en el último paso
    }

    // --- Funciones de Actualización de Visualizaciones ---

    /** Actualiza solo las visualizaciones relevantes */
    function updateRelevantVisualizations() {
         // Llama a las funciones específicas de actualización según sea necesario
         // Esto es más eficiente que llamar a todas siempre
         updateMemberListViz();
         updatePurposeBalanceViz();
         updateOpennessViz();
         updateVotingViz();
         updateTransparencyViz();
         updateAutonomyViz();
         checkDependencyAlert();
         updateKnowledgeTreeViz();
         updateCooperationViz();
         updateImpactViz();
    }

    function updateMemberListViz() {
        if (!memberListViz) return;
        memberListViz.innerHTML = '';
        if (governanceData.member_type.length === 0) {
            memberListViz.innerHTML = '<li>(Selecciona tipos de miembros)</li>';
            return;
        }
        governanceData.member_type.forEach(type => {
            const li = document.createElement('li');
            li.textContent = getFriendlyName(type);
            memberListViz.appendChild(li);
        });
    }

    function updatePurposeBalanceViz() {
        if (!purposeBalanceSlider || !purposeBalanceValue) return;
        const balance = governanceData.purpose_balance;
        purposeBalanceValue.textContent = `${balance}% Comunitario / ${100 - balance}% Financiero`;
        purposeBalanceSlider.style.setProperty('--value', `${balance}%`);
    }

    function updateOpennessViz() {
        if (!opennessSlider || !opennessLevelText) return;
        const level = governanceData.openness_level;
        let text = "Nivel intermedio de requisitos.";
        if (level > 75) text = "Alta facilidad de entrada, pocos requisitos.";
        else if (level < 25) text = "Alto compromiso requerido para entrar.";
        opennessLevelText.textContent = text;
        opennessSlider.style.setProperty('--value', `${level}%`);
    }

     function updateVotingViz() {
         if (!voteBeam || !votingVizText) return;
        const structure = governanceData.voting_structure;
        let angle = 0;
        let text = `Seleccionado: ${getFriendlyName(structure)}`;
        if (structure === 'ponderado_tipo') angle = 15;
        else if (structure === 'ponderado_aportacion') angle = -15;

        voteBeam.style.transform = `rotate(${angle}deg)`;
        votingVizText.textContent = text;
    }

    function updateTransparencyViz() {
        if (!transparencyMercury || !transparencyLevelText) return;
        let score = 0;
        const freqMap = { 'semestral': 1, 'trimestral': 2, 'continua': 3 };
        score += freqMap[governanceData.reporting_frequency] || 0;
        if (governanceData.public_access) score += 2;
        if (governanceData.external_audit) score += 2;

        const maxScore = 7; // 3 + 2 + 2
        const percentage = Math.max(10, Math.min(100, (score / maxScore) * 100));
        transparencyMercury.style.height = `${percentage}%`;

        let levelText = "Bajo";
        if (percentage > 66) levelText = "Alto";
        else if (percentage > 33) levelText = "Medio";
        transparencyLevelText.textContent = `Nivel de transparencia: ${levelText}`;
    }

    function updateAutonomyViz() {
        if (!autonomyShieldViz || !autonomyLevelText) return;
        let score = 0;
        const controlMap = { 'miembros_exclusivo': 3, 'miembros_mayoritario': 2 };
        score += controlMap[governanceData.decision_control] || 0;
        if (governanceData.external_funding_limit <= 25) score += 2;
        else if (governanceData.external_funding_limit <= 50) score += 1;
        if (governanceData.veto_rights_members) score += 1;
        if (governanceData.autonomy_clause) score += 1;

        const maxScore = 7; // 3 + 2 + 1 + 1
        const percentage = (score / maxScore) * 100;

        // Actualizar capas del escudo conceptualmente
        const layer1 = autonomyShieldViz.querySelector('#shield-layer-1');
        const layer2 = autonomyShieldViz.querySelector('#shield-layer-2');
        const layer3 = autonomyShieldViz.querySelector('#shield-layer-3');
        if(layer1) layer1.style.backgroundColor = percentage > 33 ? 'var(--success-color)' : 'transparent';
        if(layer2) layer2.style.backgroundColor = percentage > 66 ? 'var(--accent-color)' : 'transparent';
        if(layer3) layer3.style.backgroundColor = percentage > 85 ? 'var(--primary-color)' : 'transparent';

        let levelText = "Bajo";
        if (percentage > 66) levelText = "Alto";
        else if (percentage > 33) levelText = "Medio";
        autonomyLevelText.textContent = `Nivel de autonomía: ${levelText}`;
    }

     function checkDependencyAlert() {
         if (!dependencyAlert) return;
        const limit = governanceData.external_funding_limit;
        dependencyAlert.classList.toggle('hidden', limit <= 50);
    }

    function updateKnowledgeTreeViz() {
        if (!treeBranchesViz || !knowledgeImpactText) return;
        const activitiesCount = governanceData.education.length;
        treeBranchesViz.innerHTML = ''; // Limpiar ramas anteriores

        const branchCount = Math.min(activitiesCount, 7); // Limitar número de ramas visuales
        const centerX = 90; // Centro X del contenedor .knowledge-tree (180 / 2)
        const centerY = 65; // Centro Y del área de ramas (130 / 2)

        for (let i = 0; i < branchCount; i++) {
            const branch = document.createElement('div');
            branch.className = 'branch';
            // Posicionamiento más orgánico alrededor de un punto central
            const angle = Math.random() * Math.PI * 2; // Ángulo aleatorio
            const radius = 15 + Math.random() * 40; // Radio aleatorio (controla distancia del centro)
            const x = centerX + Math.cos(angle) * radius - 25; // 25 es la mitad del ancho de la rama
            const y = centerY + Math.sin(angle) * radius - 25; // 25 es la mitad de la altura

            branch.style.left = `${x}px`;
            branch.style.top = `${y}px`;
            branch.style.opacity = `${0.5 + Math.random() * 0.3}`;
            branch.style.transform = `scale(${0.7 + Math.random() * 0.5})`; // Tamaño aleatorio
            branch.style.backgroundColor = `hsl(${90 + Math.random()*40}, 60%, ${45 + Math.random()*15}%)`; // Variedad de verdes

            treeBranchesViz.appendChild(branch);
        }

        let impactText = "Bajo";
        if (activitiesCount >= 4) impactText = "Alto";
        else if (activitiesCount >= 2) impactText = "Moderado";
        knowledgeImpactText.textContent = `Nivel de compromiso educativo: ${impactText}`;
    }


    function updateCooperationViz() {
        if (!cooperationMapViz || !cooperationVizText) return;
        const level = governanceData.cooperation_level_radio;
        const areasCount = governanceData.cooperation_area.length;
        let linkStrength = 0;
        if (level === 'media') linkStrength = 1;
        else if (level === 'alta') linkStrength = 2;

        if(coopLinks) {
            coopLinks.forEach((link, index) => {
                link.style.backgroundColor = linkStrength > index ? 'var(--accent-color)' : '#ccc';
                link.style.height = linkStrength > index ? '4px' : '3px';
            });
        }
        if(coopNodes) {
             coopNodes.forEach((node, index) => {
                 node.style.backgroundColor = linkStrength > index ? 'var(--primary-color)' : '#aaa';
             });
        }

        let vizText = "Bajo";
        if (linkStrength === 2 || (linkStrength === 1 && areasCount >= 2)) vizText = "Alto";
        else if (linkStrength === 1 || areasCount >= 1) vizText = "Moderado";
        cooperationVizText.textContent = `Nivel de interconexión: ${vizText}`;
    }

    function updateImpactViz() {
         if (!impactNeedle || !impactLevelText) return;
        let score = 0;
        const focusMap = { 'primario': 3, 'importante': 2 };
        score += focusMap[governanceData.community_focus_radio] || 0;
        score += governanceData.reinvestment.length;

        const maxScore = 8; // 3 + 5
        const percentage = (score / maxScore) * 100;
        const rotation = -60 + (percentage / 100) * 120; // Rango -60 a +60 grados
        impactNeedle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

        let levelText = "Bajo";
        if (percentage > 66) levelText = "Alto";
        else if (percentage > 33) levelText = "Medio";
        impactLevelText.textContent = `Impacto comunitario potencial: ${levelText}`;
    }

    // --- Funciones de Generación del Paso Final ---

    /** Genera el resumen del dashboard */
    function generateDashboard() {
        if (!dashboardOutput) return;
        let html = '<ul>';
        html += `<li><strong>Propósito principal:</strong> <span>${governanceData.purpose.map(getFriendlyName).join(', ') || 'No definido'} (Balance: ${governanceData.purpose_balance}% comunitario)</span></li>`;
        html += `<li><strong>Tipos miembros:</strong> <span>${governanceData.member_type.map(getFriendlyName).join(', ') || 'No definidos'}</span></li>`;
        html += `<li><strong>Apertura (P1):</strong> <span>Nivel ${governanceData.openness_level}/100. Inclusión: ${getFriendlyName(governanceData.inclusion_strategy)}</span></li>`;
        let votingText = getFriendlyName(governanceData.voting_structure);
        if (governanceData.voting_structure === 'otro' && governanceData.other_voting_description) {
            votingText += `: ${governanceData.other_voting_description}`; // Mostrar descripción "Otro"
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

    /** Genera el texto del borrador preliminar */
    function generateDraftOutput() {
        if (!draftOutput) return;
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

        // Renderizar como HTML usando innerHTML
        draftOutput.innerHTML = htmlContent.replace(/\n/g, ''); // Quitar saltos de línea extra si los hubiera
    }

    /** Calcula puntuaciones ACI ilustrativas */
    function calculateAciScores() {
        const scores = { P1: 1, P2: 1, P3: 1, P4: 1, P5: 1, P6: 1, P7: 1 };
        // P1
        if (governanceData.openness_level > 50) scores.P1 += 1;
        if (!governanceData.criteria.includes('inversion') || governanceData.criteria.length <= 2) scores.P1 +=1;
        if (governanceData.inclusion_strategy === 'activa') scores.P1 += 2;
        else if (governanceData.inclusion_strategy === 'basica') scores.P1 += 1;
        // P2
        if (governanceData.voting_structure === '1m1v') scores.P2 += 2;
        if (governanceData.governing_body === 'asamblea_general') scores.P2 += 1;
        if (governanceData.public_access) scores.P2 += 1;
        if (['trimestral', 'continua'].includes(governanceData.reporting_frequency)) scores.P2 += 1;
        // P3
        if (governanceData.contribution.length >= 2) scores.P3 += 1;
        if (governanceData.surplus_priority === 'reinversion_comunidad') scores.P3 += 2;
        else if (governanceData.surplus_priority === 'combinado') scores.P3 += 1;
        if (!governanceData.incentive.includes('ninguno') && governanceData.incentive.length > 0) scores.P3 += 1;
        // P4
        if (governanceData.decision_control === 'miembros_exclusivo') scores.P4 += 2;
        else if (governanceData.decision_control === 'miembros_mayoritario') scores.P4 += 1;
        if (governanceData.external_funding_limit <= 25) scores.P4 += 2;
        if (governanceData.autonomy_clause) scores.P4 += 1;
        // P5
        scores.P5 += governanceData.education.length; // Simple count
        // P6
        if (governanceData.cooperation_level_radio === 'alta') scores.P6 += 2;
        else if (governanceData.cooperation_level_radio === 'media') scores.P6 += 1;
        scores.P6 += Math.min(2, governanceData.cooperation_area.length);
        // P7
        if (governanceData.community_focus_radio === 'primario') scores.P7 += 2;
        else if (governanceData.community_focus_radio === 'importante') scores.P7 += 1;
        scores.P7 += Math.min(2, governanceData.reinvestment.length);

        // Asegurar que las puntuaciones estén entre 1 y 5
        for (const key in scores) {
            scores[key] = Math.max(1, Math.min(5, Math.round(scores[key])));
        }
        return scores;
    }

    /** Actualiza o crea el gráfico radar */
    function updateRadarChart() {
         if (!radarChartCanvas) return; // Salir si el canvas no existe
         // Asegurarse que Chart está cargado
         if (typeof Chart === 'undefined') {
             console.error("Chart.js no está cargado.");
             return;
         }

        const scores = calculateAciScores();
        const chartData = {
            labels: ['P1: Adhesión', 'P2: Democracia', 'P3: Part. Económ.', 'P4: Autonomía', 'P5: Educación', 'P6: Cooperación', 'P7: Comunidad'],
            datasets: [{
                label: 'Alineación principios ACI (1-5)',
                data: [scores.P1, scores.P2, scores.P3, scores.P4, scores.P5, scores.P6, scores.P7],
                fill: true,
                backgroundColor: 'rgba(0, 187, 169, 0.2)',
                borderColor: 'rgb(0, 187, 169)',
                pointBackgroundColor: 'rgb(0, 187, 169)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(0, 187, 169)'
            }]
        };
        const chartConfig = {
            type: 'radar', data: chartData,
            options: {
                elements: { line: { borderWidth: 3 } },
                scales: { r: { angleLines: { display: true }, suggestedMin: 0, suggestedMax: 5, pointLabels: { font: { size: 11 } }, ticks: { display: true, stepSize: 1 } } },
                plugins: { legend: { position: 'top', } },
                maintainAspectRatio: true, responsive: true
            }
        };

        if (aciRadarChartInstance) aciRadarChartInstance.destroy(); // Destruir instancia anterior
        aciRadarChartInstance = new Chart(radarChartCanvas, chartConfig); // Crear nueva
    }

    /** Resetea el formulario y el estado a los valores iniciales */
    function resetForm() {
        if (confirm('¿Estás seguro de que quieres reiniciar todo el diseño? Se perderán todos los cambios.')) {
            // 1. Resetear Estado
            governanceData = JSON.parse(JSON.stringify(initialGovernanceData));

            // 2. Resetear Formulario Visualmente
            if (mainForm) mainForm.reset(); // Usa el reset nativo del formulario

            // 3. Resetear manualmente elementos no cubiertos o con estado visual propio
            if(otherVotingInput) otherVotingInput.value = '';
            toggleOtherVotingInput(false); // Ocultar campo "Otro"

            // 4. Actualizar todas las visualizaciones al estado inicial
            updateAllVisualizations();

            // 5. Ir al primer paso
            showStep(0);
             // Scroll to top of page after reset
             window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

     /** Llama a todas las funciones de actualización de visualización */
     function updateAllVisualizations() {
        updateMemberListViz();
        updatePurposeBalanceViz();
        updateOpennessViz();
        updateVotingViz();
        updateTransparencyViz();
        updateAutonomyViz();
        checkDependencyAlert();
        updateKnowledgeTreeViz();
        updateCooperationViz();
        updateImpactViz();
        // Limpiar salidas del paso final si es necesario (opcional)
        // if(dashboardOutput) dashboardOutput.innerHTML = '<p><em>...</em></p>';
        // if(draftOutput) draftOutput.innerHTML = '<p><em>...</em></p>';
        // if (aciRadarChartInstance) aciRadarChartInstance.destroy();
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

    // Listeners para todos los elementos del formulario
    formElements.forEach(element => {
        const eventType = (element.type === 'range' || element.type === 'number' || element.type === 'textarea') ? 'input' : 'change';
        element.addEventListener(eventType, updateGovernanceData);
    });

    // Listener para descarga PDF
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            try {
                if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
                    alert('Error: La librería jsPDF no se ha cargado correctamente. Asegúrate de tener conexión a internet.');
                    console.error("jsPDF no está definido.");
                    return;
                }
                const { jsPDF } = jspdf;
                const doc = new jsPDF();
                const outputElement = draftOutput; // El div que contiene el HTML renderizado

                if (!outputElement) {
                     alert("Error: No se encontró el contenido del borrador.");
                     return;
                }

                // Extraer texto, convertir <br> y <li> a saltos de línea, quitar otras etiquetas
                const textContent = outputElement.innerHTML
                    .replace(/<h4>(.*?)<\/h4>/gi, "\n*** $1 ***\n\n") // Formatear títulos
                    .replace(/<strong>(.*?)<\/strong>/gi, "\n$1\n" + '-'.repeat(String($1).length) + "\n") // Formatear subtítulos
                    .replace(/<br\s*[\/]?>/gi, "\n")    // Convertir <br> a newline
                    .replace(/<li>/gi, "- ")            // Convertir <li> a guión
                    .replace(/<\/(ul|li|p)>/gi, "\n") // Añadir newline al final de listas/párrafos
                    .replace(/<[^>]*>/g, "")          // Quitar todas las etiquetas HTML restantes
                    .replace(/&nbsp;/g, " ")          // Reemplazar &nbsp;
                    .replace(/&amp;/g, "&")           // Reemplazar &amp;
                    .replace(/&lt;/g, "<")            // Reemplazar &lt;
                    .replace(/&gt;/g, ">")            // Reemplazar &gt;
                    .trim();                          // Quitar espacios al inicio/final

                doc.setFontSize(11);
                const splitText = doc.splitTextToSize(textContent, 180); // Ancho aprox A4 con márgenes
                doc.text(splitText, 15, 15); // Añadir texto con margen

                doc.save('borrador_gobernanza_energetica.pdf');

            } catch (error) {
                console.error("Error al generar el PDF:", error);
                alert("Hubo un error al intentar generar el PDF. Revisa la consola del navegador.");
            }
        });
    }

    // --- Inicialización ---
    updateAllVisualizations(); // Asegurar que las visualizaciones coincidan con el estado inicial
    showStep(0); // Mostrar el primer paso

}); // Fin del DOMContentLoaded
