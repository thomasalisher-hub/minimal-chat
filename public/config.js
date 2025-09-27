// CONFIGURATION FILE - MINIMALCHAT TERMINAL
const TerminalConfig = {
    // TERMINAL DISPLAY SETTINGS
    TERMINAL_THEME: 'LETHAL_COMPANY',
    FONT_FAMILY: '"Share Tech Mono", "Courier New", monospace',
    FONT_SIZE: '14px',
    
    // MESSAGE DISPLAY
    MESSAGE_ALIGNMENT: 'left',
    OWN_MESSAGE_PREFIX: 'ВЫ',
    SHOW_TIMESTAMPS: true,
    TIMESTAMP_FORMAT: 'HH:MM:SS',
    
    // ROOM SETTINGS
    MAX_USERS_PER_ROOM: 5,
    MESSAGE_MAX_LENGTH: 200,
    ROOM_AUTO_CLEANUP: 300000, // 5 minutes
    
    // TERMINAL COLORS (Lethal Company style)
    COLORS: {
        PRIMARY: '#00ff00',    // Terminal green
        SECONDARY: '#ffff00',  // Warning yellow  
        ACCENT: '#ff3333',     // Error red
        BACKGROUND: '#0a0a0a', // Deep black
        TEXT: '#ffffff',       // White text
        SCAN_LINE: '#00ff00',  // Scanning line
        NOISE: '#00ff00'       // Noise overlay
    },
    
    // BOOT SEQUENCE (Lethal Company style)
    BOOT_SEQUENCE: [
        { text: "> INITIALIZING TERMINAL OS...", delay: 800, sound: 'beep' },
        { text: "> LOADING COMMUNICATION PROTOCOL 779...", delay: 600 },
        { text: "> SCANNING NETWORK CHANNELS...", delay: 900 },
        { text: "> CONNECTING TO COMPANY SERVER...", delay: 700 },
        { text: "> AUTHENTICATING ANONYMOUS USER...", delay: 500 },
        { text: "> ENCRYPTING COMMUNICATION...", delay: 400 },
        { text: "> SEARCHING FOR AVAILABLE CHANNEL...", delay: 1200 },
        { text: "> WARNING: UNREGISTERED FREQUENCY DETECTED", delay: 300, style: 'warning' },
        { text: "> CHANNEL ACQUIRED: [REDACTED]", delay: 200, style: 'secret' },
        { text: "> WELCOME TO COMPANY COMMUNICATIONS", delay: 1000, style: 'success' }
    ],
    
    // TERMINAL EFFECTS
    EFFECTS: {
        SCAN_LINE: true,
        NOISE_OVERLAY: true,
        TEXT_GLITCH: true,
        BLINKING_CURSOR: true,
        TYPEWRITER_EFFECT: true
    }
};