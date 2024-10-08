import React, { useState, useEffect } from "react";
import uploadImg from "../assets/postSubmissionForm-icons8-upload-image-100.png";
import locationPin from "../assets/postSubmissionForm-icons8-location-pin-50.png";
import closeImg from "../assets/postSubmissionForm-icons8-close-50.png";
import "./PostSubmissionForm.css";
import { Link, useNavigate } from "react-router-dom";

const PostSubmissionForm = ({ loadPosts }) => {
	const [username, setUsername] = useState("");
	const [postTitle, setPostTitle] = useState("");
	const [postCaption, setPostCaption] = useState("");
	const [postLocation, setPostLocation] = useState("");
	const [postTags, setPostTags] = useState([]);
	const [postMessage, setPostMessage] = useState("");
	const [postImgSrc, setPostImgSrc] = useState("");
	const [postImgId, setPostImgId] = useState(0);
	const [postPrivacy, setPostPrivacy] = useState("public");
	const [language, setLanguage] = useState("en");

	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
			setLanguage(storedLanguage);
		}
	}, []);

	const handlePrivacy = (e) => {
		const { value } = e.target;
		setPostPrivacy(value);
	};

	const navigate = useNavigate();

	useEffect(() => {
		fetch(`${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem("user")}`, {
			method: "get",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((result) => {
				if (result && result?.attributes) {
					setUsername(result?.attributes?.username || "");
				}
			})
			.catch((error) => {
				alert("error!");
			});
	}, []);

	const submitHandler = (event) => {
		event.preventDefault();
		if (!postImgSrc || !postTitle || !postCaption || !postLocation) {
      setPostMessage(
        language === "en"
          ? "All fields and a photo are required."
          : "Todos los campos y una foto son requeridos."
      );			return;
		}

    setPostMessage(
      language === "en"
        ? "Post Sent!"
        : "¡Publicación enviada!"
    );
		fetch(process.env.REACT_APP_API_PATH + "/posts", {
			method: "post",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + sessionStorage.getItem("token"),
			},
			body: JSON.stringify({
				authorID: sessionStorage.getItem("user"),
				content: postCaption,
				attributes: {
					imgId: postImgId,
					imgSrc: postImgSrc,
					type: "post",
					title: postTitle,
					location: postLocation,
					tags: postTags,
					likesCount: 0,
					commentCount: 0,
					privacy: postPrivacy,
				},
			}),
		})
			.then((res) => res.json())
			.then(
				(result) => {
					// set a status message, and then set a timeout to clear it after a few seconds
					navigate("/gallery");
				},
				(error) => {
          setPostMessage(
            language === "en"
              ? "Something went wrong."
              : "Algo salió mal."
          );				}
			);
	};

	const handleImageChange = (event) => {
		const image = event.target.files[0];
		if (image) {
			const allowedTypes = [
				"image/png",
				"image/jpeg",
				"image/jpg",
				"image/gif",
				"image/webp",
				"image/svg+xml",
				"audio/wav",
				"audio/mp3",
				"audio/wma",
				"video/mov",
				"video/mp4",
				"video/avi",
				"video/wmv",
				"video/webm",
			];
			// File size exceeds the allowed limit or it's not of an allowed type
			if (image.size > 10 * 1024 * 1024) {
				setPostMessage(
					language === "en"
						? "Please select an image file under 10MB."
						: "Por favor, selecciona un archivo de imagen menor a 10MB."
				);
				return;
			}
			if (!allowedTypes.includes(image.type)) {
				setPostMessage(
					language === "en"
						? "Unsupported file type. Only the following file types are supported: png, jpg, jpeg, gif, webp, svg, wav, mp3, wma, mov, mp4, avi, wmv, webm"
						: "Tipo de archivo no admitido. Solo se admiten los siguientes tipos de archivo: png, jpg, jpeg, gif, webp, svg, wav, mp3, wma, mov, mp4, avi, wmv, webm"
				);
				return;
			}
		}
		setPostMessage("");
		const formData = new FormData();
		formData.append("uploaderID", sessionStorage.getItem("user"));
		formData.append("attributes", JSON.stringify({}));
		formData.append("file", image);
		fetch(process.env.REACT_APP_API_PATH + "/file-uploads", {
			method: "POST",
			headers: {
				Authorization: "Bearer " + sessionStorage.getItem("token"),
			},
			body: formData,
		})
			.then((res) => res.json())
			.then((result) => {
				setPostImgId(result.id);
				setPostImgSrc(result.path);
			});
	};

	const toggleTag = (f) => (e) => {
		e.preventDefault();
		if (postTags.includes(f)) {
			setPostTags(postTags.filter((v) => v != f));
			return;
		}
		setPostTags([f, ...postTags]);
	};
	const inputEl = React.useRef();

	return (
		<div className="post-form-container">
			<div className="new-post-header">
				<Link to="/gallery">
					<img src={closeImg} className="new-post-close-icon" />
				</Link>
			</div>

			<form className="new-post-form" onSubmit={submitHandler}>
				{/* Upload image */}
				<div
					className="image-upload-container"
					onClick={(e) => {
						inputEl.current.click();
					}}
				>
					{postImgSrc ? (
						<img
							src={`${process.env.REACT_APP_API_PATH_SOCKET}${postImgSrc}`}
							alt="Image preview"
							className="post-image-upload-preview"
						/>
					) : (
						<>
							<img src={uploadImg} alt="Upload an image" />
							<br />
							<label>{language === "en" ? "Upload an image here" : "Subir una imagen aquí"}</label>
						</>
					)}
				</div>

				<input
					id="image-upload"
					type="file"
					accept="image/*"
					ref={inputEl}
					onChange={(e) => handleImageChange(e)}
					style={{ display: "none" }}
				/>

				{/* fetch the username */}
				<span className="new-post-username">{username}</span>

				{/* input Title */}
				<input
					id="title"
					className="new-post-text-input"
					type="text"
					placeholder={language === "en" ? "Enter a Title..." : "Ingrese un título..."}
					value={postTitle}
					onChange={(e) => setPostTitle(e.target.value)}
				/>

				{/* input caption */}
				<textarea
					placeholder={language === "en" ? "Enter a Caption..." : "Ingrese un subtítulo..."}
					className="new-post-text-input"
					rows="4"
					value={postCaption}
					onChange={(e) => setPostCaption(e.target.value)}
				/>

				{/* input location. currently its processed as a string */}

				<div className="new-post-location-container">
					<img src={locationPin} className="new-post-location-icon" />
					<input
						type="text"
						className="new-post-text-input"
						placeholder={language === "en" ? "Enter a Location..." : "Ingrese una ubicación..."}
						value={postLocation}
						onChange={(e) => setPostLocation(e.target.value)}
					/>
				</div>

				{/* Tags input */}
				<span className="new-post-tags-label">{language === "en" ? "Tags:" : "Etiquetas:"}</span>
				<div className="filter-container">
					<button
						className={`pill-button orange ${postTags.includes("trail") ? "active" : ""}`}
						onClick={toggleTag("trail")}
					>
						{language === "en" ? "Trail Hikes" : "Caminatas"}
					</button>
					<button
						className={`pill-button purple ${postTags.includes("mountain") ? "active" : ""}`}
						onClick={toggleTag("mountain")}
					>
						{language === "en" ? "Mountains" : "Montañas"}
					</button>
					<button
						className={`pill-button aqua ${postTags.includes("lakes") ? "active" : ""}`}
						onClick={toggleTag("lakes")}
					>
						{language === "en" ? "Lakes" : "Lagos"}
					</button>
					<button
						className={`pill-button blue ${postTags.includes("forests") ? "active" : ""}`}
						onClick={toggleTag("forests")}
					>
						{language === "en" ? "Forests" : "Bosques"}
					</button>
					<button
						className={`pill-button brown ${postTags.includes("urban") ? "active" : ""}`}
						onClick={toggleTag("urban")}
					>
						{language === "en" ? "Urban" : "Urbano"}
					</button>
					<button
						className={`pill-button light-blue ${postTags.includes("coastal") ? "active" : ""}`}
						onClick={toggleTag("coastal")}
					>
						{language === "en" ? "Coastal" : "Costero"}
					</button>
					<button
						className={`pill-button yellow ${postTags.includes("desert") ? "active" : ""}`}
						onClick={toggleTag("desert")}
					>
						{language === "en" ? "Desert" : "Desierto"}
					</button>
					<button
						className={`pill-button light-green ${postTags.includes("wetlands") ? "active" : ""}`}
						onClick={toggleTag("wetlands")}
					>
						{language === "en" ? "Wetlands" : "Humedales"}
					</button>
					<button
						className={`pill-button dark-purple ${postTags.includes("tundra") ? "active" : ""}`}
						onClick={toggleTag("tundra")}
					>
						{language === "en" ? "Tundra" : "Tundra"}
					</button>
					<button
						className={`pill-button green ${postTags.includes("day_hike") ? "active" : ""}`}
						onClick={toggleTag("day_hike")}
					>
						{language === "en" ? "Day Hikes" : "Excursiones de un día"}
					</button>
					<button
						className={`pill-button pink ${postTags.includes("backpacking") ? "active" : ""}`}
						onClick={toggleTag("backpacking")}
					>
						{language === "en" ? "Backpacking" : "Mochilero"}
					</button>
				</div>

				{/* Difficulty input */}
				<span className="new-post-tags-label">{language === "en" ? "Difficulty:" : "Dificultad:"}</span>
				<div className="filter-container">
					<button
						className={`pill-button difficulty-easy ${postTags.includes("easy") ? "active" : ""}`}
						onClick={toggleTag("easy")}
					>
						{language === "en" ? "Easy" : "Fácil"}
					</button>
					<button
						className={`pill-button difficulty-medium ${postTags.includes("medium") ? "active" : ""}`}
						onClick={toggleTag("medium")}
					>
						{language === "en" ? "Medium" : "Medio"}
					</button>
					<button
						className={`pill-button difficulty-hard ${postTags.includes("hard") ? "active" : ""}`}
						onClick={toggleTag("hard")}
					>
						{language === "en" ? "Hard" : "Difícil"}
					</button>
				</div>

				<span className="new-post-tags-label">{language === "en" ? "Visibility:" : "Visibilidad:"}</span>
				<div className="submit-post-privacy">
					<input
						type="radio"
						id="postPublic"
						name="privacy"
						value="public"
						onChange={handlePrivacy}
						checked={postPrivacy === "public"}
					/>
					<label htmlFor="postPublic">{language === "en" ? "Public" : "Público"}</label>
					<input
						type="radio"
						id="postFriends"
						name="privacy"
						value="friends"
						onChange={handlePrivacy}
						checked={postPrivacy === "friends"}
					/>
					<label htmlFor="postFriends">{language === "en" ? "Friends Only" : "Solo amigos"}</label>
				</div>

				<button className="submit-post-button" type="submit">
					{language === "en" ? "Post" : "Publicar"}
				</button>
				<div className="status-message">{postMessage}</div>
			</form>
		</div>
	);
};

export default PostSubmissionForm;
