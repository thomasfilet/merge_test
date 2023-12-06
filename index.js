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

app.post('/inscription', (req, res) => {
    const {name, password} = req.body
    const nb_random = Math.random() * 10
    const user_name = {id: user_Account.length + 1, pseudo: name + nb_random, password: password};
    user_Account.push(user_name)
    res.status(200).json(user_name)
});

app.post('/critique', (req, res) => {
    const token = req.header('Authorization')
    const {titre_film, critique_film} = req.body
    const like = 0;
    const comment = 0;
    const date_critique = Date.now();
    const user_current = jwt.verify(token, secretkey)
    if (user_current == null) {
        res.status(401).json({error: 'user invalide'})
    } else {
        const current_id = user_current.id
        const critique_split = critique_film.split(/\s+/).filter(function (word) {
            return word.length > 0
        })
        const nb_mot = critique_split.length
        if (!(nb_mot < 50) && !(nb_mot > 500)) {
            const newCritique = {
                id: film.length + 1,
                titre: titre_film,
                critique: critique_film,
                auteurId: current_id,
                date: date_critique,
                likes: like,
                comments: comment
            };
            film.push(newCritique);
            console.log(film)
            res.status(200).json(newCritique)
        } else {
            res.status(401).json({error: 'merci de mettre entre 50 et 500 mot dans la critique'})
        }
    }
});

app.get('/critique', (req, res) => {
    const token = req.header('Authorization')
    const user_current = jwt.verify(token, secretkey)
    const {auteur, titre} = req.query
    if (user_current != null) {
        const critique = []
        if (auteur !== undefined) {
            film.forEach(function (e) {
                const id_auteur = e.auteurId
                const auteur_account = user_Account.find((s) => s.id === id_auteur);
                const auteur_name = auteur_account.pseudo;
                if (auteur_name === auteur) {
                    const id_critique = e.id
                    const critique_body = e.critique
                    const critique_spe = {id: id_critique, auteur: auteur_name, critique: critique_body}
                    critique.push(critique_spe)
                }
            })
        } else if (titre !== undefined) {
            film.forEach(function (e) {
                const id_auteur = e.auteurId
                const auteur_account = user_Account.find((s) => s.id === id_auteur);
                const auteur_name = auteur_account.pseudo;
                const titre_critique = e.titre
                if (titre_critique === titre) {
                    const id_critique = e.id
                    const critique_body = e.critique
                    const critique_spe = {id: id_critique, auteur: auteur_name, critique: critique_body}
                    critique.push(critique_spe)
                }
            })
        } else {
            film.forEach(function (e) {
                const id_auteur = e.auteurId
                const auteur_account = user_Account.find((s) => s.id === id_auteur);
                const auteur_name = auteur_account.pseudo;
                const id_critique = e.id
                const critique_body = e.critique
                const critique_spe = {id: id_critique, auteur: auteur_name, critique: critique_body}
                critique.push(critique_spe)
            })
        }
        res.status(200).json(critique)
    }


});

app.get('/critique/:id', (req, res) => {
    const {id} = req.params;
    const critique = film.find((s) => s.id === parseInt(id));

    if(critique === null || critique === undefined){
        res.status(401).json({error: 'critique non existante'})
    }else{
        res.status(200).json(critique);
    }
});

function change(initialChaine, lastChaine){
    const distance = levenshtein.get(initialChaine, lastChaine);
    const longueurInitiale = initialChaine.length;
    const pourcentageModification = (distance / longueurInitiale) * 100;
    return pourcentageModification;
}


app.get('/critique/delete/:id', (req, res) => {
    const {id} = req.params;
    const critiqueindex = film.findIndex((s) => s.id === parseInt(id));

    if(critiqueindex === null || critiqueindex === undefined){
        res.status(401).json({error: 'critique non existante'})
    }else{
        film.splice(critiqueindex, 1);
        res.status(200).json({message :'suppresion reussi', film});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});