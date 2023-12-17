function redirectToPage(page) {
    window.location.href = page;
}
function viewTank(imageSrc) {
    document.getElementById('modalImage').src = imageSrc;
    document.getElementById('imageModal').style.display = 'block';
}
function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
}