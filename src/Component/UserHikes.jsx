import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Component/UserHikes.css";
import UserHikesImage from "../assets/user_hikes.png";
import DefaultUserImage from "../assets/default_user.png";
import HikeGroupImage from "../assets/HikeGroup.png";
import HikeOngoingImage from "../assets/HikeOngoing.png";
import HikeCompleteImage from "../assets/HikeComplete.png";
import DistanceImage from "../assets/Distance.png";
import DarkLocation from "../assets/DarkLocation.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faPersonHiking, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";

const UserHikes = ({ username, userId }) => {
	const navigate = useNavigate();
	const [myHikes, setMyHikes] = useState([]);
	const [picture, setPicture] = useState(DefaultUserImage);
	const [milesHiked, setTotalDistance] = useState(0);
	const [hikesCompleted, setTotalHikes] = useState(0);
	const [loading, setLoading] = useState(true);
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	useEffect(() => {
		fetch(`${process.env.REACT_APP_API_PATH}/users/${userId}`, {
			method: "get",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((result) => {
				if (result && result?.attributes) {
					setPicture(result?.attributes?.picture || DefaultUserImage);
				}
			})
			.catch((error) => {});
	}, [userId]);

	const fetchJoinedHikesDetails = async () => {
		try {
			const token = sessionStorage.getItem("token");
			const reactionsUrl = `${process.env.REACT_APP_API_PATH}/post-reactions?reactorID=${userId}&name=join`;
			const reactionsResponse = await fetch(reactionsUrl, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (!reactionsResponse.ok) {
				throw new Error(`Failed to fetch reactions. Status: ${reactionsResponse.status}`);
			}

			const reactionsData = await reactionsResponse.json();

			if (reactionsData.length === 0 || reactionsData[0].length === 0) {
				setMyHikes([]);
				setTotalHikes(0);
				setTotalDistance(0);
				return;
			}

			const postIDs = reactionsData[0].map((reaction) => reaction.postID);
			let hikesData = [];
			let totalDistance = 0;
			let totalCompleted = 0;

			for (const postID of postIDs) {
				const postUrl = `${process.env.REACT_APP_API_PATH}/posts/${postID}`;
				const postResponse = await fetch(postUrl, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});

				if (!postResponse.ok) {
					continue;
				}

				const post = await postResponse.json();
				if (post?.attributes?.type === "hike" || post?.attributes?.type === "completed") {
					if (post?.attributes?.type === "completed") {
						totalDistance += parseFloat(post.attributes.distance) || 0;
						totalCompleted += 1;
					}

					const reactionsFetchResponse = await fetch(
						`https://webdev.cse.buffalo.edu/hci/api/api/wonone/post-reactions?postID=${post.id}`,
						{
							method: "GET",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`,
							},
						}
					);

					if (!reactionsFetchResponse.ok) {
						throw new Error(`Failed to fetch reactions. Status: ${reactionsFetchResponse.status}`);
					}

					const reactionsData = await reactionsFetchResponse.json();
					const joinReactions = reactionsData[0].filter((reaction) => reaction.name === "join");
					const joinReactionsCount = joinReactions?.length;

					hikesData.push({
						id: postID,
						name: post?.attributes?.type,
						title: post?.attributes?.title,
						location: post?.attributes?.location,
						distance: parseFloat(post?.attributes?.distance) || 0,
						author: post?.author?.attributes?.username,
						picture: post?.author?.attributes?.picture || DefaultUserImage,
						hikers: joinReactionsCount,
					});
				}
			}

			setTotalHikes(totalCompleted);
			setTotalDistance(totalDistance);
			setMyHikes(hikesData);
		} catch (error) {
			console.error("Error fetching joined hikes details:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (userId) {
			setLoading(true);

			fetchJoinedHikesDetails();
		}
	}, [userId]);

	const adjustTitleFontSize = (element) => {
		if (!element) return;

		const maxLength = 20; // Maximum length of title before reducing font size
		const baseFontSize = 18; // Base font size in pixels
		const minimumFontSize = 12; // Minimum font size in pixels

		const length = element.innerText.length;
		if (length > maxLength) {
			const reductionFactor = Math.max(minimumFontSize, baseFontSize - (length - maxLength) / 5);
			element.style.fontSize = `${reductionFactor}px`;
		} else {
			element.style.fontSize = `${baseFontSize}px`; // Reset to base font size if within limits
		}
	};

	const handleCardClick = (hikeId) => {
		navigate(`/hikes/post/${hikeId}`);
	};

	return (
		<div className="HikesArea">
			{loading ? (
				<div className="loading-area">
					<br />
					<div className="loader"></div>
				</div>
			) : (
				<>
					<div className="hikesSummary fade-in">
						<img src={DistanceImage} alt="Distance" className="hikeImage" />
						{language === "en" ? "Miles Hiked" : "Millas Recorridas:"} {milesHiked.toFixed(2)} &nbsp;&nbsp;&nbsp;&nbsp;
						<FontAwesomeIcon icon={faCheckCircle} className="person-hiking-image" />
						{language === "en" ? "Hikes Completed:" : "Excursiones Completadas:"} {hikesCompleted}
					</div>
					<div className="hikeCardsArea fade-in">
						{myHikes.length > 0 ? (
							myHikes
								.slice()
								.reverse()
								.map((hike, index) => (
									<div
										key={index}
										className={`hikeCard ${hike.name === "completed" ? "completed-card" : ""}`}
										onClick={() => handleCardClick(hike.id)}
										tabIndex={0}
										onKeyDown={(e) => {
											if (e.keyCode === 13) {
												handleCardClick(hike.id);
											}
										}}
									>
										<div className="cardHeader">
											<img src={hike.picture || DefaultUserImage} alt="Profile" className="hikesProfilePic" />
											<div className="username">{hike.author}</div>
										</div>
										<div className="hikeInfo">
											<div ref={(el) => adjustTitleFontSize(el)} className="hikeTitle">
												{hike.title}
											</div>
											<div className="hikeLocation">
												<img src={DarkLocation} className="locationIcon" alt="Location" />
												<span>{hike.location}</span>
											</div>
										</div>
										<div className="hikeImages">
											<FontAwesomeIcon icon={faPeopleGroup} className="person-hiking-image group-image" />
											<span className="hikers-count">{hike.hikers}</span>
											{hike.name === "completed" ? (
												<>
													<FontAwesomeIcon icon={faCheckCircle} className="person-hiking-image-card group-image" />
													<span className="completed-status">{language === "en" ? "Completed" : "Completada"}</span>
												</>
											) : (
												<>
													<FontAwesomeIcon icon={faPersonHiking} className="person-hiking-image-card group-image" />
													<span className="completed-status">{language === "en" ? "Upcoming" : "Pronto"}</span>
												</>
											)}
										</div>
									</div>
								))
						) : (
							<div>
								<p className="nothingHereText fade-in">
									<br />
									{language === "en" ? "Nothing to see here..." : "Nada que ver aqui..."} <br />
									{language === "en"
										? "When you plan or join hikes, they will appear here"
										: "Cuando planifiques o te unas a caminatas, aparecerán aquí"}
								</p>
								<img className="userHikesImage fade-in" src={UserHikesImage} alt="hiker" />
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default UserHikes;
