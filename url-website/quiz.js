
// URL Guide self-assessment quiz.
// Answers are checked locally in the browser.

const quizForm = document.getElementById("quiz-form");
const timerDisplay = document.getElementById("timer");
const resultsPanel = document.getElementById("results");
const warning = document.getElementById("time-warning");
const retakeButton = document.getElementById("retake-button");

// The quiz has a 10-minute time limit.
const QUIZ_SECONDS = 10 * 60;

let secondsRemaining = QUIZ_SECONDS;
let timerInterval;
let quizFinished = false;

// Correct answers and explanations for each question.
const answerKey = {

  q1: {
    answer: "scheme",
    display: "Scheme",
    explanation: "The scheme, such as https, appears at the beginning of a URL."
  },

  q2: {
    answer: "query",
    display: "Query",
    explanation: "A query begins with ? and can contain name-value pairs."
  },

  q3: {
    answer: "b",
    display: "The host or server the browser contacts",
    explanation: "The host identifies the server or host that the browser contacts."
  },

  q4: {
    answer: "c",
    display: "Path",
    explanation: "The path identifies a resource or route on the host."
  },

  q5: {
    answer: "b",
    display: "To help find the network address associated with a domain name",
    explanation: "DNS helps resolve a domain name to network information used to reach its host."
  },

  q6: {
    answer: ["scheme", "host", "path", "fragment"],
    display: "Scheme, host, path, and fragment",
    explanation: "These are URL components. Font size is not a URL component."
  },

  q7: {
    answer: "full",
    display: "A URL that includes the full address, including its scheme and host",
    explanation: "An absolute URL includes the full address, including its scheme and host."
  },

  q8: {
    answer: "true",
    display: "True",
    explanation: "HTTPS uses TLS to protect information while it travels between browser and server."
  },

  q9: {
    answer: "false",
    display: "False",
    explanation: "HTTPS protects the connection but does not prove that the website itself is trustworthy."
  },

  q10: {
    answer: "fragment",
    display: "The fragment",
    explanation: "The part after # is the fragment, which can identify a section within a page."
  }

};


// Converts seconds into minutes and seconds.
function formatTime(totalSeconds) {

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;

}


// Updates the countdown timer.
function updateTimer() {

  timerDisplay.textContent = formatTime(secondsRemaining);

  timerDisplay.classList.toggle(
    "timer-warning",
    secondsRemaining <= 60
  );

}


// Starts the 10-minute countdown.
function startTimer() {

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {

    if (quizFinished) return;

    secondsRemaining--;

    updateTimer();

    // Warn the user when one minute remains.
    if (secondsRemaining === 60) {
      warning.hidden = false;
    }

    // Automatically submit when time runs out.
    if (secondsRemaining <= 0) {
      submitQuiz(true);
    }

  }, 1000);

}


// Gets the user's answer for each question.
function getUserAnswer(questionName) {

  // Fill-in-the-blank questions.
  if (questionName === "q1" || questionName === "q2") {

    return quizForm.elements[questionName].value
      .trim()
      .toLowerCase();

  }

  // Multiple-selection question.
  if (questionName === "q6") {

    return Array.from(
      quizForm.querySelectorAll(
        'input[name="q6"]:checked'
      )
    )
    .map(input => input.value)
    .sort();

  }

  // Radio button questions.
  const selected = quizForm.querySelector(
    `[name="${questionName}"]:checked`
  );

  if (selected) return selected.value;

  // Dropdown questions.
  const field = quizForm.elements[questionName];

  return field ? field.value : "";

}


// Makes the user's answers readable in the results.
function displayAnswer(value, questionName) {

  if (questionName === "q6") {

    return value.length
      ? value.map(item => ({
          scheme: "Scheme",
          host: "Host",
          path: "Path",
          font: "Font size",
          fragment: "Fragment"
        }[item])).join(", ")
      : "No answer selected";

  }

  if (!value) return "No answer provided";

  if (questionName === "q1" || questionName === "q2") {
    return value;
  }

  const option = quizForm.querySelector(
    `[name="${questionName}"][value="${CSS.escape(value)}"]`
  );

  if (option && option.parentElement.tagName === "LABEL") {
    return option.parentElement.textContent.trim();
  }

  const select = quizForm.elements[questionName];

  if (select && select.tagName === "SELECT") {
    return select.options[select.selectedIndex].text;
  }

  return value;

}


// Checks whether the user's answer is correct.
function isCorrect(questionName, userAnswer) {

  const correct = answerKey[questionName].answer;

  // Accept common variations for fill-in-the-blank answers.
  if (questionName === "q1") {
    return ["scheme", "url scheme"].includes(userAnswer);
  }

  if (questionName === "q2") {
    return [
      "query",
      "query string",
      "query component",
      "query parameter"
    ].includes(userAnswer);
  }

  // All correct choices must be selected for question 6.
  if (questionName === "q6") {

    return JSON.stringify(userAnswer) ===
      JSON.stringify([...correct].sort());

  }

  return userAnswer === correct;

}


// Grades the quiz and displays the results.
function submitQuiz(isTimedOut = false) {

  if (quizFinished) return;

  // Check that all questions are answered before submission.
  if (!isTimedOut && !quizForm.reportValidity()) {
    return;
  }

  quizFinished = true;

  clearInterval(timerInterval);

  // Calculate the time spent.
  const elapsed = QUIZ_SECONDS - secondsRemaining;

  let score = 0;

  const review = document.getElementById("answer-review");

  review.innerHTML = "";

  // Check every question.
  Object.keys(answerKey).forEach((questionName, index) => {

    const userAnswer = getUserAnswer(questionName);

    const correct = isCorrect(questionName, userAnswer);

    if (correct) {
      score++;
    }

    // Create the individual question result.
    const item = document.createElement("li");

    item.className = correct
      ? "review-correct"
      : "review-incorrect";

    const heading = document.createElement("strong");

    heading.textContent =
      `Question ${index + 1}: ${correct ? "Correct" : "Incorrect"}`;

    const response = document.createElement("p");

    response.textContent =
      `Your answer: ${displayAnswer(userAnswer, questionName)}`;

    const answer = document.createElement("p");

    answer.textContent =
      `Correct answer: ${answerKey[questionName].display}`;

    const explanation = document.createElement("p");

    explanation.textContent =
      answerKey[questionName].explanation;

    item.append(
      heading,
      response,
      answer,
      explanation
    );

    review.appendChild(item);

  });

  // Determine whether the user passed.
  const passed = score >= 7;

  document.getElementById("result-heading").textContent =
    passed ? "You Passed!" : "Keep Practicing";

  const overall = document.getElementById("overall-result");

  overall.textContent = isTimedOut
    ? (passed
        ? "Time expired, but you reached the passing score."
        : "Time expired before you reached the passing score.")
    : (passed
        ? "Congratulations! You passed the URL knowledge quiz."
        : "You did not reach the passing score of 70%. Review the explanations and try again.");

  overall.className = passed
    ? "pass-message"
    : "fail-message";

  // Display the final score and time.
  document.getElementById("final-score").textContent =
    `${score} / 10 (${score * 10}%)`;

  document.getElementById("time-used").textContent =
    formatTime(elapsed);

  // Display results and hide the quiz form.
  resultsPanel.hidden = false;

  quizForm.hidden = true;

  resultsPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


// Handles normal quiz submission.
quizForm.addEventListener("submit", event => {

  event.preventDefault();

  submitQuiz(false);

});


// Handles the clear answers button.
quizForm.addEventListener("reset", () => {

  setTimeout(() => {

    if (quizFinished) return;

    secondsRemaining = QUIZ_SECONDS;

    updateTimer();

    warning.hidden = true;

  }, 0);

});


// Resets the entire quiz for another attempt.
function resetQuiz() {

  clearInterval(timerInterval);

  quizFinished = false;

  secondsRemaining = QUIZ_SECONDS;

  quizForm.reset();

  quizForm.hidden = false;

  resultsPanel.hidden = true;

  warning.hidden = true;

  timerDisplay.classList.remove("timer-warning");

  updateTimer();

  startTimer();

  document.querySelector(".quiz-page h1").scrollIntoView({
    behavior: "smooth"
  });

}


// Retake button starts a fresh attempt.
retakeButton.addEventListener("click", resetQuiz);


// Start the timer when the page loads.
updateTimer();

startTimer();
