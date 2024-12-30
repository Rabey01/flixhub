import { useState,useEffect,useRef } from "react";
import { fetchReleases,fetchSearchResults,fetchTitleDetails } from "../api";
//Material UI components
import { Container,Typography,Grid2,Card,CardContent,CardMedia,CircularProgress,TextField,IconButton,InputAdornment } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

const HomePage = () => {
  const [releases, setReleases] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titleDetails, setTitleDetails] = useState(null);
  const [query, setQuery] = useState(""); // Track search query
  const debounceTimeout = useRef(null); // Add here

  useEffect(() => {
    // Fetch releases (upcoming or recently released)
    const fetchData = async () => {
      // Check if releases data is already stored in localStorage
      const cachedReleases = sessionStorage.getItem('releases');
      
      if (cachedReleases) {
        // Use cached data if available
        setReleases(JSON.parse(cachedReleases)); // Use cached data
		setLoading(false);
      } else {
        // Fetch data if not available in localStorage
        try {
          const data = await fetchReleases("movies"); // Fetch movie releases
          setReleases(data.releases); // Store releases in state
          sessionStorage.setItem('releases', JSON.stringify(data.releases)); // Cache data in localStorage
		  setLoading(false);
        } catch (error) {
          console.error('Error fetching releases:', error);
		  setLoading(false);
        }
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once

	const handleSearch = async (event) => {
		const query = event.target.value;
		console.log("Search Query:", query);
		setQuery(query);

		if (query.length === 0) {
			setSearchResults([]); // Reset search results when query is empty
			setLoading(false); // Ensure loading state is set back to false when clearing
			return; // Exit early to avoid unnecessary API call
		  }

		// Clear the previous timeout to reset the debounce delay
		if (debounceTimeout.current) {
			clearTimeout(debounceTimeout.current);
		}
	
		if (query.length > 2) { // Only start searching if query is more than 2 characters
			debounceTimeout.current = setTimeout(async () => {
				try {
					setLoading(true);
					const data = await fetchSearchResults(query); // Call API for search
					console.log('Search Results:', data); // Log to check if results are returned
	
					// Set the search results directly using API data without modifying field names
					setSearchResults(data.results); // Use the results directly from the API
					setLoading(false);
				} catch (error) {
					console.error("Search error:", error);
					setLoading(false);
				}
			}, 5000); // 500ms debounce time
		} else {
			setSearchResults([]); // Clear search results if the query is empty
		}
	};

	const handleTitleClick = async (id) => {
		try {
		  const data = await fetchTitleDetails(id); // Use the imported function
		  setTitleDetails(data);  // Set the title details in state
		} catch (error) {
		  console.error("Error fetching title details:", error);
		}
	  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: "20px" }}>
		<Typography variant="h3" gutterBottom>
			Welcome to the Movie App
		</Typography>

		<TextField
			label="Search Movies or TV Shows"
			variant="outlined"
			fullWidth
			value={query}
			onChange={handleSearch} // Call handleSearch when input changes
			sx={{ marginBottom: "20px" }}
			slotProps={{
				input: {
				  endAdornment: query && (
					<InputAdornment position="end">
					  <IconButton onClick={() => setQuery("")}>
						<ClearIcon />
					  </IconButton>
					</InputAdornment>
				  ),
				},
			}}
      />

		{loading ? 
			( 
				<CircularProgress/> 
			): titleDetails ? (  // If titleDetails exists, show details and hide grids
					<div>
						<Typography variant="h4" gutterBottom>
							{titleDetails.title} ({titleDetails.year})
						</Typography>
						<Card sx={{ display: 'flex' }}>
							<CardMedia
								component="img"
								height="500"
								image={titleDetails.poster || "https://via.placeholder.com/500x750?text=No+Poster"}
								alt={titleDetails.title}
							/>
							<CardContent>
								<Typography variant="h6">Plot Overview</Typography>
								<Typography>{titleDetails.plot_overview || "No plot available"}</Typography>
						
								<Typography variant="h6" sx={{ marginTop: 2 }}>
									Genres:
								</Typography>
								<Typography>{titleDetails.genre_names ? titleDetails.genre_names.join(", ") : "N/A"}</Typography>
						
								<Typography variant="h6" sx={{ marginTop: 2 }}>
									User Rating: {titleDetails.user_rating || "N/A"}
								</Typography>
						
								<Typography variant="h6" sx={{ marginTop: 2 }}>
									Streaming Sources:
								</Typography>
								{titleDetails.sources && titleDetails.sources.length > 0 ? (
									titleDetails.sources.map((source) => (
										<Typography key={source.source_id}>
										{source.name} ({source.region}) - <a href={source.web_url} target="_blank" rel="noopener noreferrer">Watch Here</a>
										</Typography>
									))
									) : (
									<Typography>No streaming sources available</Typography>
								)}
								
								{titleDetails.trailer ? (
									<Typography variant="h6" sx={{ marginTop: 2 }}>
										Trailer: <a href={titleDetails.trailer} target="_blank" rel="noopener noreferrer">Watch Trailer</a>
									</Typography>
									) : (
									<Typography>No trailer available</Typography>
								)}
							</CardContent>
						</Card>
					</div>
			  ):(
				<>
					{/* Display search results if available */}
					{query.length > 0 ? (
						<>
							<Typography variant="h4" gutterBottom>
								Search Results
							</Typography>
							<Grid2 container spacing={4} justifyContent="center">
								{searchResults.map((item) => (
									<Grid2 xs={12} sm={6} md={3} key={item.id}>
										<Card sx={{ '&:hover': { boxShadow: 10 }, height: '100%' }} onClick={() => handleTitleClick(item.id)}>
										<CardMedia
											component="img"
											height="300"
											width="100%"
											image={item.image_url || "https://via.placeholder.com/300x450?text=No+Poster"} // Use image_url from search results
											alt={item.name} // Use name as the alt text
											loading="lazy"
										/>
										<CardContent>
											<Typography variant="h6">
											{item.name} ({item.year || "N/A"}) {/* Use name and year directly from the search result */}
											</Typography>
										</CardContent>
										</Card>
									</Grid2>
								))}
							</Grid2>
						</>
					):(
						<>
							<Typography variant="h4" gutterBottom>
								Recently Released Movies
							</Typography>

							<Grid2 container spacing={4} justifyContent="center">
								{releases.map((release) => (
									release.type === 'movie' && (
										<Grid2 xs={12} sm={6} md={3} key={release.id}> 
											<Card sx={{ '&:hover': { boxShadow: 10 }, height: '100%' }} onClick={() => handleTitleClick(release.id)}>
												<CardMedia 
													component="img"
													height="300"
													width="100%" 
													image={release.poster_url || "https://via.placeholder.com/300x450?text=No+Poster"}
													alt={release.title}
													loading="lazy"
												/>
												<CardContent>
													<Typography variant="h6">
														{release.title} ({release.source_release_date && typeof release.source_release_date === 'string'? release.source_release_date.slice(0, 4) : "N/A"})
													</Typography>
												</CardContent>
											</Card>
										</Grid2>
									)
								))}
							</Grid2>

							<Typography variant="h4" gutterBottom sx={{ marginTop: "40px" }}>
								Recently released TV Series
							</Typography>

							<Grid2 container spacing={4} justifyContent="center">
								{releases.map((release) => (
									release.type === 'tv_series' && (
									<Grid2 xs={12} sm={6} md={3} key={release.id}>
										<Card sx={{ '&:hover': { boxShadow: 10 }, height: '100%' }} onClick={() => handleTitleClick(release.id)}>
											<CardMedia
												component="img"
												height="300"
												width="100%"
												image={release.poster_url || "https://via.placeholder.com/300x450?text=No+Poster"}
												alt={release.title}
												loading="lazy"
											/>
											<CardContent>
												<Typography variant="h6">
													{release.title} ({release.source_release_date && typeof release.source_release_date === 'string' ? release.source_release_date.slice(0, 4) : "N/A"}) 
												</Typography>
											</CardContent>
										</Card>
									</Grid2>
									)
								))}
							</Grid2>
						</>
					)}	
				</>
			)}
    </Container>
  );
};

export default HomePage;
