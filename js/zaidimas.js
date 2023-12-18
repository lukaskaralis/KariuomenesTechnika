const quizContainer = document.getElementById('quiz-container');
const questionContainer = document.getElementById('question-container');
const optionsContainer = document.getElementById('options-container');
const resultContainer = document.getElementById('result-container');
const nextButton = document.getElementById('next-button');

let currentQuestionIndex = 0;
let correctAnswers = 0;

const questions = [
    {
        question: 'What is in the picture?',
        imagePath: 'Foto/Tankai/M1A1.jpg',
        options: ['M60', 'M48', 'M1A1', 'M1A2'],
        correctOption: 2
    },
    {
        question: 'What is in the picture?',
        imagePath: 'Foto/Tankai/M48.jpg',
        options: ['M1A1', 'M1A2', 'M48', 'M60'],
        correctOption: 2
    },
    {
        question: 'What is in the picture?',
        imagePath: 'Foto/Tankai/M1A2.jpg',
        options: ['M1A2', 'M1A1', 'M60', 'M48'],
        correctOption: 0
    },
    {
        question: 'What is in the picture?',
        imagePath: 'Foto/Tankai/M60.jpg',
        options: ['M48', 'M60', 'M1A2', 'M1A1'],
        correctOption: 1
    },
];

function startGame() {
    currentQuestionIndex = 0;
    correctAnswers = 0;
    nextButton.style.display = 'none';
    resultContainer.innerHTML = '';
    showQuestion();
}

function showQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionContainer.innerHTML = `<img src="${currentQuestion.imagePath}" alt="Question Image">`;

    optionsContainer.innerHTML = '';
    for (let i = 0; i < currentQuestion.options.length; i++) {
        const optionButton = document.createElement('button');
        optionButton.textContent = currentQuestion.options[i];

        optionButton.addEventListener('click', function () {
            checkAnswer(i);
        });
        optionsContainer.appendChild(optionButton);
    }
}

function checkAnswer(selectedOption) {
    const currentQuestion = questions[currentQuestionIndex];
    const optionsButtons = optionsContainer.querySelectorAll('button');
    optionsButtons.forEach(button => button.disabled = true);

    if (selectedOption === currentQuestion.correctOption) {
        optionsButtons[selectedOption].style.backgroundColor = 'green';
        correctAnswers++;
    } else {
        optionsButtons[selectedOption].style.backgroundColor = 'red';
        optionsButtons[currentQuestion.correctOption].style.backgroundColor = 'green';
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        setTimeout(() => {
            resetOptionsStyles(optionsButtons);
            showQuestion();
        }, 1000);
    } else {
        setTimeout(() => {
            resetOptionsStyles(optionsButtons);
            showResult();
        }, 1000);
    }
}

function resetOptionsStyles(optionsButtons) {
    optionsButtons.forEach(button => {
        button.style.backgroundColor = '';
        button.disabled = false;
    });
}

function showResult() {
    resultContainer.innerHTML = `Tu atsakei teisingai į ${correctAnswers} iš ${questions.length}!`;
    nextButton.style.display = 'block';
}

function nextQuestion() {
    startGame();
}

startGame();

