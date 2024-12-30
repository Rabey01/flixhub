import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";

const App = () => {
  return (
    <Router>
        <div>
            {/* Navigation Bar */}
            <nav>
                <ul>
                    <li>
                        <a href="/">Home</a>
                    </li>
                    {/* Add more links for Movies and TV Shows pages later */}
                </ul>
            </nav>

            {/* Routes */}
            <Routes>
                <Route path="/" element={<HomePage />} />
                {/* Add routes for MoviesPage and TVShowsPage later */}
            </Routes>
        </div>
    </Router>
  );
};

export default App;