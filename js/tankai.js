/**
 * Funkcija skirta peradresuoti naudotoją į kitą puslapį.
 */
function redirectToPage(page) {
    window.location.href = page;
}

/**
 * Funckija skirta parodyti nuotrauką didesniame vaizde.
 */
function viewTank(imageSrc) {
    document.getElementById('modalImage').src = imageSrc;
    document.getElementById('imageModal').style.display = 'block';
}

/**
 * Funckija skirta uždaryti modelį.
 */
function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
}