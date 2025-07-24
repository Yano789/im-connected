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
import UserPreferences from "./Preferences/UserPreferences";
import ProfilePage from './Profile/ProfilePage/ProfilePage';
import { AuthContext } from "./AuthContext";
import AuthProvider from "./AuthContext";
import LoginSignUpBackground from "./assets/LoginSignUpBackground.jpg";


function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === '/login';
  const isSignUpPage = location.pathname === '/signup';
  const isAuthPage = location.pathname === '/auth';
  const isPreferencePage = location.pathname === '/preferences';

  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    const canVerifyEmail = localStorage.getItem("canVerifyEmail") === "true";
    const pathname = location.pathname;

    const loggedInPaths = ["/forum"];
    const canVerifyPaths = ["/auth", "/preferences"];

    if (!loading) {
      if (user) {
        if (canVerifyPaths.includes(pathname)) {
          navigate("/forum", { replace: true });
        }
      } else {
        if (loggedInPaths.includes(pathname)) {
          navigate("/login", { replace: true });
        } else if (canVerifyPaths.includes(pathname)) {
          if (!canVerifyEmail) {
            navigate("/login", { replace: true });
          }
        }
      }
    }
  }, [loading, user, location.pathname, navigate]);


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        backgroundImage: isLoginPage || isSignUpPage || isAuthPage || isPreferencePage
          ? `url(${LoginSignUpBackground})`
          : "linear-gradient(to bottom, #FFFDF9 75%, #F1C5C0 100%)",
        backgroundSize: isLoginPage || isSignUpPage || isAuthPage || isPreferencePage ? "cover" : "auto",
        backgroundRepeat: isLoginPage || isSignUpPage || isAuthPage || isPreferencePage ? "no-repeat" : "auto",
        backgroundPosition: isLoginPage || isSignUpPage || isAuthPage || isPreferencePage ? "left center" : "auto",
        minHeight: "100vh"
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Authentication />}></Route>
          <Route path="/signup" element={<SignUpCard />}></Route>
          <Route path="/login" element={<LoginCard />} />
          <Route path="/preferences" element={<UserPreferences />}></Route>
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/newpost" element={<NewPost />} />
          <Route path="/forum/viewpost" element={<ViewPost />} />
          <Route path="/forum/mypost" element={<MyPost />} />
          <Route path="/forum/savedpost" element={<SavedPost />} />
          <Route path="/medication" element={<MedicationsPage />} />
        </Routes>
      </BrowserRouter>
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


export default App
