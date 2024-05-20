import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Settings from "./Component/Settings";
import HomePage from "./Component/HomePage";
import Navbar from "./Component/Navbar";
import Friends from "./Component/Friends";
import Groups from "./Component/Groups";
import Modal from "./Component/Modal";
import PromiseComponent from "./Component/PromiseComponent";
import LoginForm from "./Component/LoginForm";
import RegisterForm from "./Component/RegisterForm";
import ResetPassword from "./Component/ResetPassword";
import Messaging from "./Component/Messaging";
import { io } from "socket.io-client";
import RobertAboutMe from "./Component/RobertAboutMe";
import PrfilePageJohn from "./Component/ProfilePageJohn";
import DevonAboutMe from "./Component/DevonAboutMe";
import AboutSmaran from "./Component/SmaranAboutMe.jsx";
import IbrahimAboutMe from "./Component/IbrahimAboutMe";
import ExplorePage from "./Component/ExplorePage.jsx";
import HikePlannerPage from "./Component/HikePlannerPage.jsx";
import PostPage from "./Component/ExplorePost.jsx";
import About from "./Component/About";
import StyleGuide from "./Component/StyleGuide.jsx";
import OtherUserProfile from "./Component/OtherUserProfile.jsx";
import NotFoundPage from "./Component/NotFound.jsx";
import MessagingPage from "./Component/MessagingPage.jsx";
import EditPostPage from "./Component/EditGalleryPost.jsx";

// temporary way for devs to access the PostSubmissionForm
import PostSubmissionForm from "./Component/PostSubmissionForm.jsx";
import HikePost from "./Component/HikePost.jsx";
import HikeSubmissionForm from "./Component/HikeSubmissionForm.jsx";

// App.jsx is the starting point for the application.  This is the component called by index, which will be rendered when
// a user goes to your app URL.  This component will handle routing to other parts of your app, and any initial setup.

// Initalize the socket with the respective path and tenantID
// NEED this in App.jsx to use the socket throughout the application for real-time connections
const socket = io(process.env.REACT_APP_API_PATH_SOCKET, {
	path: "/hci/api/realtime-socket/socket.io",
	query: {
		tenantID: "example",
	},
});
export { socket };

// Place this inside App.jsx, above the App component definition
function NavbarWrapper({ toggleModal, logout }) {
	const location = useLocation();
	const shouldHideNavbar = ["/", "/register", "/reset-password"].includes(location.pathname);

	if (shouldHideNavbar) {
		return null; // Do not render the Navbar for specific paths
	}

	return <Navbar toggleModal={toggleModal} logout={logout} />;
}

function App() {
	// logged in state, which tracks the state if the user is currently logged in or not
	// initially set to false
	const [loggedIn, setLoggedIn] = useState(false);
	const [openModal, setOpenModal] = useState(false);
	const [refreshPosts, setRefreshPosts] = useState(false);
	const [language, setLanguage] = useState("en");

	useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
        setLanguage(storedLanguage);
    }
}, []);

// Function to handle language change
const handleChangeLanguage = (lang) => {
    setLanguage(lang);
    // Save language preference in sessionStorage
    localStorage.setItem("language", lang);
};

	// basic logout function, removes token and user id from session storage
	const logout = (e) => {
		e.preventDefault();
		sessionStorage.removeItem("token");
		sessionStorage.removeItem("user");
		setLoggedIn(false);
		// reloads the window, so we get back to the login form
		window.location.reload();
	};

	const login = (e) => {
		e.preventDefault();
		setRefreshPosts(true);
		setLoggedIn(true);
	};

	const doRefreshPosts = () => {
		console.log("CALLING DOREFRESHPOSTS IN APP.JSX");
		setRefreshPosts(true);
	};

	const toggleModal = (e) => {
		e.preventDefault();
		// Take the current state of openModal, and update it to be the negated value of that
		// ex) if openModal == false, this will update openModal to true
		setOpenModal((prev) => !prev);
		console.log(openModal);
	};

	useEffect(() => {
		socket.on("connect", () => {
			console.log("Connected to HCI socket server");
		});
	}, []);

  return (
    // the app is wrapped in a router component, that will render the
    // appropriate content based on the URL path.  Since this is a
    // single page app, it allows some degree of direct linking via the URL
    // rather than by parameters.  Note that the "empty" route "/", uses the HomePage
    // component, if you look in the HomePage component you will see a ternary operation:
    // if the user is logged in, show the "home page", otherwise show the login form.
    <Router basename={process.env.PUBLIC_URL}>
      <div className="App">
        <header className="App-header">
          <NavbarWrapper
            toggleModal={(e) => toggleModal(e)}
            logout={(e) => logout(e)}
          />
          <div className="maincontent" id="mainContent">
            <Routes>
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/"
                element={
                  <HomePage
					isLoggedIn={loggedIn}
                    setLoggedIn={setLoggedIn}
                    doRefreshPosts={doRefreshPosts}
                    appRefresh={refreshPosts}
                  />
                }
              />
              <Route
                path="/register"
                element={<RegisterForm setLoggedIn={setLoggedIn} />}
              />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/gallery" element={<ExplorePage />} />
              <Route path="/gallery/post/:postID" element={<PostPage />} />
              <Route path="/gallery/editPost/:postID" element={<EditPostPage />} />
              <Route path="/hikes/post/:postID" element={<HikePost />} />
              <Route path="/hikes" element={<HikePlannerPage />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/promise" element={<PromiseComponent />} />
              <Route path="/about/robert" element={<RobertAboutMe />} />
              <Route path="/devonAboutMe" element={<DevonAboutMe />} />
              <Route path="/aboutme" element={<IbrahimAboutMe />} />
              {/* Declaring a route with a URL parameter "roomID" so that React router dynamically 
              captures the corresponding values in the URL when there is a match. 
              It is useful when dynamically rendering the same component for multiple paths.
              You can see how this is used in the Messaging component 
              as well as how this path is being set up in the FriendList component */}
							{/* <Route path="/messages/:roomID" element={<Messaging />} /> */}
							<Route path="/messages" element={<MessagingPage />} />
							<Route path="/about/john" element={<PrfilePageJohn />} />
							<Route path="/about/Smaran" element={<AboutSmaran />} />
							<Route path="/gallery/post" element={<PostSubmissionForm />} />
							<Route path="/hikes/post" element={<HikeSubmissionForm />} />
							<Route path="/profile" element={<Settings />} />

							<Route path="/profile/:userId" element={<OtherUserProfile />} />
							<Route path="/404" element={<NotFoundPage />} />

							<Route path="/style-guide" element={<StyleGuide />} />
							<Route path="/about" element={<About />} />
							<Route path="*" element={<NotFoundPage />} />
						</Routes>
					</div>
				</header>

				<Modal show={openModal} onClose={(e) => toggleModal(e)}>
					This is a modal dialog!
				</Modal>
			</div>
		</Router>
	);
}
export default App;
