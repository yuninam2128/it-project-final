import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import DetailTodo from "./presentation/pages/DetailTodo";
import Detail from "./presentation/pages/Detail";
import Home from "./presentation/pages/Home.jsx";
import LandingPage from "./presentation/pages/LandingPage";
import SignupPage from "./presentation/pages/SignupPage";
import LoginPage from "./presentation/pages/LoginPage";
import Store from "./presentation/pages/Store";
import TodaysTodoTest from "./presentation/pages/TodaysTodoTest";
import { AuthProvider } from "./presentation/hooks/useAuth";
import ErrorBoundary from "./presentation/components/ErrorBoundary";


function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/store" element={<Store />} />
            <Route path="/project/:projectId" element={<Detail />} />
            <Route path="/test/todays-todo" element={<TodaysTodoTest />} />
            {/* <Route path="/project/:id" element={<Detail />} />
            <Route path="/project/:id/:id2" element={<DetailTodo />} /> */}
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;