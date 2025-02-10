import { Route, Routes } from "react-router-dom";
import {
  AProblem,
  Auth,
  Home,
  Leaderboard,
  NotFoundPage,
  Problem,
  TermsCondition,
  Register,
} from "./pages";
import Navbar from "./layouts/Navbar";
import Footer from "./layouts/Footer";
import Provider from "./components/Providers";
import LoginGuard from "./guards/LoginGuard";
import AuthGuard from "./guards/AuthGuard";

export const App = () => {
  return (
    <div className="grid w-full grid-cols-1 min-h-[100dvh] grid-rows-[auto_1fr_auto]">
      <Provider>
        <Navbar />
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route element={<LoginGuard />}>
            <Route path="login" element={<Auth />} />
            <Route path="register" element={<Register />} />
          </Route>
          <Route element={<AuthGuard />}>
            <Route path="problems" element={<Problem />} />
            <Route path="problems/:problemId" element={<AProblem />} />
            <Route path="leaderboard" element={<Leaderboard />} />
          </Route>

          <Route path="terms-&-condition" element={<TermsCondition />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </Provider>
    </div>
  );
};

// export default App;
