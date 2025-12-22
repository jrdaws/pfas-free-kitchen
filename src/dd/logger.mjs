/**
 * Simple structured logger with timing support
 */

let quietMode = false;
const timings = new Map();

export function setQuiet(quiet) {
  quietMode = quiet;
}

export function log(message) {
  if (!quietMode) {
    console.log(message);
  }
}

export function error(message) {
  // Always show errors, even in quiet mode
  console.error(message);
}

export function startStep(stepId, message) {
  if (!quietMode) {
    console.log(message);
  }
  timings.set(stepId, Date.now());
}

export function endStep(stepId, message) {
  const startTime = timings.get(stepId);
  const elapsed = startTime ? Date.now() - startTime : 0;
  timings.delete(stepId);

  if (!quietMode) {
    console.log(`${message} (${elapsed}ms)`);
  }
}

export function stepSuccess(message) {
  if (!quietMode) {
    console.log(`     ✓ ${message}`);
  }
}

export function stepWarning(message) {
  if (!quietMode) {
    console.log(`     ⚠️  ${message}`);
  }
}

export function stepInfo(message) {
  if (!quietMode) {
    console.log(`     ${message}`);
  }
}

export function stepError(message) {
  // Always show errors
  console.error(`     ✗ ${message}`);
}

/**
 * Format a step header with progress indicator
 * @param {number} current - Current step number
 * @param {number} total - Total steps
 * @param {string} title - Step title
 * @returns {string} Formatted step header
 */
export function formatStep(current, total, title) {
  return `[${current}/${total}] ${title}`;
}

/**
 * Display a standardized error message with optional recovery guidance
 * Follows the pattern: What went wrong → Why → How to fix
 *
 * @param {string} message - Primary error message
 * @param {object} options - Error options
 * @param {string[]} options.reasons - Possible reasons for the error
 * @param {string[]} options.solutions - Actionable solutions
 * @param {boolean} options.exit - Whether to exit process (default: true)
 * @param {number} options.exitCode - Exit code if exiting (default: 1)
 *
 * @example
 * showError('Project not found', {
 *   reasons: [
 *     'Token is incorrect or misspelled',
 *     'Project was deleted',
 *     'Token has expired'
 *   ],
 *   solutions: [
 *     'Check the token is correct',
 *     'Create a new project at https://dawson.dev'
 *   ]
 * })
 */
export function showError(message, options = {}) {
  const {
    reasons = [],
    solutions = [],
    exit = true,
    exitCode = 1
  } = options

  // Always show error message (even in quiet mode)
  console.error(`\n❌ ${message}`)

  // Show possible reasons if provided
  if (reasons.length > 0) {
    console.log('\nPossible reasons:')
    reasons.forEach(reason => {
      console.log(`  • ${reason}`)
    })
  }

  // Show solutions if provided
  if (solutions.length > 0) {
    console.log('\n💡 Solutions:')
    solutions.forEach((solution, index) => {
      console.log(`  ${index + 1}. ${solution}`)
    })
  }

  console.log('') // Empty line for spacing

  if (exit) {
    process.exit(exitCode)
  }
}

/**
 * Display a standardized warning message
 *
 * @param {string} message - Warning message
 * @param {object} options - Warning options
 * @param {string[]} options.details - Additional details
 * @param {string[]} options.suggestions - Optional suggestions
 *
 * @example
 * showWarning('Directory already exists', {
 *   details: ['./my-app contains 5 files'],
 *   suggestions: ['Use --force to overwrite', 'Choose a different directory']
 *   })
 */
export function showWarning(message, options = {}) {
  const { details = [], suggestions = [] } = options

  console.log(`\n⚠️  ${message}`)

  if (details.length > 0) {
    console.log('')
    details.forEach(detail => {
      console.log(`  ${detail}`)
    })
  }

  if (suggestions.length > 0) {
    console.log('\nSuggestions:')
    suggestions.forEach((suggestion, index) => {
      console.log(`  ${index + 1}. ${suggestion}`)
    })
  }

  console.log('') // Empty line for spacing
}

/**
 * Display a standardized info message with optional details
 *
 * @param {string} message - Info message
 * @param {object} options - Info options
 * @param {string[]} options.details - Additional details to display
 *
 * @example
 * showInfo('Configuration loaded', {
 *   details: ['Template: saas', 'Integrations: 3 active']
 * })
 */
export function showInfo(message, options = {}) {
  const { details = [] } = options

  console.log(`\nℹ️  ${message}`)

  if (details.length > 0) {
    console.log('')
    details.forEach(detail => {
      console.log(`  ${detail}`)
    })
    console.log('')
  }
}

/**
 * Display a standardized success message
 *
 * @param {string} message - Success message
 * @param {object} options - Success options
 * @param {string[]} options.details - Additional details
 * @param {string[]} options.nextSteps - Suggested next steps
 *
 * @example
 * showSuccess('Project created successfully', {
 *   details: ['Location: ./my-app', 'Template: saas'],
 *   nextSteps: ['cd my-app', 'npm install', 'npm run dev']
 * })
 */
export function showSuccess(message, options = {}) {
  const { details = [], nextSteps = [] } = options

  console.log(`\n✅ ${message}`)

  if (details.length > 0) {
    console.log('')
    details.forEach(detail => {
      console.log(`  ${detail}`)
    })
  }

  if (nextSteps.length > 0) {
    console.log('\nNext steps:')
    nextSteps.forEach(step => {
      console.log(`  ${step}`)
    })
  }

  console.log('')
}
