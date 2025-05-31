import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 shadow-2xl mt-12">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Left side - Hospital info */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-semibold text-emerald-600 mb-1">
            Medova Hospital
          </h2>
          <p className="text-sm text-slate-300">
            &copy; {new Date().getFullYear()} Medova Hospital. All rights reserved.
          </p>
        </div>

        {/* Middle - Under development message */}
        <div className="text-center text-sm text-gray-400 italic px-4">
          🚧 Website is currently under development. Thank you for your patience! 🚧
        </div>

        {/* Right side - Social icons */}
        <div className="flex space-x-5 text-gray-400 hover:text-emerald-600 transition-colors">
          <a href="#" aria-label="Facebook" className="p-2 rounded-full hover:bg-emerald-600 hover:text-white">
            <FaFacebookF size={18} />
          </a>
          <a href="#" aria-label="Twitter" className="p-2 rounded-full hover:bg-emerald-600 hover:text-white">
            <FaTwitter size={18} />
          </a>
          <a href="#" aria-label="LinkedIn" className="p-2 rounded-full hover:bg-emerald-600 hover:text-white">
            <FaLinkedinIn size={18} />
          </a>
          <a href="#" aria-label="Instagram" className="p-2 rounded-full hover:bg-emerald-600 hover:text-white">
            <FaInstagram size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;