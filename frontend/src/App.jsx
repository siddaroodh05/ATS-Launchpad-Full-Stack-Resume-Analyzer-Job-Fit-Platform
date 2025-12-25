import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UploadResume from "./pages/UploadResume";
import Analysis from "./pages/Analysis";
import JobFitHome from "./pages/JobFitHome";
import SkillTestHome from "./pages/SkillTestHome";
import QuizPage from "./pages/MCQs";
import ResultsPage from "./pages/ResultsPage";
import JobFitAnalysis from "./pages/JobFitAnalysis";
import JobMatchesHome from "./pages/JobMatchesHome";
import JobMatchListings from "./pages/JobMatchListings";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadResume />} />
            <Route path="/skill-test" element={<SkillTestHome />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/analysis/:id" element={<Analysis />} />
            <Route path="/mcqs/:resumeId" element={<QuizPage />} />
            <Route path="/skill-test/results" element={<ResultsPage />} />
            <Route path="/job-fit" element={<JobFitHome />} />
            <Route path="/job-fit/analysis/:id" element={<JobFitAnalysis />} />
            <Route path="/job-matches" element={<JobMatchesHome />} />
            <Route path="/job-matches/listings/:resumeId" element={<JobMatchListings />} />
          </Routes>
        </div>

        <footer className="app-footer">
          &copy; {new Date().getFullYear()} YourCompanyName. All rights reserved.
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
