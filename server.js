const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ADMIN_SECRET_TOKEN = "OWNER_SECRET_KEY_9988";

let globalPrediction = {
period: "0001",
color: "GREEN",
numberSmall: 3,
numberBig: 7,
timestamp: "00:00:00"
};

app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin.html', (req, res) => {
if (req.query.token !== ADMIN_SECRET_TOKEN) {
return res.status(403).send('Forbidden');
}
res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/api/admin/updatePrediction', (req, res) => {
const { token, period, color, numberSmall, numberBig } = req.body;

if (token !== ADMIN_SECRET_TOKEN) {
    return res.status(401).json({ success: false });
}

globalPrediction = {
    period,
    color,
    numberSmall,
    numberBig,
    timestamp: new Date().toLocaleTimeString()
};

io.emit('predictionUpdate', globalPrediction);

res.json({ success: true });

});

io.on('connection', (socket) => {
socket.emit('predictionUpdate', globalPrediction);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
console.log("Server running on ${PORT}");});
