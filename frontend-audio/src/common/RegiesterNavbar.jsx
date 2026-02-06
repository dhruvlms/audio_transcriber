import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import "./RegisterNavbar.css";

const RegisterNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="navbar-wrapper">
      {/* Animated background gradients */}
      <div className="gradient-layer gradient-primary"></div>
      <div className="gradient-layer gradient-secondary"></div>
      
      {/* Animated floating orbs */}
      <div className="floating-orb orb-purple"></div>
      <div className="floating-orb orb-pink"></div>
      <div className="floating-orb orb-blue"></div>

      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            {/* Logo */}
            <div className="logo-section">
              <div className="logo-icon-wrapper">
                <div className="logo-glow"></div>
                <div className="logo-icon">
                  <Sparkles className="sparkle-icon" />
                </div>
              </div>

              <div className="logo-text-wrapper">
                <div className="logo-text">
                  {/* <span className="rocket-emoji">🚀</span> */}
                  <span className="brand-name">Audo Transcript</span>
                  <span className="beta-badge">Beta</span>
                </div>
                <div className="logo-underline"></div>
              </div>
            </div>


            
          </div>
        </div>

       
      </nav>
    </div>
  );
};

export default RegisterNavbar;