import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = 'your-secret-key';
const REFRESH_SECRET_KEY = 'your-refresh-secret-key';
const users = [
    { id: 1, username: 'user1', password: 'password1' },
    { id: 2, username: 'user2', password: 'password2' },
];

let refreshTokens = [];

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const accessToken = jwt.sign({ username: user.username, id: user.id }, SECRET_KEY, { expiresIn: '30s' });
        const refreshToken = jwt.sign({ username: user.username, id: user.id }, REFRESH_SECRET_KEY, { expiresIn: '1m' });
        refreshTokens.push(refreshToken);
        res.json({ accessToken, refreshToken });
    } else {
        res.status(401).send('Username or password incorrect');
    }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(401);
        req.user = user;
        next();
    });
};

app.get('/users', authenticateToken, (req, res) => {
    res.json(users);
});

app.post('/token', (req, res) => {
    const { token } = req.body;
    if (!token) return res.sendStatus(401);
    if (!refreshTokens.includes(token)) return res.sendStatus(403);

    jwt.verify(token, REFRESH_SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = jwt.sign({ username: user.username, id: user.id }, SECRET_KEY, { expiresIn: '30s' });
        res.json({ accessToken });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
