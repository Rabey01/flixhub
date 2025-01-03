import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";

const App = () => {
  return (
    <Router>
            {/* Routes */}
            <Routes>
                <Route path="/" element={<HomePage />} />
                {/* Add routes for MoviesPage and TVShowsPage later */}
            </Routes>
    </Router>
  );
};

export default App;