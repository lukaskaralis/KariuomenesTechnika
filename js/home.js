/**
 * Funkcija kuri tikrina ar naudotojo vardas yra įrašytas į "sessionStorage".
 * Jei taip grąžinamas pagrindinis langas su vartojo vardu, jei ne siunčiamas į prisijungimo
 * langą.
 */
const greeting = document.querySelector('.greeting');
window.onload = () => {
    if(!sessionStorage.name){
        location.href = '/login';
    } else{
        greeting.innerHTML = `${sessionStorage.name}`;
    }
}

/**
 * Ši funckija skirta atjungti vartotoją iš sesijos, ištrinant visus duomenys is
 * "sessionsStorage".
 */
const logOut = document.querySelector('.logout');
logOut.onclick = () => {
    sessionStorage.clear();
    location.reload();
}
