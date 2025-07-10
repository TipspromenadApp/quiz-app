import React, { useState } from 'react';
import '../Styles.css';

function Landing() {
  const [questionType, setQuestionType] = useState('multiple');
  const [questionData, setQuestionData] = useState({
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionData({ ...questionData, [name]: value });
  };

  const handleCorrectAnswerChange = (e) => {
    setQuestionData({ ...questionData, correctAnswer: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = {
        text: questionData.text,
        correctAnswer: questionData.correctAnswer,
        ...(questionType === 'multiple' && {
          optionA: questionData.optionA || null,
          optionB: questionData.optionB || null,
          optionC: questionData.optionC || null,
          optionD: questionData.optionD || null,
        }),
      };

      const response = await fetch('http://localhost:5249/Question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create question');
      }

      const data = await response.json();
      setSuccess(data.message);
      setQuestionData({
        text: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: '',
      });
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    }
  };

  return (
    <div className="home-container">
      <h1 className="welcome-text">Create a Quiz Question</h1>
      <form className="question-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Question Type</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="multiple">Multiple Choice (3+ Options)</option>
            <option value="text">Text Input</option>
          </select>
        </div>
        <div className="form-group question-text-group">
          <label>Question Text</label>
          <textarea
            className="question-text-input"
            name="text"
            value={questionData.text}
            onChange={handleInputChange}
            required
          />
        </div>
        {questionType === 'multiple' && (
          <>
            <div className="form-group">
              <label>Option A</label>
              <input
                type="text"
                name="optionA"
                value={questionData.optionA}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Option B</label>
              <input
                type="text"
                name="optionB"
                value={questionData.optionB}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Option C</label>
              <input
                type="text"
                name="optionC"
                value={questionData.optionC}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Option D (Optional)</label>
              <input
                type="text"
                name="optionD"
                value={questionData.optionD}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Correct Answer</label>
              <select
                value={questionData.correctAnswer}
                onChange={handleCorrectAnswerChange}
                required
              >
                <option value="">Select Correct Answer</option>
                {questionData.optionA && <option value={questionData.optionA}>{questionData.optionA}</option>}
                {questionData.optionB && <option value={questionData.optionB}>{questionData.optionB}</option>}
                {questionData.optionC && <option value={questionData.optionC}>{questionData.optionC}</option>}
                {questionData.optionD && <option value={questionData.optionD}>{questionData.optionD}</option>}
              </select>
            </div>
          </>
        )}
        {questionType === 'text' && (
          <div className="form-group">
            <label>Correct Answer (Text or Number)</label>
            <input
              type="text"
              name="correctAnswer"
              value={questionData.correctAnswer}
              onChange={handleInputChange}
              required
            />
          </div>
        )}
        <button type="submit" className="form-button">Save Question</button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
}

export default Landing;