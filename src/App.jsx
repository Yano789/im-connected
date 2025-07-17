import { Routes, Route } from 'react-router-dom';
import Header from './Header/Header';
import ForumBody from './Forum/ForumBody/ForumBody';
import MedicationsPage from './Medications/MedicationsPage/MedicationsPage';

function App() {
  return (
    <div
      style={{
        backgroundImage: "linear-gradient(to bottom, #FFFDF9 75%, #F1C5C0 100%)",
      }}
    >
      <Header />

      <Routes>

        <Route path="/" element={<ForumBody />} />


        <Route path="/forum" element={<ForumBody />} />


        <Route path="/medications" element={<MedicationsPage />} />


      </Routes>
    </div>
  );
}


export default App
