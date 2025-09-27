const socket = io();

// Применяем конфигурацию
document.documentElement.style.setProperty('--message-alignment', ChatConfig.MESSAGE_ALIGNMENT);

// Элементы DOM
const startScreen = document.getElementById('start-screen');
const bootScreen = document.getElementById('boot-screen');
const chatScreen = document.getElementById('chat-screen');
const startBtn = document.getElementById('start-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const usersCountSpan = document.getElementById('users-count');
const connectionStatus = document.getElementById('connection-status');
const bootMessages = document.getElementById('boot-messages');
const bootProgressBar = document.getElementById('boot-progress-bar');

let currentUser = {};
let bootSequenceTimeout = null;
let isBootSkipped = false;

// Функция анимации загрузки
async function startBootSequence() {
    return new Promise((resolve) => {
        let currentStep = 0;
        const totalSteps = ChatConfig.BOOT_SEQUENCE.length;
        
        function showNextMessage() {
            if (isBootSkipped || currentStep >= totalSteps) {
                resolve();
                return;
            }
            
            const step = ChatConfig.BOOT_SEQUENCE[currentStep];
            const messageDiv = document.createElement('div');
            messageDiv.className = 'boot-message';
            messageDiv.textContent = step.text;
            messageDiv.style.animationDelay = `${currentStep * 100}ms`;
            
            bootMessages.appendChild(messageDiv);
            bootMessages.scrollTop = bootMessages.scrollHeight;
            
            // Обновляем прогресс бар
            const progress = ((currentStep + 1) / totalSteps) * 100;
            bootProgressBar.style.width = `${progress}%`;
            
            // Секретные пасхалки (можно добавить логику)
            if (step.secret) {
                messageDiv.style.color = '#ffff00';
                messageDiv.style.fontWeight = 'bold';
            }
            
            currentStep++;
            
            bootSequenceTimeout = setTimeout(showNextMessage, step.delay);
        }
        
        showNextMessage();
    });
}

// Функция для добавления сообщения в чат
function addMessage(data, type = 'user') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    
    const timestamp = new Date().toLocaleTimeString('en-GB', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    let messageContent = '';
    
    switch(type) {
        case 'system':
            messageContent = `<span class="message-time">[${timestamp}]</span> SYSTEM > ${data.text}`;
            break;
        case 'own':
            messageContent = `<span class="message-time">[${timestamp}]</span> <span class="user-id" style="color: ${data.color || ChatConfig.COLORS.secondary}">[${ChatConfig.OWN_MESSAGE_LABEL}]</span> > ${data.text}`;
            break;
        default:
            messageContent = `<span class="message-time">[${timestamp}]</span> <span class="user-id" style="color: ${data.color}">[${data.username}]</span> > ${data.text}`;
    }
    
    messageDiv.innerHTML = messageContent;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Пропуск анимации загрузки
function skipBootSequence() {
    isBootSkipped = true;
    if (bootSequenceTimeout) {
        clearTimeout(bootSequenceTimeout);
    }
    showChatScreen();
}

// Показ экрана чата
function showChatScreen() {
    bootScreen.classList.remove('active');
    chatScreen.classList.add('active');
    connectionStatus.textContent = 'CONNECTING...';
    connectionStatus.style.color = '#ffff00';
    
    setTimeout(() => {
        messageInput.focus();
    }, 500);
}

// Подключение к чату
startBtn.addEventListener('click', async () => {
    startScreen.classList.remove('active');
    bootScreen.classList.add('active');
    
    // Слушатель для пропуска анимации
    const skipHandler = (e) => {
        if (e.code === 'Space' || e.code === 'Enter' || e.type === 'click') {
            skipBootSequence();
            document.removeEventListener('keydown', skipHandler);
            document.removeEventListener('click', skipHandler);
        }
    };
    
    document.addEventListener('keydown', skipHandler);
    document.addEventListener('click', skipHandler);
    
    // Запускаем анимацию загрузки
    await startBootSequence();
    
    if (!isBootSkipped) {
        showChatScreen();
    }
});

// Отправка сообщения
function sendMessage() {
    const message = messageInput.value.trim();
    if (message && message.length <= ChatConfig.MESSAGE_MAX_LENGTH) {
        socket.emit('send_message', { message });
        messageInput.value = '';
    }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Отключение от чата
disconnectBtn.addEventListener('click', () => {
    if (confirm('TERMINATE CONNECTION?')) {
        window.location.reload();
    }
});

// Сокет-события
socket.on('connect', () => {
    connectionStatus.textContent = 'CONNECTED';
    connectionStatus.style.color = ChatConfig.COLORS.primary;
});

socket.on('disconnect', () => {
    connectionStatus.textContent = 'DISCONNECTED';
    connectionStatus.style.color = ChatConfig.COLORS.accent;
});

socket.on('room_joined', (data) => {
    currentUser = data;
    usersCountSpan.textContent = `USERS: ${data.usersCount}/${ChatConfig.MAX_USERS_PER_ROOM}`;
    
    addMessage({
        text: `SESSION ESTABLISHED. ROOM: ${data.roomId.substring(0, 8).toUpperCase()}`
    }, 'system');
    
    addMessage({
        text: `WELCOME, AGENT. YOU ARE CONNECTED ANONYMOUSLY`
    }, 'system');
});

socket.on('new_message', (data) => {
    const isOwnMessage = data.username === currentUser.username;
    addMessage({
        username: data.username,
        text: data.message,
        color: data.avatarColor
    }, isOwnMessage ? 'own' : 'user');
});

socket.on('user_joined', (data) => {
    usersCountSpan.textContent = `USERS: ${data.usersCount}/${ChatConfig.MAX_USERS_PER_ROOM}`;
    addMessage({
        text: `NEW USER JOINED THE CHANNEL`
    }, 'system');
});

socket.on('user_left', (data) => {
    usersCountSpan.textContent = `USERS: ${data.usersCount}/${ChatConfig.MAX_USERS_PER_ROOM}`;
    addMessage({
        text: `USER DISCONNECTED`
    }, 'system');
});