import logo from "./logo.svg";
import "./App.css";
import SignInSide from "./components/SignIn/SignIn";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import PatientSignUp from "./components/Signup/PatientSignUp";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import ImageAnalyzer from "./pages/ImageAnalyzer";
import DocSignUp from "./components/Signup/DocSignUp";
import SummarizeReport from "./pages/SummarizeReport";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInSide />} />
        <Route path="/login" element={<SignInSide />} />
        <Route path="/signup" element={<PatientSignUp />} />
        <Route path="/docsignup" element={<DocSignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/img" element={<ImageAnalyzer />} />
        <Route path="/summ" element={<SummarizeReport />} />
        {/* ... other routes */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
