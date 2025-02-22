import { LuBuilding2 } from "react-icons/lu";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from "react-router"; 

const Navbar = () => {
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/tokenize", label: "Tokenize Property" },
    { to: "/marketplace", label: "Marketplace" },
    { to: "/compose", label: "Sign Up/In" },

  ];

  return (
    <div className="navbar px-10 flex justify-between shadow-lg shadow-gray-300">
      <Link to="/" className="flex items-center space-x-2">
        <LuBuilding2 className="h-6 w-6 text-sage-600" />
        <span className="font-semibold text-xl">PropChain</span>
      </Link>

      <nav className="">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className=" text-gray-800 px-6"
          >
            {item.label}
          </Link>
        ))}
        <ConnectButton />
      </nav>
    </div>
  );
};

export default Navbar;
