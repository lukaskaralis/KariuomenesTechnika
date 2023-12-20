
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const knex = require('knex');
const bcrypt = require("bcrypt");
const {hash} = require("bcrypt");
const cookieParser = require("cookie-parser");
const {createTokens, validateToken} = require('./js/JWT');

/**
 * Duomenų bazės konfigūracija.
 */
const db = knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: 'admin',
        database: 'loginform'
    }
})

/**
 * Konfiguruojama Express.js programa.
 */
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * Nustatomas pradinis kelias statiniams failams, pridedamas fukcionalumas JSON duomenims,.
 */
let intialPath = path.join(__dirname, "");
app.use(bodyParser.json());
app.use(express.static(intialPath));
app.use(cookieParser());
module.exports = app;

/**
 * Maršrutas skirtas grąžinti naudotojui pagrindinį HTML puslapį.
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(intialPath, "index.html"));
})

/**
 * Maršrutas skirtas grąžinti naudotojui prisijungimo HTML puslapį.
 */
app.get('/login', (req, res) => {
    res.sendFile(path.join(intialPath, "login.html"));
})

/**
 * Maršrutas skirtas grąžinti naudotojui registracijos HTML puslapį.
 */
app.get('/register', (req, res) => {
    res.sendFile(path.join(intialPath, "register.html"));
})

/**
 * Nustatoma kiek "salt" naudoti "bcrypt" algoritmui.
 */
const saltRounds = 10;
/**
 * Sukuriamas POST maršrutas. Paimami naudotojo įvesti duomenys, patikrinama ar visi reikalingi
 * laukai yra užpildyti. Tikrinama ar el.pašto laukas turi @ ženklą. Užšifruojamas slaptažodis
 * naudojant "bcrypt" algoritmą. Sukuriamas naujas įrašas į duomenų baze su naudotojo duomenimis
 * ir suvaldomi duomenys, jeigu toks el.paštas jau yra duomenų bazėje.
 */
app.post('/register-user', (req, res) => {
    const { name, email, password } = req.body;

    if(!name.length || !email.length || !password.length){
        res.json('Užpildykite visus laukus');
    }else if(!email.includes('@')){
        res.json('Blogas elektroninis paštas');
    }
    else{
        bcrypt.hash(password, saltRounds, (hashErr, hash) => {
            if (hashErr) {
                res.status(500).json('Nepavyko užšifruoti slaptažodžio');
            }else{
                db("users").insert({
                name: name,
                email: email,
                password: hash
        })
            .returning(["name", "email"])
            .then(data => {
                res.json(data[0])
            })
            .catch(err => {
                if (err.detail.includes('Jau egzistuoja')) {
                    res.json('Elektroninis paštas jau egzsituoja');
                } else {
                    res.status(500).json('Elektroninis paštas jau egzsituoja');
                }
            });
            }
        });
    }
});

/**
 * Sukuriamas POST maršrutas. Paimami naudotojo įvesti duomenys, tada duomenų bazėje ieškomas toks
 * naudotojas. Jei naudotojas randamas iš duomenų paimamas slaptažodis ir atšifruojamas ir lyginamas
 * su naudotojo įvestu. Jei netinka, gaunama klaida, jei tinka sukuriamas "accsessToken" naudojat naudotojo
 * vardą ir ID. Nustatoma kiek slapukas galios. Gale sutvarkomos klaidos, jei slaptažodis arba el.paštas yra
 * netinkamas.
 */
app.post('/login-user', (req, res) => {
    const { email, password } = req.body;

    db.select('id', 'name', 'email', 'password')
        .from('users')
        .where({
            email: email,
        })
        .then(data => {
            if (data.length) {
                const storedHashedPassword = data[0].password;
                bcrypt.compare(password, storedHashedPassword, (compareErr, result) => {
                    if (compareErr) {
                        res.status(500).json('Nepavyko prisijungti');
                    } else {
                        if (result) {
                            console.log('User Data:', data);

                            const accessToken = createTokens({
                                username: data[0].name,
                                id: data[0].id
                            });

                            res.cookie("access-token", accessToken, {
                                maxAge: 60 * 60 * 24 * 30
                            });

                            res.json({
                                name: data[0].name,
                                email: data[0].email,
                                accessToken: accessToken,
                            });
                        } else {
                            res.json('Elektroninis paštas arba slaptažodis neteisingas');
                        }
                    }
                });
            } else {
                res.json('Elektroninis paštas arba slaptažodis neteisingas');
            }
        })
        .catch(err => {
            res.status(500).json('Nepavyko prisijungti');
        });
});

/**
 * Sukuriamas GET maršrutas. "validateToken" tikrina ar pateiktas tinkamas tokenas ir autentifikuotas
 * naudotojas. Jei tokenas yra netinkamas arba jo nėra, naudotojas gaus klaidos pranešimą. Duomenų bazėje ieškomas
 * naudotojas pagal tokeno ID. Jei naudotojas randamas duomenys persiunčiami į HTML puslapį kur jis juos galės
 * koreguoti, jei nėra tokio ID, grąžinama klaida.
 */
app.get("/profile", validateToken, (req, res) => {
    const userId = req.user && req.user.id;

    if (!userId) {
        return res.status(400).json({ error: "Vartotojo ID nerastas tokenas" });
    }
    db.select('name', 'surname', 'email', 'phone', 'address', 'age')
        .from('users')
        .where('id', userId)
        .then(data => {

            if (data.length) {
                res.render('profile', { user: data[0] });
            } else {
                res.status(404).json('Vartotojas nerastas');
            }
        })
        .catch(err => {
            res.status(500).json({ error: 'Vidinė serverio klaida' });
        });
});

/**
 * Sukuriamas POST maršrutas. Nuskaitomi naudotojo įvesti duomenys ir jei duomenys yra teisingi jie
 * išsaugomi duomenų bazėje.
 */
app.post('/update-profile', validateToken, (req, res) => {
    const userId = req.user.id;

    const { name, surname, phone, address } = req.body;

    db('users')
        .where({ id: userId })
        .update({
            name: name,
            surname: surname,
            phone: phone,
            address: address,
        })
        .returning('*')
        .then(updatedUserData => {
            res.json(updatedUserData[0]);
        })
        .catch(error => {
            res.status(500).json({ error: 'Klaida atnaujinant profili' });
        });
});

/**
 * Paleidžiamas serveris.
 */
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Port is open ${PORT}.`);
});


