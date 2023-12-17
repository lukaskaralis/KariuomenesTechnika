
function saveProfile() {
    const name = document.querySelector('.name').value;
    const surname = document.querySelector('.surname').value;
    const phone = document.querySelector('.phone').value;
    const address = document.querySelector('.address').value;

    fetch('/update-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            surname: surname,
            phone: phone,
            address: address,
        }),
    })
        .then(response => response.json())
        .then(data => {
        })
        .catch(error => {
        });
}
document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    const closeButton = document.getElementById('closeButton');

    if (saveButton) {
        saveButton.addEventListener('click', function () {

            const saveSuccessful = Math.random() < 0.5;

            if (saveSuccessful) {
                showNotification('Informacija sėkmingai išsaugota!', 'success');
            } else {
                showNotification('Informacija neišsaugota!', 'error');
            }
        });
    }

    closeButton.addEventListener('click', function () {
        hideNotification();
    });

    function showNotification(message, type) {
        notificationText.textContent = message;
        notification.style.backgroundColor = type === 'success' ? '#4CAF50' : '#FF4444';
        notification.style.display = 'block';
        setTimeout(function () {
            hideNotification();
        }, 3000);
    }

    function hideNotification() {
        notification.style.display = 'none';
    }
});


