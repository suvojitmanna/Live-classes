import React from "react";
import {
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaVideo,
} from "react-icons/fa";
import { APP_CONFIG } from "../uttils/constants";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">

        {/* Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.15 },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >

          {/* LEFT */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
            className="col-span-1 sm:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FaVideo className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {APP_CONFIG.APP_NAME}
              </h3>
            </div>

            <p className="text-gray-400 mb-4 max-w-md text-sm sm:text-base">
              {APP_CONFIG.APP_DESCRIPTION}
            </p>

            <div className="flex space-x-3 sm:space-x-4">
              {[FaGithub, FaTwitter, FaLinkedin, FaEnvelope].map((Icon, i) => (
                <motion.a
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  href={
                    i === 0
                      ? APP_CONFIG.SOCIAL_LINKS.GITHUB
                      : i === 1
                      ? APP_CONFIG.SOCIAL_LINKS.TWITTER
                      : i === 2
                      ? APP_CONFIG.SOCIAL_LINKS.LINKEDIN
                      : APP_CONFIG.SOCIAL_LINKS.EMAIL
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* QUICK LINKS */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
          >
            <h4 className="text-white font-semibold mb-3 sm:mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm sm:text-base">
              {APP_CONFIG.FOOTER_LINKS.QUICK_LINKS.map((link, index) => (
                <li key={index}>
                  {link.isExternal ? (
                    <a
                      href={link.route}
                      className="hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.route}
                      className="hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* SUPPORT */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
          >
            <h4 className="text-white font-semibold mb-3 sm:mb-4">
              Support
            </h4>
            <ul className="space-y-2 text-sm sm:text-base">
              {APP_CONFIG.FOOTER_LINKS.SUPPORT_LINKS.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="hover:text-blue-400 transition-colors"
                    target={link.isExternal ? "_blank" : undefined}
                    rel={link.isExternal ? "noopener noreferrer" : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

        </motion.div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ delay: 0.3 }}
          className="border-t border-gray-800 mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400"
        >
          <p>
            &copy; {currentYear} {APP_CONFIG.APP_NAME}.{" "}
            {APP_CONFIG.COPYRIGHT_TEXT}
          </p>
        </motion.div>

      </div>
    </footer>
  );
};

export default Footer;