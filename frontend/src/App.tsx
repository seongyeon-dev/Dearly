import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Router from "./routes/Router";

function App() {
  return (
    <>
      <Header />

      <div style={{ display: "flex" }}>
        <Sidebar />
        <Router />
      </div>
    </>
  );
}

export default App;