import React from "react";
import { Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 mt-auto border-t border-slate-200/80 bg-white/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs font-semibold text-slate-500">
          &copy; {new Date().getFullYear()} InterviewHub. All rights reserved.
        </p>
        <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5 transition-colors duration-200 hover:text-slate-800">
          Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> by{" "}
          <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200 cursor-pointer">
            Srikanth Raparthi
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
