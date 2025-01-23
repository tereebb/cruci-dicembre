const cruciverbaData = [
    { parola: "PARTECIPARE", start: [0, 2], direzione: "orizzontale", 
descrizione: "Prendere parte attivamente a qualcosa.", classe: "blu", bloccate: [0, 7]},
    { parola: "ASSICURAZIONE", start: [1, 4], direzione: "orizzontale", 
descrizione: "Quella sanitaria.", classe: "azzurro", bloccate: [1, 7]},
    { parola: "Formazione", start: [2, 5], direzione: "orizzontale", 
descrizione: "Periodo precedente all'assunzione.", classe: "arancione", bloccate: [3, 4]},
    { parola: "INCARICO", start: [3, 3], direzione: "orizzontale", 
descrizione: "È diverso per ogni dipendente.", classe: "blu", bloccate: [1, 6]},
    { parola: "MOTIVAZIONE", start: [4, 4], direzione: "orizzontale", 
descrizione: "La forza che spinge una persona a raggiungere i propri obiettivi.", classe: "azzurro", bloccate: [4]},
{ parola: "COMUNICAZIONE", start: [5, 3], direzione: "orizzontale", 
descrizione: "Sinonimo di dialogo, scambio.", classe: "arancione", bloccate: [2, 6]},
   
   
];

window.onload = () => {
    createGrid();
    loadIndizi();
    setupControls();
};

/** Calcola la dimensione della griglia in base ai dati */
function calculateGridSize() {
    let maxRow = 0, maxCol = 0;

    cruciverbaData.forEach(({ parola, start, direzione }) => {
        const [row, col] = start;

        if (direzione === "orizzontale") {
            maxRow = Math.max(maxRow, row);
            maxCol = Math.max(maxCol, col + parola.length - 1);
        }
    });

    return { rows: maxRow + 1, cols: maxCol + 1 }; // Aggiungi 1 per includere l'indice 0
}

/** Crea la griglia del cruciverba */
function createGrid() {
    const cruciverbaContainer = document.getElementById('cruciverba');
    cruciverbaContainer.innerHTML = "";

    const { rows, cols } = calculateGridSize(); // Dimensioni dinamiche
    const grid = generateEmptyGrid(rows, cols);

    populateGrid(grid);
    renderGrid(grid, cruciverbaContainer);
}

/** Genera una griglia vuota */
function generateEmptyGrid(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(null));
}

/** Popola la griglia con i dati */
function populateGrid(grid) {
    cruciverbaData.forEach(({ parola, start, direzione, classe, bloccate }) => {
        const [row, col] = start;
        parola.split("").forEach((letter, index) => {
            if (direzione === "orizzontale") {
                grid[row][col + index] = { letter, classe, bloccata: bloccate?.includes(index) };
            }
        });
    });
}

/** Renderizza la griglia nel DOM */
function renderGrid(grid, container) {
    const inputs = [];
    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');

            if (cell) {
                const input = createInput(cell, rowIndex, colIndex, inputs);
                cellDiv.appendChild(input);
                cellDiv.classList.add(cell.classe);
            }
            if (colIndex === 6 && cell) {
                cellDiv.classList.add(cell.classe); // Aggiungi il colore del bordo della cella
                cellDiv.style.backgroundColor = getBorderColor(cell.classe); // Imposta lo stesso colore come background
            }

            container.appendChild(cellDiv);
        });
    });

    container.style.gridTemplateColumns = `repeat(${grid[0].length}, 1fr)`; // Colonne dinamiche
}

function getBorderColor(classe) {
    switch (classe) {
        case 'blu':
            return '#1c7792'; // Colore blu
        case 'azzurro':
            return '#00afca'; // Colore azzurro
        case 'arancione':
            return '#f2961d'; // Colore arancione
        default:
            return 'transparent'; // Colore di default
    }
}

/** Crea un elemento input per una cella */
function createInput(cell, row, col, inputs) {
    const input = document.createElement('input');
    input.setAttribute('maxlength', 1);
    input.setAttribute('style', 'text-transform: uppercase;');

    if (cell.bloccata) {
        input.value = cell.letter;
        input.disabled = true;
    } else {
        input.value = "";
    }

    input.dataset.row = row;
    input.dataset.col = col;

    setupInputEvents(input, row, col, inputs);
    inputs.push({ input, row, col });

    return input;
}

/** Configura gli eventi sugli input */
function setupInputEvents(input, row, col, inputs) {
    input.addEventListener('input', () => handleInput(input, row, col, inputs));
    input.addEventListener('keydown', (e) => handleBackspace(e, input, row, col, inputs));
}

/** Gestisce l'input di una cella */
function handleInput(input, row, col, inputs) {
    input.value = input.value.slice(-1); // Mantieni solo un carattere

    const nextInput = findNextInput(row, col, inputs);
    if (nextInput && input.value.trim()) {
        nextInput.focus();
    }
}

/** Trova l'input successivo */
function findNextInput(row, col, inputs) {
    let nextInput = inputs.find((el) => el.row === row && el.col === col + 1);

    while (nextInput && nextInput.input.disabled) {
        nextInput = inputs.find((el) => el.row === nextInput.row && el.col === nextInput.col + 1);
    }

    return nextInput?.input;
}

/** Gestisce il Backspace */
function handleBackspace(e, input, row, col, inputs) {
    if (e.key === "Backspace" && !input.value) {
        const prevInput = findPreviousInput(row, col, inputs);
        if (prevInput) {
            prevInput.focus();
        }
    }
}

/** Trova l'input precedente */
function findPreviousInput(row, col, inputs) {
    let prevInput = inputs.find((el) => el.row === row && el.col === col - 1);

    while (prevInput && prevInput.input.disabled) {
        prevInput = inputs.find((el) => el.row === prevInput.row && el.col === prevInput.col - 1);
    }

    return prevInput?.input;
}

/** Carica gli indizi nella lista */
function loadIndizi() {
    const indiziList = document.getElementById('indizi-list');
    indiziList.innerHTML = "";

    cruciverbaData.forEach(({ descrizione }, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${descrizione}`;
        indiziList.appendChild(li);
    });
}

/** Verifica gli errori nelle risposte */
function checkErrors() {
    const cells = document.querySelectorAll('.cell input');

    cells.forEach((input) => {
        const { row, col } = input.dataset;
        const cell = findCellData(row, col);

        if (cell) {
            const index = col - cell.start[1];
            const letteraCorretta = cell.parola[index].toUpperCase();
            const letteraInserita = input.value.toUpperCase();

            if (letteraInserita !== letteraCorretta) {
                input.parentElement.classList.add('error');
            } else {
                input.parentElement.classList.remove('error');
            }
        }
    });
}

/** Trova i dati di una cella nella griglia */
function findCellData(row, col) {
    return cruciverbaData.find(({ start, direzione, parola }) => {
        if (direzione === "orizzontale") {
            return (
                parseInt(row, 10) === start[0] &&
                parseInt(col, 10) >= start[1] &&
                parseInt(col, 10) < start[1] + parola.length
            );
        }
        return false;
    });
}

/** Configura i controlli */
function setupControls() {
    document.getElementById('check').addEventListener('click', checkErrors);
    document.getElementById('reset').addEventListener('click', () => location.reload());
}
