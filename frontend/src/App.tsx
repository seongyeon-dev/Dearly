import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";

function App() {
  return (
    <>
      <Header />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <main
          style={{
            flex: 1,
            padding: "36px 40px",
            backgroundColor: "var(--color-background)",
          }}
        >
          <h2>My Wishlist</h2>
          <p style={{ marginTop: "10px", color: "var(--color-text-muted)" }}>
            나만의 취향을 기록하는 공간
          </p>
        </main>
      </div>
    </>
  );
}

export default App;