import React, { useEffect, useState } from "react";
import { ExploreAndHikeButton } from "./Buttons";
import "./Buttons.css";
import "./Explore.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownShortWide, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";

export default function ExplorePage({ handleChangeLanguage }) {
  const navigate = useNavigate();
  const [rawPosts, setRawPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [sortExpanded, setSortExpanded] = useState(false);
  const [filter, setFilter] = useState(null);
  const [sort, setSort] = useState("mostRecent");
  const [language, setLanguage] = useState("en");
  const [friends, setFriends] = useState([]);
	const [blockedUsers, setBlockedUsers] = useState(new Set());
	
	useEffect(() => {
		const storedLanguage = localStorage.getItem("language");
		if (storedLanguage) {
		  setLanguage(storedLanguage);
		}
	  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/");
      window.location.reload();
      return;
    }

    // fetch the blocked users, friends for privacy filter, and all posts
    fetchBlockedUsers(token);
    fetchFriends(token);
    fetchPosts(token);
  }, []);

  useEffect(() => {
	const storedLanguage = localStorage.getItem("language");
	if (storedLanguage) {
		setLanguage(storedLanguage);
	}
}, []);


  const fetchBlockedUsers = (token) => {
    const url = `${process.env.REACT_APP_API_PATH}/connections?fromUserID=${sessionStorage.getItem("user")}`;
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const blocked = new Set();
        // if the connection status is "Blocked", we need to filter out their posts
        data[0].forEach((connection) => {
          if (connection.attributes.status === "Blocked") {
            blocked.add(connection.toUserID);
          }
        });
        setBlockedUsers(blocked);
      });
  };

  const fetchFriends = (token) => {
    let filteredConnections = [];
    
    let url = `${process.env.REACT_APP_API_PATH}/connections?toUserID=${sessionStorage.getItem("user")}`;
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then(res => res.json())
    .then(result => {
      filteredConnections = result[0].filter(conn => conn.attributes.status === "Friends").map(c => c.fromUserID);
      
      url = `${process.env.REACT_APP_API_PATH}/connections?fromUserID=${sessionStorage.getItem("user")}`;
      return fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    })
    .then(res => res.json())
    .then(result => {
      filteredConnections = [
        ...filteredConnections,
        ...result[0].filter(conn => conn.attributes.status === "Friends").map(c => c.toUserID),
      ];
      
      // Update the state with all friends' IDs
      setFriends(filteredConnections);
    })
    .catch(error => {
      console.error('Failed to fetch friends:', error);
    });
  };
  

  const fetchPosts = (token) => {
    const url = process.env.REACT_APP_API_PATH + '/posts?parentID=&attributes={"path":"type","equals":"post"}';
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result) {
          setRawPosts(result[0]);
        }
      });
  };

  useEffect(() => {
	const currentUserID = sessionStorage.getItem("user").toString();
	// console.log("Current user ID: ", currentUserID);
	// console.log("before filtering: ", rawPosts)

    // filter out blocked users
    let filteredPosts = rawPosts.filter((post) => !blockedUsers.has(post.authorID));
	// console.log("filtered block user: ", filteredPosts)

	// Filter to exclude posts blocked by the current user
	filteredPosts = filteredPosts.filter(post => {
		// Convert blockedBy IDs to string for safe comparison (if they're stored as integers)
		const isHidden = post.attributes.blockedBy ? post.attributes.blockedBy.map(id => id.toString()).includes(currentUserID) : false;
		// console.log(`Post ID: ${post.id}, Hidden: ${isHidden}`);
		return !isHidden;
	});
	// console.log("filtered block posts: ", filteredPosts)
    
    if (filter) {
      filteredPosts = filteredPosts.filter(
        (item) => item.attributes?.tags && item.attributes.tags.includes(filter)
      );
    }
	// console.log("filtered tags: ", filteredPosts)


    // privacy filtering
    filteredPosts = filteredPosts.filter(
      (item) =>
        item.attributes?.privacy !== "friends" ||
        friends.includes(item.authorID) ||
        sessionStorage.getItem("user") === item.authorID
    );
	// console.log("filtered privacy: ", filteredPosts)

    /// posts with the most likes appear on the left
    if (sort === "likes") {
      filteredPosts.sort((a, b) => b.attributes?.likesCount - a.attributes?.likesCount);
    } else if (sort === "mostRecent") {
      filteredPosts.sort((a, b) => b.id - a.id);
    } else if (sort === "oldest") {
      filteredPosts.sort((a, b) => a.id - b.id);
    } else if (sort === "comments") {
      filteredPosts.sort((a, b) => b.attributes?.commentCount - a.attributes?.commentCount);
    }

    // set posts after all filtering and sorting
    setPosts(filteredPosts);
  }, [filter, sort, rawPosts, blockedUsers, friends]);

	const toggleFilter = (f) => () => {
		if (filter == f) {
			setFilter(null);
			return;
		}
		setFilter(f);
	};

	const selectSort = (s) => () => {
		setSort(s);
		setSortExpanded(false);
	};

	const postSizeClass = (i) => {
		if (i % 3 == 0) {
			return "post-small";
		}
		if (i % 3 == 1) {
			return "post-large";
		}
		return "post-medium";
	};


	return (
		<div className="page fade-in">
			<div className="explore-header">
				<h1>{language === "en" ? "Gallery" : "Galería"}</h1>
				<ExploreAndHikeButton />
			</div>
			<div className="control-wrapper">
				<div className="filter-container">
					<button className={`pill-button orange ${filter == "trail" ? "active" : ""}`} onClick={toggleFilter("trail")}>
						{language === "en" ? "Trail Hikes" : "Caminatas"}
					</button>
					<button
						className={`pill-button purple ${filter == "mountain" ? "active" : ""}`}
						onClick={toggleFilter("mountain")}
					>
						{language === "en" ? "Mountains" : "Montañas"}
					</button>
					<button className={`pill-button aqua ${filter == "lakes" ? "active" : ""}`} onClick={toggleFilter("lakes")}>
						{language === "en" ? "Lakes" : "Lagos"}
					</button>
					<button
						className={`pill-button blue ${filter == "forests" ? "active" : ""}`}
						onClick={toggleFilter("forests")}
					>
						{language === "en" ? "Forests" : "Bosques"}
					</button>
					<button className={`pill-button brown ${filter == "urban" ? "active" : ""}`} onClick={toggleFilter("urban")}>
						{language === "en" ? "Urban" : "Urbano"}
					</button>
					<button
						className={`pill-button light-blue ${filter == "coastal" ? "active" : ""}`}
						onClick={toggleFilter("coastal")}
					>
						{language === "en" ? "Coastal" : "Costero"}
					</button>
					<button
						className={`pill-button yellow ${filter == "desert" ? "active" : ""}`}
						onClick={toggleFilter("desert")}
					>
						{language === "en" ? "Desert" : "Desierto"}
					</button>
					<button
						className={`pill-button light-green ${filter == "wetlands" ? "active" : ""}`}
						onClick={toggleFilter("wetlands")}
					>
						{language === "en" ? "Wetlands" : "Humedales"}
					</button>
					<button
						className={`pill-button dark-purple ${filter == "tundra" ? "active" : ""}`}
						onClick={toggleFilter("tundra")}
					>
						{language === "en" ? "Tundra" : "Tundra"}
					</button>
					<button
						className={`pill-button green ${filter == "day_hike" ? "active" : ""}`}
						onClick={toggleFilter("day_hike")}
					>
						{language === "en" ? "Day Hikes" : "Excursiones de un día"}
					</button>
					<button
						className={`pill-button pink ${filter == "backpacking" ? "active" : ""}`}
						onClick={toggleFilter("backpacking")}
					>
						{language === "en" ? "Backpacking" : "Mochilero"}
					</button>
					<button
						className={`pill-button difficulty-easy ${filter == "easy" ? "active" : ""}`}
						onClick={toggleFilter("easy")}
					>
						{language === "en" ? "Easy" : "Fácil"}
					</button>
					<button
						className={`pill-button difficulty-medium ${filter == "medium" ? "active" : ""}`}
						onClick={toggleFilter("medium")}
					>
						{language === "en" ? "Medium" : "Medio"}
					</button>
					<button
						className={`pill-button difficulty-hard ${filter == "hard" ? "active" : ""}`}
						onClick={toggleFilter("hard")}
					>
						{language === "en" ? "Hard" : "Difícil"}
					</button>
				</div>
				<div className="sort-container">
					<button
						className="pill-button"
						onClick={() => {
							setSortExpanded(!sortExpanded);
						}}
					>
						<FontAwesomeIcon icon={faArrowDownShortWide} />
					</button>
					<div className={`sort-dropdown ${sortExpanded ? "sort-dropdown-active" : ""}`}>
						<button className="explore-sort-button" onClick={selectSort("mostRecent")}>
							{language === "en" ? "Most Recent" : "Más Reciente"}
						</button>
						<button className="explore-sort-button" onClick={selectSort("oldest")}>
							{language === "en" ? "Oldest" : "Más Antiguo"}
						</button>
						<button className="explore-sort-button" onClick={selectSort("likes")}>
							{language === "en" ? "Likes" : "Más Gustado"}
						</button>
						<button className="explore-sort-button" onClick={selectSort("comments")}>
							{language === "en" ? "Comments" : "Más Comentarios"}
						</button>
					</div>
				</div>
			</div>
			<div className="explore-grid">
				{posts.map((p) => (
					<Link key={p.id} to={`/gallery/post/${p.id}`} className={`post ${postSizeClass(p.id)}`}>
						<img src={`${process.env.REACT_APP_API_PATH_SOCKET}${p.attributes?.imgSrc}`} alt={p.attributes?.title} />
					</Link>
				))}
			</div>
			<div className="new-post-container">
				<Link className="circle-button green" to="/gallery/post">
					<FontAwesomeIcon icon={faPlus} />
				</Link>
			</div>
		</div>
	);
}

