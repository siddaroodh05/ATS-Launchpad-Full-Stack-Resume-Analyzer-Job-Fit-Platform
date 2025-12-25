import "../styles/Mcq.css";
import  { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, ChevronRight, ChevronLeft, CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";

export default function QuizPage() {
  const navigate = useNavigate();
  const { resumeId } = useParams();
  
  const [questionss, setQuestionss] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/resume/get-stored-mcqs/${resumeId}`);
        setQuestionss(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    if (resumeId) fetchQuestions();
  }, [resumeId]);

  useEffect(() => {
    if (timeLeft === 0) handleSubmit();
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOptionSelect = (option) => {
    const questionUuid = questionss[currentQuestion].id;
    setSelectedAnswers({ ...selectedAnswers, [questionUuid]: option });
  };

  const handleSubmit = () => {
    let score = 0;

    const formattedQuestions = questionss.map((q) => {
      const userAnswer = selectedAnswers[q.id] || "Skipped";
      const isCorrect = userAnswer === q.answer;
      if (isCorrect) score += 2;

      return {
        questionText: q.question_text,
        options: q.options,
        userAnswer,
        correctAnswer: q.answer
      };
    });

    const timeSpentSeconds = 900 - timeLeft;
    const minutesTaken = Math.floor(timeSpentSeconds / 60);
    const secondsTaken = timeSpentSeconds % 60;
    const timeFormatted = `${minutesTaken}:${secondsTaken < 10 ? "0" : ""}${secondsTaken}`;

    let status = score < 5 ? "Fail" : score >= 8 ? "Excellent" : "Pass";

    navigate("/skill-test/results", { 
      state: { 
        results: {
          score,
          total: questionss.length,
          status,
          percentage: (score / questionss.length) * 100,
          timeTaken: timeFormatted,
          questionss: formattedQuestions
        } 
      } 
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" size={48} />
        <p>Loading questions...</p>
      </div>
    );
  }

  const currentData = questionss[currentQuestion];

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <header className="quiz-header">
          <div className="quiz-info">
            <span className="question-count">
              Question <strong>{currentQuestion + 1}</strong> of {questionss.length}
            </span>
            <div className="timer">
              <Clock size={18} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / questionss.length) * 100}%` }}
            ></div>
          </div>
        </header>

        <main className="question-card">
          <h2 className="question-text">{currentData.question_text}</h2>
          <div className="options-grid">
            {currentData.options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${selectedAnswers[currentData.id] === option ? "selected" : ""}`}
                onClick={() => handleOptionSelect(option)}
              >
                <span className="option-label">{String.fromCharCode(65 + index)}</span>
                <span className="option-value">{option}</span>
              </button>
            ))}
          </div>
        </main>

        <footer className="quiz-footer">
          <button 
            className="nav-btn prev" 
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
          >
            <ChevronLeft size={20} /> Previous
          </button>

          <div className="footer-actions">
            {currentQuestion === questionss.length - 1 ? (
              <button className="submit-btn" onClick={handleSubmit}>
                <CheckCircle size={18} /> Finish Test
              </button>
            ) : (
              <button 
                className="nav-btn next" 
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                Next <ChevronRight size={20} />
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
