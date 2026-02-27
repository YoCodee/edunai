"use client";

import { Twitter, Instagram, Linkedin, Github, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a1c20] pt-24 pb-12 relative overflow-hidden font-sans border-t border-gray-800">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[300px] bg-gradient-to-b from-[#fca03e]/10 to-transparent pointer-events-none blur-3xl"></div>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-20">
          {/* Brand & Newsletter Column (Col-span 4) */}
          <div className="md:col-span-12 lg:col-span-4 flex flex-col">
            <div className="mb-6">
              <span
                className="text-[28px] font-bold text-white tracking-tight"
                style={{ fontFamily: "serif" }}
              >
                Edunai
              </span>
              <p className="text-[14px] text-gray-400 mt-4 leading-relaxed max-w-sm">
                The all-in-one AI academic workspace that helps students
                organize, collaborate, and learn efficiently.
              </p>
            </div>

            <div className="mt-4">
              <h4 className="text-[12px] font-bold text-gray-300 uppercase tracking-wider mb-3">
                Newsletter
              </h4>
              <div className="flex items-center gap-2 bg-[#2a2c30] p-1.5 rounded-full border border-gray-700/50 max-w-sm">
                <input
                  type="email"
                  placeholder="hello@university.edu"
                  className="bg-transparent border-none outline-none text-[14px] text-white px-4 w-full placeholder:text-gray-500"
                />
                <button className="w-10 h-10 rounded-full bg-[#fca03e] hover:bg-[#ffb05c] transition-colors flex items-center justify-center text-[#1a1c20] shrink-0">
                  <Send size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Spacer for large screens */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Links Columns (Col-span 7) */}
          <div className="md:col-span-12 lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
            {/* Column 1 */}
            <div>
              <h4 className="text-[13px] font-bold text-gray-200 uppercase tracking-wider mb-6">
                Product
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition-colors"
                  >
                    AI Notes
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition-colors"
                  >
                    Kanban Boards
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    Changelog{" "}
                    <span className="bg-[#2a2c30] text-[10px] text-gray-300 px-2 py-0.5 rounded border border-gray-700">
                      New
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-[13px] font-bold text-gray-200 uppercase tracking-wider mb-6">
                Resources
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition-colors"
                  >
                    Student Guides
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition-colors"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition-colors"
                  >
                    University Partners
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition-colors"
                  >
                    API Documentation
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-[13px] font-bold text-gray-200 uppercase tracking-wider mb-6">
                Company
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[13px] text-gray-500">
            © {new Date().getFullYear()} Edunai Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-[13px] text-gray-500 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[13px] text-gray-500 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-[13px] text-gray-500 hover:text-white transition-colors"
            >
              Cookies
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-[#2a2c30] hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Twitter size={16} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-[#2a2c30] hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Instagram size={16} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-[#2a2c30] hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Linkedin size={16} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-[#2a2c30] hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <Github size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
