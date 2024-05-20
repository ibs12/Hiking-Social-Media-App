import { Link, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faXmark, faLocationDot, faHeart, faLock, faEyeSlash, faBan } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./Buttons.css";
import "./ExplorePost.css";
import "./HikePost.css"
import UnlikedImage from "../assets/Unliked.png";
import LikedImage from "../assets/Liked.png";
import DefaultUserImage from "../assets/default_user.png";

export default function HikePost() {
	const navigate = useNavigate();
	const { postID } = useParams();
	const [post, setPost] = useState({});
	const [optionsExpanded, setOptionsExpanded] = useState(false);
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState(undefined);
	const [joinedHike, setJoinedHike] = useState(false);
	const [isHikeEnded, setIsHikeEnded] = useState(false);
	const [buttonColor, setButtonColor] = useState("green");
	const [toastMessage, setToastMessage] = useState("");
	const [language, setLanguage] = useState("en");

	const showToast = (message) => {
		console.log("Toast opened: ", message)
		setToastMessage(message);
		const toastElement = document.getElementById('blockToast');
		if (toastElement) {
		  toastElement.classList.add('block-toast-visible');
		  setTimeout(() => {
			toastElement.classList.remove('block-toast-visible');
			navigate("/hikes");
		  }, 3000);
		}
	};
	

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	useEffect(() => {
		if (isHikeEnded) {
			setButtonColor("gray");
		} else {
			setButtonColor(joinedHike ? "red" : "green");
		}
	}, [isHikeEnded, joinedHike]);

	const fetchComments = () => {
		let url = process.env.REACT_APP_API_PATH + "/posts?sort=oldest&parentID=" + postID;
		fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + sessionStorage.getItem("token"),
			},
		})
			.then((res) => res.json())
			.then((result) => {
				if (result) {
					setComments(result[0]);
				}
			});
	};

	useEffect(() => {
		fetchComments();
	}, []);

	const submitComment = (e) => {
		if (e.key != "Enter") {
			return;
		}
		if (!newComment) {
			return;
		}
		let url = process.env.REACT_APP_API_PATH + "/posts";
		fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + sessionStorage.getItem("token"),
			},
			body: JSON.stringify({
				authorID: sessionStorage.getItem("user"),
				content: newComment,
				parentID: postID,
			}),
		}).then(() => fetchComments());
		setNewComment("");
	};

	const [userID, setUserID] = useState(-1);
	const [likeImage, setLikeImage] = useState(UnlikedImage);
	const [refreshLikedImage, setRefreshLikedImage] = useState(false);
	const [currentUserPicture, setCurrentUserPicture] = useState(DefaultUserImage);

	useEffect(() => {
		if (!sessionStorage.getItem("token")) {
			navigate("/");
			window.location.reload();
			return;
		}

		let url = process.env.REACT_APP_API_PATH + "/posts/" + postID;
		fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + sessionStorage.getItem("token"),
			},
		})
			.then((res) => res.json())
			.then((result) => {
				if (result) {
					setPost(result);
					setIsHikeEnded(result?.attributes?.type === "completed");
				}
			});
	}, []);

	// Will grab the ID of the user and info on whether the post has been liked by the user on load AND when a post is liked/unkliked
	useEffect(() => {
		// Fetch user details to get the user's ID
		fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((userResult) => {
				if (userResult && userResult.attributes) {
					const userID = userResult.id;
					const userImage = userResult.attributes.picture;
					setUserID(userID);
					setCurrentUserPicture(userImage || DefaultUserImage);

					// Fetch the post's reactions now that we have the ID of the user
					return fetch(`${process.env.REACT_APP_API_PATH}/post-reactions?postID=${postID}`, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${sessionStorage.getItem("token")}`,
						},
					});
				} else {
					throw new Error("User not found");
				}
			})
			.then((res) => res.json())
			.then((reactionsResult) => {
				// Proceed if reactionsResult exists and the first element in reactionsResult is an array of reactions
				if (reactionsResult && Array.isArray(reactionsResult[0])) {
					// Determine whether or not we have liked the post already
					const hasLiked = reactionsResult[0].some(
						(reaction) => reaction.reactorID === userID && reaction.name === "like"
					);

					// Update state based on whether the user has liked the post or not
					if (hasLiked) {
						setLikeImage(LikedImage);
					} else {
						setLikeImage(UnlikedImage);
					}

					const isJoined = reactionsResult[0].some(
						(reaction) => reaction.reactorID === userID && reaction.name === "join"
					);
					setJoinedHike(isJoined);
				}
			})

			.catch((error) => {
				// Not sure what to do with error handling yet
				console.error("Error:", error);
			});
	}, [postID, userID, refreshLikedImage]);

	const blockPost = async (postID) => {
		setOptionsExpanded(!optionsExpanded);
		try {
			const userID = sessionStorage.getItem("user");
			let url = `${process.env.REACT_APP_API_PATH}/posts/${postID}`;
	
			// Fetch current post data to update
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`
				}
			});
	
			const postData = await response.json();
	
			// Ensure blockedBy array exists and add userID if not already present
			const blockedBy = postData.attributes.blockedBy || [];
			if (!blockedBy.includes(parseInt(userID))) {
				blockedBy.push(parseInt(userID));
			}
	
			// Update post with new blockedBy array
			const patchResponse = await fetch(url, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`
				},
				body: JSON.stringify({ attributes: { ...postData.attributes, blockedBy } })
			});
	
			if (patchResponse.ok) {
				// needs translation
				showToast(language === "en" ? "The hike has been hidden." : "La excursión ha sido escondida.");
			} else {
				throw new Error("Failed to block the post.");
			}
		} catch (error) {
			console.error("Error blocking post:", error);
			// needs translation
			showToast(language === "en" ? "Failed to hide the hike." : "No se pudo esconder la excursión.");
		}
	};

	
	// This runs whenever we click on the heart button
	const toggleLikePost = async (postID, reactorID) => {
		try {
			// Fetch user details to get the user's ID
			// We do this because we want to make sure the user is logged in as they press the button. If not, don't continue.
			const userResponse = await fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			});
			const userResult = await userResponse.json();
			if (!userResult) {
				alert("Cannot submit a like or dislike. Please ensure you are logged in.");
				throw new Error("User could not be found");
			}

			// Fetch the post's reactions
			const reactionsResponse = await fetch(`${process.env.REACT_APP_API_PATH}/post-reactions?postID=${postID}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			});

			// Make sure to wait for the server response before going on
			const reactionsResult = await reactionsResponse.json();

			// Assuming the API returns an array of reactions directly
			const reactions = reactionsResult[0] || [];

			// Find if the user has already liked the post
			// Done by finding the User ID and the "like" name in the same reactions object
			const myLikeReaction = reactions.find((reaction) => reaction.reactorID === reactorID && reaction.name === "like");

			// Convert the result of finding a like by this user into a simple boolean to be used to determine if we need to like or unlike
			const hasLiked = Boolean(myLikeReaction);

			// Run if the user has liked the post. If so, we need to delete this user's like reaction
			if (hasLiked) {
				await fetch(`${process.env.REACT_APP_API_PATH}/post-reactions/${myLikeReaction.id}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem("token")}`,
					},
				});

				// This will force one useEffect to run again
				// Done to update the heart image
				setRefreshLikedImage((prevState) => !prevState);
				updateUserLikedPosts(postID, "remove");

				// Otherwise, we should post a like to the backend
			} else {
				const payload = {
					postID: postID, // ID of the post we are trying to like
					reactorID: reactorID, // ID of the user liking the comment
					name: "like", // This is the type of the reaction
					value: 1, // Let's say comments have a value of 1
					attributes: {}, // Can be used to hold a comment in the future
				};

				// Post the new like reaction to the database
				const addReactionResponse = await fetch(`${process.env.REACT_APP_API_PATH}/post-reactions`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem("token")}`,
					},
					body: JSON.stringify(payload),
				});

				// Done for error handling
				if (!addReactionResponse.ok) {
					alert("Cannot submit a like or unlike. Please Try again.");
					throw new Error("Failed to add like");
				}
				setRefreshLikedImage((prevState) => !prevState);
				updateUserLikedPosts(postID, "add");
			}
		} catch (error) {
			alert("Cannot submit a like or unlike. Please Try again.");
			console.error("Error toggling like:", error);
		}
	};

	const updateUserLikedPosts = async (postId, action) => {
		try {
			// Get the current user data from the database
			const response = await fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			});

			// Execute if something went wrong
			if (!response.ok) {
				alert("Error adding or removing this post to you list of liked posts!");
				throw new Error("Failed to get user data from database");
			}

			const userData = await response.json();

			let existingLikedPosts;

			// Execute if there is an array of liked posts in this user's data
			if (userData.attributes.likedPosts) {
				existingLikedPosts = JSON.parse(userData.attributes.likedPosts);
				// Otherwise, we have to make it
			} else {
				existingLikedPosts = [];
			}
			// Determine whether or not to add or remove this post from the user's likedPosts array
			let updatedLikedPostsArray;
			if (action === "add") {
				updatedLikedPostsArray = [...existingLikedPosts, parseInt(postId)];
			} else if (action === "remove") {
				updatedLikedPostsArray = existingLikedPosts.filter((id) => id !== parseInt(postId));
			} else {
				// Not sure if we need anything here. Probably don't
			}

			// Prepare the data to be sent in the patch for updating user's likedPosts array
			const updateUserDataPayload = {
				attributes: {
					...userData.attributes, // Keeps other data like username, city, and more untouched
					likedPosts: JSON.stringify(updatedLikedPostsArray),
				},
			};

			// Patch the user's data in the database
			const updateResponse = await fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
				body: JSON.stringify(updateUserDataPayload),
			});

			// Execute if something went wrong with the patch
			if (!updateResponse.ok) {
				alert("Error adding or removing this post to you list of liked posts!");
				throw new Error("Failed to update user data in database");
			}
		} catch (error) {
			alert("Error adding or removing this post to you list of liked posts!");
			console.error("Error updating user's likedPosts:", error);
		}
	};

	const toggleJoinPost = async (postID, reactorID) => {
		try {
			// Fetch user details to get the user's ID
			// We do this because we want to make sure the user is logged in as they press the button. If not, don't continue.
			const userResponse = await fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			});
			const userResult = await userResponse.json();
			if (!userResult) {
				alert("Cannot submit a like or dislike. Please ensure you are logged in.");
				throw new Error("User could not be found");
			}

			// Fetch the post's reactions
			const reactionsResponse = await fetch(`${process.env.REACT_APP_API_PATH}/post-reactions?postID=${postID}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			});

			// Make sure to wait for the server response before going on
			const reactionsResult = await reactionsResponse.json();

			// Assuming the API returns an array of reactions directly
			const reactions = reactionsResult[0] || [];

			// Find if the user has already liked the post
			// Done by finding the User ID and the "join" name in the same reactions object
			const myJoinReaction = reactions.find((reaction) => reaction.reactorID === reactorID && reaction.name === "join");

			// Convert the result of finding a like by this user into a simple boolean to be used to determine if we need to like or unlike
			const hasJoined = Boolean(myJoinReaction);

			// Run if the user has liked the post. If so, we need to delete this user's like reaction
			if (hasJoined) {
				await fetch(`${process.env.REACT_APP_API_PATH}/post-reactions/${myJoinReaction.id}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem("token")}`,
					},
				});

				// This will force one useEffect to run again
				// Done to update the heart image
				setJoinedHike(!joinedHike);
				updateGroupChatData(parseInt(postID), userID, !joinedHike);

				// Otherwise, we should post a like to the backend
			} else {
				const payload = {
					postID: postID, // ID of the post we are trying to like
					reactorID: reactorID, // ID of the user liking the comment
					name: "join", // This is the type of the reaction
					value: 1, // Let's say comments have a value of 1
					attributes: {}, // Can be used to hold a comment in the future
				};

				// Post the new like reaction to the database
				const addReactionResponse = await fetch(`${process.env.REACT_APP_API_PATH}/post-reactions`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem("token")}`,
					},
					body: JSON.stringify(payload),
				});

				// Done for error handling
				if (!addReactionResponse.ok) {
					alert("Cannot submit a join or unjoin. Please try again.");
					throw new Error("Failed to join");
				}
				setJoinedHike(!joinedHike);
				updateGroupChatData(parseInt(postID), userID, !joinedHike);
			}
		} catch (error) {
			console.error("Error toggling join:", error);
		}
	};

	const tagIncluded = (name) => post?.attributes?.tags?.includes(name);

	// Add or remove this user from the group chat depending on whether or not they have
	// joined or left the hike. If the creator of the hike tries to join or leave the hike, do nothing
	const updateGroupChatData = async (postId, userId, hasJoined) => {
		const groupResponse = await fetch(`${process.env.REACT_APP_API_PATH}/groups`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		});

		if (!groupResponse.ok) {
			throw new Error("Failed to fetch group data");
		}

		const groupData = await groupResponse.json();

		// Find the group associated with the this hike
		const filteredGroup = groupData[0].filter(
			(group) => group.name === "hm" && group.attributes.originalPost === postId
		)[0];

		// If we have found the group, let do work
		if (filteredGroup) {
			// If the creator is trying to join or leave the hike, do nothing
			if (filteredGroup.attributes.creatorId === userId) {
				return;
			}

			const group = filteredGroup;

			let updatedChatters = group.attributes.chatters ? [...group.attributes.chatters] : [];
			let updatedHasNewMessage = { ...group.attributes.hasNewMessage };

			// The user is joining the hike, so add them to the chat...
			if (hasJoined) {
				// Add user to chatters array
				updatedChatters.push(userId);

				// Check if chat history exists. If it does, mark that the user will have new messages to read
				if (group.attributes.chatHistory && group.attributes.chatHistory.length > 0) {
					updatedHasNewMessage[userId] = true;
				} else {
					updatedHasNewMessage[userId] = true;
				}

				// Otherwise we need to remove this user from the chatters array and the dictionary
			} else {
				updatedChatters = updatedChatters.filter((id) => id !== userId);
				delete updatedHasNewMessage[userId];
			}

			// Prepare updated group data to patch
			const updatedGroup = {
				...group,
				attributes: {
					...group.attributes,
					chatters: updatedChatters,
					hasNewMessage: updatedHasNewMessage,
				},
			};

			// Patch the updated group data
			const patchResponse = await fetch(`${process.env.REACT_APP_API_PATH}/groups/${group.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
				body: JSON.stringify(updatedGroup),
			});

			if (!patchResponse.ok) {
				throw new Error("Failed to patch updated group data");
			}
		} else {
			throw new Error("Group not found for the given post ID");
		}
	};

	// Function to end hike
	const endHike = async (postId) => {
		if (post.attributes.type === "completed") {
			return;
		}

		// Update post type to "completed"
		const updatePostResponse = await fetch(`${process.env.REACT_APP_API_PATH}/posts/${postID}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({
				attributes: {
					...post.attributes,
					type: "completed",
				},
			}),
		});

		if (updatePostResponse.ok) {
			const groupResponse = await fetch(`${process.env.REACT_APP_API_PATH}/groups`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			});

			if (!groupResponse.ok) {
				throw new Error("Failed to fetch group data");
			}

			const groupData = await groupResponse.json();

			// Find the group associated with the this hike
			const filteredGroup = groupData[0].filter(
				(group) => group.name === "hm" && group.attributes.originalPost === postId
			)[0];

			// If we have found the group, lets do work
			if (filteredGroup) {
				const group = filteredGroup;

				// Prepare updated group data to patch
				const updatedGroup = {
					...group,
					name: "ch",
					attributes: {
						...group.attributes,
					},
				};

				// Patch the updated group data
				const patchResponse = await fetch(`${process.env.REACT_APP_API_PATH}/groups/${group.id}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${sessionStorage.getItem("token")}`,
					},
					body: JSON.stringify(updatedGroup),
				});

				if (patchResponse.ok) {
					setIsHikeEnded(true);
				}

				if (!patchResponse.ok) {
					throw new Error("Failed to patch updated group data");
				}
			} else {
				throw new Error("Group not found for the given post ID");
			}
		}
	};

	return (
		<div className="page fade-in">
			<div className="post-wrapper">
				<div className="post-container">
					<div className="post-img">
						<img
							src={`${process.env.REACT_APP_API_PATH_SOCKET}${post?.attributes?.imgSrc}`}
							alt={post?.attributes?.title}
						/>
					</div>
					<div className="post-info">
						<div className="post-control-header">
							{/* if post is not by logged in user display hide option */}
							{sessionStorage.getItem("user") !== post?.authorID ? 
								<div className="options-container">
									<button
										className="pill-button"
										onClick={() => {
											setOptionsExpanded(!optionsExpanded);
										}}
									>
										<FontAwesomeIcon icon={faEllipsis} />
									</button>
									<div className={`options-dropdown ${optionsExpanded ? "options-dropdown-active" : ""}`}>
									<button className="post-options-button" onClick={() => blockPost(postID)}>
										{/* needs translation update */}
										<FontAwesomeIcon icon={faEyeSlash} /> {language === "en" ? "Hide Hike" : "Esconder Excursión"}
									</button>
									</div>
								</div>
							: null}
							<div>
								{post?.attributes?.privacy == "friends" && (
									<FontAwesomeIcon
										icon={faLock}
										title={language === "en" ? "Only visible to friends" : "Sólo visible para amigos"}
									/>
								)}
							</div>
							<Link
								to="/hikes"
								onClick={(e) => {
									e.preventDefault(); // Prevent default link behavior
									window.history.back(); // Navigate back in the browser history
								}}
							>
								<FontAwesomeIcon icon={faXmark} />
							</Link>
						</div>
						<h1 className="post-title">{post?.attributes?.title}</h1>
						<div className="post-location">
							<FontAwesomeIcon className="post-location-icon" icon={faLocationDot} />
							<span className="post-location-text">{post?.attributes?.location}</span>
						</div>
						<p>{post?.content}</p>
						<div className="filter-container">
							<span className={`pill-button orange ${tagIncluded("trail") ? "" : "tag-hidden"}`}>
								{language === "en" ? "Trail Hikes" : "Caminatas"}
							</span>
							<span className={`pill-button purple ${tagIncluded("mountain") ? "" : "tag-hidden"}`}>
								{language === "en" ? "Mountains" : "Montañas"}
							</span>
							<span className={`pill-button aqua ${tagIncluded("lakes") ? "" : "tag-hidden"}`}>
								{language === "en" ? "Lakes" : "Lagos"}
							</span>
							<span className={`pill-button blue ${tagIncluded("forests") ? "" : "tag-hidden"}`}>
								{language === "en" ? "Forests" : "Bosques"}
							</span>
							<span className={`pill-button brown ${tagIncluded("urban") ? "" : "tag-hidden"}`}>
								{language === "en" ? "Urban" : "Urbano"}
							</span>
							<span className={`pill-button light-blue ${tagIncluded("coastal") ? "" : "tag-hidden"}`}>
								{language === "en" ? "Coastal" : "Costero"}
							</span>
							<span className={`pill-button yellow ${tagIncluded("desert") ? "" : "tag-hidden"}`}>
								{language === "en" ? "Desert" : "Desierto"}
							</span>
							<span className={`pill-button light-green ${tagIncluded("wetlands") ? "" : "tag-hidden"}`}>
								{language === "en" ? "Wetlands" : "Humedales"}
							</span>
							<span className={`pill-button dark-purple ${tagIncluded("tundra") ? "" : "tag-hidden"}`}>
								{language === "en" ? "Tundra" : "Tundra"}
							</span>
							<span className={`pill-button green ${tagIncluded("day_hike") ? "" : "tag-hidden"}`}>
								{language === "en" ? "Day Hikes" : "Excursiones de un día"}
							</span>
							<span className={`pill-button pink ${tagIncluded("backpacking") ? "" : "tag-hidden"}`}>
								{language === "en" ? "Backpacking" : "Mochilero"}
							</span>
							<span className={`pill-button difficulty-easy ${tagIncluded("easy") ? "" : "tag-hidden"}`}>
								{language === "en" ? "Easy" : "Fácil"}
							</span>
							<span className={`pill-button difficulty-medium ${tagIncluded("medium") ? "" : "tag-hidden"}`}>
								{language === "en" ? "Medium" : "Medio"}
							</span>
							<span className={`pill-button difficulty-hard ${tagIncluded("hard") ? "" : "tag-hidden"}`}>
								{language === "en" ? "Hard" : "Difícil"}
							</span>
						</div>
						<div className="post-profile">
							<div className="post-profile-img">
								<Link to={post?.author?.id === userID ? "/settings" : `/profile/${post?.author?.id}`} className="link">
									<img
										src={post?.author?.attributes?.picture || DefaultUserImage}
										alt={post?.author?.attributes?.username || "username"}
									/>
								</Link>
							</div>
							<div className="post-profile-info">
								<Link to={post?.author?.id === userID ? "/settings" : `/profile/${post?.author?.id}`} className="link">
									<span className="post-profile-info-author">{post?.author?.attributes?.username}</span>
								</Link>

								<span className="post-profile-info-bio">{post?.author?.attributes?.bio}</span>
							</div>
						</div>
						{userID === post?.author?.id ? (
							<button
								className={`pill-button ${buttonColor}`}
								disabled={post?.attributes?.type === "completed"}
								onClick={() => endHike(parseInt(postID))}
							>
								{language === "en"
									? isHikeEnded
										? "Hike Completed"
										: "End Hike"
									: isHikeEnded
									? "Excursión Completada"
									: "Completar Excursión"}
							</button>
						) : (
							<button
								disabled={post?.attributes?.type === "completed"}
								className={`pill-button ${buttonColor}`}
								onClick={() => toggleJoinPost(postID, userID)}
							>
								{language === "en"
									? post?.attributes?.type === "completed"
										? "Hike Completed"
										: joinedHike
										? "Leave Hike"
										: "Join Hike"
									: post?.attributes?.type === "completed"
									? "Excursión Completada"
									: joinedHike
									? "Salir de la Excursión"
									: "Unirse a la Excursión"}
							</button>
						)}

						<div className="post-comments">
							<span className="post-comments-header">{language === "en" ? "Comments:" : "Comentarios:"}</span>
							{comments.length == 0 && (
								<span className="post-comments-no-comments">
									{language === "en"
										? "No comments yet. You could be the first comment!"
										: "Sin comentarios aún. ¡Tú podrías ser el primer comentario!"}
								</span>
							)}
							<div className="post-comments-comments">
								{comments.map((c) => (
									<div className="post-comment">
										<img
											src={c?.author?.attributes?.picture || DefaultUserImage}
											alt="username"
											className="post-interaction-commenter-profile-img"
										/>
										<Link to={c?.author?.id === userID ? "/settings" : `/profile/${c?.author?.id}`} className="link">
											<span className="post-comment-author">{c?.author?.attributes?.username}:&nbsp;</span>
										</Link>

										<span className="post-comment-content">{c?.content}</span>
									</div>
								))}
							</div>
						</div>
						<div className="post-interaction">
							<div className="post-interaction-header">
								<span>{language === "en" ? "What do you think?" : "¿Qué opinas?"}</span>
								<button className="post-interaction-header-button">
									<img
										src={likeImage}
										alt="Heart"
										className="heart-image"
										onClick={() => toggleLikePost(postID, userID)}
									/>
								</button>
							</div>
							<div className="post-interaction-comment">
								<div className="post-interaction-profile-img">
									<img src={currentUserPicture} alt="username" />
								</div>
								<input
									className="post-interaction-comment-input"
									type="text"
									name="new-comment"
									placeholder={language === "en" ? "Add a comment?" : "Escribe un comentario"}
									value={newComment}
									onChange={(e) => setNewComment(e.target.value)}
									onKeyDown={submitComment}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div id="blockToast" className="block-toast">{toastMessage}</div>
		</div>
	);
}
