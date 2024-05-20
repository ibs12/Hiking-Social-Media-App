import React, { useState, useEffect } from "react";
import locationPin from "../assets/postSubmissionForm-icons8-location-pin-50.png";
import closeImg from "../assets/postSubmissionForm-icons8-close-50.png";
import "./EditGalleryPost.css";
import { Link, useNavigate, useParams } from "react-router-dom";

const EditPostPage = () => {
    const { postID } = useParams();
    const [post, setPost] = useState({});
    const [username, setUsername] = useState("");
    const [postTitle, setPostTitle] = useState("");
    const [postCaption, setPostCaption] = useState("");
    const [postLocation, setPostLocation] = useState("");
    const [postTags, setPostTags] = useState([]);
    const [postMessage, setPostMessage] = useState("");
    const [postImgSrc, setPostImgSrc] = useState("");
    const [postImgId, setPostImgId] = useState(0);
    const [likeCount, setLikeCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [postPrivacy, setPostPrivacy] = useState("public");

    const handlePrivacy = (e) => {
        const { value } = e.target;
        setPostPrivacy(value);
    };

    const navigate = useNavigate();

    useEffect(() => {
        fetch(
        `${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem(
            "user"
        )}`,
        {
            method: "get",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
        }
        )
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
                setPostTitle(result?.attributes?.title);
                setPostCaption(result?.content);
                setPostLocation(result?.attributes?.location);
                setPostImgId(result?.attributes?.imgId);
                setPostImgSrc(result?.attributes?.imgSrc);
                setPostTags(result?.attributes?.tags);
                setLikeCount(result?.attributes?.likesCount);
                setCommentCount(result?.attributes?.commentCount);
                setPostPrivacy(result?.attributes?.privacy)
            }
        });
    }, []);

    const toggleTag = (f) => (e) => {
        e.preventDefault();
        if (postTags.includes(f)) {
        setPostTags(postTags.filter((v) => v != f));
        return;
        }
        setPostTags([f, ...postTags]);
    };

    const updatePostDetails = async (event) => {
        event.preventDefault();
        setPostMessage("Updating post...");

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_PATH}/posts/${postID}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
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
                            likesCount: likeCount,
                            commentCount: commentCount,
                            privacy: postPrivacy,
                        },
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Data is:", data);
            setPostMessage("Post updated successfully!");
            navigate("/gallery");
        } catch (error) {
            console.error("Error updating post:", error);            
            setPostMessage(`Failed to update post: ${error.message}`);
        }
    };

    return (
        <div className="post-form-container">
        <div className="new-post-header">
            <Link to="/gallery">
            <img src={closeImg} className="new-post-close-icon" />
            </Link>
        </div>

        <form className="new-post-form" onSubmit={updatePostDetails}>
            <h1 className="post-title">Post Editor</h1>
            <div>
                <img
                    src={`${process.env.REACT_APP_API_PATH_SOCKET}${postImgSrc}`}
                    alt="Upload an image"
                    className="post-image-upload-preview"
                />
                <br />
            </div>
            
            {/* fetch the username */}
            <span className="new-post-username">{username}</span>

            {/* input Title */}
            <input
                id="title"
                className="new-post-text-input"
                type="text"
                placeholder="Edit your Title here..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
            />

            {/* input caption */}
            <textarea
            placeholder="Edit your Caption here..."
            className="new-post-text-input"
            rows="4"
            value={postCaption}
            onChange={(e) => setPostCaption(e.target.value)}
            />

            {/* input location. currently its porcessed as a string */}
            <div className="new-post-location-container">
            <img src={locationPin} className="new-post-location-icon" />
            <input
                type="text"
                className="new-post-text-input"
                placeholder="Edit your Location here..."
                value={postLocation}
                onChange={(e) => setPostLocation(e.target.value)}
            />
            </div>

            {/* Tags input */}
            <span className="new-post-tags-label">Tags:</span>
            <div className="filter-container">
            <button
                className={`pill-button orange ${
                postTags.includes("trail") ? "active" : ""
                }`}
                onClick={toggleTag("trail")}
            >
                Trail Hikes
            </button>
            <button
                className={`pill-button purple ${
                postTags.includes("mountain") ? "active" : ""
                }`}
                onClick={toggleTag("mountain")}
            >
                Mountains
            </button>
            <button
                className={`pill-button aqua ${
                postTags.includes("lakes") ? "active" : ""
                }`}
                onClick={toggleTag("lakes")}
            >
                Lakes
            </button>
            <button
                className={`pill-button blue ${
                postTags.includes("forests") ? "active" : ""
                }`}
                onClick={toggleTag("forests")}
            >
                Forests
            </button>
            <button
                className={`pill-button brown ${
                postTags.includes("urban") ? "active" : ""
                }`}
                onClick={toggleTag("urban")}
            >
                Urban
            </button>
            <button
                className={`pill-button light-blue ${
                postTags.includes("coastal") ? "active" : ""
                }`}
                onClick={toggleTag("coastal")}
            >
                Coastal
            </button>
            <button
                className={`pill-button yellow ${
                postTags.includes("desert") ? "active" : ""
                }`}
                onClick={toggleTag("desert")}
            >
                Desert
            </button>
            <button
                className={`pill-button light-green ${
                postTags.includes("wetlands") ? "active" : ""
                }`}
                onClick={toggleTag("wetlands")}
            >
                Wetlands
            </button>
            <button
                className={`pill-button dark-purple ${
                postTags.includes("tundra") ? "active" : ""
                }`}
                onClick={toggleTag("tundra")}
            >
                Tundra
            </button>
            <button
                className={`pill-button green ${
                postTags.includes("day_hike") ? "active" : ""
                }`}
                onClick={toggleTag("day_hike")}
            >
                Day Hikes
            </button>
            <button
                className={`pill-button pink ${
                postTags.includes("backpacking") ? "active" : ""
                }`}
                onClick={toggleTag("backpacking")}
            >
                Backpacking
            </button>
            </div>

            {/* Difficulty input */}
            <span className="new-post-tags-label">Difficulty:</span>
            <div className="filter-container">
                <button
                className={`pill-button difficulty-easy ${
                postTags.includes("easy") ? "active" : ""
                }`}
                onClick={toggleTag("easy")}
            >
                Easy
            </button>
            <button
                className={`pill-button difficulty-medium ${
                postTags.includes("medium") ? "active" : ""
                }`}
                onClick={toggleTag("medium")}
            >
                Medium
            </button>
            <button
                className={`pill-button difficulty-hard ${
                postTags.includes("hard") ? "active" : ""
                }`}
                onClick={toggleTag("hard")}
            >
                Hard
            </button>
            </div>

            <span className="new-post-tags-label">Visibility:</span>
            <div className="submit-post-privacy">
            <input
                type="radio"
                id="postPublic"
                name="privacy"
                value="public"
                onChange={handlePrivacy}
                checked={postPrivacy == "public"}
            />
            <label for="postPublic">Public</label>
            <input
                type="radio"
                id="postFriends"
                name="privacy"
                value="friends"
                onChange={handlePrivacy}
                checked={postPrivacy == "friends"}
            />
            <label for="postFriends">Friends Only</label>
            </div>

            <button className="save-edit-button" type="submit">
                Save Changes
            </button>
            <div className="status-message">{postMessage}</div>
        </form>
        </div>
    );
};

export default EditPostPage;


// {
//   "id": 1235,
//   "authorID": 574,
//   "created": "2024-04-14T20:46:42.785Z",
//   "updated": "2024-04-16T18:14:50.158Z",
//   "content": "Brrrrrr",
//   "parentID": null,
//   "recipientUserID": null,
//   "recipientGroupID": null,
//   "attributes": {
//     "imgId": 224,
//     "imgSrc": "/hci/api/uploads/files/qWbY1p4sAhB1Jzo4PE8j0-IEIK4JVzNpsTmxDjKzjCc.jpg",
//     "type": "post",
//     "title": "Winter Hike",
//     "location": "Somewhere Cold",
//     "tags": [
//       "medium",
//       "tundra"
//     ],
//     "likesCount": 0,
//     "commentCount": 1
//   },
//   "author": {
//     "id": 574,
//     "email": "dmorlok@buffalo.edu",
//     "attributes": {
//       "username": "Devon",
//       "city": "Somewhere",
//       "state": "SomeState",
//       "likedPosts": "[780,870,935,973,1124,1040,879,1126,1121,1216]",
//       "picture": "https://webdev.cse.buffalo.edu/hci/api/uploads/files/Yv2Wbg9-srM1WWlB1tmJ_fR4he-k7a-ArLqj2nM5ioo.jpeg"
//     }
//   },
//   "recipientUser": null,
//   "recipientGroup": null,
//   "reactions": [],
//   "_count": {
//     "children": 0
//   }
// }

// {
//   "id": 1132,
//   "authorID": 574,
//   "created": "2024-04-04T19:07:23.302Z",
//   "updated": "2024-04-18T18:29:00.102Z",
//   "content": "I hope this works",
//   "parentID": null,
//   "recipientUserID": null,
//   "recipientGroupID": null,
//   "attributes": {
//     "title": "Please kill me",
//     "location": "Mountain, Somewhere",
//     "tags": [
//       "medium",
//       "mountain",
//       "backpacking",
//       "trail"
//     ],
//     "imgId": 189,
//     "imgSrc": "/hci/api/uploads/files/B4pTMYJpLJv-QLHnCtbWI337BzvuU6eJF6ksZtkHp7s.jpg",
//     "likesCount": 1,
//     "commentCount": 70
//   },
//   "author": {
//     "id": 574,
//     "email": "dmorlok@buffalo.edu",
//     "attributes": {
//       "username": "Devon",
//       "city": "Somewhere",
//       "state": "SomeState",
//       "likedPosts": "[780,870,935,973,1124,1040,879,1126,1121,1216]",
//       "picture": "https://webdev.cse.buffalo.edu/hci/api/uploads/files/Yv2Wbg9-srM1WWlB1tmJ_fR4he-k7a-ArLqj2nM5ioo.jpeg"
//     }
//   },
//   "recipientUser": null,
//   "recipientGroup": null,
//   "reactions": [
//     {
//       "id": 348,
//       "postID": 1132,
//       "reactorID": 734,
//       "name": "like",
//       "value": 1,
//       "attributes": {}
//     }
//   ],
//   "_count": {
//     "children": 70
//   }
// }