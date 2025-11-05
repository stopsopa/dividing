# Long Division Web Simulator - Implementation Plan

## Overview
A web-based interactive simulator for visualizing long division step-by-step, with preview and execution phases for each operation.

## Technology Stack
- **HTML5** - Structure and layout
- **CSS3** - Custom styling and grid system
- **Vanilla JavaScript** - Division logic and interactivity
- No build tools or frameworks required

## Project Structure
```
├── index.html      # Main HTML page
├── styles.css      # All styling and grid system
├── script.js       # Division algorithm and UI logic
└── CLAUDE.md       # This implementation plan
```

## Core Components

### 1. Grid System
The grid is the visual foundation for displaying the division process.

**Requirements:**
- Dynamic sizing based on input numbers
- Cell-based layout for placing individual digits
- Support for drawing lines (horizontal for division bar, horizontal for subtraction)
- Highlighting system for active digits/blocks
- Positioning system for quotient, dividend, divisor, and intermediate results

**Implementation:**
- Use CSS Grid or flexbox for layout
- Each digit/character occupies one cell
- Lines are rendered as borders or separate div elements
- Highlighting uses CSS classes applied dynamically

**Grid Layout Example:**
```
        4 2 5    ← Quotient (top)
     ________
  8 ) 3 4 0 0    ← Divisor | Dividend
    - 3 2        ← First subtraction
      ___
        2 0      ← Bring down
      - 1 6      ← Second subtraction
        ___
          4 0    ← Bring down
        - 4 0    ← Third subtraction
          ___
            0    ← Remainder
```

### 2. Division State Machine

**State Structure:**
```javascript
{
  dividend: string,          // Original dividend
  divisor: string,           // Original divisor
  quotient: string,          // Building quotient
  currentStep: number,       // Which step we're on
  phase: 'preview' | 'execute', // Preview or execute phase
  steps: Array,              // History of all steps
  workingDividend: string,   // Current portion being divided
  position: number,          // Current position in dividend
  remainder: number          // Current remainder
}
```

**Step Types:**
1. **Divide** - Determine how many times divisor goes into current working number
2. **Multiply** - Show divisor × quotient digit
3. **Subtract** - Subtract product from working dividend
4. **Bring Down** - Bring down next digit
5. **Complete** - Division is finished

**Two-Phase System:**
- **Preview Phase**: Highlight the numbers involved and show what operation will happen
- **Execute Phase**: Perform the operation and update the grid

### 3. Division Algorithm

**Process:**
1. Start with leftmost digit(s) of dividend that are ≥ divisor
2. For each step:
   - **Preview**: Highlight working dividend, show division will occur
   - **Execute**: Calculate quotient digit, write to quotient row
   - **Preview**: Show multiplication (divisor × quotient digit)
   - **Execute**: Write product below working dividend
   - **Preview**: Show subtraction line and numbers
   - **Execute**: Perform subtraction, show result
   - **Preview**: Highlight next digit to bring down (if any)
   - **Execute**: Bring down digit to remainder
3. Repeat until all digits processed
4. Final remainder (if any)

### 4. UI Components

**Input Section:**
- Dividend input field (text input, numbers only)
- Divisor input field (text input, numbers only)
- Start button to begin division
- Example problems dropdown

**Grid Display:**
- Dynamic grid showing current state
- Visual highlighting of active elements
- Lines for division bar and subtractions

**Navigation:**
- Forward button (with dynamic label: "Next Step" or "Execute")
- Backward button (disabled at start)
- Current step indicator (e.g., "Step 3 of 15")

**Info Panel:**
- Description of current/next operation
- Step history list (collapsible)

**Controls:**
- Reset button (start over with same numbers)
- New Problem button (clear and enter new numbers)

### 5. Styling Approach

**Grid Cells:**
- Monospace font for alignment
- Fixed cell size (e.g., 40px × 40px)
- Border for visualization during development

**Highlighting States:**
- `.highlight-preview` - Blue background for preview
- `.highlight-active` - Yellow background for active operation
- `.highlight-result` - Green background for results

**Lines:**
- Horizontal lines: border-top or border-bottom
- Division bar: thick top border on dividend row

**Responsive Design:**
- Center the grid on screen
- Scale font size for smaller screens
- Stack controls vertically on mobile

### 6. Features

**Must Have:**
- ✓ Two-phase step system (preview → execute)
- ✓ Forward/backward navigation
- ✓ Dynamic grid for any number size
- ✓ Visual highlighting
- ✓ Reset functionality
- ✓ Step history

**Nice to Have:**
- ✓ Example problems
- Animation transitions
- Keyboard shortcuts (arrow keys)
- Export step history as text
- Speed control (auto-play mode)

## Implementation Steps

### Phase 1: Structure (HTML)
1. Create basic HTML structure
2. Add input fields for dividend and divisor
3. Add navigation buttons (forward, backward, reset)
4. Create container for grid display
5. Add step info panel

### Phase 2: Styling (CSS)
1. Create grid system with CSS
2. Style input section
3. Style navigation buttons
4. Create highlighting classes
5. Add responsive layout
6. Style step history panel

### Phase 3: Core Logic (JavaScript)
1. Input validation and sanitization
2. Division state initialization
3. Implement division algorithm with step breakdown
4. Create grid rendering function
5. Implement step navigation (forward/backward)

### Phase 4: Visual Features
1. Highlighting system for active elements
2. Preview phase descriptions
3. Step history tracking and display
4. Line drawing for division bar and subtractions

### Phase 5: Polish
1. Add example problems
2. Improve error handling
3. Add animations/transitions
4. Test edge cases (divide by 1, 0 remainder, etc.)
5. Optimize performance for large numbers

## Algorithm Pseudocode

```javascript
function performLongDivision(dividend, divisor) {
  const steps = [];
  let workingNumber = 0;
  let position = 0;
  let quotient = '';

  while (position < dividend.length) {
    // Build working number
    workingNumber = workingNumber * 10 + parseInt(dividend[position]);

    if (workingNumber >= divisor) {
      // Preview: Show division
      steps.push({
        type: 'preview_divide',
        workingNumber,
        divisor
      });

      // Execute: Calculate quotient digit
      const quotientDigit = Math.floor(workingNumber / divisor);
      quotient += quotientDigit;
      steps.push({
        type: 'execute_divide',
        quotientDigit
      });

      // Preview: Show multiplication
      const product = quotientDigit * divisor;
      steps.push({
        type: 'preview_multiply',
        quotientDigit,
        divisor,
        product
      });

      // Execute: Write product
      steps.push({
        type: 'execute_multiply',
        product
      });

      // Preview: Show subtraction
      steps.push({
        type: 'preview_subtract',
        minuend: workingNumber,
        subtrahend: product
      });

      // Execute: Subtract
      workingNumber = workingNumber - product;
      steps.push({
        type: 'execute_subtract',
        remainder: workingNumber
      });
    } else {
      quotient += '0';
    }

    position++;

    // Preview: Bring down next digit (if exists)
    if (position < dividend.length) {
      steps.push({
        type: 'preview_bring_down',
        digit: dividend[position]
      });

      steps.push({
        type: 'execute_bring_down',
        digit: dividend[position]
      });
    }
  }

  return { quotient, remainder: workingNumber, steps };
}
```

## Testing Scenarios

1. **Simple division**: 84 ÷ 4 = 21
2. **With remainder**: 85 ÷ 4 = 21 R1
3. **Zeros in quotient**: 102 ÷ 3 = 34
4. **Large numbers**: 123456 ÷ 12 = 10288
5. **Single digit**: 9 ÷ 3 = 3
6. **Edge case**: 100 ÷ 10 = 10

## File Responsibilities

### index.html
- Page structure
- Input fields
- Grid container
- Navigation buttons
- Step info display
- Example problems dropdown

### styles.css
- Grid layout system
- Cell styling
- Highlighting classes
- Button styles
- Responsive design
- Line drawing styles

### script.js
- Division algorithm
- State management
- Grid rendering
- Event handlers
- Navigation logic
- Step history
- Example problems data

## Future Enhancements

1. **Decimal division** - Support for decimal results
2. **Multiplication simulator** - Similar step-by-step for multiplication
3. **Subtraction/Addition** - Expand to other operations
4. **Print/Export** - Generate PDF or image of solution
5. **Accessibility** - Screen reader support, keyboard navigation
6. **Themes** - Dark mode, color customization
7. **Localization** - Multiple language support
8. **Practice mode** - Quiz functionality where user must predict next step

## Notes

- Keep code modular and well-commented
- Prioritize clarity over performance for initial version
- Test thoroughly with various input combinations
- Consider edge cases (division by 1, very large numbers, etc.)
- Make sure highlighting is clear and intuitive
- Preview descriptions should be educational and clear
