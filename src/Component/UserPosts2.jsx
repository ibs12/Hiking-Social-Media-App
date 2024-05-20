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

const UserPosts2 = ({ userId }) => {
	const [userPostIds, setUserPostIds] = useState([]);
	const [userPostDetails, setUserPostDetails] = useState([]); // Holds data tied to the user's posts
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
		const fetchPostIds = async () => {
			try {
				const response = await fetch(
					`${process.env.REACT_APP_API_PATH}/posts?authorID=${userId}&attributes={"path":"type","equals":"post"}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${sessionStorage.getItem("token")}`,
						},
					}
				);
				if (response.ok) {
					const data = await response.json();
					const ids = data[0].map((post) => post.id);
					setUserPostIds(ids);
					return ids; // Return ids for chaining
				} else {
					throw new Error("Could not get post details");
				}
			} catch (error) {
				console.error("Could not get post details", error);
			}
		};

		const fetchAllUserPostsDetails = async (postIds) => {
			const detailsPromises = postIds.map((postId) => {
				return fetch(`${process.env.REACT_APP_API_PATH}/posts/${postId}`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem("token")}`,
					},
				}).then((res) => res.json());
			});
			const details = await Promise.all(detailsPromises);
			setUserPostDetails(details.filter((detail) => detail !== null));
			setLoading(false);
		};

		fetchPostIds().then((postIds) => {
			if (postIds && postIds.length > 0) {
				fetchAllUserPostsDetails(postIds);
			} else {
				setLoading(false);
			}
		});
	}, [userId]);

	const handleCardClick = (postId) => {
		navigate(`/gallery/post/${postId}`);
	};

	return (
		<div className="LikedArea">
			{loading ? (
				<LoadingIndicator />
			) : userPostDetails.length === 0 ? (
				<>
					<p className="nothingHereText fade-in">
						<br />
						{language === "en" ? "Nothing to see here..." : "Nada que ver aqui..."} <br />
						{language === "en"
							? "When you create posts, they will appear here"
							: "Cuando haces publicaciones, van aparecer aqui"}
					</p>
					<img className="userHikesImage fade-in" src={LikedHikerImage} alt="hiker" />
				</>
			) : (
				<div className="cardsArea fade-in">
					{userPostDetails.map((post) => (
						<ProfilePostCard
							key={post.id}
							image={`${process.env.REACT_APP_API_PATH_SOCKET}${post.attributes?.imgSrc}`}
							onClick={() => handleCardClick(post.id)}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default UserPosts2;
