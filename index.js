const levenshtein = require('fast-levenshtein');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')
const cors = require('cors');
const publicRoute = ['/', '/auth', '/inscription']
const app = express();
app.use(bodyParser.json());
app.use(cors());

const secretkey = "dd"


const user_Account = [
    {
        id: 1,
        pseudo: 'SuperFan123',
        password: 'password123',
    },
    {
        id: 2,
        pseudo: 'HeroWatcher456',
        password: 'password456'
    }
]


const film = [
    {
        id: 1,
        titre: "The Superhero Returns",
        critique: 'Un film incroyable avec des effets spéciaux époustouflants',
        auteurId: 1,
        date: '2023-11-01T10:00:00Z',
        likes: 2,
        comments: 3
    },
    {
        id: 2,
        titre: "Night Hero: The Darkening",
        critique: "Un scénario un peu faible, mais des performances d'acteur solides.",
        auteurId: 2,
        date: "2023-11-03T15:30:00Z",
        likes: 5,
        comments: 7
    },
    {
        id: 3,
        titre: "Guardians of the Galaxy Far Away",
        critique: "Une aventure spatiale hilarante et émouvante, remplie de personnages attachants.",
        auteurId: 1,
        date: "2023-11-05T09:20:00Z",
        likes: 15,
        comments: 10
    },
    {
        id: 4,
        titre: "Heroic Battles: Dawn of Power",
        critique: "Une expérience cinématographique épique, marquant un tournant dans l'univers des super-héros.",
        auteurId: 2,
        date: "2023-11-07T13:45:00Z",
        likes: 20,
        comments: 12
    },
    {
        id: 6,
        titre: "Heroic Battles: Dawn of Power",
        critique: "super",
        auteurId: 2,
        date: "2023-11-07T13:45:00Z",
        likes: 20,
        comments: 12
    },
]

const authenticateJwt = (req, res, next) => {
    const token = req.header('Authorization')

    if (!token) {
        res.status(401).json({error: 'auhtentification requise'})
    } else {
        jwt.verify(token, secretkey, (err, decoded) => {
            if (err) {
                res.status(401).json({error: 'JWT invalide'})
            } else {
                next()
            }
        })
    }
}
app.use((req, res, next) => {
    if (publicRoute.includes(req.path)) {
        next()
    } else {
        authenticateJwt(req, res, next)
    }
})


app.post('/auth', (req, res) => {
    const {pseudo, password} = req.body;
    const user = user_Account.find((s) => s.pseudo === pseudo && s.password === password);

    if (user !== null) {
        const payload = {
            id: user.id,
            pseudo: user.pseudo,
            exp: Math.floor(Date.now() / 1000) + 43200
        };
        const token = jwt.sign(payload, secretkey)
        res.send({jwt: token})
    } else (
        res.status(401).json({error: 'Wrong User / password'})
    )
})