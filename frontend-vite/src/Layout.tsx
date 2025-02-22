import { Outlet } from "react-router";
import Navbar from "@/reactcomponents/Navbar";
import Footer from "@/reactcomponents/Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
