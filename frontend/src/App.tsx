import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";

function App() {
  return (
    <>
      <Header />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <main style={{ padding: "40px", flex: 1 }}>
          <h1>My Wishlist</h1>
          <p>나만의 취향을 기록하는 공간</p>
        </main>
      </div>
    </>
  );
}

export default App;