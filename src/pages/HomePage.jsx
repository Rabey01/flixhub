import { useState,useEffect,useRef } from "react";
import { fetchReleases,fetchSearchResults,fetchTitleDetails } from "../api";
//Material UI components
import { Container,Typography,Card,CardContent,CardMedia,CircularProgress,TextField,
		IconButton,InputAdornment,Dialog,DialogTitle,DialogContent,Button,Skeleton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from '@mui/icons-material/Search';

const HomePage = () => {
  const [releases, setReleases] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [titleDetails, setTitleDetails] = useState(null);
  const [open, setOpen] = useState(false);
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

	const abortController = useRef(new AbortController());

	const handleSearch = async (event) => {
		setErrorMessage('');
		const query = event.target.value;
		setQuery(query);

		if (query.length === 0) {
			setSearchResults([]); // Reset search results when query is empty
			setLoading(false); // Ensure loading state is set back to false when clearing
			return; // Exit early to avoid unnecessary API call
		  }

		abortController.current.abort();
		abortController.current = new AbortController();

		// Clear the previous timeout to reset the debounce delay
		if (debounceTimeout.current) {
			clearTimeout(debounceTimeout.current);
		}
	
		if (query.length > 2) { // Only start searching if query is more than 2 characters
			debounceTimeout.current = setTimeout(async () => {
				try {
					setLoading(true);
					const data = await fetchSearchResults(query, { signal: abortController.current.signal }); // Call API for search
					console.log('Search Results:', data); // Log to check if results are returned
	
					// Set the search results directly using API data without modifying field names
					setSearchResults(data.results); // Use the results directly from the API
					setLoading(false);
				} catch (error) {
					if (error.name === 'AbortError') {
							console.log('Previous search was aborted.');
						} else {
							console.error("Search error:", error);
						}
						setLoading(false);
					}
				  }, 300);
		} else {
			setSearchResults([]); // Clear search results if the query is empty
			setErrorMessage('Oops! Something went wrong, please try again.');
		}
	};

	const handleTitleClick = async (id) => {
		try {
			const data = await fetchTitleDetails(id);
			setTitleDetails(data);
			setOpen(true); // Open modal
			console.log(data);
		} catch (error) {
			console.error("Error fetching title details:", error);
		}
	};
	  
	const handleClose = () => {
		setOpen(false);
		setTitleDetails(null); // Reset title details
	};

  return (
    <Container maxWidth="lg" sx={{ paddingTop: "40px",paddingBottom: "40px", }}>
		<Typography variant="h3" gutterBottom sx={{ 
			color: "#FFFFFF",  // White text for high contrast
			fontWeight: "700",  // Bold font for a strong title
			fontSize: {xs: "2rem", sm: "3rem", md: "3rem"},   // Large size for impact
			letterSpacing: "1px",  // Slightly increased letter spacing for a modern look
			textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)",  // Subtle text shadow to add depth
			textTransform: "uppercase",  // Make the text uppercase for a sleek look
			textAlign: "center" 
		}}>
			FlixHub
		</Typography>

		{query.length === 0 && (
			<Typography variant="body1" sx={{ 
				marginBottom: "20px",
				color: "#B0B0B0", 
				fontSize: { xs: "0.9rem", sm: "1.2rem" }, 
				lineHeight: "1.6", 
				textAlign: "center"
			}}>
			Your one-stop platform for discovering where to stream movies and TV shows, anytime, anywhere			</Typography>
		)}

		<TextField
			label="Search Movies and TV Series"
			variant="outlined"
			fullWidth
			value={query}
			onChange={handleSearch} // Call handleSearch when input changes
			sx={{
				marginBottom: "20px",
				backgroundColor: "#333333",
				color: "#E0E0E0",
				'& .MuiOutlinedInput-root': {
					backgroundColor: '#333333',
					'& fieldset': {
						borderColor: '#444444',
					},
					'&:hover fieldset': {
						borderColor: '#1976D2',
					},
					'&.Mui-focused fieldset': {
						borderColor: '#1976D2',
					},
					'& input': {
						color: '#E0E0E0',
						backgroundColor: '#333333 !important',
					},
					'& input:disabled': {
						backgroundColor: '#333333 !important',
					}
				},
				'& .MuiInputLabel-root': {
					color: "#B0B0B0",
				},
			}}
			slotProps={{
				input: {
					startAdornment: (
						<InputAdornment position="start">
						  <SearchIcon sx={{ color: "#B0B0B0" }} />
						</InputAdornment>
					  ),
					endAdornment: query && (
						<InputAdornment position="end">
						<IconButton onClick={() => setQuery("")}>
							<ClearIcon sx={{ color: "#B0B0B0" }} />
						</IconButton>
						</InputAdornment>
					),
				},
			}}
      />

		{loading ? 
			( 
				<div>
					<Skeleton variant="text" width="80%" height={40} sx={{ marginBottom: 2 }} />
					<Skeleton variant="rectangular" width="100%" height={300} sx={{ marginBottom: 2 }} />
					<Skeleton variant="rectangular" width="100%" height={300} sx={{ marginBottom: 2 }} />
					<CircularProgress sx={{ color: "#4CAF50" }} />
       			 </div> 
			): titleDetails ? (  // If titleDetails exists, show details and hide grids
				<Dialog open={open} onClose={handleClose}  maxWidth="sm" fullWidth sx={{ backgroundColor: "#2A2A2A", color: "#E0E0E0" }}>
					<DialogTitle sx={{ backgroundColor: "#2A2A2A", color: "#E0E0E0" }}>
						{titleDetails.title} ({titleDetails.year}) 
						<IconButton onClick={handleClose} sx={{ position: 'absolute', right: 10, top: 10, color: "#FFFFFF" }}>
							<ClearIcon />
						</IconButton>
					</DialogTitle>
					<DialogContent sx={{ backgroundColor: "#2A2A2A", color: "#E0E0E0" }}>
						<Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, backgroundColor: "#333333", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"}}>
							<CardMedia
								component="img"
								height="400"
								image={titleDetails.posterMedium || "https://via.placeholder.com/500x750/333333/FFFFFF?text=No+Poster"}
								alt={titleDetails.title}
								sx={{ width: '100%', maxWidth: '400px', marginBottom: { xs: '10px', sm: '0' } }}
							/>
							<CardContent sx={{ display: 'flex', flexDirection: 'column',  color: "#E0E0E0" }}>
								<Typography variant="h6" sx={{ marginTop: 2, color: "#E0E0E0" }}>Overview</Typography>
								<Typography sx={{ color: "#B0B0B0" }}>{titleDetails.plot_overview || "No plot available"}</Typography>
								<Typography variant="h6" sx={{ marginTop: 2, color: "#E0E0E0" }}>
									Genres:
								</Typography>
								<Typography sx={{ color: "#B0B0B0" }}>{titleDetails.genre_names ? titleDetails.genre_names.join(", ") : "N/A"}</Typography>
								<Typography variant="h6" sx={{ marginTop: 2, color: "#E0E0E0" }}>
									User Rating: {titleDetails.user_rating || "N/A"}
								</Typography>
								<Typography variant="h6" sx={{ marginTop: 2, color: "#E0E0E0"  }}>
									Streaming Sources:
								</Typography>
								{titleDetails.sources && titleDetails.sources.length > 0 ? (
									titleDetails.sources.map((source) => (
										<Typography key={source.source_id} sx={{ color: "#B0B0B0" }}>
											{source.name} ({source.region}) - <a href={source.web_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', fontWeight: 'bold' }}>Watch Here</a>
										</Typography>
									))
								) : (
									<Typography sx={{ color: "#B0B0B0" }}>No streaming sources found</Typography>
								)}

								<Typography variant="h6" sx={{ marginTop: 2, color: "#E0E0E0" }}>Watch the Trailer:</Typography>
								<a href={titleDetails.trailer} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', fontWeight: 'bold' }}>View Trailer</a>

								{titleDetails.trailer_thumbnail && (
									<a href={titleDetails.trailer} target="_blank" rel="noopener noreferrer">
										<img src={titleDetails.trailer_thumbnail} alt="Trailer Thumbnail" style={{ width: '100%', borderRadius: '8px', marginTop: '10px', transition: 'transform 0.3s' }} />
									</a>
								)}
							</CardContent>
						</Card>
					</DialogContent>
				</Dialog>
			):(
				<>
					{/* Display search results if available */}
					{query.length > 0 ? (
						<>
							<Typography variant="h4" gutterBottom sx={{ color: "#FFFFFF",marginBottom: "20px", fontSize: { xs: "1.3rem", sm: "1.5rem", md: "2rem" } }}>
								Search Results
							</Typography>
							
							<Button
								onClick={() => {
									setQuery("");  // Clear the search query
									setSearchResults([]);  // Reset the search results
								}}
								sx={{
									color: "#E0E0E0",backgroundColor: "#444444",marginBottom: "20px",padding: "12px 24px",fontWeight: "600",textTransform: "none",transition: "all 0.3s ease", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)", 
									'&:hover': {backgroundColor: "#555555",boxShadow: "0 6px 12px rgba(0, 0, 0, 0.4)", transform: "scale(1.05)"}
								}}
							>
								Go Back
							</Button>

							<div style={{ display: 'grid',gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px',}}>							
								{searchResults.map((item) => (
									<div key={item.id}>
										<Card sx={{'&:hover': { boxShadow: 10, transform: 'scale(1.05)',transition: 'transform 0.3s, box-shadow 0.3s'},height: '100%',cursor: 'pointer',backgroundColor: '#333333',position: 'relative',}} onClick={() => handleTitleClick(item.id)}>
										<CardMedia
											component="img"
											height="300"
											sx={{ objectFit: 'cover' }}
											image={item.image_url || "https://via.placeholder.com/300x450/333333/FFFFFF?text=No+Poster"} // Use image_url from search results
											alt={item.name} // Use name as the alt text
											loading="lazy"
										/>
										<CardContent sx={{ color: "#E0E0E0" }}>
											<Typography variant="h6" sx={{ color: "#B0B0B0", fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" } }}>
											{item.name} ({item.year || "N/A"}) {/* Use name and year directly from the search result */}
											</Typography>
										</CardContent>
										</Card>
									</div>
								))}
							</div>
							{errorMessage && <Typography variant="h6" color="error" sx={{backgroundColor: '#333333', color: '#FF5722',padding: '10px',borderRadius: '5px',marginTop: '10px', fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" }}}>{errorMessage}</Typography>}
						</>
					):(
						<>
							<Typography variant="h4" gutterBottom sx={{ marginTop: "40px", color: "#FFFFFF",marginBottom: "20px", fontSize: { xs: "1.3rem", sm: "1.5rem", md: "2rem" } }}>
							Coming Soon: Movies
							</Typography>
							<div style={{ display: 'grid',gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px',}}>
								{releases.map((release) => (
									release.type === 'movie' && (
										<div key={release.id}>
											<Card sx={{'&:hover': { boxShadow: 10, transform: 'scale(1.05)',transition: 'transform 0.3s, box-shadow 0.3s'},height: '100%',cursor: 'pointer',position: 'relative',backgroundColor: '#333333'}} onClick={() => handleTitleClick(release.id)}>
												<CardMedia 
													component="img"
													height="300"
													sx={{ objectFit: 'cover' }} 
													image={release.poster_url || "https://via.placeholder.com/300x450/333333/FFFFFF?text=No+Poster"}
													alt={release.title}
													loading="lazy"
												/>
												<CardContent sx={{ color: "#E0E0E0" }}>
													<Typography variant="h6" sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" } }}>
														{release.title} ({release.source_release_date && typeof release.source_release_date === 'string'? release.source_release_date.slice(0, 4) : "N/A"})
													</Typography>
												</CardContent>
											</Card>
										</div>
									)
								))}
							</div>

							<Typography variant="h4" gutterBottom sx={{ marginTop: "40px",color: "#FFFFFF",marginBottom: "20px", fontSize: { xs: "1.3rem", sm: "1.5rem", md: "2rem" } }}>
							Coming Soon: TV Series
							</Typography>
							<div style={{ display: 'grid',gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px',}}>
								{releases.map((release) => (
									release.type === 'tv_series' && (
										<div key={release.id}>
											<Card sx={{'&:hover': { boxShadow: 10, transform: 'scale(1.05)',transition: 'transform 0.3s, box-shadow 0.3s'},height: '100%',cursor: 'pointer',backgroundColor: '#333333',position: 'relative'}} onClick={() => handleTitleClick(release.id)}>
												<CardMedia
													component="img"
													height="300"
													sx={{ objectFit: 'cover' }}
													image={release.poster_url || "https://via.placeholder.com/300x450/333333/FFFFFF?text=No+Poster"}
													alt={release.title}
													loading="lazy"
												/>
												<CardContent sx={{ color: "#E0E0E0" }}>
													<Typography variant="h6" sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" } }}>
														{release.title} ({release.source_release_date && typeof release.source_release_date === 'string' ? release.source_release_date.slice(0, 4) : "N/A"}) 
													</Typography>
												</CardContent>
											</Card>
										</div>
									)
								))}
							</div>
						</>
					)}	
				</>
			)}
    </Container>
  );
};

export default HomePage;
