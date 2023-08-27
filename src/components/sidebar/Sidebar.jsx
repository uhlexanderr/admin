import "./sidebar.css";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  LineStyle,
  PermIdentity,
  Storefront,
  AttachMoney,
  BarChart,
  ExitToApp,
} from "@material-ui/icons";
import { Link, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@material-ui/core";

import { logout } from "../../redux/userRedux";

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [activeItem, setActiveItem] = useState("home");
  const [open, setOpen] = useState(false);

  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  const handleLogout = () => {
    setOpen(true);
  };

  const handleLogoutConfirmed = () => {
    setOpen(false);
    dispatch(logout());
    // Redirect to the login page after logout
    window.location.href = "/login";
  };

  const handleLogoutCancelled = () => {
    setOpen(false);
  };

  useEffect(() => {
    // Use the location.pathname to get the current route
    const currentRoute = location.pathname.replace("/", "");
    setActiveItem(currentRoute || "home");
  }, [location]);

  return (
    <div className="sidebar">
      <div className="sidebarWrapper">
        <div className="sidebarMenu">
          <h3 className="sidebarTitle">Dashboard</h3>
          <ul className="sidebarList">
            <Link to="/" className="link">
              <li
                className={`sidebarListItem ${
                  activeItem === "home" ? "active" : ""
                }`}
                onClick={() => handleItemClick("home")}
              >
                <LineStyle className="sidebarIcon" />
                Home
              </li>
            </Link>
            <Link to="/users" className="link">
              <li
                className={`sidebarListItem ${
                  activeItem === "users" ? "active" : ""
                }`}
                onClick={() => handleItemClick("users")}
              >
                <PermIdentity className="sidebarIcon" />
                Users
              </li>
            </Link>
            <Link to="/products" className="link">
              <li
                className={`sidebarListItem ${
                  activeItem === "products" ? "active" : ""
                }`}
                onClick={() => handleItemClick("products")}
              >
                <Storefront className="sidebarIcon" />
                Products
              </li>
            </Link>
            <Link to="/orders" className="link">
              <li
                className={`sidebarListItem ${
                  activeItem === "orders" ? "active" : ""
                }`}
                onClick={() => handleItemClick("orders")}
              >
                <AttachMoney className="sidebarIcon" />
                Orders
              </li>
            </Link>
            <Link to="/reports" className="link">
              <li
                className={`sidebarListItem ${
                  activeItem === "reports" ? "active" : ""
                }`}
                onClick={() => handleItemClick("reports")}
              >
                <BarChart className="sidebarIcon" />
                Reports
              </li>
            </Link>
            {/* Logout button */}
            <Link to="#" className="link" onClick={handleLogout}>
              <li className="sidebarListItem">
                <ExitToApp className="sidebarIcon" />
                Logout
              </li>
            </Link>
          </ul>
        </div>
      </div>
      {/* Confirmation dialog */}
      <Dialog
        open={open}
        onClose={handleLogoutCancelled}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Logout"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancelled} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirmed} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
