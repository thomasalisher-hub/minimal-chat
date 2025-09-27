const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../public')));

// Конфигурация сервера
const SERVER_CONFIG = {
    MAX_USERS_PER_ROOM: 5, // Легко изменить
    ROOM_CLEANUP_TIMEOUT: 300000 // 5 минут
};

const rooms = new Map();
const users = new Map();

function findAvailableRoom() {
    for (let [roomId, room] of rooms) {
        if (room.users.size < SERVER_CONFIG.MAX_USERS_PER_ROOM) {
            return roomId;
        }
    }
    const newRoomId = Math.random().toString(36).substring(2, 10);
    rooms.set(newRoomId, { users: new Set(), creationTime: Date.now() });
    return newRoomId;
}

function getRandomColor() {
    const colors = ['#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ffaa00', '#aa00ff'];
    return colors[Math.floor(Math.random() * colors.length)];
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    const roomId = findAvailableRoom();
    const room = rooms.get(roomId);

    const userData = {
        roomId,
        username: `USER_${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
        avatarColor: getRandomColor()
    };
    users.set(socket.id, userData);

    room.users.add(socket.id);
    socket.join(roomId);

    // Уведомляем других пользователей
    socket.to(roomId).emit('user_joined', {
        username: userData.username,
        usersCount: room.users.size
    });

    // Отправляем данные пользователю
    socket.emit('room_joined', {
        username: userData.username,
        usersCount: room.users.size,
        roomId: roomId,
        avatarColor: userData.avatarColor
    });

    // Обработка сообщений
    socket.on('send_message', (data) => {
        const user = users.get(socket.id);
        if (!user || !data.message.trim()) return;

        const cleanMessage = data.message.trim().substring(0, 500);

        io.to(user.roomId).emit('new_message', {
            username: user.username,
            avatarColor: user.avatarColor,
            message: cleanMessage,
            timestamp: new Date().toLocaleTimeString()
        });
    });

    // Отключение
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const user = users.get(socket.id);
        if (user) {
            const room = rooms.get(user.roomId);
            if (room) {
                room.users.delete(socket.id);
                
                socket.to(user.roomId).emit('user_left', {
                    username: user.username,
                    usersCount: room.users.size
                });

                if (room.users.size === 0) {
                    setTimeout(() => {
                        if (room.users.size === 0) {
                            rooms.delete(user.roomId);
                            console.log('Room deleted:', user.roomId);
                        }
                    }, SERVER_CONFIG.ROOM_CLEANUP_TIMEOUT);
                }
            }
            users.delete(socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Max users per room: ${SERVER_CONFIG.MAX_USERS_PER_ROOM}`);
});