// Espera a que todo el contenido del HTML esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN DEL TEST ---

    // 1. Definir las carreras técnicas
    const careers = {
        textil: 'Textiles y Confecciones',
        carpinteria: 'Carpintería en Madera y Metal',
        metalica: 'Mecánica Industrial',
        electricidad: 'Electricidad Industrial',
        electronica: 'Electrónica',
        automotriz: 'Mecánica Automotriz',
        sistemas: 'Sistemas Informáticos',
        gastronomia: 'Gastronomía'
    };

    // 2. Mapear qué preguntas afectan a qué carreras
    // Cada número de pregunta corresponde a una o más claves de 'careers'
    const questionMapping = {
        // Todas las carreras consideran intereses de creación, precisión e innovación según su área técnica.
        1: ['textil', 'carpinteria', 'metalica', 'gastronomia'], 2: ['textil', 'electronica', 'sistemas', 'gastronomia'], 3: ['textil', 'carpinteria', 'metalica', 'electricidad', 'electronica', 'automotriz', 'sistemas', 'gastronomia'], 4: ['textil', 'carpinteria', 'metalica', 'electronica', 'sistemas', 'gastronomia'], 5: ['textil', 'carpinteria', 'metalica', 'electronica', 'automotriz', 'sistemas', 'gastronomia'],
        6: ['carpinteria', 'metalica', 'gastronomia'], 7: ['carpinteria', 'metalica', 'electricidad', 'electronica', 'automotriz', 'sistemas', 'gastronomia'], 8: ['carpinteria', 'metalica', 'electricidad', 'automotriz'], 9: ['carpinteria', 'metalica', 'automotriz', 'gastronomia'], 10: ['carpinteria', 'metalica', 'automotriz', 'gastronomia'],
        11: ['electricidad'], 12: ['electricidad', 'electronica'], 13: ['electricidad', 'electronica'], 14: ['electricidad', 'automotriz'], 15: ['electricidad'],
        16: ['electronica'], 17: ['electronica', 'sistemas'], 18: ['electronica', 'sistemas', 'gastronomia'], 19: ['electronica', 'automotriz'], 20: ['electronica', 'sistemas', 'gastronomia'],
        21: ['automotriz'], 22: ['automotriz'], 23: ['automotriz'], 24: ['automotriz', 'electronica'], 25: ['automotriz'],
        26: ['metalica'], 27: ['metalica'], 28: ['metalica'], 29: ['metalica', 'carpinteria'], 30: ['metalica'],
        31: ['sistemas'], 32: ['sistemas'], 33: ['sistemas', 'electronica'], 34: ['sistemas'], 35: ['sistemas']
    };

    // 3. Asignar puntos a cada respuesta
    const pointValues = {
        mucho: 3,
        algo: 2,
        poco: 1,
        nada: 0
    };
    const TOTAL_QUESTIONS = 35;

    // Verificación interna: evita resultados incorrectos si se edita el test más adelante.
    const configurationIsValid = () => {
        const missingQuestions = [];
        const unknownCareers = [];

        for (let question = 1; question <= TOTAL_QUESTIONS; question++) {
            if (!questionMapping[question]) missingQuestions.push(question);
            (questionMapping[question] || []).forEach((career) => {
                if (!careers[career]) unknownCareers.push(career);
            });
        }

        if (missingQuestions.length || unknownCareers.length) {
            console.error('Configuración del test incompleta.', { missingQuestions, unknownCareers });
            return false;
        }
        return true;
    };

    // --- LÓGICA DEL FORMULARIO ---

    // Obtener los elementos del HTML con los que vamos a trabajar
    const form = document.getElementById('vocational-test-form');
    const resultsContainer = document.getElementById('results-container');
    const result1Elem = document.getElementById('result-1');
    const result2Elem = document.getElementById('result-2');
    const result3Elem = document.getElementById('result-3');
    const themeToggle = document.getElementById('theme-toggle');
    const progressCount = document.getElementById('progress-count');
    const progressBar = document.getElementById('progress-bar');
    const progressTrack = document.querySelector('.progress-track');

    // Las áreas no se muestran durante el test: se mezclan las preguntas y se
    // numeran en el orden visible para evitar que el estudiante identifique bloques.
    const shuffle = (items) => {
        for (let index = items.length - 1; index > 0; index--) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
        }
        return items;
    };

    const submitButton = form.querySelector('.submit-btn');
    const shuffledCards = shuffle([...form.querySelectorAll('.question-card')]);
    shuffledCards.forEach((card, index) => {
        const title = card.querySelector('.question-title');
        const questionText = title.textContent.replace(/^\s*\d+\.\s*/, '').trim();
        title.innerHTML = `<span class="question-number">Pregunta ${index + 1}</span>${questionText}`;
        form.insertBefore(card, submitButton);
    });

    // Mantener la preferencia de color entre visitas y ofrecer un modo oscuro legible.
    const setTheme = (theme) => {
        document.body.dataset.theme = theme;
        const dark = theme === 'dark';
        themeToggle.setAttribute('aria-pressed', String(dark));
        themeToggle.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
        themeToggle.querySelector('.theme-icon').textContent = dark ? 'light_mode' : 'dark_mode';
        themeToggle.querySelector('.theme-text').textContent = dark ? 'Modo claro' : 'Modo oscuro';
        localStorage.setItem('bth-theme', theme);
    };

    const savedTheme = localStorage.getItem('bth-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
    });

    // Actualizar el avance al responder y destacar cada tarjeta completada.
    const updateProgress = () => {
        const answered = form.querySelectorAll('input[type="radio"]:checked').length;
        progressCount.textContent = answered;
        progressBar.style.width = `${(answered / TOTAL_QUESTIONS) * 100}%`;
        progressTrack.setAttribute('aria-valuenow', answered);
        document.querySelectorAll('.question-card').forEach((card) => {
            card.classList.toggle('is-answered', Boolean(card.querySelector('input:checked')));
        });
    };

    form.addEventListener('change', updateProgress);
    updateProgress();
    configurationIsValid();

    // Escuchar el evento 'submit' cuando el usuario haga clic en el botón
    form.addEventListener('submit', (event) => {
        // Prevenir que la página se recargue (comportamiento por defecto del formulario)
        event.preventDefault();

        // Doble validación por seguridad, incluso si el envío se activa por código.
        const firstUnanswered = Array.from({ length: TOTAL_QUESTIONS }, (_, index) => index + 1)
            .find((question) => !form.querySelector(`input[name="pregunta${question}"]:checked`));

        if (firstUnanswered) {
            const firstQuestion = form.querySelector(`input[name="pregunta${firstUnanswered}"]`);
            firstQuestion?.closest('.question-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstQuestion?.focus();
            return;
        }

        if (!configurationIsValid()) return;

        // Inicializar un objeto para guardar los puntajes de cada carrera en cero
        const scores = Object.fromEntries(Object.keys(careers).map((key) => [key, 0]));

        // Recorrer todas las 35 preguntas para calcular los puntos
        for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
            // Encontrar la respuesta seleccionada para la pregunta actual
            const selectedOption = form.querySelector(`input[name="pregunta${i}"]:checked`);
            
            if (selectedOption) {
                const answerValue = selectedOption.value; // 'mucho', 'algo', 'poco', 'nada'
                const points = pointValues[answerValue] || 0; // Obtener los puntos para esa respuesta
                const affectedCareers = questionMapping[i]; // Obtener las carreras afectadas por esta pregunta

                // Sumar los puntos a cada carrera afectada
                if (affectedCareers) {
                    affectedCareers.forEach(careerKey => {
                        scores[careerKey] += points;
                    });
                }
            }
        }

        // Convertir el objeto de puntajes en un array para poder ordenarlo
        const sortedCareers = Object.keys(scores).map((key) => ({
            key,
            name: careers[key],
            score: scores[key]
        })).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'es')); // Ordenar de mayor a menor puntaje

        // Obtener las tres carreras con mayor puntaje
        const topCareer1 = sortedCareers[0];
        const topCareer2 = sortedCareers[1];
        const topCareer3 = sortedCareers[2];

        // Mostrar los resultados en el HTML
        result1Elem.innerHTML = `<strong>Opción 1:</strong> ${topCareer1.name} con <strong>${topCareer1.score}</strong> puntos.`;
        result2Elem.innerHTML = `<strong>Opción 2:</strong> ${topCareer2.name} con <strong>${topCareer2.score}</strong> puntos.`;
        result3Elem.innerHTML = `<strong>Opción 3:</strong> ${topCareer3.name} con <strong>${topCareer3.score}</strong> puntos.`;

        // Hacer visible la tarjeta de resultados y desplazar la vista hacia ella
        resultsContainer.classList.remove('hidden');
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});
