import React from "react";
import { FaUsers } from "react-icons/fa";
import { APP_CONFIG } from "../../utils/constants";
import { motion } from "framer-motion";

const ParticipantsList = ({ participants, hostName }) => {
  //  Container animation
  const container = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  //  Each participant item
  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  if (!participants || participants.length === 0) {
    return (
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }} //  page refresh
        whileInView={{ opacity: 1, y: 0 }} //  scroll
        viewport={{ once: false, amount: 0.3 }}
      >
        <div className="flex items-center mb-4">
          <FaUsers className="w-5 h-5 mr-2 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">
            {APP_CONFIG.SESSION_CONTENT.PARTICIPANTS.HEADING}
          </h2>
        </div>

        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            {APP_CONFIG.SESSION_CONTENT.PARTICIPANTS.EMPTY_MESSAGE}
          </p>
        </div>
      </motion.div>
    );
  }

  const hostParticipants = participants.filter((p) => p.userName === hostName);
  const otherParticipants = participants.filter((p) => p.userName !== hostName);

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-4"
      variants={container}
      initial="hidden"
      animate="visible" //  page refresh
      whileInView="visible" //  scroll
      viewport={{ once: false, amount: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <FaUsers className="w-5 h-5 mr-2 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">
          {APP_CONFIG.SESSION_CONTENT.PARTICIPANTS.HEADING} (
          {participants.length})
        </h2>
      </div>

      <div className="space-y-3">
        {/*  Host */}
        {hostParticipants.map((p, index) => (
          <motion.div
            key={index}
            variants={item}
            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                <span>{p.userName?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{p.userName}</p>
                <p className="text-xs text-blue-600 font-medium">
                  {APP_CONFIG.SESSION_CONTENT.PARTICIPANTS.HOST_LABEL}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/*  Others */}
        {otherParticipants.length > 0 && (
          <>
            <div className="pt-1 border-t border-gray-200 text-sm text-gray-500">
              {APP_CONFIG.SESSION_CONTENT.PARTICIPANTS.JOINED_USERS_LABEL}

              {otherParticipants.map((p, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  className="p-3 bg-white rounded-lg border border-gray-200 flex items-center"
                >
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center mr-3 text-gray-700 font-semibold">
                    {p.userName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{p.userName}</p>
                    <p className="text-xs text-gray-500">
                      {
                        APP_CONFIG.SESSION_CONTENT.PARTICIPANTS
                          .PARTICIPANT_LABEL
                      }
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ParticipantsList;
