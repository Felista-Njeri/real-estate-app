import { LuBuilding2 } from "react-icons/lu";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {  NavLink } from "react-router"; 
import { useAccount } from "wagmi";

const Navbar = () => {
  const { address } = useAccount();

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/tokenize", label: "Tokenize Property" },
    { to: "/marketplace", label: "Marketplace" },
    { to: "/owner-portfolio", label: "Property Owner Portfolio" },
  ];

  return (
    <div className="navbar px-10 flex justify-between shadow-lg shadow-gray-300">
      <NavLink to="/" className="flex items-center space-x-2">
        <LuBuilding2 className="h-6 w-6 text-sage-600" />
        <span className="font-semibold text-xl">PropChain</span>
      </NavLink>

      <nav className="">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="text-gray-800 hover:bg-gray-200 py-3 rounded-sm px-6"
          >
            {item.label}
          </NavLink>
        ))}
        {address && <NavLink to="/portfolio" className="text-gray-800 px-6">My Portfolio</NavLink> }
        <ConnectButton />
      </nav>
    </div>
  );
};

export default Navbar;
