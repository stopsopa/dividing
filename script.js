// ===== State Management =====
const state = {
    dividend: '',
    divisor: '',
    steps: [],
    currentStepIndex: -1,
    isActive: false,
    workHistory: [] // Track all work rows for rendering
};

// ===== DOM Elements =====
const elements = {
    dividend: document.getElementById('dividend'),
    divisor: document.getElementById('divisor'),
    startBtn: document.getElementById('startBtn'),
    examples: document.getElementById('examples'),
    gridContainer: document.getElementById('gridContainer'),
    navigationSection: document.getElementById('navigationSection'),
    infoSection: document.getElementById('infoSection'),
    forwardBtn: document.getElementById('forwardBtn'),
    backwardBtn: document.getElementById('backwardBtn'),
    resetBtn: document.getElementById('resetBtn'),
    newProblemBtn: document.getElementById('newProblemBtn'),
    stepInfo: document.getElementById('stepInfo'),
    stepDescription: document.getElementById('stepDescription'),
    historyList: document.getElementById('historyList'),
    historyHeader: document.getElementById('historyHeader'),
    historyContent: document.getElementById('historyContent'),
    toggleHistory: document.getElementById('toggleHistory')
};

// ===== Event Listeners =====
elements.startBtn.addEventListener('click', startDivision);
elements.forwardBtn.addEventListener('click', stepForward);
elements.backwardBtn.addEventListener('click', stepBackward);
elements.resetBtn.addEventListener('click', resetDivision);
elements.newProblemBtn.addEventListener('click', newProblem);
elements.examples.addEventListener('change', loadExample);
elements.historyHeader.addEventListener('click', toggleHistory);

// Only allow numbers in input fields
elements.dividend.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});
elements.divisor.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

// ===== Main Functions =====

function startDivision() {
    const dividend = elements.dividend.value.trim();
    const divisor = elements.divisor.value.trim();

    // Validation
    if (!dividend || !divisor) {
        alert('Please enter both dividend and divisor');
        return;
    }

    const dividendNum = parseInt(dividend);
    const divisorNum = parseInt(divisor);

    if (divisorNum === 0) {
        alert('Cannot divide by zero');
        return;
    }

    if (dividendNum === 0) {
        alert('Dividend cannot be zero');
        return;
    }

    // Initialize state
    state.dividend = dividend;
    state.divisor = divisor;
    state.steps = generateSteps(dividend, divisor);
    state.currentStepIndex = -1;
    state.isActive = true;

    // Show navigation and info sections
    elements.navigationSection.style.display = 'block';
    elements.infoSection.style.display = 'block';

    // Update UI
    updateStepInfo();
    updateButtons();
    renderInitialGrid();
    clearHistory();

    // Set description for initial state
    elements.stepDescription.textContent = `Ready to divide ${dividend} by ${divisor}. Click "Forward" to begin.`;
}

function generateSteps(dividend, divisor) {
    const steps = [];
    const divisorNum = parseInt(divisor);
    let workingNumber = 0;
    let position = 0;
    let quotient = '';
    const workRows = []; // Track all work rows
    let currentRow = 0;
    let indentLevel = 0; // Track indentation for each operation

    // Initial step - show the problem
    steps.push({
        type: 'initial',
        description: 'Starting long division',
        gridState: {
            dividend,
            divisor,
            quotient: '',
            workRows: [],
            highlight: null
        }
    });

    while (position < dividend.length) {
        const digit = parseInt(dividend[position]);
        workingNumber = workingNumber * 10 + digit;

        // Preview: Bring down (except first digit when starting fresh)
        if (position > 0 || quotient.length > 0) {
            steps.push({
                type: 'preview_bring_down',
                description: `We bring down the digit ${digit} to make ${workingNumber}`,
                gridState: {
                    dividend,
                    divisor,
                    quotient,
                    workRows: [...workRows],
                    highlight: { type: 'bring_down', dividendPos: position }
                }
            });

            steps.push({
                type: 'execute_bring_down',
                description: `Now we have ${workingNumber} to work with`,
                gridState: {
                    dividend,
                    divisor,
                    quotient,
                    workRows: [...workRows],
                    highlight: { type: 'working', value: workingNumber, indent: indentLevel, dividendPos: position }
                }
            });
        }

        // Can we divide?
        if (workingNumber >= divisorNum) {
            const quotientDigit = Math.floor(workingNumber / divisorNum);
            const product = quotientDigit * divisorNum;

            // Preview: Division
            steps.push({
                type: 'preview_divide',
                description: `How many times does ${divisorNum} go into ${workingNumber}? Answer: ${quotientDigit}`,
                gridState: {
                    dividend,
                    divisor,
                    quotient,
                    workRows: [...workRows],
                    highlight: { type: 'divide_preview', workingNumber, divisorNum, quotientDigit, quotientPos: quotient.length }
                }
            });

            // Execute: Write quotient digit
            quotient += quotientDigit;
            steps.push({
                type: 'execute_divide',
                description: `Write ${quotientDigit} in the quotient`,
                gridState: {
                    dividend,
                    divisor,
                    quotient,
                    workRows: [...workRows],
                    highlight: { type: 'quotient_digit', quotientPos: quotient.length - 1 }
                }
            });

            // Preview: Multiplication
            steps.push({
                type: 'preview_multiply',
                description: `Multiply: ${quotientDigit} × ${divisorNum} = ${product}`,
                gridState: {
                    dividend,
                    divisor,
                    quotient,
                    workRows: [...workRows],
                    highlight: { type: 'multiply_preview', quotientDigit, divisorNum, product }
                }
            });

            // Execute: Write product
            workRows.push({
                type: 'product',
                value: product.toString(),
                indent: indentLevel,
                dividendPos: position
            });
            steps.push({
                type: 'execute_multiply',
                description: `Write ${product} below`,
                gridState: {
                    dividend,
                    divisor,
                    quotient,
                    workRows: [...workRows],
                    highlight: { type: 'product_written', rowIndex: workRows.length - 1 }
                }
            });

            // Preview: Subtraction
            const difference = workingNumber - product;
            steps.push({
                type: 'preview_subtract',
                description: `Subtract: ${workingNumber} - ${product} = ${difference}`,
                gridState: {
                    dividend,
                    divisor,
                    quotient,
                    workRows: [...workRows],
                    highlight: { type: 'subtract_preview', rowIndex: workRows.length - 1 }
                }
            });

            // Execute: Show subtraction result
            workRows.push({
                type: 'line',
                indent: indentLevel,
                dividendPos: position
            });
            workRows.push({
                type: 'remainder',
                value: difference.toString(),
                indent: indentLevel,
                dividendPos: position
            });
            workingNumber = difference;
            indentLevel++;

            steps.push({
                type: 'execute_subtract',
                description: `The remainder is ${workingNumber}`,
                gridState: {
                    dividend,
                    divisor,
                    quotient,
                    workRows: [...workRows],
                    highlight: { type: 'remainder_shown', rowIndex: workRows.length - 1 }
                }
            });

        } else {
            // Can't divide, add 0 to quotient
            if (quotient.length > 0) {
                steps.push({
                    type: 'preview_zero',
                    description: `${divisorNum} doesn't go into ${workingNumber}, so write 0`,
                    gridState: {
                        dividend,
                        divisor,
                        quotient,
                        workRows: [...workRows],
                        highlight: { type: 'zero_preview', workingNumber, divisorNum, quotientPos: quotient.length }
                    }
                });

                quotient += '0';
                steps.push({
                    type: 'execute_zero',
                    description: `Wrote 0 in the quotient`,
                    gridState: {
                        dividend,
                        divisor,
                        quotient,
                        workRows: [...workRows],
                        highlight: { type: 'quotient_digit', quotientPos: quotient.length - 1 }
                    }
                });
            }
        }

        position++;
    }

    // Final step
    const finalRemainder = workingNumber;
    steps.push({
        type: 'complete',
        description: `Division complete! ${dividend} ÷ ${divisor} = ${quotient}${finalRemainder > 0 ? ` R${finalRemainder}` : ''}`,
        gridState: {
            dividend,
            divisor,
            quotient,
            workRows: [...workRows],
            highlight: { type: 'complete', finalRemainder }
        }
    });

    return steps;
}

function stepForward() {
    if (state.currentStepIndex < state.steps.length - 1) {
        state.currentStepIndex++;
        const step = state.steps[state.currentStepIndex];

        // Update display
        elements.stepDescription.textContent = step.description;
        renderGrid(step);
        updateStepInfo();
        updateButtons();
        addToHistory(step.description);
    }
}

function stepBackward() {
    if (state.currentStepIndex > 0) {
        state.currentStepIndex--;
        const step = state.steps[state.currentStepIndex];

        // Update display
        elements.stepDescription.textContent = step.description;
        renderGrid(step);
        updateStepInfo();
        updateButtons();
        removeLastHistory();
    }
}

function resetDivision() {
    state.currentStepIndex = -1;
    updateStepInfo();
    updateButtons();
    renderInitialGrid();
    clearHistory();
    elements.stepDescription.textContent = `Ready to divide ${state.dividend} by ${state.divisor}. Click "Forward" to begin.`;
}

function newProblem() {
    state.isActive = false;
    state.steps = [];
    state.currentStepIndex = -1;

    elements.dividend.value = '';
    elements.divisor.value = '';
    elements.examples.value = '';

    elements.navigationSection.style.display = 'none';
    elements.infoSection.style.display = 'none';

    renderInitialGrid();
}

function loadExample() {
    const value = elements.examples.value;
    if (value) {
        const [dividend, divisor] = value.split(',');
        elements.dividend.value = dividend;
        elements.divisor.value = divisor;
    }
}

// ===== Grid Rendering =====

function renderInitialGrid() {
    elements.gridContainer.innerHTML = '<p class="placeholder-text">Click "Forward" to begin the division process</p>';
}

function renderGrid(step) {
    const { gridState } = step;

    if (!gridState) {
        renderInitialGrid();
        return;
    }

    const { dividend, divisor, quotient, workRows, highlight } = gridState;

    let html = '<div class="division-grid">';

    // Quotient row
    html += '<div class="grid-row quotient-row">';
    html += `<div class="grid-cell" style="min-width: ${(divisor.length + 2) * 40}px;"></div>`;

    for (let i = 0; i < dividend.length; i++) {
        const digit = i < quotient.length ? quotient[i] : '';
        const isHighlighted = highlight?.type === 'quotient_digit' && highlight.quotientPos === i;
        html += `<div class="grid-cell ${isHighlighted ? 'highlight-result' : ''}">${digit || '&nbsp;'}</div>`;
    }
    html += '</div>';

    // Division bar and dividend row
    html += '<div class="grid-row">';
    html += `<div class="grid-cell divisor-cell">${divisor} )</div>`;

    for (let i = 0; i < dividend.length; i++) {
        const digit = dividend[i];
        const isHighlighted = highlight?.type === 'bring_down' && highlight.dividendPos === i;
        html += `<div class="grid-cell ${isHighlighted ? 'highlight-preview' : ''}" style="border-top: 3px solid #333;">${digit}</div>`;
    }
    html += '</div>';

    // Work rows (products, remainders, etc.)
    for (let i = 0; i < workRows.length; i++) {
        const row = workRows[i];
        const isHighlighted = highlight?.rowIndex === i;

        if (row.type === 'line') {
            html += '<div class="grid-row">';
            html += `<div class="grid-cell" style="min-width: ${(divisor.length + 2) * 40}px;"></div>`;

            // Add spacing for indent
            for (let j = 0; j < row.indent; j++) {
                html += '<div class="grid-cell"></div>';
            }

            // Draw the line across the relevant cells
            const lineWidth = Math.min(row.value?.length || 2, dividend.length - row.indent);
            for (let j = 0; j < lineWidth; j++) {
                html += '<div class="grid-cell" style="border-bottom: 2px solid #333;"></div>';
            }

            html += '</div>';
        } else {
            html += '<div class="grid-row">';
            html += `<div class="grid-cell" style="min-width: ${(divisor.length + 2) * 40}px;"></div>`;

            // Add spacing for indent
            for (let j = 0; j < row.indent; j++) {
                html += '<div class="grid-cell"></div>';
            }

            // Add a minus sign for product rows
            if (row.type === 'product') {
                html += '<div class="grid-cell" style="min-width: 20px;">-</div>';
            } else {
                html += '<div class="grid-cell" style="min-width: 20px;"></div>';
            }

            // Add the digits
            const digits = row.value.split('');
            for (let j = 0; j < digits.length; j++) {
                const cellHighlight = isHighlighted ? (
                    highlight.type === 'product_written' ? 'highlight-active' :
                    highlight.type === 'remainder_shown' ? 'highlight-result' :
                    ''
                ) : '';
                html += `<div class="grid-cell ${cellHighlight}">${digits[j]}</div>`;
            }

            html += '</div>';
        }
    }

    html += '</div>';
    elements.gridContainer.innerHTML = html;
}

// ===== UI Updates =====

function updateStepInfo() {
    const current = state.currentStepIndex + 1;
    const total = state.steps.length;
    elements.stepInfo.textContent = `Step ${current} of ${total}`;
}

function updateButtons() {
    // Backward button
    elements.backwardBtn.disabled = state.currentStepIndex <= 0;

    // Forward button
    elements.forwardBtn.disabled = state.currentStepIndex >= state.steps.length - 1;
}

// ===== History Management =====

function addToHistory(description) {
    const li = document.createElement('li');
    li.textContent = description;
    elements.historyList.appendChild(li);

    // Auto-scroll to bottom
    elements.historyContent.scrollTop = elements.historyContent.scrollHeight;
}

function removeLastHistory() {
    if (elements.historyList.lastChild) {
        elements.historyList.removeChild(elements.historyList.lastChild);
    }
}

function clearHistory() {
    elements.historyList.innerHTML = '';
}

function toggleHistory() {
    const isOpen = elements.historyContent.style.display === 'block';
    elements.historyContent.style.display = isOpen ? 'none' : 'block';
    elements.toggleHistory.classList.toggle('open');
}

// ===== Initialize =====
console.log('Long Division Simulator loaded successfully');
