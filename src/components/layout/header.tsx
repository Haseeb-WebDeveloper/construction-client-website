"use client";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useContactPopup } from "@/components/providers/contact-popup-provider";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openContactPopup } = useContactPopup();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Get all sections
      const sections = document.querySelectorAll('section[id]');
      
      // Find the current section
      sections.forEach(section => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).clientHeight;
        if (window.scrollY >= sectionTop - 100 && window.scrollY < sectionTop + sectionHeight - 100) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "renodomi", href: "https://renodomi.nl/" },
    { name: "duradomi", href: "https://duradomi.nl/" },
    { name: "isodomi", href: "https://isodomi.nl/" },
    { name: "Over ons", href: "#about" },
    { name: "Diensten", href: "#services" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      // Close mobile menu first
      setIsMobileMenuOpen(false);
      
      // Small delay to allow menu animation to complete
      setTimeout(() => {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 300);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? "bg-background/80 backdrop-blur-lg shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}          
          <Link href="#hero" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Logo" width={100} height={100} className="w-10 h-10" />
            <h1 className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
              isodomi
            </h1>
          </Link>

          {/* Desktop Navigation */}

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`relative group text-base font-medium hover:bg-primary/5 px-4 py-2 rounded-md ${activeSection === item.href.replace('#', '') ? 'text-primary' : ''}`}
              >
                {item.name}
               
              </Link>
            ))}
            <Button
              variant="contact"
              className="relative group text-sm font-medium"
              onClick= {openContactPopup}
            >
              Aan de slag
            </Button>
          </nav>

          {/* CTA Button & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <Button 
              className="hidden md:inline-flex px-8 py-4"
              onClick= {openContactPopup}
            >
              Aan de slag
            </Button>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 hover:bg-accent rounded-md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-primary/10"
            >
              <div className="py-4 space-y-4">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="block px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
                <div className="px-4 pt-2">
                  <Button 
                    onClick={openContactPopup}
                    className="w-full"
                  >
                    Aan de slag
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
