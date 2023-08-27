import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { login } from "../../redux/apiCalls";
import { Button, TextField, Snackbar, Typography, SnackbarContent } from "@material-ui/core";

const Login = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  const initialValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values) => {
    try {
      const loggedIn = await login(dispatch, values);
      console.log("loggedIn:", loggedIn);
      if (loggedIn) {
        history.push("/");
      } else {
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.log("Login error:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundImage: `url('/bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: 25,
          borderRadius: 8,
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Your circular logo */}
        <div
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            overflow: "hidden",
            marginBottom: "20px",
          }}
        >
          <img
            src="/Logo.png"
            alt="Your Logo"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <Typography
          variant="h5"
          style={{
            color: "#191919",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Marasigan Admin
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Form style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Field
              as={TextField}
              type="text"
              name="username"
              label="Username"
              variant="outlined"
              style={{ marginTop: 20, width: "100%" }}
            />
            <ErrorMessage
              name="username"
              component="div"
              style={{ color: "red", marginBottom: "10px" }}
            />

            <Field
              as={TextField}
              type="password"
              name="password"
              label="Password"
              variant="outlined"
              style={{ marginTop: 20, width: "100%" }}
            />
            <ErrorMessage
              name="password"
              component="div"
              style={{ color: "red", marginBottom: "10px" }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ width: 200, marginTop: 20, padding: 10 }}
            >
              Login
            </Button>
          </Form>
        </Formik>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          onClose={() => setOpenSnackbar(false)}
        >
          <SnackbarContent
            style={{ backgroundColor: "red" }}
            message="Invalid credentials. Please try again."
          />
        </Snackbar>
      </div>
    </div>
  );
};

export default Login;
