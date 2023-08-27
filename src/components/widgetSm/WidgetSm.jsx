import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom"; // Import useHistory hook
import "./widgetSm.css";
import { Visibility } from "@material-ui/icons";
import { userRequest } from '../../redux/requestMethods';

export default function WidgetSm() {
  const [users, setUsers] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const history = useHistory(); // Create a history object

  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await userRequest.get("users/?new=true", {
          headers: {
            Authorization: currentUser?.accessToken
              ? `Bearer ${currentUser.accessToken}`
              : "",
          },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error.response);
      }
    };
    getUsers();
  }, [currentUser?.accessToken]);

  // Function to handle the user click and redirect to their profile
  const handleDisplayClick = (userId) => {
    history.push(`/user/${userId}`);
  };

  return (
    <div className="widgetSm">
      <span className="widgetSmTitle">Latest Users</span>
      <ul className="widgetSmList">
        {users.map((user) => (
          <li className="widgetSmListItem" key={user._id}>
            <img
              src={
                user.img ||
                "/avatar.png"
              }
              alt=""
              className="widgetSmImg"
            />
            <div className="widgetSmUser">
              <span className="widgetSmUsername">{user.username}</span>
            </div>
            <button
              className="widgetSmButton"
              onClick={() => handleDisplayClick(user._id)}
            >
              <Visibility className="widgetSmIcon" />
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
