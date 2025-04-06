/* INICIO: Código JavaScript Completo Final Revisado (script.js) */

// CDNs requeridas en HTML: Chart.js, jsPDF
// <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de Elementos DOM ---
    // Guardar referencias a elementos clave para evitar búsquedas repetidas
    const steps = document.querySelectorAll('.step');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const resetBtn = document.getElementById('reset-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressStepText = document.getElementById('progress-step-text');
    const stepsContainer = document.getElementById('steps-container');
    const downloadBtn = document.getElementById('download-draft-btn');
    // Referencia al formulario para usar .reset()
    const mainForm = document.getElementById('governance-form');

    // Elementos interactivos específicos dentro del formulario
    const formElements = mainForm ? mainForm.querySelectorAll('input, select, textarea') : []; // Seleccionar dentro del form
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
    // const externalFundingLimitInput = document.getElementById('external_funding_limit'); // No se usa directamente, se lee del estado
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
    let aciRadarChartInstance = null; // Instancia del gráfico Radar

    // Estado Inicial Inmutable (referencia para resetear)
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

    // Estado de ejecución (copia profunda modificable)
    let governanceData = JSON.parse(JSON.stringify(initialGovernanceData));

    // --- Funciones Auxiliares ---

    /** Convierte valor interno a texto legible en español. */
    function getFriendlyName(value) {
        // (Sin cambios)
        const nameMap={reducir_facturas:"Reducir facturas",energia_limpia:"Energía limpia local",desarrollo_local:"Desarrollo local",lucha_pobreza:"Lucha pobreza energética",infraestructura:"Infraestructura pública",educacion:"Educación ambiental",flexibilidad:"Flexibilidad al sistema",hogares:"Hogares",hogares_vulnerables:"Hogares vulnerables",pymes:"PYMEs",municipio:"Ayuntamiento",otros:"Otros",generacion_fv:"Generación FV",autoconsumo:"Autoconsumo compartido",recarga_ve:"Recarga VE",red_calor:"Red calor/frío",eficiencia:"Asesoramiento eficiencia",almacenamiento:"Almacenamiento",geografico:"Geográfico",tecnico:"Técnico",inversion:"Inversión mínima",consumo:"Ser consumidor",participacion:"Participación activa",ninguna:"Ninguna específica",basica:"Básica",activa:"Activa","1m1v":"Un miembro, un voto",ponderado_tipo:"Ponderado por tipo",ponderado_aportacion:"Ponderado por aportación",otro:"Otro sistema",asamblea_general:"Asamblea general",representantes_bloque:"Bloques/tipos miembro",combinado:"Combinado",anual:"Anual",semestral:"Semestral",trimestral:"Trimestral",continua:"Continua",cuota_entrada:"Cuota entrada",aportacion_capital:"Aportación capital",cuota_periodica:"Cuota periódica",aportacion_especie:"Aportación especie",voluntariado:"Voluntariado",reparto_miembros:"Reparto a miembros",reserva_obligatoria:"Dotar reservas",reinversion_comunidad:"Reinversión comunidad",descuento_factura:"Descuento factura",prioridad_servicios:"Prioridad servicios",retorno_diferenciado:"Retorno diferenciado",reconocimiento:"Reconocimiento",ninguno:"Ninguno específico",miembros_exclusivo:"Exclusivo miembros",miembros_mayoritario:"Mayoritario miembros",externos_consultivo:"Externos consultivo",info_miembros:"Info a miembros",formacion_gobierno:"Formación gobierno",talleres_publico:"Talleres públicos",material_divulgativo:"Material divulgativo",colaboracion_escuelas:"Colab. escuelas",baja:"Baja",media:"Media",alta:"Alta",conocimiento:"Conocimiento",compras_conjuntas:"Compras conjuntas",proyectos_conjuntos:"Proyectos conjuntos",representacion:"Representación",servicios_compartidos:"Servicios compartidos",secundario:"Secundario",importante:"Importante",primario:"Primario",proyectos_locales:"Proyectos locales",tarifas_sociales:"Tarifas sociales",infraestructura_publica:"Infraestructura pública",fondo_social:"Fondo social",empleo_local:"Empleo local",default:value?String(value).replace(/_/g," "):""};
        return nameMap[value]||(typeof value==="string"?value.replace(/_/g," "):value)
    }

    // --- Funciones Principales ---

    /** Actualiza el objeto governanceData según cambios en el formulario. */
    function updateGovernanceData(event) {
        const element = event.target;
        const name = element.name;
        const type = element.type;
        let value = element.value;

        // Salir si el elemento no tiene nombre o no pertenece al estado rastreado
        if (!name || !initialGovernanceData.hasOwnProperty(name)) return;

        try {
            // Manejo checkboxes booleanos (ej: public_access, external_audit)
            if (type === 'checkbox' && typeof initialGovernanceData[name] === 'boolean') {
                 governanceData[name] = element.checked;
            }
            // Manejo checkboxes de array (ej: purpose, criteria)
            else if (type === 'checkbox') {
                if (!Array.isArray(governanceData[name])) governanceData[name] = [];
                const valueExists = governanceData[name].includes(value);

                // Lógica especial para 'incentive' con opción 'ninguno'
                if (name === 'incentive') {
                    if (element.checked) {
                        if (value === 'ninguno') {
                            governanceData[name] = ['ninguno']; // Solo 'ninguno'
                            document.querySelectorAll('input[name="incentive"]').forEach(cb => { if (cb !== element) cb.checked = false; });
                        } else {
                            governanceData[name] = governanceData[name].filter(item => item !== 'ninguno'); // Quitar 'ninguno'
                            const ningunoCb = document.querySelector('input[name="incentive"][value="ninguno"]');
                            if (ningunoCb) ningunoCb.checked = false; // Desmarcar visualmente
                            if (!valueExists) governanceData[name].push(value); // Añadir el actual
                        }
                    } else { // Si se desmarca
                        governanceData[name] = governanceData[name].filter(item => item !== value); // Quitar el desmarcado
                        // Si queda vacío, marcar 'ninguno'
                        if (governanceData[name].length === 0) {
                            const ningunoCb = document.querySelector('input[name="incentive"][value="ninguno"]');
                            if (ningunoCb) { ningunoCb.checked = true; governanceData[name].push('ninguno'); }
                        }
                    }
                } else { // Checkboxes de array estándar
                    if (element.checked) { if (!valueExists) governanceData[name].push(value); }
                    else { governanceData[name] = governanceData[name].filter(item => item !== value); }
                }
            }
            // Manejo de Radio buttons
            else if (type === 'radio') {
                if (element.checked) {
                    governanceData[name] = value;
                    // Caso especial: mostrar/ocultar input "Otro" para estructura de voto
                    if (name === 'voting_structure') {
                        toggleOtherVotingInput(value === 'otro');
                        if (value !== 'otro' && otherVotingInput) { // Limpiar si no es "otro"
                            governanceData.other_voting_description = '';
                            otherVotingInput.value = '';
                        }
                    }
                }
            }
            // Manejo de Textarea
            else if (type === 'textarea') {
                governanceData[name] = value;
            }
            // Manejo de Range y Number
            else if (type === 'range' || type === 'number') {
                governanceData[name] = parseFloat(value); // Guardar como número
            }
            // Otros tipos (select-one, text, etc.)
            else {
                governanceData[name] = value;
            }

            // Actualizar visualizaciones después del cambio de estado
            requestAnimationFrame(updateRelevantVisualizations);

        } catch (error) {
             console.error(`Error al actualizar governanceData para '${name}':`, error);
        }
        // console.log('Governance Data Updated:', JSON.stringify(governanceData)); // Para depuración detallada
    }

    /** Muestra/oculta el campo de texto para "Otro" sistema de voto. */
    function toggleOtherVotingInput(show) {
        if (otherVotingContainer) {
            otherVotingContainer.classList.toggle('hidden', !show);
        }
    }

    /** Muestra el paso especificado y actualiza UI. */
    function showStep(stepIndex) {
         if (stepIndex < 0 || stepIndex >= totalSteps) return;

        steps.forEach((step, index) => step.classList.toggle('active', index === stepIndex));

        currentStep = stepIndex;
        updateProgressBar();
        updateStepText();
        updateButtons(); // Actualizar estado botones (importante después de setear currentStep)

        // Scroll suave al inicio del paso activo
        if (steps[currentStep]) {
            // Pequeño delay antes del scroll para dar tiempo a que 'active' aplique
            setTimeout(() => {
                 steps[currentStep].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        }

        // Generar/Actualizar contenido del último paso (dashboard, borrador, gráfico)
        if (currentStep === totalSteps - 1) {
             // Delay para asegurar que el canvas esté visible antes de dibujar
             setTimeout(() => {
                 try {
                     // Actualizar el gráfico PRIMERO, ya que se usará para el PDF
                     updateRadarChart();
                     generateDashboard();
                     generateDraftOutput();
                 } catch (error) { console.error("Error generando contenido final:", error); }
             }, 250); // Aumentar delay si el gráfico sigue sin aparecer a veces
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
        if(resetBtn) resetBtn.disabled = false; // Habilitar siempre reset

        if (nextBtn) {
             if (currentStep === totalSteps - 1) {
                nextBtn.textContent = 'Finalizar diseño';
                nextBtn.disabled = false; // Mantener activo
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
        // Llamar a cada función individualmente
        // Añadir checks por si algún elemento no existe
        if (memberListViz) updateMemberListViz();
        if (purposeBalanceSlider) updatePurposeBalanceViz();
        if (opennessSlider) updateOpennessViz();
        if (voteBeam) updateVotingViz();
        if (transparencyMercury) updateTransparencyViz(); // Importante
        if (autonomyShieldViz) updateAutonomyViz();
        if (dependencyAlert) checkDependencyAlert();
        if (treeBranchesViz) updateKnowledgeTreeViz(); // Importante
        if (cooperationMapViz) updateCooperationViz();
        if (impactNeedle) updateImpactViz();
    }

    /** Llama a funciones de actualización relevantes (aquí simplificado a todas). */
    function updateRelevantVisualizations() { updateAllVisualizations(); }

    /** Actualiza la lista visual de tipos de miembro. */
    function updateMemberListViz() {
        if (!memberListViz) return;
        memberListViz.innerHTML = '';
        const types = governanceData.member_type;
        if (!types || types.length === 0) { memberListViz.innerHTML = '<li>(Selecciona tipos)</li>'; return; }
        types.forEach(type => { const li = document.createElement('li'); li.textContent = getFriendlyName(type); memberListViz.appendChild(li); });
    }

    /** Actualiza el texto y estilo del slider de balance de propósito. */
    function updatePurposeBalanceViz() {
        if (!purposeBalanceSlider || !purposeBalanceValue) return;
        const balance = governanceData.purpose_balance;
        purposeBalanceValue.textContent = `${balance}% Comunitario / ${100 - balance}% Financiero`;
        purposeBalanceSlider.style.setProperty('--value', `${balance}%`);
    }

    /** Actualiza el texto descriptivo del slider de apertura. */
    function updateOpennessViz() {
        if (!opennessSlider || !opennessLevelText) return;
        const level = governanceData.openness_level;
        let text = "Nivel intermedio."; if (level > 75) text = "Alta facilidad."; else if (level < 25) text = "Alto compromiso.";
        opennessLevelText.textContent = text;
        opennessSlider.style.setProperty('--value', `${level}%`);
    }

     /** Actualiza la visualización de la balanza de voto. */
    function updateVotingViz() {
         if (!voteBeam || !votingVizText) return;
        const structure = governanceData.voting_structure;
        let angle = 0; let text = `Seleccionado: ${getFriendlyName(structure)}`;
        if (structure === 'ponderado_tipo') angle = 15; else if (structure === 'ponderado_aportacion') angle = -15;
        voteBeam.style.transform = `rotate(${angle}deg)`;
        votingVizText.textContent = text;
    }

    /** Actualiza el termómetro de transparencia (Corregido). */
    function updateTransparencyViz() {
        if (!transparencyMercury || !transparencyLevelText) return;
        let score = 0;
        const freqMap = { 'semestral': 1, 'trimestral': 2, 'continua': 3 }; score += freqMap[governanceData.reporting_frequency] || 0;
        if (governanceData.public_access === true) score += 2; if (governanceData.external_audit === true) score += 2;
        const maxScore = 7; const percentage = Math.max(10, Math.min(100, (score / maxScore) * 100));
        transparencyMercury.style.height = `${percentage}%`;
        let levelText = "Bajo"; if (percentage > 66) levelText = "Alto"; else if (percentage > 33) levelText = "Medio";
        transparencyLevelText.textContent = `Nivel de transparencia: ${levelText}`;
    }

    /** Actualiza el escudo de autonomía. */
    function updateAutonomyViz() {
        if (!autonomyShieldViz || !autonomyLevelText) return;
        let score = 0; const controlMap = { 'miembros_exclusivo': 3, 'miembros_mayoritario': 2 }; score += controlMap[governanceData.decision_control] || 0;
        if (governanceData.external_funding_limit <= 25) score += 2; else if (governanceData.external_funding_limit <= 50) score += 1;
        if (governanceData.veto_rights_members === true) score += 1; if (governanceData.autonomy_clause === true) score += 1;
        const maxScore = 7; const percentage = (score / maxScore) * 100;
        const layer1 = autonomyShieldViz.querySelector('#shield-layer-1'); const layer2 = autonomyShieldViz.querySelector('#shield-layer-2'); const layer3 = autonomyShieldViz.querySelector('#shield-layer-3');
        if(layer1) layer1.style.backgroundColor = percentage > 33 ? 'var(--success-color)' : 'transparent';
        if(layer2) layer2.style.backgroundColor = percentage > 66 ? 'var(--accent-color)' : 'transparent';
        if(layer3) layer3.style.backgroundColor = percentage > 85 ? 'var(--primary-color)' : 'transparent';
        let levelText = "Bajo"; if (percentage > 66) levelText = "Alto"; else if (percentage > 33) levelText = "Medio";
        autonomyLevelText.textContent = `Nivel de autonomía: ${levelText}`;
    }

     /** Muestra/oculta la alerta de dependencia. */
    function checkDependencyAlert() {
         if (!dependencyAlert) return;
        dependencyAlert.classList.toggle('hidden', governanceData.external_funding_limit <= 50);
    }

    /** Actualiza la visualización del árbol de conocimiento (Determinista). */
    function updateKnowledgeTreeViz() {
        if (!treeBranchesViz || !knowledgeImpactText || !knowledgeTreeViz) return;
        const activitiesCount = governanceData.education.length;
        treeBranchesViz.innerHTML = ''; // Limpiar

        // Posiciones fijas cerca del tronco
        const positions = [ [0, 15], [-25, 35], [25, 35], [-15, 60], [15, 60], [-40, 80], [40, 80] ];
        const branchCount = Math.min(activitiesCount, positions.length);
        const baseLeft = treeBranchesViz.offsetWidth / 2; const branchSize = 50;

        for (let i = 0; i < branchCount; i++) {
            const branch = document.createElement('div'); branch.className = 'branch';
            const [offsetX, offsetY] = positions[i];
            branch.style.left = `${baseLeft + offsetX - branchSize / 2}px`;
            branch.style.top = `${offsetY}px`;
            branch.style.opacity = `${0.6 + i * 0.05}`; branch.style.transform = `scale(${0.8 + i * 0.05})`;
            branch.style.zIndex = i; branch.style.backgroundColor = `hsl(${100 + i*5}, 60%, ${45 + i*2}%)`;
            treeBranchesViz.appendChild(branch);
        }
        let impactText = "Bajo"; if (activitiesCount >= 4) impactText = "Alto"; else if (activitiesCount >= 2) impactText = "Moderado";
        knowledgeImpactText.textContent = `Nivel de compromiso educativo: ${impactText}`;
    }

    /** Actualiza el mapa conceptual de cooperación. */
    function updateCooperationViz() {
        if (!cooperationMapViz || !cooperationVizText) return;
        const level = governanceData.cooperation_level_radio; const areasCount = governanceData.cooperation_area.length;
        let linkStrength = 0; if (level === 'media') linkStrength = 1; else if (level === 'alta') linkStrength = 2;
        if(coopLinks) coopLinks.forEach((link, i) => { link.style.backgroundColor=linkStrength>i?'var(--accent-color)':'#ccc'; link.style.height=linkStrength>i?'4px':'3px'; });
        if(coopNodes) coopNodes.forEach((node, i) => { node.style.backgroundColor=linkStrength>i?'var(--primary-color)':'#aaa'; });
        let vizText = "Bajo"; if (linkStrength === 2 || (linkStrength === 1 && areasCount >= 2)) vizText = "Alto"; else if (linkStrength === 1 || areasCount >= 1) vizText = "Moderado";
        cooperationVizText.textContent = `Nivel de interconexión: ${vizText}`;
    }

    /** Actualiza el medidor de impacto comunitario. */
    function updateImpactViz() {
         if (!impactNeedle || !impactLevelText) return;
        let score = 0; const focusMap = { 'primario': 3, 'importante': 2 }; score += focusMap[governanceData.community_focus_radio] || 0; score += governanceData.reinvestment.length;
        const maxScore = 8; const percentage = (score / maxScore) * 100;
        const rotation = Math.max(-60, Math.min(60, -60 + (percentage / 100) * 120));
        impactNeedle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
        let levelText = "Bajo"; if (percentage > 66) levelText = "Alto"; else if (percentage > 33) levelText = "Medio";
        impactLevelText.textContent = `Impacto comunitario potencial: ${levelText}`;
    }

    // --- Funciones de Generación del Paso Final ---

    /** Genera el resumen del dashboard con nombres legibles. */
    function generateDashboard() {
        if (!dashboardOutput) return;
        // (Sin cambios en la lógica interna, sigue usando getFriendlyName)
        let html = '<ul>';
        html += `<li><strong>Propósito principal:</strong> <span>${governanceData.purpose.map(getFriendlyName).join(', ') || 'No definido'} (Balance: ${governanceData.purpose_balance}% comunitario)</span></li>`;
        html += `<li><strong>Tipos miembros:</strong> <span>${governanceData.member_type.map(getFriendlyName).join(', ') || 'No definidos'}</span></li>`;
        html += `<li><strong>Apertura (P1):</strong> <span>Nivel ${governanceData.openness_level}/100. Inclusión: ${getFriendlyName(governanceData.inclusion_strategy)}</span></li>`;
        let votingText = getFriendlyName(governanceData.voting_structure); if (governanceData.voting_structure === 'otro' && governanceData.other_voting_description) { votingText += `: "${governanceData.other_voting_description}"`; }
        html += `<li><strong>Voto (P2):</strong> <span>${votingText}. Transparencia: ${transparencyLevelText?.textContent.split(': ')[1] || 'N/A'}</span></li>`;
        html += `<li><strong>Participación econ. (P3):</strong> <span>Contrib.: ${governanceData.contribution.map(getFriendlyName).join(', ')}. Excedentes: ${getFriendlyName(governanceData.surplus_priority)}</span></li>`;
        html += `<li><strong>Autonomía (P4):</strong> <span>Nivel ${autonomyLevelText?.textContent.split(': ')[1] || 'N/A'}. Límite externo: ${governanceData.external_funding_limit}%</span></li>`;
        html += `<li><strong>Educación (P5):</strong> <span>${governanceData.education.length} ${governanceData.education.length === 1 ? 'actividad' : 'actividades'} seleccionada(s).</span></li>`;
        html += `<li><strong>Cooperación (P6):</strong> <span>Nivel ${getFriendlyName(governanceData.cooperation_level_radio)}. Áreas: ${governanceData.cooperation_area.length}</span></li>`;
        html += `<li><strong>Interés comunidad (P7):</strong> <span>Foco: ${getFriendlyName(governanceData.community_focus_radio)}. Reinversión: ${governanceData.reinvestment.length} ${governanceData.reinvestment.length === 1 ? 'mecanismo' : 'mecanismos'}</span></li>`;
        html += '</ul>';
        dashboardOutput.innerHTML = html;
    }

    /** Genera el texto del borrador como HTML (SIN línea "Fin"). */
    function generateDraftOutput() {
        if (!draftOutput) return;
        // Generar contenido HTML (sin la línea 'Fin del borrador')
        let htmlContent = `<h4>BORRADOR PRELIMINAR DE GOBERNANZA</h4>`;
        htmlContent += `<strong>OBJETO Y FINES (Ref. P7):</strong><ul><li>Fines principales: ${governanceData.purpose.map(getFriendlyName).join(', ')||"Definir"}.</li><li>Énfasis: ${governanceData.purpose_balance}% beneficio comunitario, ${100-governanceData.purpose_balance}% retorno financiero.</li><li>El interés por la comunidad local es ${getFriendlyName(governanceData.community_focus_radio)}.</li><li>Mecanismos de reinversión comunitaria: ${governanceData.reinvestment.map(getFriendlyName).join(', ')||"Ninguno definido"}.</li></ul>`;
        htmlContent += `<strong>MIEMBROS (Ref. P1):</strong><ul><li>Tipos de miembros admitidos: ${governanceData.member_type.map(getFriendlyName).join(', ')||"Definir"}.</li><li>Criterios elegibilidad: ${governanceData.criteria.map(getFriendlyName).join(', ')||"Abierto (revisar)"}.</li><li>Nivel de apertura/compromiso: ${governanceData.openness_level}/100.</li><li>Estrategia de inclusión: ${getFriendlyName(governanceData.inclusion_strategy)}.</li></ul>`;
        htmlContent += `<strong>CONTROL DEMOCRÁTICO (Ref. P2):</strong><ul>`; let votingText = getFriendlyName(governanceData.voting_structure); if (governanceData.voting_structure === 'otro' && governanceData.other_voting_description) { votingText += `: "${governanceData.other_voting_description}"`; } htmlContent += `<li>Estructura de voto: ${votingText}.</li><li>Órgano de gobierno elegido por: ${getFriendlyName(governanceData.governing_body)}. ${governanceData.reserved_seats?'Con puestos reservados.':''}</li><li>Transparencia: Informes ${getFriendlyName(governanceData.reporting_frequency)}. Decisiones ${governanceData.public_access?'accesibles':'no accesibles'}. Auditoría externa: ${governanceData.external_audit?'Sí':'No'}.</li></ul>`;
        htmlContent += `<strong>PARTICIPACIÓN ECONÓMICA (Ref. P3):</strong><ul><li>Formas de contribución: ${governanceData.contribution.map(getFriendlyName).join(', ')||"Definir"}.</li><li>Uso prioritario de excedentes: ${getFriendlyName(governanceData.surplus_priority)}.</li><li>Incentivos a la participación: ${governanceData.incentive.map(getFriendlyName).join(', ')||"Ninguno"}.</li></ul>`;
        htmlContent += `<strong>AUTONOMÍA E INDEPENDENCIA (Ref. P4):</strong><ul><li>Control estratégico: ${getFriendlyName(governanceData.decision_control)}.</li><li>Límite a participación externa: ${governanceData.external_funding_limit}%.</li><li>${governanceData.veto_rights_members?'Con':'Sin'} derecho de veto de miembros sobre acuerdos externos.</li><li>${governanceData.autonomy_clause?'Se incluirá':'No se incluirá'} cláusula explícita de autonomía.</li></ul>`;
        htmlContent += `<strong>EDUCACIÓN E INFORMACIÓN (Ref. P5):</strong><ul><li>Actividades previstas: ${governanceData.education.map(getFriendlyName).join(', ')||"Ninguna definida"}.</li></ul>`;
        htmlContent += `<strong>COOPERACIÓN (Ref. P6):</strong><ul><li>Nivel de cooperación buscado: ${getFriendlyName(governanceData.cooperation_level_radio)}.</li><li>Áreas de cooperación potenciales: ${governanceData.cooperation_area.map(getFriendlyName).join(', ')||"Ninguna definida"}.</li></ul>`;
        // La línea 'Fin del Borrador' se ha eliminado de aquí.
        draftOutput.innerHTML = htmlContent;
    }

    /** Calcula puntuaciones ACI ilustrativas (sin cambios). */
    function calculateAciScores() {
        // (Lógica de puntuación sin cambios)
        const scores = { P1: 1, P2: 1, P3: 1, P4: 1, P5: 1, P6: 1, P7: 1 };
        if (governanceData.openness_level > 50) scores.P1 += 1; if (!governanceData.criteria.includes('inversion') || governanceData.criteria.length <= 2) scores.P1 +=1; if (governanceData.inclusion_strategy === 'activa') scores.P1 += 2; else if (governanceData.inclusion_strategy === 'basica') scores.P1 += 1;
        if (governanceData.voting_structure === '1m1v') scores.P2 += 2; if (governanceData.governing_body === 'asamblea_general') scores.P2 += 1; if (governanceData.public_access === true) scores.P2 += 1; if (['trimestral', 'continua'].includes(governanceData.reporting_frequency)) scores.P2 += 1;
        if (governanceData.contribution.length >= 2) scores.P3 += 1; if (governanceData.surplus_priority === 'reinversion_comunidad') scores.P3 += 2; else if (governanceData.surplus_priority === 'combinado') scores.P3 += 1; if (!governanceData.incentive.includes('ninguno') && governanceData.incentive.length > 0) scores.P3 += 1;
        if (governanceData.decision_control === 'miembros_exclusivo') scores.P4 += 2; else if (governanceData.decision_control === 'miembros_mayoritario') scores.P4 += 1; if (governanceData.external_funding_limit <= 25) scores.P4 += 2; if (governanceData.autonomy_clause === true) scores.P4 += 1;
        scores.P5 += governanceData.education.length;
        if (governanceData.cooperation_level_radio === 'alta') scores.P6 += 2; else if (governanceData.cooperation_level_radio === 'media') scores.P6 += 1; scores.P6 += Math.min(2, governanceData.cooperation_area.length);
        if (governanceData.community_focus_radio === 'primario') scores.P7 += 2; else if (governanceData.community_focus_radio === 'importante') scores.P7 += 1; scores.P7 += Math.min(2, governanceData.reinvestment.length);
        for (const key in scores) { scores[key] = Math.max(1, Math.min(5, Math.round(scores[key]))); } return scores;
     }

    /** Actualiza o crea el gráfico radar (Revisado para visibilidad). */
    function updateRadarChart() {
        if (!radarChartCanvas) { console.warn("Canvas para gráfico no encontrado."); return; }
        if (typeof Chart === 'undefined') { console.error("Chart.js no está cargado."); return; }

        // Destruir instancia anterior si existe para evitar solapamientos
        if (aciRadarChartInstance) {
            try { aciRadarChartInstance.destroy(); aciRadarChartInstance = null; }
            catch (e) { console.error("Error destruyendo gráfico:", e); }
        }

        const scores = calculateAciScores();
        const chartData = {
            labels: ['P1 Adhesión', 'P2 Democracia', 'P3 Part. Econ.', 'P4 Autonomía', 'P5 Educación', 'P6 Cooperación', 'P7 Comunidad'],
            datasets: [{
                label: 'Alineación Principios ACI (1-5)',
                data: [scores.P1, scores.P2, scores.P3, scores.P4, scores.P5, scores.P6, scores.P7],
                fill: true, backgroundColor: 'rgba(0, 187, 169, 0.3)', borderColor: 'rgb(0, 187, 169)',
                pointBackgroundColor: 'rgb(0, 187, 169)', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(0, 187, 169)', borderWidth: 2, pointRadius: 4, pointHoverRadius: 6
            }]
        };
        const chartConfig = {
            type: 'radar', data: chartData,
            options: {
                scales: { r: { angleLines: { display: true, color: 'rgba(0, 0, 0, 0.1)' }, suggestedMin: 0, suggestedMax: 5, pointLabels: { font: { size: 10 } }, ticks: { display: true, stepSize: 1, backdropColor: 'rgba(255, 255, 255, 0.7)' }, grid: { color: 'rgba(0, 0, 0, 0.1)' } } },
                plugins: { legend: { position: 'bottom', labels:{ font: {size: 11}} } },
                maintainAspectRatio: false, responsive: true
            }
        };

        // Crear nueva instancia del gráfico en el contexto del canvas
        try {
            const ctx = radarChartCanvas.getContext('2d');
            if (!ctx) throw new Error("No se pudo obtener el contexto 2D del canvas.");
            aciRadarChartInstance = new Chart(ctx, chartConfig);
            console.log("Gráfico radar creado/actualizado.");
        } catch (error) {
            console.error("Error al crear el gráfico Chart.js:", error);
            const container = document.getElementById('aci-alignment-score');
            if (container) container.innerHTML = `<p style="color: red; text-align: center;">Error al mostrar gráfico: ${error.message}</p>`;
        }
    }


    // --- Funciones de Control ---

    /** Resetea el formulario y el estado (Revisado y Corregido). */
    function resetForm() {
        if (confirm('¿Estás seguro de que quieres reiniciar todo el diseño? Se perderán todos los cambios.')) {
            console.log("Reseteando formulario...");
            // 1. Resetear Estado Interno
            governanceData = JSON.parse(JSON.stringify(initialGovernanceData));
            console.log("Estado interno reseteado.");

            // 2. Resetear Formulario HTML Nativamente (Usando selector corregido)
            if (mainForm && typeof mainForm.reset === 'function') {
                 mainForm.reset();
                 console.log("Formulario reseteado nativamente.");
            } else {
                 console.warn("'mainForm' no encontrado o no es un <form>.");
                 // Intentar reset manual de todas formas
            }

            // 3. Iterar y establecer explícitamente valores iniciales VISUALES
            formElements.forEach(element => {
                const name = element.name;
                if (!name || !initialGovernanceData.hasOwnProperty(name)) return;
                const initialValue = initialGovernanceData[name];
                const type = element.type;

                try {
                    if (type === 'checkbox') {
                        element.checked = (typeof initialValue === 'boolean') ? initialValue : (Array.isArray(initialValue) && initialValue.includes(element.value));
                        if (name === 'incentive') element.checked = initialValue.includes(element.value); // Reset específico incentivo
                    } else if (type === 'radio') {
                        element.checked = (element.value === initialValue);
                    } else {
                        element.value = initialValue;
                        if (type === 'range') { // IMPORTANTE: Disparar evento para sliders
                             element.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }
                 } catch(e) { console.warn(`Error reseteando visualmente ${name}: ${e}`); }
            });
            console.log("Elementos individuales reseteados visualmente.");

            // 4. Resetear elementos específicos adicionales
            toggleOtherVotingInput(false); // Ocultar campo "Otro"
            if(otherVotingInput) otherVotingInput.value = '';

            // 5. Actualizar todas las visualizaciones
             requestAnimationFrame(() => {
                 console.log("Actualizando visualizaciones post-reset...");
                 updateAllVisualizations();
                 console.log("Visualizaciones actualizadas.");
                 // 6. Ir al Primer Paso
                 showStep(0);
                 // 7. Scroll al inicio de la página
                 window.scrollTo({ top: 0, behavior: 'smooth' });
                 console.log("Navegado al primer paso post-reset.");
             });
        }
    }


    // --- Event Listeners ---

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentStep < totalSteps - 1) { showStep(currentStep + 1); }
            else { alert('¡Diseño completado!\nRevisa el resumen y el borrador.\nPuedes descargar el borrador como PDF.'); }
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => { if (currentStep > 0) showStep(currentStep - 1); });
    }
    if (resetBtn) {
         resetBtn.addEventListener('click', resetForm);
    }

    // Listeners para cambios en formulario
    formElements.forEach(element => {
        const eventType = (element.type === 'range' || element.type === 'number' || element.tagName === 'TEXTAREA') ? 'input' : 'change';
        element.addEventListener(eventType, updateGovernanceData);
    });

    // Listener Descarga PDF (con imagen y texto corregido)
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            try {
                // Verificar librerías
                if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') throw new Error('jsPDF no cargado.');
                if (typeof Chart === 'undefined') throw new Error('Chart.js no cargado.');

                const { jsPDF } = jspdf;
                const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                const outputElement = draftOutput;
                const chartCanvas = radarChartCanvas;

                if (!outputElement) throw new Error("Contenedor del borrador no encontrado.");
                if (!chartCanvas) throw new Error("Canvas del gráfico no encontrado.");

                // Asegurarse que el gráfico esté renderizado antes de capturarlo
                 if (!aciRadarChartInstance || radarChartCanvas.height === 0 || radarChartCanvas.width === 0) {
                     console.warn("Gráfico no renderizado o sin dimensiones, intentando actualizar...");
                     updateRadarChart(); // Intentar actualizar ahora
                     // Pequeña pausa para posible renderizado asíncrono de Chart.js
                     // Esto no es ideal, una solución más robusta usaría promesas o callbacks si Chart.js los ofrece
                      // setTimeout(() => { generatePdfContent(doc, outputElement, chartCanvas); }, 100); // Omitimos el timeout complejo por ahora
                      if (!aciRadarChartInstance || radarChartCanvas.height === 0 || radarChartCanvas.width === 0) {
                           throw new Error("No se pudo generar o encontrar el gráfico ACI para el PDF.");
                      }
                      generatePdfContent(doc, outputElement, chartCanvas); // Intentar generar inmediatamente tras el update
                 } else {
                      generatePdfContent(doc, outputElement, chartCanvas); // Generar si ya existe
                 }

            } catch (error) {
                console.error("Error al iniciar generación de PDF:", error);
                alert(`Hubo un error al preparar el PDF: ${error.message || error}.\nRevisa la consola.`);
            }
        });
    }

    /** Función interna para generar contenido PDF (texto + imagen) */
    function generatePdfContent(doc, outputElement, chartCanvas) {
        try {
             // --- Página 1: Texto ---
             console.log("Generando texto PDF...");
             let textContent = outputElement.innerHTML;
             textContent = textContent
                 .replace(/<h4>(.*?)<\/h4>/gi, (match, p1) => `\n\n*** ${p1.toUpperCase().trim()} ***\n\n`)
                 .replace(/<strong>(.*?)<\/strong>/gi, (match, p1) => `\n${p1.trim()}\n${'-'.repeat(p1.trim().length)}\n`)
                 .replace(/<br\s*\/?>|<\/p>|<\/ul>/gi, "\n").replace(/<\/li>/gi, "\n").replace(/<li>/gi, "  - ")
                 .replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                 .replace(/\n{3,}/g, "\n\n").trim();

             doc.setFontSize(10); const margin = 15; const textWidth = doc.internal.pageSize.getWidth() - (margin * 2);
             const splitText = doc.splitTextToSize(textContent, textWidth);
             doc.text(splitText, margin, margin);
             console.log("Texto PDF generado.");

             // --- Página 2: Gráfico ---
             console.log("Generando imagen gráfico para PDF...");
             const imageDataUrl = chartCanvas.toDataURL('image/png'); // Capturar como PNG

             if (!imageDataUrl || !imageDataUrl.startsWith('data:image/png')) throw new Error("Fallo al generar imagen del gráfico (toDataURL).");

             doc.addPage(); // Nueva página
             doc.setFontSize(12); doc.text("Puntuación de Alineación con Principios ACI (Ilustrativa)", margin, margin);

             const imgWidthMax = doc.internal.pageSize.getWidth() - (margin * 2);
             const imgHeightMax = doc.internal.pageSize.getHeight() - (margin * 3); // Más margen abajo
             const canvasWidth = chartCanvas.width; const canvasHeight = chartCanvas.height;
             const ratio = Math.min(imgWidthMax / canvasWidth, imgHeightMax / canvasHeight);
             const imgWidth = canvasWidth * ratio * 0.9; // Reducir un poco para margen extra
             const imgHeight = canvasHeight * ratio * 0.9;
             const imgX = (doc.internal.pageSize.getWidth() - imgWidth) / 2; // Centrar
             const imgY = margin + 15; // Espacio bajo título

             doc.addImage(imageDataUrl, 'PNG', imgX, imgY, imgWidth, imgHeight);
             console.log("Imagen gráfico añadida a PDF.");

             // --- Guardar ---
             doc.save('borrador_gobernanza_energetica_con_grafico.pdf');

         } catch(pdfError){
             console.error("Error durante la generación del contenido del PDF:", pdfError);
             alert(`Error al generar el PDF: ${pdfError.message || pdfError}`);
             // Intentar añadir página de error si falla la imagen
             if (doc && pdfError.message.includes("imagen")) {
                 try {
                     if (!doc.internal.pages[2]) doc.addPage(); // Añadir página 2 si no existe
                     doc.setPage(2);
                     doc.setTextColor(255, 0, 0); doc.text("Error: No se pudo incluir la imagen del gráfico.", 15, 15); doc.setTextColor(0, 0, 0);
                     doc.save('borrador_gobernanza_energetica_SIN_GRAFICO.pdf'); // Guardar sin gráfico
                 } catch(fallbackError){ console.error("Error al guardar PDF de fallback:", fallbackError); }
             }
         }
    }

    // --- Inicialización ---
    try {
        requestAnimationFrame(updateAllVisualizations); // Actualizar visuales iniciales
        showStep(0); // Mostrar primer paso
    } catch(initError) {
        console.error("Error durante la inicialización:", initError);
        document.body.insertAdjacentHTML('afterbegin', `<div style="color:red;background:lightyellow;padding:10px;border:1px solid red;">Error al iniciar: ${initError.message}. Recarga la página.</div>`);
    }

}); // Fin del DOMContentLoaded

/* FIN: Código JavaScript Completo Final Revisado (script.js) */
