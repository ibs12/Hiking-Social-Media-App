import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./ProfilePostModal.css";
import HeartImage from "../assets/Heart.png";
import CommentsImage from "../assets/Comments.png";
import DefaultProfilePic from "../assets/default_user.png";
import BackButton from "../assets/Back.png";
import Xbutton from "../assets/Xbutton.png";
import TrashImage from "../assets/Trash.png";


const ProfilePostModal = ({
	children,
	isOpen,
	onClose,
	image,
	username,
	setMyPosts,
	setCaption,
	caption,
	setLocale,
	locale,
	setSuccessMessage,
	successMessage,
	handleSaveChanges,
	setTags,
	tags,
	handleDeleteTag,
}) => {
	const [showLikesBox, setShowLikesBox] = useState(false);
	const [showCommentsBox, setShowCommentsBox] = useState(false);
	const [comments, setComments] = useState([{ id: 1, username: "anotherUser", text: "This is a comment" }]);
	const [showPostDeleteConfirmation, setShowPostDeleteConfirmation] = useState(false);
	const [showEditBox, setShowEditBox] = useState(false);
	const [tempCaption, setTempCaption] = useState(caption);
	const [tempLocale, setTempLocale] = useState(locale);
	const [tempTags, setTempTags] = useState(tags);
	const navigate = useNavigate();


	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";

			setTempCaption(caption);
			setTempLocale(locale);
			setTempTags(tags);
		} else {
			document.body.style.overflow = "unset";

			setSuccessMessage("");
		}
	}, [isOpen, caption, locale, setSuccessMessage]);

	if (!isOpen) return null;

	const handleHeartClick = () => {
		setShowLikesBox(true);
		setShowCommentsBox(false);
		setShowPostDeleteConfirmation(false);
		setShowEditBox(false);
	};

	const handleCommentsClick = () => {
		setShowCommentsBox(true);
		setShowLikesBox(false);
		setShowPostDeleteConfirmation(false);
		setShowEditBox(false);
	};

	const handleDeleteComment = (index) => {
		// Will probably have to change this at some point
		const updatedComments = comments.filter((_, i) => i !== index);
		setComments(updatedComments);
	};

	const handlePostDeleteClick = () => {
		setShowPostDeleteConfirmation(true);
		setShowLikesBox(false);
		setShowCommentsBox(false);
		setShowEditBox(false);
	};

	const handlePostEditClick = () => {
		setShowEditBox(true);
		setShowPostDeleteConfirmation(false);
		setShowLikesBox(false);
		setShowCommentsBox(false);
	};

	const handleTempDeleteTag = (index) => {
		const updatedTempTags = tempTags.filter((_, i) => i !== index);
		setTempTags(updatedTempTags);
	};

	const handleCardClick = () => {
		navigate("/someotherUser");
	};

	return (
		<div className="postModalOverlay">
			<div className="postModalContent" onClick={(e) => e.stopPropagation()}>
				<img
					src={Xbutton}
					alt="X button"
					className="modalCloseButton"
					onClick={() => {
						onClose();
						setSuccessMessage("");
						setShowEditBox(false);
						setShowPostDeleteConfirmation(false);
						setShowLikesBox(false);
						setShowCommentsBox(false);
						setTempCaption(caption);
						setTempLocale(locale);
						setTempTags(tags);
					}}
				></img>
				{showEditBox ? (
					<>
						<>
							<img src={image} alt="Modal Post" className="postModalPostImage" />
							<img
								src={BackButton}
								alt="Back"
								className="backButton"
								onClick={() => {
									setShowEditBox(false);
									setSuccessMessage("");
									setTempCaption(caption);
									setTempLocale(locale);
									setTempTags(tags);
								}}
							></img>

							<div className="postModalDetailsBox">
								<div className="detailsBoxContent">
									<div className="postCaptionLabel">Caption</div>

									<input
										type="text"
										value={tempCaption}
										onChange={(e) => {
											setTempCaption(e.target.value);
											setSuccessMessage("");
										}}
										className="editCaptionText"
										placeholder="Enter a caption here"
									/>
									<div className="postCaptionLabel">Location</div>

									<input
										type="text"
										value={tempLocale}
										onChange={(e) => {
											setTempLocale(e.target.value);
											setSuccessMessage("");
										}}
										className="editCaptionText"
										placeholder="Enter a caption here"
									/>
									<div className="postCaptionLabel">Tags</div>

									<div className="postTagsArea">
										{tempTags.map((tag, index) => (
											<div key={index} className="postTag">
												{tag}
												<button className="deleteTagButton" onClick={() => handleTempDeleteTag(index)}>
													×
												</button>
											</div>
										))}
									</div>
								</div>
							</div>
							<div className="modalButtonsContainer">
								<button
									className="modalEditButton"
									onClick={() => handleSaveChanges(tempCaption, tempLocale, tempTags)}
								>
									Save Changes
								</button>
								<br />
							</div>
							<div className="postCaptionLabel">{successMessage}</div>
						</>
					</>
				) : showPostDeleteConfirmation ? (
					<>
						<div className="confirmationBox">
							<div className="confirmationMessage">Are you sure you want to delete this post?</div>
							<div className="buttonsArea">
								<button className="modalEditButton" onClick={() => setShowPostDeleteConfirmation(false)}>
									No
								</button>
								<button
									className="modalDeleteButton"
									onClick={() => {
										setShowPostDeleteConfirmation(false);
										// Deleting needs to happen here
										setMyPosts(null);
										onClose();
									}}
								>
									Yes
								</button>
							</div>
						</div>
					</>
				) : showCommentsBox ? (
					<>
						<img src={BackButton} alt="Back" className="backButton" onClick={() => setShowCommentsBox(false)}></img>
						<div className="commentsBox">
							<div className="commentsTitle">Comments</div>
							{comments.map((comment, index) => (
								<div key={comment.id} className="aComment" >
									<img src={DefaultProfilePic} alt="Profile" className="commentProfilePic" onClick={handleCardClick}/>
									<div className="commentUser" onClick={handleCardClick}>{comment.username}:&nbsp;</div>
									<div className="comment">{comment.text}</div>
									<img
										src={TrashImage}
										alt="Trash"
										className="commentDeleteButton"
										onClick={() => handleDeleteComment(index)}
									></img>
								</div>
							))}
							<hr />
						</div>
					</>
				) : showLikesBox ? (
					<>
						<div className="likesBoxHeader">
							<img src={BackButton} alt="Back" className="backButton" onClick={() => setShowLikesBox(false)}></img>
						</div>
						<div className="likesBox">
							<div className="likesTitle">Likes</div>

							<div className="aLike">
								<img src={DefaultProfilePic} alt="Profile" className="commentProfilePic" onClick={handleCardClick}/>
								<div className="likeUser" onClick={handleCardClick}>anotherUser</div>
							</div>
						</div>
					</>
				) : (
					<>
						<img src={image} alt="Modal Post" className="postModalPostImage" />

						<div className="postModalDetailsBox">
							<div className="detailsBoxContent">
								<div className="postUsername">{username}</div>
								<div className="LikesAndCommentsArea">
									<img src={HeartImage} alt="Heart" className="heartImage" onClick={handleHeartClick} /> 1
									<img src={CommentsImage} alt="Comments" className="CommentsImage" onClick={handleCommentsClick} />
								</div>
								<div className="captionText">{caption}</div>
								<div className="postLocationText">{locale}</div>
								<div className="postTagsArea">
									{tags.map((tag, index) => (
										<div key={index} className="postTag">
											{tag}
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="modalButtonsContainer">
							<button className="modalEditButton" onClick={handlePostEditClick}>
								Edit
							</button>
							<button className="modalDeleteButton" onClick={handlePostDeleteClick}>
								Delete
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};
export default ProfilePostModal;
