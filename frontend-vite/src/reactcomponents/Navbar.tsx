import { LuBuilding2 } from "react-icons/lu";
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = () => {
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/buy", label: "Buy Tokens" },
    { href: "/tokenize", label: "Tokenize Property" },
    { href: "/properties", label: "Properties" },
    { href: "/compose", label: "Sign Up/In" },

  ];

  return (
    <div className="navbar px-10 flex justify-between">
      <a href="/" className="flex items-center space-x-2">
        <LuBuilding2 className="h-6 w-6 text-sage-600" />
        <span className="font-semibold text-xl">PropChain</span>
      </a>

      <nav className="">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className=" text-gray-800 px-6"
          >
            {item.label}
          </a>
        ))}
        <ConnectButton />
      </nav>
    </div>
  );
};

export default Navbar;
