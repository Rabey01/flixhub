import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { Typography } from "@mui/material";

const App = () => {
  return (
    <Router>
            {/* Routes */}
            <Routes>
                <Route path="/" element={<HomePage />} />
                {/* Add routes for MoviesPage and TVShowsPage later */}
            </Routes>
            <Typography variant="body2" sx={{ color: '#B0B0B0', fontSize: '0.875rem' }}>
              Streaming data provided by <a href="https://www.watchmode.com" target="_blank" rel="noopener noreferrer" style={{ color: '#B0B0B0', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={e => e.target.style.color = 'rgb(86, 178, 165)'} onMouseOut={e => e.target.style.color = '#B0B0B0'}>Watchmode</a>
            </Typography>
    </Router>
  );
};

export default App;