import { BrowserRouter as Router, Route, Routes } from "react-router";
import {
  AProblem,
  Auth,
  Home,
  Leaderboard,
  NotFoundPage,
  Problem,
} from "./pages";
import Navbar from "./layouts/Navbar";
import Footer from "./layouts/Footer";

function App() {
  return (
    <Router>
      <div className="grid w-full grid-cols-1 min-h-[100dvh] grid-rows-[auto_1fr_auto]">
        <Navbar />
        <Routes>
          <Route index element={<Home />} />
          <Route path="signin" element={<Auth />} />
          <Route path="problems" element={<Problem />} />
          <Route path="problems/:problemId" element={<AProblem />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
