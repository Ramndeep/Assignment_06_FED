/**
 * Initializes the Trivia Game when the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("trivia-form");
    const questionContainer = document.getElementById("question-container");
    const newPlayerButton = document.getElementById("new-player");

    // Initialize the game
    checkUsername(); 
    fetchQuestions();
    displayScores();

    /**
     * Fetches trivia questions from the API and displays them.
     */
    function fetchQuestions() {
        showLoading(true); // Show loading state

        fetch("https://opentdb.com/api.php?amount=10&type=multiple")
            .then((response) => response.json())
            .then((data) => {
                displayQuestions(data.results);
                showLoading(false); // Hide loading state
            })
            .catch((error) => {
                console.error("Error fetching questions:", error);
                showLoading(false); // Hide loading state on error
            });
    }

    /**
     * Toggles the display of the loading state and question container.
     *
     * @param {boolean} isLoading - Indicates whether the loading state should be shown.
     */
    function showLoading(isLoading) {
        document.getElementById("loading-container").classList = isLoading
            ? ""
            : "hidden";
        document.getElementById("question-container").classList = isLoading
            ? "hidden"
            : "";
    }

    /**
     * Displays fetched trivia questions.
     * @param {Object[]} questions - Array of trivia questions.
     */
    function displayQuestions(questions) {
        questionContainer.innerHTML = ""; // Clear existing questions
        questions.forEach((question, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.innerHTML = `
                <p>${question.question}</p>
                ${createAnswerOptions(
                    question.correct_answer,
                    question.incorrect_answers,
                    index
                )}
            `;
            questionContainer.appendChild(questionDiv);
        });
    }

    /**
     * Creates HTML for answer options.
     * @param {string} correctAnswer - The correct answer for the question.
     * @param {string[]} incorrectAnswers - Array of incorrect answers.
     * @param {number} questionIndex - The index of the current question.
     * @returns {string} HTML string of answer options.
     */
    function createAnswerOptions(
        correctAnswer,
        incorrectAnswers,
        questionIndex
    ) {
        const allAnswers = [correctAnswer, ...incorrectAnswers].sort(
            () => Math.random() - 0.5
        );
        return allAnswers
            .map(
                (answer) => `
            <label>
                <input type="radio" name="answer${questionIndex}" value="${answer}" ${
                    answer === correctAnswer ? 'data-correct="true"' : ""
                }>
                ${answer}
            </label>
        `
            )
            .join("");
    }

    // Event listeners for form submission and new player button
    form.addEventListener("submit", handleFormSubmit);
    newPlayerButton.addEventListener("click", newPlayer);

    /**
     * Handles the trivia form submission.
     * @param {Event} event - The submit event.
     */
    
    function handleFormSubmit(event) {
        event.preventDefault();
    const usernameInput = document.getElementById("username");
    let username = getCookie("username");

    if (!username && usernameInput.value.trim()) {
        username = usernameInput.value.trim();
        setCookie("username", username, 7);
    }

    const score = calculateScore();
    saveScore(username, score);

    fetchQuestions();
    displayScores();
    }
    
    function checkUsername() {
        const username = getCookie("username");
    const usernameInput = document.getElementById("username");
    const newPlayerButton = document.getElementById("new-player");

    if (username) {
        usernameInput.classList.add("hidden");
        newPlayerButton.classList.remove("hidden");
    } else {
        usernameInput.classList.remove("hidden");
        newPlayerButton.classList.add("hidden");
    }
    }

    function setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    }

    function getCookie(name) {
        const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return match ? match.pop() : null;
    }

    function saveScore(username, score) {
        const scores = JSON.parse(localStorage.getItem("scores")) || [];
    scores.push({ username, score });
    localStorage.setItem("scores", JSON.stringify(scores));
    }
    
    function newPlayer() {
        setCookie("username", "", -1); 
        checkUsername(); 
    }

    function calculateScore() {
        let score = 0;
    const questions = document.querySelectorAll("#question-container div");

    questions.forEach((questionDiv, index) => {
        const selectedAnswer = questionDiv.querySelector(`input[name="answer${index}"]:checked`);
        if (selectedAnswer && selectedAnswer.hasAttribute("data-correct")) {
            score += 1;
        }
    });

    return score;
    }
    
    function displayScores() {
        const scoresTableBody = document.querySelector("#score-table tbody");
    scoresTableBody.innerHTML = "";

    const scores = JSON.parse(localStorage.getItem("scores")) || [];
    scores.forEach(({ username, score }) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${username}</td><td>${score}</td>`;
        scoresTableBody.appendChild(row);
    });
    }
});