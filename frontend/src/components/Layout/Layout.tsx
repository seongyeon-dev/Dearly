import { Outlet } from "react-router-dom";

import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";

function Layout() {
  return (
    <>
      <Header />

      <div style={{ display: "flex" }}>
        <Sidebar />
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
