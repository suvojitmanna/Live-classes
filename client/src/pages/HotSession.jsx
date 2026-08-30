import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import MeetingRoom from "./MeetingRoom";

const HotSession = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get("roomId");

  useEffect(() => {
    if (roomId) {
      navigate(`${ROUTES.MEETING}/${roomId}`, { replace: true });
    }
  }, [roomId, navigate]);

  return <MeetingRoom />;
};

export default HotSession;
