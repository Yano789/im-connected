import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import Forum from "./Forum/Forum/Forum";
import NewPost from "./Forum/NewPost/NewPost";
import ViewPost from "./Forum/ViewPost/ViewPost";
import MyPost from "./Forum/MyPost/MyPost";
import SavedPost from "./Forum/SavedPost/SavedPost";
import MedicationsPage from "./Medications/MedicationsPage/MedicationsPage";
import LoginCard from "./Login/LoginCard";
import SignUpCard from "./SignUp/SignUpCard";
import Authentication from "./Authentication/Authentication";
import UserPreferences from "./Preferences/userPreferences";
import ForgotPasswordEmail from "./ForgotPassword/ForgotPasswordEmail";
import ForgotPasswordOTP from "./ForgotPassword/ForgotPasswordOTP";
import ForgotPasswordNewPassword from "./ForgotPassword/ForgotPasswordNewPassword";
import ProfilePage from './Profile/ProfilePage/ProfilePage';
import { AuthContext } from "./AuthContext";
import AuthProvider from "./AuthContext";
import ChatPage from './Chatbot/Chat';
import LoginSignUpBackground from "./assets/LoginSignUpBackground.jpg";
import Dashboard from "./Dashboard/Dashboard/Dashboard";
import Splashscreen from './Splashscreen/Splashscreen';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  const protectedRoutes = [
    "/forum",
    "/forum/newpost", 
    "/forum/viewpost",
    "/forum/mypost",
    "/forum/savedpost",
    "/medication",
    "/profile"
  ];

  const authRoutes = ["/login", "/signup", "/forgotpassword"];
  const verificationRoutes = ["/auth", "/preferences"];
  const forgotPasswordRoutes = ["/forgotpassword/otp", "/forgotpassword/newpassword"];

  const needsAuthBackground = authRoutes.includes(location.pathname) || verificationRoutes.includes(location.pathname) 
                              || forgotPasswordRoutes.includes(location.pathname);

  useEffect(() => {
    if (loading) return;

    const canVerifyEmail = localStorage.getItem("canVerifyEmail") === "true";
    const currentPath = location.pathname;

    console.log("Route protection debug:", {
      user: !!user,
      currentPath,
      canVerifyEmail,
      loading
    });

    if (user) {  // if logged in
      if (authRoutes.includes(currentPath) || currentPath === "/auth") {
        console.log("Redirecting authenticated user from auth route to forum");
        navigate("/forum", { replace: true });
      }
      else if (currentPath === "/preferences" && !canVerifyEmail) {
        console.log("Redirecting authenticated user from preferences to forum");
        navigate("/forum", { replace: true });
      }
    } 
    else {    // if not logged in (not a user)
      if (protectedRoutes.includes(currentPath)) {
        console.log("Redirecting unauthenticated user from protected route to login");
        navigate("/login", { replace: true });
      }
      else if (verificationRoutes.includes(currentPath) && !canVerifyEmail) {
        console.log("Redirecting unauthenticated user from verification route to login");
        navigate("/login", { replace: true });
      }
      else if (forgotPasswordRoutes.includes(currentPath)) {
        const resetEmail = localStorage.getItem("resetEmail");
        if (!resetEmail) {
          console.log("Redirecting user from forgot password flow without email to forgot password page");
          navigate("/forgotpassword", { replace: true });
        }
      }
    }
  }, [user, loading, location, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        backgroundImage: needsAuthBackground
          ? `url(${LoginSignUpBackground})`
          : "linear-gradient(to bottom, #FFFDF9 75%, #F1C5C0 100%)",
        backgroundSize: needsAuthBackground ? "cover" : "auto",
        backgroundRepeat: needsAuthBackground ? "no-repeat" : "auto",
        backgroundPosition: needsAuthBackground ? "left center" : "auto",
        minHeight: "100vh"
      }}
    >
      <Routes>
        <Route path="/" element={<Splashscreen />}></Route>
        <Route path="/signup" element={<SignUpCard />}></Route>
        <Route path="/login" element={<LoginCard />} />
        <Route path="/auth" element={<Authentication />} />
        <Route path="/preferences" element={<UserPreferences />}></Route>
        <Route path="/forgotpassword" element={<ForgotPasswordEmail />} />
        <Route path="/forgotpassword/otp" element={<ForgotPasswordOTP />} />
        <Route path="/forgotpassword/newpassword" element={<ForgotPasswordNewPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/newpost" element={<NewPost />} />
        <Route path="/forum/viewpost" element={<ViewPost />} />
        <Route path="/forum/mypost" element={<MyPost />} />
        <Route path="/forum/savedpost" element={<SavedPost />} />
        <Route path="/medication" element={<MedicationsPage />} />
        <Route path="/profile" element={< ProfilePage />} />
        <Route path='/chatbot' element={< ChatPage />}></Route>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
