import React, { useState, useEffect } from "react";
import Search from "./components/Search";
import MovieCard from "./components/MovieCard";
import Spinner from "./components/Spinner";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchTerm } from "./appwrtie";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
	method: "GET",
	headers: {
		accept: "application/json",
		Authorization: `Bearer ${API_KEY}`,
	},
};

const App = () => {
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	const [movies, setMovies] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const [trendingMovies, setTrendingMovies] = useState([]);

	useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

	const fetchTrendingMovies = async () => {
		try {
			const movies = await getTrendingMovies();
			setTrendingMovies(movies);
		} catch (error) {
			console.error(`Error fetching trending movies: ${error}`);
		}
	};

	useEffect(() => {
		fetchTrendingMovies();
	}, []);

	const fetchMovies = async (query = "") => {
		setIsLoading(true);
		setErrorMessage("");

		try {
			const endpoint = query
				? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
				: `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
			const response = await fetch(endpoint, API_OPTIONS);

			if (!response.ok) {
				throw new Error("Failed to fetch movies");
			}

			const data = await response.json();

			if (data.Response === "False") {
				setErrorMessage(data.Error || "Failed to fetch movies");
				setMovies([]);
				return;
			}
			setMovies(data.results);

			if (query && data.results.length > 0) {
				await updateSearchTerm(query, data.results[0]);
			}
		} catch (error) {
			console.error(`Error fetching movies: ${error}`);
			setErrorMessage("Error fetching movies. Please try again later.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchMovies(debouncedSearchTerm);
	}, [debouncedSearchTerm]);

	return (
		<main>
			<div className="pattern" />
			<div className="wrapper">
				<header>
					<img src="./hero-img.png" alt="hero-img" />
					<h1>
						Find <span className="text-gradient">Movies</span> You'll Enjoy
						Without The Hassle
					</h1>
					<Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
				</header>

				{trendingMovies.length > 0 && (
					<section className="trending">
						<h2 className="mt-[10px] md:mt-[20px]">Trending Movies</h2>
						<ul>
							{trendingMovies.map((movie, index) => (
								<li key={movie.$id}>
									<p>{index + 1}</p>
									<img src={movie.poster_url} alt={movie.title} />
								</li>
							))}
						</ul>
					</section>
				)}

				<section className="all-movies">
					<h2 className="mt-[10px] md:mt-[20px]">All Movies</h2>
					{isLoading ? (
						<Spinner />
					) : errorMessage ? (
						<p className="text-red-500">{errorMessage}</p>
					) : (
						<ul>
							{movies.map((movie) => (
								<MovieCard key={movie.id} movie={movie} />
							))}
						</ul>
					)}
				</section>
			</div>
		</main>
	);
};

export default App;
