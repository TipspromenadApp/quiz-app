import { useState } from "react";
import axios from "axios";

export default function StartQuiz() {
  const [count, setCount] = useState(5);
  const [random, setRandom] = useState(false);
  const [questions, setQuestions] = useState([]);

  const startQuiz = async () => {
    const res = await axios.get(`http://localhost:5000/quiz/start?count=${count}&random=${random}`);
    setQuestions(res.data);
  };

  return (
    <div>
      <label>Number of Questions:
        <input type="number" value={count} onChange={e => setCount(e.target.value)} />
      </label>
      <label>
        <input type="checkbox" checked={random} onChange={e => setRandom(e.target.checked)} />
        Random Order
      </label>
      <button onClick={startQuiz}>Start Quiz</button>

      <ul>
        {questions.map(q => (
          <li key={q.id}>{q.text}</li>
        ))}
      </ul>
    </div>
  );
}
