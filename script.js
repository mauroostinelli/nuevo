// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const steps = document.querySelectorAll('.step');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressStepText = document.getElementById('progress-step-text');
    const stepsContainer = document.getElementById('steps-container');
    const downloadBtn = document.getElementById('download-draft-btn');

    // Specific interactive elements for state update
    const formElements = document.querySelectorAll('#governance-constructor input, #governance-constructor select');

    // Visualization Elements
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
    const knowledgeTreeViz = document.getElementById('knowledge-tree-viz'); // Container
    const treeBranchesViz = document.getElementById('tree-branches-viz');
    const knowledgeImpactText = document.getElementById('knowledge-impact-text');
    const cooperationMapViz = document.querySelector('.cooperation-map'); // Container
    const coopNodes = cooperationMapViz.querySelectorAll('.map-node.other');
    const coopLinks = cooperationMapViz.querySelectorAll('.map-link');
    const cooperationVizText = document.getElementById('cooperation-viz-text');
    const impactNeedle = document.getElementById('impact-needle');
    const impactLevelText = document.getElementById('impact-level-text');

    // Final Step Elements
    const dashboardOutput = document.getElementById('governance-dashboard');
    const draftOutput = document.getElementById('draft-output');
    const radarChartCanvas = document.getElementById('aciRadarChart');

    // --- State ---
    let currentStep = 0;
    const totalSteps = steps.length;
    let aciRadarChartInstance = null; // To hold the chart instance

    // Governance Data Object - Structure to hold all user choices
    let governanceData = {
        // Step 1
        purpose: [],
        purpose_balance: 70, // Default value
        member_type: [],
        activity: [],
        // Step 2 (P1)
        openness_level: 60, // Default value
        criteria: [],
        inclusion_strategy: 'ninguna',
        // Step 3 (P2)
        voting_structure: '1m1v',
        governing_body: 'asamblea_general',
        reserved_seats: false,
        reporting_frequency: 'semestral',
        public_access: true,
        external_audit: false,
        // Step 4 (P3)
        contribution: ['cuota_entrada'],
        surplus_priority: 'reinversion_comunidad',
        incentive: ['ninguno'],
        // Step 5 (P4)
        decision_control: 'miembros_exclusivo',
        external_funding_limit: 25,
        veto_rights_members: false,
        autonomy_clause: true,
        // Step 6 (P5)
        education: ['info_miembros'],
        // Step 7 (P6)
        cooperation_level_radio: 'media',
        cooperation_area: [],
        // Step 8 (P7)
        community_focus_radio: 'primario',
        reinvestment: ['proyectos_locales'],
    };


    // --- Functions ---

    /**
     * Updates the governanceData object based on form input changes.
     */
    function updateGovernanceData(event) {
        const element = event.target;
        const name = element.name;
        const type = element.type;
        let value = element.value;

        if (!name) return; // Ignore elements without a name

        if (type === 'checkbox') {
            if (!governanceData[name] || !Array.isArray(governanceData[name])) {
                governanceData[name] = [];
            }
            if (element.checked) {
                // Special case for 'ninguno' incentive: uncheck others
                if (name === 'incentive' && value === 'ninguno') {
                    governanceData[name] = ['ninguno'];
                    // Uncheck other incentive checkboxes visually
                    document.querySelectorAll('input[name="incentive"]').forEach(cb => {
                        if (cb !== element) cb.checked = false;
                    });
                } else {
                     // Remove 'ninguno' if another incentive is checked
                    if(name === 'incentive') {
                        governanceData[name] = governanceData[name].filter(item => item !== 'ninguno');
                         // Uncheck 'ninguno' visually
                        const ningunoCb = document.querySelector('input[name="incentive"][value="ninguno"]');
                        if (ningunoCb) ningunoCb.checked = false;
                    }
                    if (!governanceData[name].includes(value)) {
                        governanceData[name].push(value);
                    }
                }
            } else {
                governanceData[name] = governanceData[name].filter(item => item !== value);
                 // If unchecking the last non-'ninguno' incentive, maybe check 'ninguno'? (optional)
                if (name === 'incentive' && governanceData[name].length === 0) {
                    const ningunoCb = document.querySelector('input[name="incentive"][value="ninguno"]');
                     if (ningunoCb) {
                         ningunoCb.checked = true;
                         governanceData[name].push('ninguno');
                     }
                }
            }
        } else if (type === 'radio') {
            if (element.checked) {
                governanceData[name] = value;
            }
        } else if (type === 'range') {
            governanceData[name] = parseInt(value, 10); // Store as number
        } else if (type === 'number') {
            governanceData[name] = parseInt(value, 10);
        } else { // Includes select-one, text, etc.
            governanceData[name] = value;
        }

        // --- Trigger Visual Updates Based on Changed Data ---
        // Use requestAnimationFrame for smoother updates, especially for visuals
        requestAnimationFrame(() => {
            if (name === 'member_type') updateMemberListViz();
            if (name === 'purpose_balance') updatePurposeBalanceViz();
            if (name === 'openness_level') updateOpennessViz();
            if (name === 'voting_structure') updateVotingViz();
            if (['reporting_frequency', 'public_access', 'external_audit'].includes(name)) updateTransparencyViz();
            if (['decision_control', 'external_funding_limit', 'veto_rights_members', 'autonomy_clause'].includes(name)) updateAutonomyViz();
             if (name === 'external_funding_limit') checkDependencyAlert();
            if (name === 'education') updateKnowledgeTreeViz();
            if (name === 'cooperation_level_radio' || name === 'cooperation_area') updateCooperationViz();
            if (name === 'community_focus_radio' || name === 'reinvestment') updateImpactViz();
        });

        // console.log('Governance Data Updated:', governanceData); // For debugging
    }


    /**
     * Shows the specified step and updates UI elements.
     */
    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });

        currentStep = stepIndex;
        updateProgressBar();
        updateStepText();
        updateButtons();

        // Scroll to the top of the step container for better UX on long pages
        stepsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // If it's the final step, generate outputs
        if (currentStep === totalSteps - 1) {
            generateDashboard();
            generateDraftOutput();
            updateRadarChart(); // Generate/Update the chart
        }
    }

    /** Updates the progress bar width */
    function updateProgressBar() {
        const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    /** Updates the step indicator text */
    function updateStepText() {
        progressStepText.textContent = `Paso ${currentStep + 1} de ${totalSteps}`;
    }

    /** Enables/disables navigation buttons */
    function updateButtons() {
        prevBtn.disabled = currentStep === 0;
        if (currentStep === totalSteps - 1) {
            nextBtn.textContent = 'Finalizar Diseño';
            nextBtn.disabled = true; // Disable on the last step
        } else {
            nextBtn.textContent = 'Siguiente';
            nextBtn.disabled = false;
        }
    }

    // --- Visualization Update Functions ---

    function updateMemberListViz() {
        memberListViz.innerHTML = ''; // Clear previous list
        if (governanceData.member_type.length === 0) {
            memberListViz.innerHTML = '<li>(Selecciona tipos de miembros)</li>';
            return;
        }
        governanceData.member_type.forEach(type => {
            const li = document.createElement('li');
            // Simple text mapping - could be enhanced with icons
            const typeMap = {
                'hogares': 'Hogares', 'hogares_vulnerables': 'Hog. Vulnerables',
                'pymes': 'PYMEs', 'municipio': 'Ayuntamiento', 'otros': 'Otros'
            };
            li.textContent = typeMap[type] || type;
            memberListViz.appendChild(li);
        });
    }

     function updatePurposeBalanceViz() {
        const balance = governanceData.purpose_balance;
        purposeBalanceValue.textContent = `${balance}% Comunitario / ${100 - balance}% Financiero`;
        // Update slider gradient background dynamically
        purposeBalanceSlider.style.setProperty('--value', `${balance}%`);
    }

    function updateOpennessViz() {
        const level = governanceData.openness_level;
        let text = "Nivel intermedio de requisitos.";
        if (level > 75) text = "Alta facilidad de entrada, pocos requisitos.";
        else if (level < 25) text = "Alto compromiso requerido para entrar.";
        opennessLevelText.textContent = text;
        opennessSlider.style.setProperty('--value', `${level}%`);
    }

     function updateVotingViz() {
        const structure = governanceData.voting_structure;
        let angle = 0; // 1m1v
        let text = "Seleccionado: Un Miembro, Un Voto";
        if (structure === 'ponderado_tipo') { angle = 15; text = "Voto Ponderado por Tipo"; }
        else if (structure === 'ponderado_aportacion') { angle = -15; text = "Voto Ponderado por Aportación"; }
        else if (structure === 'otro') { angle = 0; text = "Sistema de Voto: Otro"; } // Neutral visualmente

        voteBeam.style.transform = `rotate(${angle}deg)`;
        votingVizText.textContent = text;
    }

    function updateTransparencyViz() {
        let score = 0;
        if (governanceData.reporting_frequency === 'semestral') score += 1;
        if (governanceData.reporting_frequency === 'trimestral') score += 2;
        if (governanceData.reporting_frequency === 'continua') score += 3;
        if (governanceData.public_access) score += 2;
        if (governanceData.external_audit) score += 2;

        const maxScore = 7; // 3 + 2 + 2
        const percentage = Math.max(10, (score / maxScore) * 100); // Min 10% height
        transparencyMercury.style.height = `${percentage}%`;

        let levelText = "Bajo";
        if (percentage > 66) levelText = "Alto";
        else if (percentage > 33) levelText = "Medio";
        transparencyLevelText.textContent = `Nivel de Transparencia: ${levelText}`;
    }

    function updateAutonomyViz() {
        let score = 0;
        if (governanceData.decision_control === 'miembros_exclusivo') score += 3;
        if (governanceData.decision_control === 'miembros_mayoritario') score += 2;
        if (governanceData.external_funding_limit <= 25) score += 2; // Stricter limit = more autonomy
        if (governanceData.external_funding_limit <= 50) score += 1;
        if (governanceData.veto_rights_members) score += 1;
        if (governanceData.autonomy_clause) score += 1;

        const maxScore = 7; // 3 + 2 + 1 + 1
        const percentage = (score / maxScore) * 100;

        // Update shield layers (conceptual)
        autonomyShieldViz.querySelector('#shield-layer-1').style.backgroundColor = percentage > 33 ? 'var(--success-color)' : 'transparent';
        autonomyShieldViz.querySelector('#shield-layer-2').style.backgroundColor = percentage > 66 ? 'var(--accent-color)' : 'transparent';
        autonomyShieldViz.querySelector('#shield-layer-3').style.backgroundColor = percentage > 85 ? 'var(--primary-color)' : 'transparent';

        let levelText = "Bajo";
        if (percentage > 66) levelText = "Alto";
        else if (percentage > 33) levelText = "Medio";
        autonomyLevelText.textContent = `Nivel de Autonomía: ${levelText}`;
    }

     function checkDependencyAlert() {
        const limit = governanceData.external_funding_limit;
        dependencyAlert.classList.toggle('hidden', limit <= 50); // Show alert if limit > 50%
    }

    function updateKnowledgeTreeViz() {
        const activitiesCount = governanceData.education.length;
        treeBranchesViz.innerHTML = ''; // Clear old branches

        // Add branches conceptually
        for (let i = 0; i < activitiesCount; i++) {
            const branch = document.createElement('div');
            branch.className = 'branch';
            // Basic positioning - can be improved
            branch.style.left = `${20 + i * 15}%`;
            branch.style.top = `${50 - i * 10}%`;
            branch.style.transform = `scale(${1 + i * 0.1}) rotate(${i * 20 - (activitiesCount-1)*10}deg)`; // Grow and spread
             branch.style.opacity = `${0.6 + i * 0.1}`;
            treeBranchesViz.appendChild(branch);
        }

        let impactText = "Bajo";
        if (activitiesCount >= 4) impactText = "Alto";
        else if (activitiesCount >= 2) impactText = "Moderado";
        knowledgeImpactText.textContent = `Nivel de compromiso educativo: ${impactText}`;
    }

    function updateCooperationViz() {
        const level = governanceData.cooperation_level_radio;
        const areasCount = governanceData.cooperation_area.length;
        let linkStrength = 0; // 0=low, 1=medium, 2=high

        if (level === 'media') linkStrength = 1;
        else if (level === 'alta') linkStrength = 2;

        // Update link colors/styles
        coopLinks.forEach((link, index) => {
            link.style.backgroundColor = linkStrength > index ? 'var(--accent-color)' : '#ccc';
            link.style.height = linkStrength > index ? '4px' : '3px';
        });

         // Update node colors
         coopNodes.forEach((node, index) => {
             node.style.backgroundColor = linkStrength > index ? 'var(--primary-color)' : '#aaa';
         });


        let vizText = "Bajo";
        if (linkStrength === 2 || (linkStrength === 1 && areasCount >= 2)) vizText = "Alto";
        else if (linkStrength === 1 || areasCount >= 1) vizText = "Moderado";
        cooperationVizText.textContent = `Nivel de interconexión: ${vizText}`;
    }

     function updateImpactViz() {
        let score = 0;
        if (governanceData.community_focus_radio === 'primario') score += 3;
        if (governanceData.community_focus_radio === 'importante') score += 2;
        score += governanceData.reinvestment.length; // Add 1 point per mechanism

        const maxScore = 8; // 3 + 5 mechanisms
        const percentage = (score / maxScore) * 100;
        // Rotation range: -60deg (low) to +60deg (high) -> 120deg total
        const rotation = -60 + (percentage / 100) * 120;
        impactNeedle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

        let levelText = "Bajo";
        if (percentage > 66) levelText = "Alto";
        else if (percentage > 33) levelText = "Medio";
        impactLevelText.textContent = `Impacto comunitario potencial: ${levelText}`;
    }


    // --- Final Step Generation Functions ---

    /** Generates the summary dashboard */
    function generateDashboard() {
        let html = '<ul>';
        // Iterating through some key data points for the dashboard
        html += `<li><strong>Propósito Principal:</strong> <span>${governanceData.purpose.join(', ') || 'No definido'} (Balance: ${governanceData.purpose_balance}% Comunitario)</span></li>`;
        html += `<li><strong>Tipos Miembros:</strong> <span>${governanceData.member_type.join(', ') || 'No definidos'}</span></li>`;
        html += `<li><strong>Apertura (P1):</strong> <span>Nivel ${governanceData.openness_level}/100. Inclusión: ${governanceData.inclusion_strategy}</span></li>`;
        html += `<li><strong>Voto (P2):</strong> <span>${governanceData.voting_structure}. Transparencia: ${transparencyLevelText.textContent.split(': ')[1]}</span></li>`;
        html += `<li><strong>Participación Econ. (P3):</strong> <span>Contrib.: ${governanceData.contribution.join(', ')}. Excedentes: ${governanceData.surplus_priority}</span></li>`;
        html += `<li><strong>Autonomía (P4):</strong> <span>Nivel ${autonomyLevelText.textContent.split(': ')[1]}. Límite externo: ${governanceData.external_funding_limit}%</span></li>`;
        html += `<li><strong>Educación (P5):</strong> <span>${governanceData.education.length} actividades seleccionadas.</span></li>`;
        html += `<li><strong>Cooperación (P6):</strong> <span>Nivel ${governanceData.cooperation_level_radio}. Áreas: ${governanceData.cooperation_area.length}</span></li>`;
        html += `<li><strong>Interés Comunidad (P7):</strong> <span>Foco: ${governanceData.community_focus_radio}. Reinversión: ${governanceData.reinvestment.length} mecanismos</span></li>`;
        html += '</ul>';
        dashboardOutput.innerHTML = html;
    }

    /** Generates the draft text output */
    function generateDraftOutput() {
        // Simple text generation based on choices
        let text = `<h4>BORRADOR PRELIMINAR DE GOBERNANZA</h4>\n\n`;
        text += `<strong>OBJETO Y FINES (Ref. P7):</strong>\n`;
        text += `- Fines principales: ${governanceData.purpose.join(', ') || 'Definir'}.\n`;
        text += `- Énfasis: ${governanceData.purpose_balance}% beneficio comunitario, ${100 - governanceData.purpose_balance}% retorno financiero.\n`;
        text += `- El interés por la comunidad local es ${governanceData.community_focus_radio}.\n`;
        text += `- Mecanismos de reinversión comunitaria: ${governanceData.reinvestment.join(', ') || 'Ninguno definido'}.\n\n`;

        text += `<strong>MIEMBROS (Ref. P1):</strong>\n`;
        text += `- Tipos de miembros admitidos: ${governanceData.member_type.join(', ') || 'Definir'}.\n`;
        text += `- Criterios elegibilidad: ${governanceData.criteria.join(', ') || 'Abierto (revisar)'}.\n`;
        text += `- Nivel de apertura/compromiso: ${governanceData.openness_level}/100.\n`;
        text += `- Estrategia de inclusión: ${governanceData.inclusion_strategy}.\n\n`;

        text += `<strong>CONTROL DEMOCRÁTICO (Ref. P2):</strong>\n`;
        text += `- Estructura de voto: ${governanceData.voting_structure}.\n`;
        text += `- Órgano de gobierno elegido por: ${governanceData.governing_body}. ${governanceData.reserved_seats ? 'Con puestos reservados.' : ''}\n`;
        text += `- Transparencia: Informes ${governanceData.reporting_frequency}. Decisiones ${governanceData.public_access ? 'accesibles' : 'no accesibles'}. Auditoría externa: ${governanceData.external_audit ? 'Sí' : 'No'}.\n\n`;

        text += `<strong>PARTICIPACIÓN ECONÓMICA (Ref. P3):</strong>\n`;
        text += `- Formas de contribución: ${governanceData.contribution.join(', ') || 'Definir'}.\n`;
        text += `- Uso prioritario de excedentes: ${governanceData.surplus_priority}.\n`;
        text += `- Incentivos a la participación: ${governanceData.incentive.join(', ') || 'Ninguno'}.\n\n`;

        text += `<strong>AUTONOMÍA E INDEPENDENCIA (Ref. P4):</strong>\n`;
        text += `- Control estratégico: ${governanceData.decision_control}.\n`;
        text += `- Límite a participación externa: ${governanceData.external_funding_limit}%.\n`;
        text += `- ${governanceData.veto_rights_members ? 'Con' : 'Sin'} derecho de veto de miembros sobre acuerdos externos.\n`;
        text += `- ${governanceData.autonomy_clause ? 'Se incluirá' : 'No se incluirá'} cláusula explícita de autonomía.\n\n`;

        text += `<strong>EDUCACIÓN E INFORMACIÓN (Ref. P5):</strong>\n`;
        text += `- Actividades previstas: ${governanceData.education.join(', ') || 'Ninguna definida'}.\n\n`;

        text += `<strong>COOPERACIÓN (Ref. P6):</strong>\n`;
        text += `- Nivel de cooperación buscado: ${governanceData.cooperation_level_radio}.\n`;
        text += `- Áreas de cooperación potenciales: ${governanceData.cooperation_area.join(', ') || 'Ninguna definida'}.\n\n`;

        text += `<em>--- Fin del Borrador Preliminar ---</em>`;
        draftOutput.textContent = text;
    }


    /** Calculates illustrative scores and updates the radar chart */
    function calculateAciScores() {
        // --- SIMPLIFIED SCORING LOGIC - FOR ILLUSTRATION ONLY ---
        // Scores range roughly from 1 (low alignment) to 5 (high alignment)
        const scores = {
            P1: 1, // Adhesión Abierta
            P2: 1, // Control Democrático
            P3: 1, // Participación Económica
            P4: 1, // Autonomía
            P5: 1, // Educación
            P6: 1, // Cooperación
            P7: 1  // Interés Comunidad
        };

        // P1 Scoring
        if (governanceData.openness_level > 50) scores.P1 += 1;
        if (!governanceData.criteria.includes('inversion') || governanceData.criteria.length <= 2) scores.P1 +=1; // Fewer criteria = more open
        if (governanceData.inclusion_strategy === 'activa') scores.P1 += 2;
        if (governanceData.inclusion_strategy === 'basica') scores.P1 += 1;

        // P2 Scoring
        if (governanceData.voting_structure === '1m1v') scores.P2 += 2;
        if (governanceData.governing_body === 'asamblea_general') scores.P2 += 1;
        if (governanceData.public_access) scores.P2 += 1;
        if (['trimestral', 'continua'].includes(governanceData.reporting_frequency)) scores.P2 += 1;

        // P3 Scoring (Focus on member benefit vs pure profit)
        if (governanceData.contribution.length >= 2) scores.P3 += 1;
        if (governanceData.surplus_priority === 'reinversion_comunidad') scores.P3 += 2;
        if (governanceData.surplus_priority === 'combinado') scores.P3 += 1;
        if (!governanceData.incentive.includes('ninguno') && governanceData.incentive.length > 0) scores.P3 += 1;


        // P4 Scoring
        if (governanceData.decision_control === 'miembros_exclusivo') scores.P4 += 2;
        if (governanceData.decision_control === 'miembros_mayoritario') scores.P4 += 1;
        if (governanceData.external_funding_limit <= 25) scores.P4 += 2;
        if (governanceData.autonomy_clause) scores.P4 += 1;

        // P5 Scoring
        scores.P5 += governanceData.education.length; // Simple count

        // P6 Scoring
        if (governanceData.cooperation_level_radio === 'alta') scores.P6 += 2;
        if (governanceData.cooperation_level_radio === 'media') scores.P6 += 1;
        scores.P6 += Math.min(2, governanceData.cooperation_area.length); // Max 2 points from areas

        // P7 Scoring
        if (governanceData.community_focus_radio === 'primario') scores.P7 += 2;
        if (governanceData.community_focus_radio === 'importante') scores.P7 += 1;
        scores.P7 += Math.min(2, governanceData.reinvestment.length); // Max 2 points from reinvestment

        // Clamp scores between 1 and 5
        for (const key in scores) {
            scores[key] = Math.max(1, Math.min(5, Math.round(scores[key])));
        }

        return scores;
    }

    function updateRadarChart() {
        const scores = calculateAciScores();
        const chartData = {
            labels: [
                'P1: Adhesión', 'P2: Democracia', 'P3: Part. Económ.',
                'P4: Autonomía', 'P5: Educación', 'P6: Cooperación', 'P7: Comunidad'
            ],
            datasets: [{
                label: 'Alineación Principios ACI (1-5)',
                data: [
                    scores.P1, scores.P2, scores.P3, scores.P4,
                    scores.P5, scores.P6, scores.P7
                ],
                fill: true,
                backgroundColor: 'rgba(0, 187, 169, 0.2)', // Accent color transparent
                borderColor: 'rgb(0, 187, 169)',       // Accent color solid
                pointBackgroundColor: 'rgb(0, 187, 169)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(0, 187, 169)'
            }]
        };

        const chartConfig = {
            type: 'radar',
            data: chartData,
            options: {
                elements: {
                    line: {
                        borderWidth: 3
                    }
                },
                scales: {
                    r: {
                        angleLines: { display: true },
                        suggestedMin: 0,
                        suggestedMax: 5,
                        pointLabels: { font: { size: 11 } },
                        ticks: {
                           display: true, // Show tick values 0, 1, 2... 5
                           stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                         position: 'top',
                    }
                },
                maintainAspectRatio: true, // Adapt to container
                responsive: true
            }
        };

        // Destroy previous chart instance if it exists before creating a new one
        if (aciRadarChartInstance) {
            aciRadarChartInstance.destroy();
        }
        // Create new chart instance
        aciRadarChartInstance = new Chart(radarChartCanvas, chartConfig);
    }


    // --- Event Listeners ---

    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps - 1) {
            showStep(currentStep + 1);
        }
        // No 'else' needed as the button gets disabled on the last step now
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            showStep(currentStep - 1);
        }
    });

    // Add event listeners to all relevant form elements
    formElements.forEach(element => {
        element.addEventListener('change', updateGovernanceData); // Use 'change' for selects, checkboxes, radios
        if (element.type === 'range' || element.type === 'number') {
             element.addEventListener('input', updateGovernanceData); // Use 'input' for immediate feedback on sliders/numbers
        }
    });

     // Listener for download button (Placeholder action)
    downloadBtn.addEventListener('click', () => {
        alert('La función de descarga PDF aún no está implementada.\n\nPuedes copiar el texto del "Borrador Preliminar de Gobernanza".');
        // In a real scenario, you would call a PDF generation function here.
    });


    // --- Initialization ---
    showStep(0); // Show the first step initially
    // Initial visual updates based on default data
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

}); // End of DOMContentLoaded
