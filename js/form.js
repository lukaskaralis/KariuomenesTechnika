const form = [...document.querySelector('.form').children];

/**
 * Sukuriamas efektas, kad teksto įvedimo laukai atsirastu vienas po kito
 */
form.forEach((item, i) => {
    setTimeout(() => {
        item.style.opacity = 1;
    }, i*100);
})

/**
 * Jei naudotojas yra prisijunges ir turi "sessionStorage.name" jis negalės grįžti į
 * prisijungimo langą.
 */
window.onload = () => {
    if(sessionStorage.name){
        location.href = '/';
    }
}

/**
 * Nuorodos į HTML elementus, kurie atitinka konkrečius elementus.
 */
const name = document.querySelector('.name') || null;
const email = document.querySelector('.email');
const password = document.querySelector('.password');
const submitBtn = document.querySelector('.submit-btn');

/**
 * Jei "name" yra null, vykdomas pirmas blokas, kuriame naudojamas "/login-user" maršrutas,
 * tada siunčiami duomenys JSON formatu funkcijai "validateData". Jei "name" nėra null, viskas vyksta
 * taip pat tik maršrutas yra "/register-user".
 */
if(name == null){
    submitBtn.addEventListener('click', () => {
        fetch('/login-user',{
            method: 'post',
            headers: new Headers({'Content-Type': 'application/json'}),
            body: JSON.stringify({
                email: email.value,
                password: password.value
            })
        })
            .then(res => res.json())
            .then(data => {
                validateData(data);
            })
    })
} else{
    submitBtn.addEventListener('click', () => {
        fetch('/register-user', {
            method: 'post',
            headers: new Headers({'Content-Type': 'application/json'}),
            body: JSON.stringify({
                name: name.value,
                email: email.value,
                password: password.value
            })
        })
            .then(res => res.json())
            .then(data => {
                validateData(data);
            })
    })
}
/**
 * Jei vartotojo duomenų trūksta arba yra neteisingi, rodomas klaidos pranešimas, jei teisingi
 * duomenys yra išsaugomi.
 */
const validateData = (data) => {
    if(!data.name){
        alertBox(data);
    } else{
        sessionStorage.name = data.name;
        sessionStorage.email = data.email;
        location.href = '/';
    }
}
/**
 * Funkcija kuri leidžia rodyti ir slėpti pranešimus naudotojui.
 */
const alertBox = (data) => {
    const alertContainer = document.querySelector('.alert-box');
    const alertMsg = document.querySelector('.alert');
    alertMsg.innerHTML = data;

    alertContainer.style.top = `5%`;
    setTimeout(() => {
        alertContainer.style.top = null;
    }, 5000);
}