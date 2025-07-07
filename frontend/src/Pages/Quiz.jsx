import React, { useState } from 'react';
import './quiz.css';
import { Link } from 'react-router-dom';

const Quiz = () => {
  const [rounds, setRounds] = useState(1);
  const [currentRound, setCurrentRound] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const playClickSound = () => {
  const audio = new Audio('/sounds/soft-click.wav'); 
  audio.volume = 0.2; 
  audio.play().catch((error) => {
    console.log('Sound play error:', error);
  });
};


  //ROUND 1 QUESTIONS
  const roundOneQuestions = [
    { id: 1, text: "Which of these drinks usually contains caffeine?", options: ["Orange juice", "Water", "Tea", "Milk"], correctAnswer: "Tea" },
    { id: 2, text: "What is sushi traditionally wrapped in?", options: ["Seaweed", "Lettuce", "Rice paper", "Plastic"], correctAnswer: "Seaweed" },
    { id: 3, text: "Which of these is a common way to reduce stress?", options: ["Listening to calming music", "Eating more sugar", "Skipping sleep", "Arguing online"], correctAnswer: "Listening to calming music" },
    { id: 4, text: "What do bees produce?", options: ["Honey", "Butter", "Oil", "Milk"], correctAnswer: "Honey" },
    { id: 5, text: "Which of these is considered a fruit?", options: ["Apple", "Lettuce", "Carrot", "Broccoli"], correctAnswer: "Apple" },
    { id: 6, text: "Which country is famous for the Eiffel Tower?", options: ["France", "Italy", "Germany", "Spain"], correctAnswer: "France" },
    { id: 7, text: "What do you use to send an email?", options: ["Computer", "Microwave", "Television", "Oven"], correctAnswer: "Computer" },
    { id: 8, text: "What helps plants grow?", options: ["Sunlight", "Darkness", "Plastic", "Smoke"], correctAnswer: "Sunlight" },
    { id: 9, text: "Which one is a musical instrument?", options: ["Guitar", "Plate", "Chair", "Spoon"], correctAnswer: "Guitar" },
    { id: 10, text: "What is a common breakfast food?", options: ["Cereal", "Pizza", "Steak", "Popcorn"], correctAnswer: "Cereal" }
  ];

  // ROUND 2 QUESTIONS
const roundTwoQuestions = [
  { id: 11, text: "What color is the sky on a clear day?", options: ["Blue", "Green", "Red", "Yellow"], correctAnswer: "Blue" },
  { id: 12, text: "Which of these animals can fly?", options: ["Dog", "Elephant", "Bird", "Snake"], correctAnswer: "Bird" },
  { id: 13, text: "How many legs does a spider have?", options: ["Six", "Eight", "Ten", "Four"], correctAnswer: "Eight" },
  { id: 14, text: "Which sense do we use to hear?", options: ["Sight", "Taste", "Hearing", "Touch"], correctAnswer: "Hearing" },
  { id: 15, text: "What do we breathe in to stay alive?", options: ["Oxygen", "Helium", "Carbon", "Smoke"], correctAnswer: "Oxygen" },
  { id: 16, text: "What grows on trees and turns color in fall?", options: ["Roots", "Leaves", "Branches", "Fruits"], correctAnswer: "Leaves" },
  { id: 17, text: "Which of these is a shape?", options: ["Circle", "Blue", "Soft", "Tall"], correctAnswer: "Circle" },
  { id: 18, text: "What do we use to write?", options: ["Fork", "Pencil", "Knife", "Brush"], correctAnswer: "Pencil" },
  { id: 19, text: "What is frozen water called?", options: ["Steam", "Rain", "Ice", "Fog"], correctAnswer: "Ice" },
  { id: 20, text: "Which of these is a pet?", options: ["Lion", "Elephant", "Dog", "Whale"], correctAnswer: "Dog" }
];

// ROUND 3 QUESTIONS
const roundThreeQuestions = [
  {
    id: 1,
    text: "What do trees absorb from the air?",
    options: ["Carbon dioxide", "Oxygen", "Hydrogen", "Nitrogen"],
    correctAnswer: "Carbon dioxide"
  },
  {
    id: 2,
    text: "What color do you get when you mix red and blue?",
    options: ["Purple", "Green", "Orange", "Yellow"],
    correctAnswer: "Purple"
  },
  {
    id: 3,
    text: "What is the capital of Japan?",
    options: ["Tokyo", "Beijing", "Seoul", "Bangkok"],
    correctAnswer: "Tokyo"
  },
  {
    id: 4,
    text: "Which animal is known for having a trunk?",
    options: ["Elephant", "Lion", "Crocodile", "Giraffe"],
    correctAnswer: "Elephant"
  },
  {
    id: 5,
    text: "Which of these is a healthy snack?",
    options: ["Apple slices", "Candy", "Fries", "Soda"],
    correctAnswer: "Apple slices"
  },
  {
    id: 6,
    text: "What is ice made of?",
    options: ["Frozen water", "Salt", "Glass", "Plastic"],
    correctAnswer: "Frozen water"
  },
  {
    id: 7,
    text: "What do we use our ears for?",
    options: ["Hearing", "Smelling", "Seeing", "Tasting"],
    correctAnswer: "Hearing"
  },
  {
    id: 8,
    text: "Which of these is a planet in our solar system?",
    options: ["Mars", "Alpha Centauri", "Orion", "Andromeda"],
    correctAnswer: "Mars"
  },
  {
    id: 9,
    text: "What is 10 + 5?",
    options: ["15", "20", "25", "30"],
    correctAnswer: "15"
  },
  {
    id: 10,
    text: "Which of these is used to write?",
    options: ["Pen", "Fork", "Hammer", "Spoon"],
    correctAnswer: "Pen"
  }
];



  //AFFIRMATIONS
  const affirmations = [
    "Even the smallest steps forward are part of a beautiful journey. Keep going — you're doing better than you realize.",
    "Your light is unique, and the world is better because you’re in it. Don’t be afraid to shine.",
    "You are stronger than you think, braver than you feel, and more loved than you know. Today is a new page, and you have the pen.",
    "Peace begins within. Breathe deeply — you are safe, you are capable, and you are growing every day.",
    "There is quiet strength in simply choosing to begin again. Today holds gentle new beginnings."
  ];

  //SHUFFLE LOGIC
  const shuffleArray = (array) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  //START QUIZ
  const handleStart = () => {
    setQuizStarted(true);
    setCurrentRound(1);
    setCurrentQuestionIndex(0);
    setShowAffirmation(false);
    setSelectedAnswer(null);
    setShowResult(false);

    const shuffled = roundOneQuestions.map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }));
    setShuffledQuestions(shuffleArray(shuffled));
  };

  // HANDLE ANSWER AND AUTO-NEXT
const handleAnswer = (option) => {
  playClickSound();
  setSelectedAnswer(option);
  const correct = shuffledQuestions[currentQuestionIndex].correctAnswer === option;
  setIsCorrect(correct);
  setShowResult(true);

  // Auto-advance after short delay (e.g. 1.5 seconds)
  setTimeout(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowAffirmation(true); 
    }
  }, 1500); // adjust delay if needed
};


  return (
    <div className="quiz-container content-box">
      <h1 className="quiz-title">Welcome, Explorer of the Mind</h1>
<p className="quiz-subtitle">Choose your path and begin the journey of self-discovery.</p>


      
      {!quizStarted && (
        <div style={{ textAlign: 'center' }}>
          <label htmlFor="rounds" style={{ fontSize: '18px' }}>Choose number of rounds:</label>
          <br />
          <select
 
  id="rounds"
  className="quiz-select"
  value={rounds}
  onChange={(e) => setRounds(parseInt(e.target.value))}
>


            <option value={1}>1 Round</option>
            <option value={2}>2 Rounds</option>
            <option value={3}>3 Rounds</option>
            <option value={4}>4 Rounds</option>
            <option value={5}>5 Rounds</option>
          </select>
          <br />
          <button className="quiz-button" onClick={handleStart}>Start Quest</button>
        </div>
      )}

      {/*QUIZ IN PROGRESS*/}
      {quizStarted && !showAffirmation && shuffledQuestions.length > 0 && (
        <div>
          <h2>Round {currentRound}</h2>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>
            <strong>Question {currentQuestionIndex + 1}:</strong> {shuffledQuestions[currentQuestionIndex].text}
          </p>

         {shuffledQuestions.length > 0 && shuffledQuestions[currentQuestionIndex] && (
  shuffledQuestions[currentQuestionIndex].options.map((option, idx) => (
    <button
      key={idx}
      onClick={() => handleAnswer(option)}
      disabled={showResult}
      className={`answer-btn ${selectedAnswer === option ? 'selected' : ''}`}
    >
      {option}
    </button>
  ))
)}


          {showResult && (
            <div className="result">
              <p style={{ color: isCorrect ? 'green' : 'red' }}>
                {isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${shuffledQuestions[currentQuestionIndex].correctAnswer}`}
              </p>
              
            </div>
          )}
        </div>
      )}

      {/*AFFIRMATION PAGE*/}
      {showAffirmation && (
        <div className="affirmation">
          <h2 style={{ fontStyle: 'italic', color: '#444' }}>
            {affirmations[Math.floor(Math.random() * affirmations.length)]}
          </h2>
          {currentRound < rounds ? (
            <button
              className="quiz-button"
             onClick={() => {
  setCurrentRound(prev => prev + 1);
  setCurrentQuestionIndex(0);
  setShowAffirmation(false);
  setSelectedAnswer(null);
  setShowResult(false);

  let nextQuestions = [];

  if (currentRound === 1) {
    nextQuestions = roundTwoQuestions;
  } else if (currentRound === 2) {
    nextQuestions = roundThreeQuestions;
  } else {
    // Placeholder: AI questions can go here later
    nextQuestions = roundThreeQuestions;
  }

  const shuffled = nextQuestions.map(q => ({
    ...q,
    options: shuffleArray(q.options)
  }));

  setShuffledQuestions(shuffleArray(shuffled));
}}

            >
              Start Round {currentRound + 1}
            </button>
          ) : (
            <>
  <p className="completion-message">
    All rounds complete. You made it. Thank you for being here.
  </p>
  <Link to="/" className="back-link">← Back to Home</Link>
</>

          )}
        </div>
      )}
    </div>
  );
};





export default Quiz;
