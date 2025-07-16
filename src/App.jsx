import Header from './Header/Header';
import ForumBody from './Forum/ForumBody/ForumBody'; 
function App() {
  return (
    <>
      <div
        style={{
          backgroundImage: "linear-gradient(to bottom, #FFFDF9 0%, #F1C5C0 50%)",
        }}
      >
        <Header />
        <ForumBody/>
      </div>
    </>
  );
}


export default App
