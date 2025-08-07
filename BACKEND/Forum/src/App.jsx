import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Forum from "./Forum/Forum/Forum";
import NewPost from "./Forum/NewPost/NewPost";
import MedicationsPage from "./Medications/MedicationsPage/MedicationsPage";

function App() {
  return (
    <div
      style={{
        backgroundImage: "linear-gradient(to bottom, #FFFDF9 75%, #F1C5C0 100%)",
      }}
    >
      <Router>
        <Routes>
           {/* 
           <Route path="/" element={<SplashScreen/>}/>
          <Route path="/signup" element={<SignUp/>}/>
          <Route path="/signin" element={<SignIn/>}/>
          <Route path="/preferences" element={<Preferences/>}/>
          <Route path="/emailauthentication" element={<EmailAuthentication/>}/>
          <Route path="/forgetpassword" element={<ForgetPassword/>}/> 
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/forum/post?postid=xxx" element={<SelectedPost/>}/> 
          */}
          <Route path="/forum" element={<Forum/>}/>
          <Route path="/forum/newpost" element={<NewPost/>}/>
          <Route path="/medication" element={<MedicationsPage/>}/>
          {/*
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/chatbot" element={<Chatbot/>}/>
          */}
        </Routes>
      </Router>
    </div>
  );
}


export default App