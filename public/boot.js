/**
 * boot.js
 * Handles the boot animation sequence and mini terminal logic.
 */

const bootLogs = [
  "Initializing kernel",
  "Mounting filesystem",
  "Starting services",
  "Loading AI Modules",
  "Portfolio Ready"
];

const finalMessage = `
------------------------------------------
Welcome, Visitor
Portfolio Boot Complete
Launching Interface...
------------------------------------------`;

// Helper to pause execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Checks whether to skip the boot animation
 * @returns {boolean} True if animation should be skipped
 */
function shouldSkipBoot() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return true;

  if (sessionStorage.getItem('sos_os_booted') === 'true') {
    return true;
  }

  return false;
}

/**
 * Main function to start the boot sequence
 */
async function startBootSequence() {
  const bootScreen = document.getElementById('boot-screen');
  const container = document.getElementById('boot-log-container');
  
  if (!bootScreen || !container) return;

  if (shouldSkipBoot()) {
    bootScreen.style.display = 'none';
    initMiniTerminal();
    return;
  }

  // Ensure boot screen is visible
  bootScreen.style.display = 'flex';

  let activeCursor = null;

    for (let i = 0; i < bootLogs.length; i++) {
    const text = bootLogs[i];
    const isLast = i === bootLogs.length - 1;
    
    const lineEl = document.createElement('div');
    lineEl.className = 'boot-log-line';
    
    let statusSpan = document.createElement('span');
    statusSpan.className = 'boot-status';
    statusSpan.textContent = '[....] ';
    lineEl.appendChild(statusSpan);
    
    const textSpan = document.createElement('span');
    textSpan.textContent = '';
    lineEl.appendChild(textSpan);
    
    const cursor = document.createElement('span');
    cursor.className = 'boot-cursor';
    lineEl.appendChild(cursor);
    
    container.appendChild(lineEl);
    
    // Auto-scroll to bottom
    bootScreen.scrollTop = bootScreen.scrollHeight;

    // Type text character by character
    for (let j = 0; j < text.length; j++) {
      textSpan.textContent += text[j];
      await sleep(15 + Math.random() * 20); 
    }

    if (statusSpan) {
      await sleep(80 + Math.random() * 150);
      statusSpan.textContent = isLast ? '[DONE] ' : '[ OK ] ';
    } else {
      await sleep(100);
    }
    
    if (activeCursor) activeCursor.remove();
    activeCursor = cursor;
  }

  await sleep(400);

  // Print final message
  const finalEl = document.createElement('div');
  finalEl.className = 'boot-log-line';
  finalEl.style.whiteSpace = 'pre';
  finalEl.style.color = '#fff';
  finalEl.textContent = finalMessage;
  container.appendChild(finalEl);

  const finalCursor = document.createElement('span');
  finalCursor.className = 'boot-cursor';
  finalEl.appendChild(finalCursor);
  bootScreen.scrollTop = bootScreen.scrollHeight;

  // Hold before launching interface
  await sleep(1200);
  
  // Mark as booted for this session
  sessionStorage.setItem('sos_os_booted', 'true');
  
  // Scroll to top to ensure home section is showing first
  window.scrollTo(0, 0);
  // Slide up to reveal portfolio
  bootScreen.classList.add('boot-fade-out');
  
  // Let the CSS animation finish then hide and init terminal
  setTimeout(() => {
    bootScreen.style.display = 'none';
    initMiniTerminal();
  }, 1000);
}

/**
 * Initializes the mini terminal that appears after boot
 */
function initMiniTerminal() {
  const miniTerm = document.getElementById('mini-terminal');
  if (!miniTerm) return;

  miniTerm.classList.add('visible');
  const miniLog = document.getElementById('mini-terminal-log');
  
  const defaultPrompt = `<span class="mini-term-prefix">user@saketh:~$</span> <span class="boot-cursor" style="height: 1.1em; width: 8px;"></span>`;
  miniLog.innerHTML = defaultPrompt;

  // Listen to hover events to change mini terminal logs
  document.addEventListener('mouseover', (e) => {
    // Only capture things that look clickable or represent a section
    const target = e.target.closest('section, a, button, .project-card, .skill-item, [role="button"]');
    if (target) {
      let actionText = '';
      
      if (target.tagName.toLowerCase() === 'section') {
        const id = target.getAttribute('id');
        if (id) actionText = `Entering ${id}...`;
      } else if (target.tagName.toLowerCase() === 'a') {
        const href = target.getAttribute('href');
        if (href && href.startsWith('#')) {
          actionText = `Navigating to ${href}...`;
        } else {
          actionText = `Analyzing link...`;
        }
      } else if (target.tagName.toLowerCase() === 'button' || target.getAttribute('role') === 'button') {
        actionText = `Executing action...`;
      } else if (target.classList && target.classList.contains('project-card')) {
        actionText = `Opening Project...`;
      } else if (target.classList && target.classList.contains('skill-item')) {
        actionText = `Loading Skill...`;
      }

      if (actionText) {
        miniLog.innerHTML = `<span class="mini-term-prefix">user@saketh:~$</span> ${actionText} <span class="boot-cursor" style="height: 1.1em; width: 8px;"></span>`;
      }
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('section, a, button, .project-card, .skill-item, [role="button"]');
    if (target) {
      miniLog.innerHTML = defaultPrompt;
    }
  });
}

// Kick off when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window !== 'undefined') {
    startBootSequence();
  }
});
