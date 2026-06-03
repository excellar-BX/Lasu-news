import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white mt-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1 mb-4">
              <span className="font-black text-2xl tracking-tighter text-white">
                LASU
              </span>
              <span className="text-[#e63946] font-black text-2xl tracking-tighter">
                .NEWS
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Your trusted source for breaking news and in-depth coverage of LASU
              campus events and announcements.
            </p>
            <div className="flex gap-3">
              {["facebook", "instagram", "twitter", "linkedin"].map(
                (platform) => (
                  <a
                    key={platform}
                    href={`https://${platform}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 text-white/60 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )
              )}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm mb-4 tracking-wide uppercase text-white">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:demijiemmanuel@gmail.com"
                  className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                >
                  <Mail className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  demijiemmanuel@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/2348130827166"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                >
                  <Phone className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  +234 813 082 7166
                </a>
              </li>
              <li className="text-white/40 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                Lagos State, Nigeria
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-sm mb-4 tracking-wide uppercase text-white">
              Categories
            </h4>
            <ul className="space-y-2.5">
              {["UPDATES", "EVENTS", "SPOTLIGHT", "TRENDING"].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/?category=${cat}`}
                    className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e63946] group-hover:scale-125 transition-transform" />
                    {cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm mb-4 tracking-wide uppercase text-white">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "All News", href: "/news" },
                { label: "Search", href: "/search" },
                { label: "Home", href: "/" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-[#e63946] transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white/30 text-xs">
          <p>© {new Date().getFullYear()} LASU News · All rights reserved</p>
          <p>
            Crafted with <span className="text-[#e63946]">❤</span> for LASU
            students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
