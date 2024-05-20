import React, { useState, useEffect, useRef } from "react";
import "../App.css";
import "../Component/Profile.css";
import UserLiked from "./UserLiked";
import UserPosts from "./UserPosts";
import UserPosts2 from "./UserPosts2";
import UserHikes from "./UserHikes";
import DeleteProfileModal from "./DeleteProfileModal";
import EditProfileModal from "./EditProfileModal";
import LoadingModal from "./LoadingModal";
import DefaultUserImage from "../assets/default_user.png";
import LocationIconImage from "../assets/location_icon.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash, faLocationDot } from "@fortawesome/free-solid-svg-icons";

// The Profile component shows data from the user table.  This is set up fairly generically to allow for you to customize
// user data by adding it to the attributes for each user, which is just a set of name value pairs that you can add things to
// in order to support your group specific functionality.  In this example, we store basic profile information for the user
const Profile = (props) => {
	// states which contain basic user information/attributes
	// Initially set them all as empty strings to post them to the backend
	const [picture, setPicture] = useState(DefaultUserImage);
	const [friendsCount, setFriendsCount] = useState("0");
	const [activeTab, setActiveTab] = useState("Liked");
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [inputUsername, setInputUsername] = useState("");
	const [inputCity, setInputCity] = useState("");
	const [selectedState, setSelectedState] = useState("NY");
	const [actualUsername, setActualUsername] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [likedPosts, setLikedPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const userId = sessionStorage.getItem("user");
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	useEffect(() => {
		const storedTab = sessionStorage.getItem("selectedTab");
		if (storedTab) {
			setActiveTab(storedTab);
		}
	}, []);

	const handleClickTab = (tabName) => {
		sessionStorage.setItem("selectedTab", tabName);
		setActiveTab(tabName);
	};

	const likedRef = useRef(null);
	const postsRef = useRef(null);
	const hikesRef = useRef(null);

	useEffect(() => {
		fetch(`https://webdev.cse.buffalo.edu/hci/api/api/wonone/connections?anyUserID=${userId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((response) => response.json())
			.then((data) => {
				// Filter the data to get only the connections where status is "Friends"
				const filteredConnections = data[0].filter((connection) => connection.attributes.status === "Friends");
				setFriendsCount(filteredConnections.length);
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	}, []);

	useEffect(() => {
		fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
			method: "get",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then(async (result) => {
				if (result && result?.attributes) {
					// Set user data states
					setActualUsername(result?.attributes?.username || "");
					setInputCity(
						result?.attributes?.city != null ? result?.attributes?.city : language === "en" ? "Somewhere" : "En algún lugar"
					);
					setPicture(result?.attributes?.picture || DefaultUserImage);

					const likedPostsString = result?.attributes?.likedPosts || "[]"; // Get liked posts as a string
					const likedPostsArray = JSON.parse(likedPostsString); // Parse the string into an array
					const likedPosts = likedPostsArray.map((postIdStr) => parseInt(postIdStr)); // Convert strings to integers

					const temp = [];

					for (const postId of likedPosts) {
						try {
							const response = await fetch(`${process.env.REACT_APP_API_PATH}/posts/${postId}`, {
								method: "GET",
								headers: {
									"Content-Type": "application/json",
									Authorization: `Bearer ${sessionStorage.getItem("token")}`,
								},
							});

							if (response.ok) {
								temp.push(postId);
							}
						} catch (error) {}
					}

					setLikedPosts(temp);
					setLoading(false);
				}
			})
			.catch((error) => {
				console.error("Error fetching user data:", error);
			});
	}, [language]);

	const submitHandler = async (newUsername, newCity, newState, newPicture) => {
		let pictureURL;

		const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
		const citySpecialCharRegex = /[!@#$%^&*().?":{}|<>]/;

		if (specialCharRegex.test(newUsername)) {
			setSuccessMessage(
				language === "en"
					? `Username cannot contain special characters: !@#$%^&*(),.?":{}|<>`
					: `El nombre de usuario no puede contener caracteres especiales: !@#$%^&*(),.?":{}|<>`
			);
			return;
		}

		if (citySpecialCharRegex.test(newCity)) {
			setSuccessMessage(
				language === "en"
					? `City cannot contain special characters: !@#$%^&*().?":{}|<>`
					: `La ciudad no puede contener caracteres especiales: !@#$%^&*().?":{}|<>`
			);
			return;
		}

		if (newCity.length > 35) {
			setSuccessMessage(
				language === "en" ? "City must be 35 characters or less." : "Cuidad debe tener 35 caracteres o menos."
			);
			return;
		}

		if (newUsername.length > 20) {
			setSuccessMessage(
				language === "en"
					? "Username must be 20 characters or less."
					: "El nombre de usuario debe tener 20 caracteres o menos."
			);
			return;
		}

		const checkUsernameExists = async () => {
			const queryParams = encodeURIComponent(
				JSON.stringify({
					path: "username",
					equals: newUsername,
				})
			);
			const response = await fetch(`${process.env.REACT_APP_API_PATH}/users?attributes=${queryParams}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			});
			const data = await response.json();
			return data[0] && data[0].length > 0;
		};

		if (newUsername !== actualUsername) {
			const usernameExists = await checkUsernameExists();
			if (usernameExists) {
				setSuccessMessage(
					language === "en"
						? "Username already exists. Choose a different username."
						: "El nombre de usuario ya existe. Elija un nombre de usuario diferente."
				);
				return;
			}
		}

		// Only post if the potential new picture is different
		if (newPicture != picture) {
			const formData = new FormData();
			formData.append("uploaderID", sessionStorage.getItem("user"));
			formData.append("attributes", JSON.stringify({}));
			formData.append("file", newPicture);

			try {
				const response = await fetch(process.env.REACT_APP_API_PATH + "/file-uploads", {
					method: "POST",
					headers: {
						Authorization: "Bearer " + sessionStorage.getItem("token"),
					},
					body: formData,
				});
				const result = await response.json();
				if (result) {
					pictureURL = "https://webdev.cse.buffalo.edu" + result.path;
				}
			} catch (error) {
				setSuccessMessage(
					language === "en" ? "Error in saving profile picture!" : "¡Error al guardar la foto de perfil!"
				);
				return;
			}
		}

		// We do this to make sure we don't delete any extra data while editing a profile
		const currentAttributes = await fetchUserAttributes();

		const attributes = {
			username: newUsername,
			city: newCity,
			state: newState,
			likedPosts: currentAttributes.likedPosts,
		};
		if (newPicture != picture) {
			attributes.picture = pictureURL;
		} else {
			attributes.picture = picture;
		}

		// Update user's attributes
		fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
			body: JSON.stringify({ attributes }),
		})
			.then((res) => res.json())
			.then((result) => {
				setSuccessMessage(language === "en" ? "Your changes have been saved" : "Cambios han sido guardados");
				setActualUsername(newUsername);
				setInputCity(newCity);
				setSelectedState(newState);
				if (newPicture != picture) {
					setPicture(pictureURL);
				}
			})
			.catch((error) => {});
	};

	const getUnderlineStyle = () => {
		let activeRef;

		if (activeTab === "Liked") activeRef = likedRef;
		else if (activeTab === "Posts") activeRef = postsRef;
		else if (activeTab === "Hikes") activeRef = hikesRef;

		const isMobile = window.innerWidth <= 768;

		const extraWidth = isMobile ? 10 : 15;
		const shiftLeftAmount = isMobile ? 20 : 50;

		if (activeRef && activeRef.current) {
			return {
				left: activeRef.current.offsetLeft - shiftLeftAmount - extraWidth / 2,
				width: activeRef.current.offsetWidth + extraWidth,
				bottom: -3,
			};
		} else {
			return {};
		}
	};

	const handleOpenDeleteModal = () => {
		setIsDeleteModalOpen(true);
	};

	const handleCloseDeleteModal = () => {
		setIsDeleteModalOpen(false);
	};

	const handleOpenEditModal = () => {
		setIsEditModalOpen(true);
	};

	const handleCloseEditModal = () => {
		setIsEditModalOpen(false);
	};

	// Function to handle deletion (remains unchanged)
	const handleDeleteProfile = () => {
		// TO BE ADDED: Deletion logic will go here

		setIsDeleteModalOpen(false);
	};

	const handleEditProfile = () => {
		setIsEditModalOpen(false);
	};

	const handleClickSaveChanges = (newUsername, newCity, newState, newPicture) => {
		submitHandler(newUsername, newCity, newState, newPicture);
	};

	// Prevent scrolling when a modal is open
	useEffect(() => {
		document.body.style.overflow = isDeleteModalOpen || isEditModalOpen ? "hidden" : "unset";
	}, [isDeleteModalOpen, isEditModalOpen]);

	// Used to preserve user attributes that will remain untouched while editing a profile
	const fetchUserAttributes = async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
			});
			if (!response.ok) {
				throw new Error("Failed to fetch user data");
			}
			const userData = await response.json();
			return userData.attributes;
		} catch (error) {}
	};

	if (loading) {
		return <LoadingModal />;
	}

	// This is the function that draws the component to the screen.  It will get called every time the
	// state changes, automatically.  This is why you see the username and firstname change on the screen
	// as you type them.
	return (
		<>
			<h1 className="title-profile ">{language === "en" ? "Profile and Settings" : "Perfil y Ajustes"}</h1>
			<br />

			<img src={picture || DefaultUserImage} alt="your profile avatar" className="profilePic fade-in" />
			<div className="usernameText fade-in">{actualUsername}</div>

			<div className="locationText fade-in">
				<FontAwesomeIcon icon={faLocationDot} />
				&nbsp;{inputCity}
			</div>
			<div className="friendsText fade-in">
				{" "}
				{friendsCount} {language === "en" ? "Friend(s)" : "Amigo(s)"}
			</div>
			<div className="buttonsArea ">
				<button className="editProfileButton fade-in" onClick={handleOpenEditModal}>
					<FontAwesomeIcon icon={faPencil} />
					&nbsp;{language === "en" ? "Edit Profile" : "Editar Perfil"}
				</button>
				<EditProfileModal
					isOpen={isEditModalOpen}
					onClose={handleCloseEditModal}
					onConfirm={handleEditProfile}
					errorMessage={errorMessage}
					setErrorMessage={setErrorMessage}
					actualUsername={actualUsername}
					inputCity={inputCity}
					selectedState={selectedState}
					picture={picture}
					handleClickSaveChanges={handleClickSaveChanges}
					successMessage={successMessage}
					setSuccessMessage={setSuccessMessage}
					submitHandler={submitHandler}
				/>
				<button className="deleteProfileButton fade-in" onClick={handleOpenDeleteModal}>
					<FontAwesomeIcon icon={faTrash} />
					&nbsp;{language === "en" ? "Delete Profile" : "Borrar Perfil"}
				</button>
				<DeleteProfileModal
					isOpen={isDeleteModalOpen}
					onClose={handleCloseDeleteModal}
					onConfirm={handleDeleteProfile}
					errorMessage={errorMessage}
					setErrorMessage={setErrorMessage}
					inputUsername={inputUsername}
					setInputUsername={setInputUsername}
					actualUsername={actualUsername}
				/>
			</div>
			<div className="LikedPostsHikesArea fade-in">
				<div
					tabIndex={0}
					ref={likedRef}
					className="LikedText"
					onClick={() => handleClickTab("Liked")}
					onKeyDown={(e) => {
						if (e.keyCode === 13) {
							handleClickTab("Liked");
						}
					}}
				>
					{language === "en" ? "Liked" : "Gustado"}
				</div>

				<div
					tabIndex={0}
					ref={postsRef}
					className="PostsText"
					onClick={() => handleClickTab("Posts")}
					onKeyDown={(e) => {
						if (e.keyCode === 13) {
							handleClickTab("Posts");
						}
					}}
				>
					{language === "en" ? "Posts" : "Publicaciones"}
				</div>

				<div
					tabIndex={0}
					className="HikesText"
					ref={hikesRef}
					onClick={() => handleClickTab("Hikes")}
					onKeyDown={(e) => {
						if (e.keyCode === 13) {
							setActiveTab("Hikes");
						}
					}}
				>
					{language === "en" ? "Hikes" : "Excursiones"}
				</div>
				<div className="underline" style={getUnderlineStyle()}></div>
			</div>

			{activeTab === "Liked" ? (
				<div>
					<UserLiked likedPosts={likedPosts}></UserLiked>
				</div>
			) : activeTab === "Posts" ? (
				<div>
					{/* <UserPosts username={actualUsername}></UserPosts> */}
					<UserPosts2 userId={userId}></UserPosts2>
				</div>
			) : activeTab === "Hikes" ? (
				<div>
					<UserHikes picture={picture} userId={userId} username={actualUsername}></UserHikes>
				</div>
			) : null}
		</>
	);
};

export default Profile;
