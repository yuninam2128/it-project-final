/*
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DetailTodo from "./Routes/DetailTodo";
import Detail from "./Routes/Detail";
import Home from "./Routes/Home";
import LandingPage from "./Routes/LandingPage";
import SignupPage from "./Routes/SignupPage";
import LoginPage from "./Routes/LoginPage";
import Store from "./Routes/Store";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/project/:id" element={<Detail />}/>
        <Route path="/project/:id/:id2" element={<DetailTodo />}/>
      </Routes>
    </Router>
  );
}

export default App;

*/

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import DetailTodo from "./presentation/pages/DetailTodo";
import Detail from "./presentation/pages/Detail";
import Home from "./presentation/pages/Home";
import LandingPage from "./presentation/pages/LandingPage";
import SignupPage from "./presentation/pages/SignupPage";
import LoginPage from "./presentation/pages/LoginPage";
import Store from "./presentation/pages/Store";
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
            {/* <Route path="/project/:id" element={<Detail />} />
            <Route path="/project/:id/:id2" element={<DetailTodo />} /> */}
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;