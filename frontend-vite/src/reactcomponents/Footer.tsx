import { LuBuilding2, LuTwitter, LuInstagram, LuFacebook } from "react-icons/lu";

const Footer = () => {
  return (
    <>
      <footer className="footer text-base-content p-10 shadow-[0_-6px_6px_-1px_rgba(0,0,0,0.1)]">
        <nav>
          <h6 className="footer-title">Services</h6>
          <a className="link link-hover">Branding</a>
          <a className="link link-hover">Design</a>
          <a className="link link-hover">Marketing</a>
          <a className="link link-hover">Advertisement</a>
        </nav>
        <nav>
          <h6 className="footer-title">Company</h6>
          <a className="link link-hover">About us</a>
          <a className="link link-hover">Contact</a>
          <a className="link link-hover">Jobs</a>
          <a className="link link-hover">Press kit</a>
        </nav>
        <nav>
          <h6 className="footer-title">Legal</h6>
          <a className="link link-hover">Terms of use</a>
          <a className="link link-hover">Privacy policy</a>
          <a className="link link-hover">Cookie policy</a>
        </nav>
      </footer>
      <footer className="footer text-base-content border-base-300 border-t px-10 py-4">
        <aside className="grid-flow-col items-center">
         <LuBuilding2 className=""/>
          <p>PropChain Ltd.<br />Providing tokenized real estate</p>
        </aside>
        <nav className="md:place-self-center md:justify-self-end">
          <div className="grid grid-flow-col gap-4">
            <a><LuTwitter /></a>
            <a><LuInstagram /></a>
            <a><LuFacebook /></a>
          </div>
        </nav>
      </footer>
    </>
  );
};

export default Footer;
