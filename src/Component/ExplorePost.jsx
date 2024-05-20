import { Link, useParams } from "react-router-dom";
import React, { useEffect, useState, version } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faEllipsis,
  faXmark,
  faLocationDot,
  faHeart,
  faPaperPlane,
  faLock,
  faBan,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./Buttons.css";
import "./ExplorePost.css";
import UnlikedImage from "../assets/Unliked.png";
import LikedImage from "../assets/Liked.png";
import DefaultUserImage from "../assets/default_user.png";
import EditButtons from "./EditButtons";

export default function PostPage() {
  const navigate = useNavigate();
  const { postID } = useParams();
  const [post, setPost] = useState({});
  const [optionsExpanded, setOptionsExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState(undefined);
  const [likeCount, setLikeCount] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [language, setLanguage] = useState("en");
  const [postAuthorId, setPostAuthorId] = useState(undefined);

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);
  version = postID % 2 == 0;

  const showToast = (message) => {
		console.log("Toast opened: ", message)
		setToastMessage(message);
		const toastElement = document.getElementById('blockToast');
		if (toastElement) {
		  toastElement.classList.add('block-toast-visible');
		  setTimeout(() => {
			toastElement.classList.remove('block-toast-visible');
			navigate("/gallery");
		  }, 3000);
		}
	};

  const fetchComments = () => {
    let url =
      process.env.REACT_APP_API_PATH + "/posts?sort=oldest&parentID=" + postID;
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

  const incrementLikesCount = async () => {
    const updateLikes = {
      attributes: {
        ...post.attributes, // Keeps post data untouched
        likesCount: likeCount + 1,
      },
    };

    try {
      // Patch the post's data in the database
      const response = await fetch(
        `${process.env.REACT_APP_API_PATH}/posts/${postID}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateLikes),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
    } catch (error) {
      console.error("Error updating likes count:", error);
    }
  };

  const decrementLikesCount = async () => {
    const updateLikes = {
      attributes: {
        ...post.attributes, // Keeps post data untouched
        likesCount: likeCount - 1,
      },
    };

    try {
      // Patch the post's data in the database
      const response = await fetch(
        `${process.env.REACT_APP_API_PATH}/posts/${postID}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateLikes),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
    } catch (error) {
      console.error("Error updating likes count:", error);
    }
  };

  const incrementCommentCount = async () => {
    const updateCommentCount = {
      attributes: {
        ...post.attributes, // Keeps post data untouched
        commentCount: comments.length + 1,
      },
    };

    try {
      // Patch the post's data in the database
      const response = await fetch(
        `${process.env.REACT_APP_API_PATH}/posts/${postID}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateCommentCount),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error updating comment count:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const doSubmitComment = () => {
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
    });
    fetchComments();
    incrementCommentCount();
    setNewComment("");
  };

  const submitComment = (e) => {
    if (e.key != "Enter") {
      return;
    }
    doSubmitComment();
  };
  const [userID, setUserID] = useState(-1);
  const [likeImage, setLikeImage] = useState(UnlikedImage);
  const [refreshLikedImage, setRefreshLikedImage] = useState(false);
  const [currentUserPicture, setCurrentUserPicture] =
    useState(DefaultUserImage);

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
          setPostAuthorId(result?.authorID);
        }
      });
  }, []);

  // Will grab the ID of the user and info on whether the post has been liked by the user on load AND when a post is liked/unkliked
  useEffect(() => {
    // Fetch user details to get the user's ID
    fetch(
      `${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem(
        "user"
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    )
      .then((res) => res.json())
      .then((userResult) => {
        if (userResult && userResult.attributes) {
          const userID = userResult.id;
          const userImage = userResult.attributes.picture;
          setUserID(userID);
          setCurrentUserPicture(userImage || DefaultUserImage);

          // Fetch the post's reactions now that we have the ID of the user
          return fetch(
            `${process.env.REACT_APP_API_PATH}/post-reactions?postID=${postID}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            }
          );
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
            (reaction) =>
              reaction.reactorID === userID && reaction.name === "like"
          );

          // ADD PATCH FOR THIS POST HERE TO UPDATE LIKES HERE
          const totalLikes = reactionsResult[0].filter(
            (reaction) => reaction.name === "like"
          ).length;
          setLikeCount(totalLikes);

          // Update state based on whether the user has liked the post or not
          if (hasLiked) {
            setLikeImage(LikedImage);
          } else {
            setLikeImage(UnlikedImage);
          }
        }
      })

      .catch((error) => {
        // Not sure what to do with error handling yet
        console.error("Error:", error);
      });
  }, [postID, userID, refreshLikedImage]);

  // This runs whenever we click on the heart button
  const toggleLikePost = async (postID, reactorID) => {
    try {
      // Fetch user details to get the user's ID
      // We do this because we want to make sure the user is logged in as they press the button. If not, don't continue.
      const userResponse = await fetch(
        `${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem(
          "user"
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      const userResult = await userResponse.json();
      if (!userResult) {
        alert(
          "Cannot submit a like or dislike. Please ensure you are logged in."
        );
        throw new Error("User could not be found");
      }

      // Fetch the post's reactions
      const reactionsResponse = await fetch(
        `${process.env.REACT_APP_API_PATH}/post-reactions?postID=${postID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      // Make sure to wait for the server response before going on
      const reactionsResult = await reactionsResponse.json();

      // Assuming the API returns an array of reactions directly
      const reactions = reactionsResult[0] || [];

      // Find if the user has already liked the post
      // Done by finding the User ID and the "like" name in the same reactions object
      const myLikeReaction = reactions.find(
        (reaction) =>
          reaction.reactorID === reactorID && reaction.name === "like"
      );

      // Convert the result of finding a like by this user into a simple boolean to be used to determine if we need to like or unlike
      const hasLiked = Boolean(myLikeReaction);

      // Run if the user has liked the post. If so, we need to delete this user's like reaction
      if (hasLiked) {
        await fetch(
          `${process.env.REACT_APP_API_PATH}/post-reactions/${myLikeReaction.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        // This will force one useEffect to run again
        // Done to update the heart image
        setRefreshLikedImage((prevState) => !prevState);
        updateUserLikedPosts(postID, "remove");
        decrementLikesCount();

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
        const addReactionResponse = await fetch(
          `${process.env.REACT_APP_API_PATH}/post-reactions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify(payload),
          }
        );

        // Done for error handling
        if (!addReactionResponse.ok) {
          alert("Cannot submit a like or unlike. Please Try again.");
          throw new Error("Failed to add like");
        }
        setRefreshLikedImage((prevState) => !prevState);
        updateUserLikedPosts(postID, "add");
        incrementLikesCount();
      }
    } catch (error) {
      alert("Cannot submit a like or unlike. Please Try again.");
      console.error("Error toggling like:", error);
    }
  };

  const updateUserLikedPosts = async (postId, action) => {
    try {
      // Get the current user data from the database
      const response = await fetch(
        `${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem(
          "user"
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

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
        updatedLikedPostsArray = existingLikedPosts.filter(
          (id) => id !== parseInt(postId)
        );
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
      const updateResponse = await fetch(
        `${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem(
          "user"
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify(updateUserDataPayload),
        }
      );

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

  // hide post aka block the post
  const handleHidePost = async () => {
    const userID = sessionStorage.getItem("user");
    let currentBlockedBy = post.attributes?.blockedBy || [];
    
    // Check if user has already blocked the post
    if (currentBlockedBy.includes(userID)) {
      // needs translation
      showToast(language === "en" ? "You have already hidden this post." : "Ya has escondido esta publicación.");
      return;
    }

    // Add the current user's ID to the blockedBy array
    currentBlockedBy.push(userID);

    try {
        const response = await fetch(`${process.env.REACT_APP_API_PATH}/posts/${postID}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            },
            body: JSON.stringify({ attributes: { ...post.attributes, blockedBy: currentBlockedBy } })
        });

        if (response.ok) {
            // Update local state to reflect the post is hidden
            setPost({ ...post, attributes: { ...post.attributes, blockedBy: currentBlockedBy } });
            // needs translation
            showToast(language === "en" ? "The post has been hidden." : "Esta publicación ha sido escondida.");
        } else {
            throw new Error("Failed to hide the post.");
        }
    } catch (error) {
        // needs translation
        showToast(language === "en" ? "Failed to hide the post." : "No se pudo esconder la publicación.");
    }
  };


  const tagIncluded = (name) => post?.attributes?.tags?.includes(name);

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
              <div className="options-container">
                <button
                  className="pill-button"
                  onClick={() => {
                    setOptionsExpanded(!optionsExpanded);
                  }}
                >
                  <FontAwesomeIcon icon={faEllipsis} />
                </button>
                <div
                  className={`options-dropdown ${
                    optionsExpanded ? "options-dropdown-active" : ""
                  }`}
                >
                  {parseInt(postAuthorId) === parseInt(userID) ? (
                    <EditButtons ID={postID} />
                  ) : 
                    <button className="post-options-button" onClick={handleHidePost}>
                      {/* Needs translation update */}
                      <FontAwesomeIcon icon={faEyeSlash} /> {language === "en" ? "Hide Post" : "Esconder publicación"}
                    </button>
                  }
                </div>
              </div>
              <div>
                {post?.attributes?.privacy == "friends" && (
                  <FontAwesomeIcon
                    icon={faLock}
                    title="Only visible to friends"
                  />
                )}
              </div>
              <button onClick={() => navigate(-1)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <h1 className="post-title">{post?.attributes?.title}</h1>
            <div className="post-location">
              <FontAwesomeIcon
                className="post-location-icon"
                icon={faLocationDot}
              />
              <span className="post-location-text">
                {post?.attributes?.location}
              </span>
            </div>
            <p>{post?.content}</p>
            <div className="filter-container">
              <span
                className={`pill-button orange ${
                  tagIncluded("trail") ? "" : "tag-hidden"
                }`}
              >
                {language === "en" ? "Trail Hikes" : "Caminatas"}
              </span>
              <span
                className={`pill-button purple ${
                  tagIncluded("mountain") ? "" : "tag-hidden"
                }`}
              >
                {language === "en" ? "Mountains" : "Montañas"}
              </span>
              <span
                className={`pill-button aqua ${
                  tagIncluded("lakes") ? "" : "tag-hidden"
                }`}
              >
                {language === "en" ? "Lakes" : "Lagos"}
              </span>
              <span
                className={`pill-button blue ${
                  tagIncluded("forests") ? "" : "tag-hidden"
                }`}
              >
                {language === "en" ? "Forests" : "Bosques"}
              </span>
              <span
                className={`pill-button brown ${
                  tagIncluded("urban") ? "" : "tag-hidden"
                }`}
              >
                {language === "en" ? "Urban" : "Urbano"}
              </span>
              <span
                className={`pill-button light-blue ${
                  tagIncluded("coastal") ? "" : "tag-hidden"
                }`}
              >
                {language === "en" ? "Coastal" : "Costero"}
              </span>
              <span
                className={`pill-button yellow ${
                  tagIncluded("desert") ? "" : "tag-hidden"
                }`}
              >
                {language === "en" ? "Desert" : "Desierto"}
              </span>
              <span
                className={`pill-button light-green ${
                  tagIncluded("wetlands") ? "" : "tag-hidden"
                }`}
              >
                {language === "en" ? "Wetlands" : "Humedales"}
              </span>
              <span
                className={`pill-button dark-purple ${
                  tagIncluded("tundra") ? "" : "tag-hidden"
                }`}
              >
                {language === "en" ? "Tundra" : "Tundra"}
              </span>
              <span
                className={`pill-button green ${
                  tagIncluded("day_hike") ? "" : "tag-hidden"
                }`}
              >
                {language === "en" ? "Day Hikes" : "Excursiones de un día"}
              </span>
              <span
                className={`pill-button pink ${
                  tagIncluded("backpacking") ? "" : "tag-hidden"
                }`}
              >
                {language === "en" ? "Backpacking" : "Mochilero"}
              </span>
              <span
                className={`pill-button difficulty-easy ${
                  tagIncluded("easy") ? "" : "tag-hidden"
                }`}
              >
                {language === "en" ? "Easy" : "Fácil"}
              </span>
              <span
                className={`pill-button difficulty-medium ${
                  tagIncluded("medium") ? "" : "tag-hidden"
                }`}
              >
                {language === "en" ? "Medium" : "Medio"}
              </span>
              <span
                className={`pill-button difficulty-hard ${
                  tagIncluded("hard") ? "" : "tag-hidden"
                }`}
              >
                {language === "en" ? "Hard" : "Difícil"}
              </span>
            </div>
            <div className="post-profile">
              <div className="post-profile-img">
                <Link
                  to={
                    post?.author?.id === userID
                      ? "/settings"
                      : `/profile/${post?.author?.id}`
                  }
                  className="link"
                >
                  <img
                    src={post?.author?.attributes?.picture || DefaultUserImage}
                    alt={post?.author?.attributes?.username || "username"}
                  />
                </Link>
              </div>
              <div className="post-profile-info">
                <Link
                  to={
                    post?.author?.id === userID
                      ? "/settings"
                      : `/profile/${post?.author?.id}`
                  }
                  className="link"
                >
                  <span className="post-profile-info-author">
                    {post?.author?.attributes?.username}
                  </span>
                </Link>

                <span className="post-profile-info-bio">
                  {post?.author?.attributes?.bio}
                </span>
              </div>
            </div>
            {
              <>
                <div className="post-comments">
                  <span className="post-comments-header">
                    {language === "en" ? "Comments:" : "Comentarios:"}
                  </span>
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
                          src={
                            c?.author?.attributes?.picture || DefaultUserImage
                          }
                          alt="username"
                          className="post-interaction-commenter-profile-img"
                        />
                        <Link
                          to={
                            c?.author?.id === userID
                              ? "/settings"
                              : `/profile/${c?.author?.id}`
                          }
                          className="link"
                        >
                          <span className="post-comment-author">
                            {c?.author?.attributes?.username}:&nbsp;
                          </span>
                        </Link>

                        <span className="post-comment-content">
                          {c?.content}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="post-interaction">
                  <div className="post-interaction-header">
                    <span>
                      {language === "en"
                        ? "What do you think?"
                        : "¿Qué opinas?"}
                    </span>
                    <button className="post-interaction-header-button">
                      <img
                        src={likeImage}
                        alt="Heart"
                        className="heart-image"
                        onClick={() => toggleLikePost(postID, userID)}
                        onKeyDown={(e) => {
                          if (e.keyCode === 13) {
                            toggleLikePost(postID, userID);
                          }
                        }}
                      />
                      <span className="like-count">&nbsp;{likeCount}</span>
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
                      placeholder={
                        language === "en"
                          ? "Add a comment?"
                          : "Escribe un comentario"
                      }
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={submitComment}
                    />
                    <button
                      className="post-interaction-comment-send"
                      onClick={doSubmitComment}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                  </div>
                </div>
              </>
            }
          </div>
        </div>
      </div>
      <div id="blockToast" className="block-toast">{toastMessage}</div>
    </div>
  );
}
