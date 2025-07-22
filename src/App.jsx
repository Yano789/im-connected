import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Forum from "./Forum/Forum/Forum";
import NewPost from "./Forum/NewPost/NewPost";
import ViewPost from "./Forum/ViewPost/ViewPost";
import MyPost from "./Forum/MyPost/MyPost";
import SavedPost from "./Forum/SavedPost/SavedPost";
import MedicationsPage from "./Medications/MedicationsPage/MedicationsPage";
import LoginCard from "./Login/LoginCard";
import ProfilePage from './Profile/ProfilePage/ProfilePage';

function App() {
  return (
    <div
      style={{
        backgroundImage: "linear-gradient(to bottom, #FFFDF9 75%, #F1C5C0 100%)",
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<LoginCard/>}/>
          {/* 
          <Route path="/signup" element={<SignUp/>}/>
          <Route path="/signin" element={<SignIn/>}/>
          <Route path="/preferences" element={<Preferences/>}/>
          <Route path="/emailauthentication" element={<EmailAuthentication/>}/>
          <Route path="/forgetpassword" element={<ForgetPassword/>}/> 
          <Route path="/dashboard" element={<Dashboard/>}/>
          */}
          <Route path="/forum" element={<Forum/>}/>
          <Route path="/forum/newpost" element={<NewPost/>}/>
          <Route path="/forum/viewpost" element={<ViewPost/>}/> 
          <Route path="/forum/mypost" element={<MyPost/>}/>
          <Route path="/forum/savedpost" element={<SavedPost/>}/>
          <Route path="/medication" element={<MedicationsPage/>}/>
          <Route path="/profile" element={<ProfilePage/>}/>
          
          {/* <Route path="/chatbot" element={<Chatbot/>}/>
          */}
        </Routes>
      </Router>
    </div>
  );
}


export default App
