import React, { useState } from "react";
import { CalendarToday, LocationSearching, MailOutline, PermIdentity, PhoneAndroid, Publish } from "@material-ui/icons";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../redux/apiCalls";
import "./user.css";
import { Snackbar, SnackbarContent } from "@material-ui/core";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { format } from "date-fns"; // Import the format function from date-fns

const validationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  mobileNumber: Yup.string().required("Mobile Number is required"),
});

const User = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const dispatch = useDispatch();
  const { userId } = useParams();
  const users = useSelector((state) => state.user.users);
  const selectedUser = users.find((user) => user._id === userId);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(updateUser(userId, values));
      // No need to update local state, directly update the Redux state
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setSubmitting(false);
    }
  };  

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  if (!selectedUser) {
    return <div>Loading...</div>;
  }

  const { username, firstName, lastName, email, mobile_number, isAdmin, createdAt } = selectedUser;

  return (
    <div className="user">
      <div className="userTitleContainer">
        <h1 className="userTitle">Edit User</h1>
        <Link to="/newUser">
          <button className="userAddButton">Create</button>
        </Link>
      </div>
      <div className="userContainer">
        <div className="userShow">
          <div className="userShowTop">
            <img
              src="/avatar.png"
              alt=""
              className="userShowImg"
            />
            <div className="userShowTopTitle">
              <span className="userShowUsername">{username}</span>
              <span className="userShowUserTitle">{isAdmin ? "Administrator" : "Basic User"}</span>
            </div>
          </div>
          <div className="userShowBottom">
            <span className="userShowTitle">Account Details</span>
            <div className="userShowInfo">
              <PermIdentity className="userShowIcon" />
              <span className="userShowInfoTitle">{username}</span>
            </div>
            <div className="userShowInfo">
              <CalendarToday className="userShowIcon" />
              <span className="userShowInfoTitle">{format(new Date(createdAt), "MMMM dd, yyyy")}</span>
            </div>
            <span className="userShowTitle">Contact Details</span>
            <div className="userShowInfo">
              <PhoneAndroid className="userShowIcon" />
              <span className="userShowInfoTitle">{mobile_number}</span>
            </div>
            <div className="userShowInfo">
              <MailOutline className="userShowIcon" />
              <span className="userShowInfoTitle">{email}</span>
            </div>
            <div className="userShowInfo">
              <LocationSearching className="userShowIcon" />
              <span className="userShowInfoTitle">Philippines</span>
            </div>
          </div>
        </div>
        <div className="userUpdate">
          <span className="userUpdateTitle">Edit</span>
          <Formik
            initialValues={{
              username: username,
              firstName: firstName,
              lastName: lastName,
              email: email,
              mobileNumber: mobile_number,
              isAdmin: isAdmin,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="userUpdateForm">
                <div className="userUpdateLeft">
                  <div className="userUpdateItem">
                    <label>Username</label>
                    <Field type="text" name="username" className="userUpdateInput" />
                    <ErrorMessage name="username" component="div" className="error" />
                  </div>
                  <div className="userUpdateItem">
                    <label>First Name</label>
                    <Field type="text" name="firstName" className="userUpdateInput" />
                    <ErrorMessage name="firstName" component="div" className="error" />
                  </div>
                  <div className="userUpdateItem">
                    <label>Last Name</label>
                    <Field type="text" name="lastName" className="userUpdateInput" />
                    <ErrorMessage name="lastName" component="div" className="error" />
                  </div>
                  <div className="userUpdateItem">
                    <label>Email</label>
                    <Field type="text" name="email" className="userUpdateInput" />
                    <ErrorMessage name="email" component="div" className="error" />
                  </div>
                  <div className="userUpdateItem">
                    <label>Mobile Number</label>
                    <Field type="text" name="mobileNumber" className="userUpdateInput" />
                    <ErrorMessage name="mobileNumber" component="div" className="error" />
                  </div>
                  <div className="userUpdateItem">
  <label>Role</label>
  <Field as="select" name="isAdmin" className="userUpdateInput">
    <option value={false}>Basic User</option>
    <option value={true}>Administrator</option>
  </Field>
</div>

                </div>
                <div className="userUpdateRight">
                  <div className="userUpdateUpload">
                    <img
                      className="userUpdateImg"
                      src="/avatar.png"
                      alt=""
                    />
                    <label htmlFor="file">
                      <Publish className="userUpdateIcon" />
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} />
                  </div>
                  <button type="submit" className="userUpdateButton" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        {/* Custom SnackbarContent for success messages */}
        <SnackbarContent
          style={{ backgroundColor: "green" }}
          message="User updated successfully!"
        />
      </Snackbar>
    </div>
  );
};

export default User;