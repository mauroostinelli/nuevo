// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const steps = document.querySelectorAll('.step');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressStepText = document.getElementById('progress-step-text');
    const stepsContainer = document.getElementById('steps-container'); // Para posible scroll

    // --- State ---
    let currentStep = 0;
    const totalSteps = steps.length;

    // --- Functions ---

    /**
     * Muestra el paso especificado y oculta los demás.
     * Actualiza la barra de progreso y los botones.
     * @param {number} stepIndex - El índice del paso a mostrar.
     */
    function showStep(stepIndex) {
        // 1. Ocultar todos los pasos
        steps.forEach((step, index) => {
            step.classList.remove('active');
            // Opcional: Añadir/quitar clases para animaciones de salida si es necesario
        });

        // 2. Mostrar el paso actual
        if (steps[stepIndex]) {
            steps[stepIndex].classList.add('active');
            currentStep = stepIndex; // Actualizar el estado global

            // Opcional: Scroll al inicio del contenedor de pasos
            // stepsContainer.scrollTop = 0; // o window.scrollTo(0, stepsContainer.offsetTop);
        } else {
            console.error("Índice de paso inválido:", stepIndex);
            return; // Salir si el índice no es válido
        }

        // 3. Actualizar la barra de progreso
        updateProgressBar();

        // 4. Actualizar el texto del indicador de paso
        updateStepText();

        // 5. Actualizar el estado de los botones
        updateButtons();
    }

    /**
     * Actualiza el ancho de la barra de progreso y el texto asociado.
     */
    function updateProgressBar() {
        const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    /**
     * Actualiza el texto que indica el paso actual (ej. "Paso 2 de 8").
     */
    function updateStepText() {
        progressStepText.textContent = `Paso ${currentStep + 1} de ${totalSteps}`;
    }


    /**
     * Habilita/deshabilita los botones de navegación según el paso actual.
     */
    function updateButtons() {
        // Botón Anterior: Deshabilitado en el primer paso
        prevBtn.disabled = currentStep === 0;

        // Botón Siguiente:
        // - Cambiar texto a "Finalizar" en el último paso (antes del final)
        // - Deshabilitar en el último paso si no hay más acción
        if (currentStep === totalSteps - 1) {
            nextBtn.textContent = 'Finalizar Diseño'; // O simplemente deshabilitar
            // nextBtn.disabled = true; // Descomentar si no hay acción después del último paso
        } else {
            nextBtn.textContent = 'Siguiente';
            nextBtn.disabled = false;
        }
    }

    // --- Event Listeners ---

    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps - 1) {
            showStep(currentStep + 1);
        } else {
            // Acción para el botón "Finalizar Diseño"
            console.log('Diseño Finalizado! Mostrando resumen...');
            // Aquí podrías llamar a una función para generar el dashboard/resumen
            // O simplemente dejarlo así si el último paso YA es el resumen.
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            showStep(currentStep - 1);
        }
    });

    // --- Initialization ---
    showStep(0); // Mostrar el primer paso al cargar la página

}); // Fin del DOMContentLoaded
