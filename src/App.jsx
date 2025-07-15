import Header from './Header/Header';
import ForumBody from './Forum/ForumBody/ForumBody';
function App() {
  return (
    <>
      <div
        style={{
          backgroundImage: "linear-gradient(to bottom, #FFFDF9 75%, #F1C5C0 100%)",
        }}
      >
        <Header />
        <ForumBody/>
      </div>
    </>
  );
}


export default App
