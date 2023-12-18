const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const knex = require('knex');
const bcrypt = require("bcrypt");
const {hash} = require("bcrypt");
const cookieParser = require("cookie-parser");
const {createTokens, validateToken} = require('./js/JWT');


const db = knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: 'admin',
        database: 'loginform'
    }
})

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let intialPath = path.join(__dirname, "");

app.use(bodyParser.json());
app.use(express.static(intialPath));
app.use(cookieParser());

module.exports = app;



app.get('/', (req, res) => {
    res.sendFile(path.join(intialPath, "index.html"));
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(intialPath, "login.html"));
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(intialPath, "register.html"));
})

const saltRounds = 10;

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
                    // Handle other errors, log them, or send a generic message
                    res.status(500).json('Elektroninis paštas jau egzsituoja');
                }
            });
            }
        });
    }
});

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



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Port is open ${PORT}.`);
});


