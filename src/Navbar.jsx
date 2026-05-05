import { useNavigate } from "react-router-dom";
import uniLogo from "./assets/images/upb_logo.jpg";
import glossaryLogo from "./assets/images/glossary_logo.png";
import UserBadge from "./UserBadge";
import { Button } from "@mui/material";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };
  
  const username = localStorage.getItem("username");

  return (
    <div className="navbar fixed top-0 w-full bg-white text-white shadow-lg z-50 p-0 text-base">
      <div className="flex flex-row flex-nowrap items-center space-x-4 px-4 py-2">
        <a
          href="https://www.uni-paderborn.de/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={uniLogo} alt="University Logo" width={150} height={50} />
        </a>
      </div>

      <div
        className="flex-1 flex justify-center cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img
          src={glossaryLogo}
          alt="Glossary Logo"
          className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity duration-200"
        />
      </div>

     <div className="ml-auto flex items-center space-x-8 px-4">
  {username && <UserBadge username={username} />}
  <Button
  type="button"
  variant="contained"
    onClick={handleLogout}
  >
    Logout
  </Button>
</div>

    </div>
  );
}
