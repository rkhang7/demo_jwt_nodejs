import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();

const PORT = process.env.PORT || 5000;

let refreshTokens = [];

app.use(express.json())

const books = [
    {
        id: 1,
        name: "Book01",
    },
    {
        id: 2,
        name: "Book02",
    },
    {
        id: 1,
        name: "Book02",
    },
]

app.get('/books', authenticationToken, (req, res) => {
    res.json({ status: "Success", data: books })
})

function authenticationToken(req, res, next) {
    var token = req.headers.authorization.split(' ')[1];

    if (!token) res.sendStatus(401);

    jwt.verify(token, "Secret key", (err, data) => {
        if (err) res.sendStatus(403);
        next()
    })


}

app.post('/refreshToken', (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) res.sendStatus(403);

    jwt.verify(refreshToken, "Refresh token key", (err, data) => {
        console.log(err, data);
        if (err) res.sendStatus(403);
        const accessToken = jwt.sign(
            { username: data.username },
            "Secret key",
            {
                expiresIn: '30s',
            }
        );
        res.json({ accessToken: accessToken });
    });
});

app.post('/login', (req, res) => {
    const data = req.body;
    const accessToken = jwt.sign(data, "Secret key", { expiresIn: '30s' });
    const refreshToken = jwt.sign(data, "Refresh token key");
    refreshTokens.push(refreshToken);
    res.json({ accessToken, refreshToken })
})

app.listen(PORT, () => {
    console.log('Service is running ${PORT}');
})