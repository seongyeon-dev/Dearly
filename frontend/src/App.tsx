import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import AppRouter from "./router/router";

function App() {
  return (
    <>
      <Header />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <AppRouter />
      </div>
    </>
  );
}

export default App;