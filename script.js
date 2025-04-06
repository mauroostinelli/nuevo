/* INICIO: Código JavaScript Completo (script.js) */

// CDNs requeridas en HTML: Chart.js, jsPDF
// <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de Elementos DOM ---
    // Se usan constantes ya que estos elementos no deberían cambiar dinámicamente
    const steps = document.querySelectorAll('.step');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const resetBtn = document.getElementById('reset-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressStepText = document.getElementById('progress-step-text');
    const stepsContainer = document.getElementById('steps-container');
    const downloadBtn = document.getElementById('download-draft-btn');
    const mainForm = document.getElementById('governance-constructor'); // Contenedor principal

    // Elementos interactivos específicos (NodeList es live, se mantiene actualizado)
    const formElements = document.querySelectorAll('#governance-constructor input, #governance-constructor select, #governance-constructor textarea');
    const otherVotingContainer = document.getElementById('other-voting-description-container');
    const otherVotingInput = document.getElementById('other_voting_description');

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
    const coopNodes = cooperationMapViz?.querySelectorAll('.map-node.other'); // '?' por si no existe
    const coopLinks = cooperationMapViz?.querySelectorAll('.map-link'); // '?' por si no existe
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
    let aciRadarChartInstance = null; // Instancia del gráfico Radar

    // Estado Inicial Inmutable (definido como referencia para resetear)
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

    // Estado de ejecución (copia profunda para poder modificarlo)
    let governanceData = JSON.parse(JSON.stringify(initialGovernanceData));

    // --- Funciones Auxiliares ---

    /** Convierte valor interno a texto legible en español. */
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

        // Asegurarse que el nombre existe y es una propiedad del estado inicial (evita procesar elementos no deseados)
        if (!name || !initialGovernanceData.hasOwnProperty(name)) return;

        try {
            // Manejo específico para checkboxes que representan booleanos
            if (type === 'checkbox' && typeof initialGovernanceData[name] === 'boolean') {
                 governanceData[name] = element.checked;
            }
            // Manejo para checkboxes que representan arrays
            else if (type === 'checkbox') {
                if (!Array.isArray(governanceData[name])) governanceData[name] = [];
                const valueExists = governanceData[name].includes(value);

                // Lógica 'ninguno' para incentivos
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
                            if (ningunoCb) { ningunoCb.checked = true; governanceData[name].push('ninguno'); }
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
                    // Mostrar/ocultar campo "Otro" para estructura de voto
                    if (name === 'voting_structure') {
                        toggleOtherVotingInput(value === 'otro');
                        if (value !== 'otro' && otherVotingInput) { // Limpiar si no es "otro"
                            governanceData.other_voting_description = '';
                            otherVotingInput.value = '';
                        }
                    }
                }
            } else if (type === 'textarea') {
                governanceData[name] = value;
            } else if (type === 'range' || type === 'number') {
                governanceData[name] = parseFloat(value); // Usar parseFloat para números
            } else { // select-one, text, etc.
                governanceData[name] = value;
            }

            // Actualizar visualizaciones relevantes de forma eficiente
            requestAnimationFrame(updateRelevantVisualizations);

        } catch (error) {
             console.error("Error al actualizar governanceData para el elemento:", element, error);
             // Considerar mostrar un mensaje al usuario si es un error crítico
        }
        // console.log('Governance Data Updated:', governanceData); // Para depuración
    }

    /** Muestra/oculta el campo de texto para "Otro" sistema de voto. */
    function toggleOtherVotingInput(show) {
        if (otherVotingContainer) {
            otherVotingContainer.classList.toggle('hidden', !show);
        }
    }

    /** Muestra el paso especificado y actualiza UI. */
    function showStep(stepIndex) {
         if (stepIndex < 0 || stepIndex >= totalSteps) {
             console.warn("Intento de mostrar paso inválido:", stepIndex);
             return;
         }

        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });

        currentStep = stepIndex; // Actualizar paso actual
        updateProgressBar();
        updateStepText();
        updateButtons(); // Actualizar estado de botones

        // Scroll suave al inicio del paso
        if (steps[currentStep]) {
            steps[currentStep].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Generar resultados si es el último paso
        if (currentStep === totalSteps - 1) {
             // Usar un pequeño delay para asegurar que el DOM está listo y la animación de paso ha ocurrido
             setTimeout(() => {
                 try { // Envolver en try-catch por si fallan las generaciones
                     generateDashboard();
                     generateDraftOutput();
                     updateRadarChart();
                 } catch (error) {
                     console.error("Error al generar contenido del paso final:", error);
                 }
             }, 150); // Ajustar delay si es necesario
        }
    }

    /** Actualiza la barra de progreso. */
    function updateProgressBar() {
        if (!progressBar) return;
        const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    /** Actualiza el texto del indicador de paso. */
    function updateStepText() {
        if (!progressStepText) return;
        progressStepText.textContent = `Paso ${currentStep + 1} de ${totalSteps}`;
    }

    /** Configura el estado de los botones de navegación. */
    function updateButtons() {
        if(prevBtn) prevBtn.disabled = currentStep === 0;
        if(resetBtn) resetBtn.disabled = false; // Habilitar siempre (o deshabilitar en paso 0 si se prefiere)

        if (nextBtn) {
             if (currentStep === totalSteps - 1) {
                nextBtn.textContent = 'Finalizar diseño';
                nextBtn.disabled = false; // Mantener activo en el último paso
            } else {
                nextBtn.textContent = 'Siguiente';
                nextBtn.disabled = false;
            }
        }
        // Habilitar descarga sólo en el último paso
        if(downloadBtn) downloadBtn.disabled = currentStep !== totalSteps - 1;
    }

    // --- Funciones de Actualización de Visualizaciones ---

    /** Llama a todas las funciones de actualización visual. */
    function updateAllVisualizations() {
        // Llamar a cada función individualmente para actualizar su parte
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

    /** Llama a funciones de actualización relevantes (aquí simplificado a todas). */
    function updateRelevantVisualizations() {
         // En una app más compleja, se podría optimizar para llamar solo a las necesarias
         updateAllVisualizations();
    }

    /** Actualiza la lista visual de tipos de miembro. */
    function updateMemberListViz() {
        if (!memberListViz) return;
        memberListViz.innerHTML = ''; // Limpiar
        const types = governanceData.member_type;
        if (!types || types.length === 0) {
            memberListViz.innerHTML = '<li>(Selecciona tipos de miembros)</li>';
            return;
        }
        types.forEach(type => {
            const li = document.createElement('li');
            li.textContent = getFriendlyName(type);
            memberListViz.appendChild(li);
        });
    }

    /** Actualiza el texto y estilo del slider de balance de propósito. */
    function updatePurposeBalanceViz() {
        if (!purposeBalanceSlider || !purposeBalanceValue) return;
        const balance = governanceData.purpose_balance;
        purposeBalanceValue.textContent = `${balance}% Comunitario / ${100 - balance}% Financiero`;
        // Actualizar variable CSS para el fondo del track del slider
        purposeBalanceSlider.style.setProperty('--value', `${balance}%`);
    }

    /** Actualiza el texto descriptivo del slider de apertura. */
    function updateOpennessViz() {
        if (!opennessSlider || !opennessLevelText) return;
        const level = governanceData.openness_level;
        let text = "Nivel intermedio de requisitos.";
        if (level > 75) text = "Alta facilidad de entrada, pocos requisitos.";
        else if (level < 25) text = "Alto compromiso requerido para entrar.";
        opennessLevelText.textContent = text;
        // Actualizar variable CSS para el fondo del track del slider
        opennessSlider.style.setProperty('--value', `${level}%`);
    }

     /** Actualiza la visualización de la balanza de voto. */
    function updateVotingViz() {
         if (!voteBeam || !votingVizText) return;
        const structure = governanceData.voting_structure;
        let angle = 0; // 1m1v o 'otro'
        let text = `Seleccionado: ${getFriendlyName(structure)}`;
        if (structure === 'ponderado_tipo') angle = 15;
        else if (structure === 'ponderado_aportacion') angle = -15;

        voteBeam.style.transform = `rotate(${angle}deg)`;
        votingVizText.textContent = text;
    }

    /** Actualiza el termómetro de transparencia. */
    function updateTransparencyViz() {
        if (!transparencyMercury || !transparencyLevelText) return;
        let score = 0;
        const freqMap = { 'semestral': 1, 'trimestral': 2, 'continua': 3 };
        score += freqMap[governanceData.reporting_frequency] || 0;
        // Acceder a los booleanos directamente
        if (governanceData.public_access === true) score += 2;
        if (governanceData.external_audit === true) score += 2;

        const maxScore = 7; // Máxima puntuación posible
        // Calcular porcentaje y asegurar mínimo/máximo visual
        const percentage = Math.max(10, Math.min(100, (score / maxScore) * 100));
        transparencyMercury.style.height = `${percentage}%`; // Actualizar altura del mercurio

        // Actualizar texto descriptivo
        let levelText = "Bajo";
        if (percentage > 66) levelText = "Alto";
        else if (percentage > 33) levelText = "Medio";
        transparencyLevelText.textContent = `Nivel de transparencia: ${levelText}`;
    }

    /** Actualiza el escudo de autonomía. */
    function updateAutonomyViz() {
        if (!autonomyShieldViz || !autonomyLevelText) return;
        let score = 0;
        const controlMap = { 'miembros_exclusivo': 3, 'miembros_mayoritario': 2 };
        score += controlMap[governanceData.decision_control] || 0;
        if (governanceData.external_funding_limit <= 25) score += 2;
        else if (governanceData.external_funding_limit <= 50) score += 1;
        if (governanceData.veto_rights_members === true) score += 1;
        if (governanceData.autonomy_clause === true) score += 1;

        const maxScore = 7;
        const percentage = (score / maxScore) * 100;

        // Actualizar capas del escudo (usando visibilidad o color)
        const layer1 = autonomyShieldViz.querySelector('#shield-layer-1');
        const layer2 = autonomyShieldViz.querySelector('#shield-layer-2');
        const layer3 = autonomyShieldViz.querySelector('#shield-layer-3');
        if(layer1) layer1.style.backgroundColor = percentage > 33 ? 'var(--success-color)' : 'transparent';
        if(layer2) layer2.style.backgroundColor = percentage > 66 ? 'var(--accent-color)' : 'transparent';
        if(layer3) layer3.style.backgroundColor = percentage > 85 ? 'var(--primary-color)' : 'transparent';

        // Actualizar texto descriptivo
        let levelText = "Bajo";
        if (percentage > 66) levelText = "Alto";
        else if (percentage > 33) levelText = "Medio";
        autonomyLevelText.textContent = `Nivel de autonomía: ${levelText}`;
    }

     /** Muestra/oculta la alerta de dependencia. */
    function checkDependencyAlert() {
         if (!dependencyAlert) return;
        const limit = governanceData.external_funding_limit;
        // Mostrar alerta si el límite de financiación externa es mayor al 50%
        dependencyAlert.classList.toggle('hidden', limit <= 50);
    }

    /** Actualiza la visualización del árbol de conocimiento (Determinista). */
    function updateKnowledgeTreeViz() {
        if (!treeBranchesViz || !knowledgeImpactText || !knowledgeTreeViz) return;
        const activitiesCount = governanceData.education.length;
        treeBranchesViz.innerHTML = ''; // Limpiar ramas existentes

        // Posiciones predefinidas relativas al centro-superior del área de ramas
        // Formato: [desplazamiento X desde centro, desplazamiento Y desde arriba] en px
        const positions = [
            [0, 15], [-25, 35], [25, 35], [-15, 60], [15, 60], [-40, 80], [40, 80]
        ];

        const branchCount = Math.min(activitiesCount, positions.length); // Limitar visualmente
        const baseLeft = treeBranchesViz.offsetWidth / 2; // Centro X del contenedor
        const branchSize = 50; // Tamaño aprox. de la bola

        for (let i = 0; i < branchCount; i++) {
            const branch = document.createElement('div');
            branch.className = 'branch';
            const [offsetX, offsetY] = positions[i];

            // Calcular posición final centrando la bola
            branch.style.left = `${baseLeft + offsetX - branchSize / 2}px`;
            branch.style.top = `${offsetY}px`;
            // Aplicar estilos visuales (pueden variar ligeramente)
            branch.style.opacity = `${0.6 + i * 0.05}`;
            branch.style.transform = `scale(${0.8 + i * 0.05})`;
            branch.style.zIndex = i;
            branch.style.backgroundColor = `hsl(${100 + i*5}, 60%, ${45 + i*2}%)`; // Tono de verde varía

            treeBranchesViz.appendChild(branch);
        }

        // Actualizar texto descriptivo
        let impactText = "Bajo";
        if (activitiesCount >= 4) impactText = "Alto";
        else if (activitiesCount >= 2) impactText = "Moderado";
        knowledgeImpactText.textContent = `Nivel de compromiso educativo: ${impactText}`;
    }

    /** Actualiza el mapa conceptual de cooperación. */
    function updateCooperationViz() {
        if (!cooperationMapViz || !cooperationVizText) return;
        const level = governanceData.cooperation_level_radio;
        const areasCount = governanceData.cooperation_area.length;
        let linkStrength = 0; // 0=baja, 1=media, 2=alta
        if (level === 'media') linkStrength = 1;
        else if (level === 'alta') linkStrength = 2;

        // Actualizar estilos de enlaces y nodos (asegurarse que existen)
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

        // Actualizar texto descriptivo
        let vizText = "Bajo";
        if (linkStrength === 2 || (linkStrength === 1 && areasCount >= 2)) vizText = "Alto";
        else if (linkStrength === 1 || areasCount >= 1) vizText = "Moderado";
        cooperationVizText.textContent = `Nivel de interconexión: ${vizText}`;
    }

    /** Actualiza el medidor de impacto comunitario. */
    function updateImpactViz() {
         if (!impactNeedle || !impactLevelText) return;
        let score = 0;
        const focusMap = { 'primario': 3, 'importante': 2 };
        score += focusMap[governanceData.community_focus_radio] || 0;
        score += governanceData.reinvestment.length; // Sumar puntos por cada mecanismo

        const maxScore = 8; // Puntuación máxima posible (3 + 5)
        const percentage = (score / maxScore) * 100;
        // Calcular rotación entre -60 (min) y +60 (max) grados
        const rotation = Math.max(-60, Math.min(60, -60 + (percentage / 100) * 120));
        impactNeedle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

        // Actualizar texto descriptivo
        let levelText = "Bajo";
        if (percentage > 66) levelText = "Alto";
        else if (percentage > 33) levelText = "Medio";
        impactLevelText.textContent = `Impacto comunitario potencial: ${levelText}`;
    }

    // --- Funciones de Generación del Paso Final ---

    /** Genera el resumen del dashboard con nombres legibles. */
    function generateDashboard() {
        if (!dashboardOutput) return;
        let html = '<ul>';
        // Usar getFriendlyName para mostrar nombres legibles
        html += `<li><strong>Propósito principal:</strong> <span>${governanceData.purpose.map(getFriendlyName).join(', ') || 'No definido'} (Balance: ${governanceData.purpose_balance}% comunitario)</span></li>`;
        html += `<li><strong>Tipos miembros:</strong> <span>${governanceData.member_type.map(getFriendlyName).join(', ') || 'No definidos'}</span></li>`;
        html += `<li><strong>Apertura (P1):</strong> <span>Nivel ${governanceData.openness_level}/100. Inclusión: ${getFriendlyName(governanceData.inclusion_strategy)}</span></li>`;
        let votingText = getFriendlyName(governanceData.voting_structure);
        if (governanceData.voting_structure === 'otro' && governanceData.other_voting_description) {
            votingText += `: "${governanceData.other_voting_description}"`; // Añadir descripción "Otro"
        }
        html += `<li><strong>Voto (P2):</strong> <span>${votingText}. Transparencia: ${transparencyLevelText?.textContent.split(': ')[1] || 'N/A'}</span></li>`;
        html += `<li><strong>Participación econ. (P3):</strong> <span>Contrib.: ${governanceData.contribution.map(getFriendlyName).join(', ')}. Excedentes: ${getFriendlyName(governanceData.surplus_priority)}</span></li>`;
        html += `<li><strong>Autonomía (P4):</strong> <span>Nivel ${autonomyLevelText?.textContent.split(': ')[1] || 'N/A'}. Límite externo: ${governanceData.external_funding_limit}%</span></li>`;
        html += `<li><strong>Educación (P5):</strong> <span>${governanceData.education.length} ${governanceData.education.length === 1 ? 'actividad' : 'actividades'} seleccionada(s).</span></li>`;
        html += `<li><strong>Cooperación (P6):</strong> <span>Nivel ${getFriendlyName(governanceData.cooperation_level_radio)}. Áreas: ${governanceData.cooperation_area.length}</span></li>`;
        html += `<li><strong>Interés comunidad (P7):</strong> <span>Foco: ${getFriendlyName(governanceData.community_focus_radio)}. Reinversión: ${governanceData.reinvestment.length} ${governanceData.reinvestment.length === 1 ? 'mecanismo' : 'mecanismos'}</span></li>`;
        html += '</ul>';
        dashboardOutput.innerHTML = html; // Usar innerHTML para renderizar
    }

    /** Genera el texto del borrador preliminar como HTML. */
    function generateDraftOutput() {
        if (!draftOutput) return;
        // Usar `getFriendlyName` y formatear como HTML
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
            votingText += `: "${governanceData.other_voting_description}"`; // Añadir descripción si existe
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

        draftOutput.innerHTML = htmlContent; // Usar innerHTML para renderizar el formato
    }

    /** Calcula puntuaciones ACI ilustrativas (sin cambios en la lógica). */
    function calculateAciScores() {
        const scores = { P1: 1, P2: 1, P3: 1, P4: 1, P5: 1, P6: 1, P7: 1 };
        // P1
        if (governanceData.openness_level > 50) scores.P1 += 1;
        if (!governanceData.criteria.includes('inversion') || governanceData.criteria.length <= 2) scores.P1 +=1;
        if (governanceData.inclusion_strategy === 'activa') scores.P1 += 2; else if (governanceData.inclusion_strategy === 'basica') scores.P1 += 1;
        // P2
        if (governanceData.voting_structure === '1m1v') scores.P2 += 2;
        if (governanceData.governing_body === 'asamblea_general') scores.P2 += 1;
        if (governanceData.public_access === true) scores.P2 += 1; // Booleano
        if (['trimestral', 'continua'].includes(governanceData.reporting_frequency)) scores.P2 += 1;
        // P3
        if (governanceData.contribution.length >= 2) scores.P3 += 1;
        if (governanceData.surplus_priority === 'reinversion_comunidad') scores.P3 += 2; else if (governanceData.surplus_priority === 'combinado') scores.P3 += 1;
        if (!governanceData.incentive.includes('ninguno') && governanceData.incentive.length > 0) scores.P3 += 1;
        // P4
        if (governanceData.decision_control === 'miembros_exclusivo') scores.P4 += 2; else if (governanceData.decision_control === 'miembros_mayoritario') scores.P4 += 1;
        if (governanceData.external_funding_limit <= 25) scores.P4 += 2;
        if (governanceData.autonomy_clause === true) scores.P4 += 1; // Booleano
        // P5
        scores.P5 += governanceData.education.length;
        // P6
        if (governanceData.cooperation_level_radio === 'alta') scores.P6 += 2; else if (governanceData.cooperation_level_radio === 'media') scores.P6 += 1;
        scores.P6 += Math.min(2, governanceData.cooperation_area.length);
        // P7
        if (governanceData.community_focus_radio === 'primario') scores.P7 += 2; else if (governanceData.community_focus_radio === 'importante') scores.P7 += 1;
        scores.P7 += Math.min(2, governanceData.reinvestment.length);

        // Limitar puntuaciones entre 1 y 5
        for (const key in scores) { scores[key] = Math.max(1, Math.min(5, Math.round(scores[key]))); }
        return scores;
    }

    /** Actualiza o crea el gráfico radar. */
    function updateRadarChart() {
        if (!radarChartCanvas) return;
        if (typeof Chart === 'undefined') { console.error("Chart.js no está cargado."); return; }

        const scores = calculateAciScores();
        const chartData = { /* ... (sin cambios en datos y config) ... */ };
         const chartConfig = {
            type: 'radar', data: chartData,
            options: { /* ... (sin cambios en opciones) ... */ }
        };
        // Código para destruir y crear instancia (sin cambios)
        if (aciRadarChartInstance) aciRadarChartInstance.destroy();
        try {
            aciRadarChartInstance = new Chart(radarChartCanvas, chartConfig);
        } catch (error) {
            console.error("Error al crear el gráfico Chart.js:", error);
        }
    }

    // --- Funciones de Control ---

    /** Resetea el formulario y el estado (Revisado y Corregido). */
    function resetForm() {
        if (confirm('¿Estás seguro de que quieres reiniciar todo el diseño? Se perderán todos los cambios.')) {
            console.log("Reseteando formulario..."); // Log para depuración
            // 1. Resetear Estado Interno a los valores iniciales
            governanceData = JSON.parse(JSON.stringify(initialGovernanceData));
            console.log("Estado interno reseteado:", governanceData);

            // 2. Resetear Formulario HTML Nativamente (puede no resetear todo visualmente)
            if (mainForm) mainForm.reset();
            console.log("Formulario reseteado nativamente.");

            // 3. Iterar y establecer explícitamente valores iniciales VISUALES
            // Esto es crucial porque mainForm.reset() puede no ser suficiente
            formElements.forEach(element => {
                const name = element.name;
                if (!name || !initialGovernanceData.hasOwnProperty(name)) return;

                const initialValue = initialGovernanceData[name];
                const type = element.type;

                try {
                    if (type === 'checkbox') {
                        // Necesitamos comparar el 'value' del elemento con el array inicial, o usar el booleano inicial
                        if (typeof initialValue === 'boolean') {
                            element.checked = initialValue;
                        } else if (Array.isArray(initialValue)) {
                            element.checked = initialValue.includes(element.value);
                        } else { // Default si no es booleano ni array en estado inicial
                            element.checked = false;
                        }
                         // Caso especial 'ninguno' incentivo
                         if (name === 'incentive') {
                             element.checked = initialValue.includes(element.value);
                         }

                    } else if (type === 'radio') {
                        // Marcar el radio cuyo valor coincide con el inicial
                        element.checked = (element.value === initialValue);
                    } else { // text, number, range, select-one, textarea
                        element.value = initialValue;
                         // Disparar evento 'input' para sliders para actualizar su track visual
                        if (type === 'range') {
                             element.dispatchEvent(new Event('input', { bubbles: true }));
                         }
                    }
                 } catch(e) {
                     console.warn(`Error reseteando visualmente el elemento ${name}: ${e}`);
                 }
            });
             console.log("Elementos del formulario reseteados visualmente.");

            // 4. Resetear elementos específicos adicionales
            toggleOtherVotingInput(false); // Ocultar campo "Otro"
            if(otherVotingInput) otherVotingInput.value = ''; // Limpiar textarea explícitamente

            // 5. Actualizar todas las visualizaciones al estado reseteado
            // Usar requestAnimationFrame para dar tiempo al navegador a procesar resets visuales
             requestAnimationFrame(() => {
                 console.log("Actualizando visualizaciones tras reset...");
                 updateAllVisualizations();
                 console.log("Visualizaciones actualizadas.");
                 // 6. Ir al Primer Paso (después de actualizar visuales)
                 showStep(0);
                 // 7. Scroll al inicio de la página
                 window.scrollTo({ top: 0, behavior: 'smooth' });
                 console.log("Navegado al primer paso.");
             });
        }
    }


    // --- Event Listeners ---

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentStep < totalSteps - 1) {
                showStep(currentStep + 1);
            } else {
                // Mensaje final o acción al completar el último paso
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
         resetBtn.addEventListener('click', resetForm); // Asignar función de reseteo
     }

    // Listeners para todos los elementos del formulario
    formElements.forEach(element => {
        const eventType = (element.type === 'range' || element.type === 'number' || element.tagName === 'TEXTAREA') ? 'input' : 'change';
        element.addEventListener(eventType, updateGovernanceData);
    });

    // Listener Descarga PDF (Corregido)
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            try {
                // Verificar que jsPDF está cargado
                if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
                    alert('Error: La librería jsPDF no se ha cargado. Comprueba la conexión a internet o la consola.');
                    console.error("jsPDF is not defined."); return;
                }
                const { jsPDF } = jspdf; // Destructuring para acceso más fácil
                const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                const outputElement = draftOutput;

                if (!outputElement) { alert("Error: No se encontró el contenido del borrador."); return; }

                // Convertir HTML a texto plano para PDF, preservando formato básico
                let textContent = outputElement.innerHTML;

                // 1. Reemplazar etiquetas HTML clave con formato de texto plano y saltos de línea
                textContent = textContent
                    // Títulos H4 -> *** TÍTULO *** con saltos
                    .replace(/<h4>(.*?)<\/h4>/gi, (match, p1) => `\n\n*** ${p1.toUpperCase().trim()} ***\n\n`)
                    // Strong -> TÍTULO\n-------\n
                    .replace(/<strong>(.*?)<\/strong>/gi, (match, p1) => `\n${p1.trim()}\n${'-'.repeat(p1.trim().length)}\n`)
                    // BR, fin P, fin UL -> Salto de línea
                    .replace(/<br\s*\/?>|<\/p>|<\/ul>/gi, "\n")
                    // Fin LI -> Salto de línea
                    .replace(/<\/li>/gi, "\n")
                    // LI -> Guión al inicio
                    .replace(/<li>/gi, "- ")
                    // Quitar todas las etiquetas HTML restantes
                    .replace(/<[^>]*>/g, "")
                    // Decodificar entidades HTML comunes
                    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                    // Normalizar múltiples saltos de línea
                    .replace(/\n{3,}/g, "\n\n")
                    .trim(); // Limpiar espacios al inicio/final

                doc.setFontSize(11); // Tamaño de fuente base
                const margin = 15; // Margen en mm
                const textWidth = doc.internal.pageSize.getWidth() - (margin * 2); // Ancho útil

                // Generar texto con auto-wrap usando la función de jsPDF
                const splitText = doc.splitTextToSize(textContent, textWidth);
                doc.text(splitText, margin, margin); // Añadir texto con márgenes

                // Guardar el PDF
                doc.save('borrador_gobernanza_energetica.pdf');

            } catch (error) {
                console.error("Error al generar el PDF:", error);
                alert(`Hubo un error al intentar generar el PDF: ${error.message || error}.\nRevisa la consola del navegador para más detalles.`);
            }
        });
    }

    // --- Inicialización ---
    try { // Envolver inicialización en try-catch
        updateAllVisualizations(); // Actualizar visuales al cargar
        showStep(0); // Mostrar el primer paso
    } catch(initError) {
        console.error("Error durante la inicialización:", initError);
        // Podría mostrar un mensaje de error al usuario aquí
    }

}); // Fin del DOMContentLoaded

/* FIN: Código JavaScript Completo (script.js) */
