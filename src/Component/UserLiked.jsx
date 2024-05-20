import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Component/UserLiked.css";
import LikedHikerImage from "../assets/liked_hiker.png";
import ProfilePostCard from "../Component/ProfilePostCard";

const LoadingIndicator = () => {
	return (
		<div className="loading-area">
			<br />
			<div className="loader"></div>
		</div>
	);
};

const UserLiked = ({ likedPosts }) => {
	const [likedPostDetails, setLikedPostDetails] = useState([]); // Holds data tied to posts in likedPosts
	const [loading, setLoading] = useState(true);
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	const navigate = useNavigate();

	// Will fetch post details by ID on load
	useEffect(() => {
		const fetchPostDetails = async (postId) => {
			try {
				const response = await fetch(`${process.env.REACT_APP_API_PATH}/posts/${postId}`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem("token")}`,
					},
				});
				if (response.ok) {
					const data = await response.json();
					return data;
				} else {
					throw new Error("Could not get post details");
				}
			} catch (error) {
				console.error("Could not get post details", error);
				return null;
			}
		};

		// Get details for each post in likedPosts array
		const fetchAllLikedPostsDetails = async () => {
			const detailsPromises = likedPosts.map((postId) => fetchPostDetails(postId));
			const details = await Promise.all(detailsPromises);

			// Prevent null details from being stored
			setLikedPostDetails(details.filter((detail) => detail !== null));
			setLoading(false);
		};

		if (likedPosts.length > 0) {
			fetchAllLikedPostsDetails();
		} else {
			setLoading(false);
		}
	}, [likedPosts]);

	// Send the user to the unique page for a given post
	const handleCardClick = (postId) => {
		navigate(`/gallery/post/${postId}`);
	};

	return (
		<div className="LikedArea">
			{loading ? (
				<LoadingIndicator />
			) : likedPosts.length === 0 ? (
				<>
					<p className="nothingHereText fade-in">
						<br />
						{language === "en" ? "Nothing to see here..." : "Nada que ver aqui..."} <br />
						{language === "en" ? "When you like posts, they will appear here to see here" : "Cuando te gustan publicaciones, van aparecer aqui..."}
					</p>
					<img className="userHikesImage fade-in" src={LikedHikerImage} alt="hiker" />
				</>
			) : (
				<div className="cardsArea fade-in">
					{likedPostDetails.map((post) => (
						<ProfilePostCard
							key={post.id}
							image={`${process.env.REACT_APP_API_PATH_SOCKET}${post.attributes?.imgSrc}`}
							//title={post.attributes?.title} might need this later
							onClick={() => handleCardClick(post.id)}
							
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default UserLiked;
