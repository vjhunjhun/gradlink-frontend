import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const useGetAllNotification = () => {
  const { user } = useSelector((store) => store.auth);

  const [notifications, setNotifications] = useState([]);
    useEffect(() => {
    const fetchAllNotification = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/v1/user/notification/${user?._id}`,
          { withCredentials: true },
        );

        if (res.data.success) {
          setNotifications(res.data.notifications);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchAllNotification();
  }, [user]);

    return notifications;
};

export default useGetAllNotification;
