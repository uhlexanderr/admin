import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Snackbar, SnackbarContent, Button } from "@material-ui/core";
import ErrorIcon from "@material-ui/icons/Error";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import "./newProduct.css";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app from "../../firebase";
import { addProduct } from "../../redux/apiCalls";
import { useDispatch } from "react-redux";

export default function NewProduct() {
  const [file, setFile] = useState(null);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const dispatch = useDispatch();

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleColorAdd = (color) => {
    if (color.trim() !== "") {
      // Check if the color already exists in the colors array
      if (!colors.includes(color.trim())) {
        setColors((prevColors) => [...prevColors, color.trim()]);
      } else {
        setSnackbarOpen(true);
        setSnackbarMessage("Color already added.");
        setSnackbarSeverity("error");
      }
    }
  };

  const handleSizeAdd = (size) => {
    if (size.trim() !== "") {
      // Check if the size already exists in the sizes array
      if (!sizes.includes(size.trim())) {
        setSizes((prevSizes) => [...prevSizes, size.trim()]);
      } else {
        setSnackbarOpen(true);
        setSnackbarMessage("Size already added.");
        setSnackbarSeverity("error");
      }
    }
  };

  const handleColorRemove = (index) => {
    setColors((prevColors) => prevColors.filter((_, i) => i !== index));
  };

  const handleSizeRemove = (index) => {
    setSizes((prevSizes) => prevSizes.filter((_, i) => i !== index));
  };

  const handleClick = (values) => {
    const fileName = new Date().getTime() + file.name;
    const storage = getStorage(app);
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        setSnackbarOpen(true);
        setSnackbarMessage(`Upload is ${progress.toFixed(2)}% done`);
        setSnackbarSeverity("info");
      },
      (error) => {
        // Handle unsuccessful uploads
        setSnackbarOpen(true);
        setSnackbarMessage("Error uploading the image.");
        setSnackbarSeverity("error");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const product = {
            ...values,
            img: downloadURL,
            size: sizes,
            color: colors,
          };
          addProduct(product, dispatch)
            .then(() => {
              setSnackbarOpen(true);
              setSnackbarMessage("Product created successfully.");
              setSnackbarSeverity("success");
            })
            .catch((error) => {
              setSnackbarOpen(true);
              setSnackbarMessage("Error creating the product.");
              setSnackbarSeverity("error");
            });
        });
      }
    );
  };

  const categories = ["curtains", "accessories", "decors"];

  return (
    <div className="newProduct">
      <h1 className="addProductTitle">New Product</h1>
      <Formik
        initialValues={{
          title: "",
          desc: "",
          color: "",
          size: "",
          inStock: true,
          price: "",
          categories: "",
        }}
        onSubmit={handleClick}
      >
        {({ isValid, values, setFieldValue }) => (
          <Form className="addProductForm">
            <div className="addProductItem">
              <label>Image</label>
              <input
                type="file"
                id="file"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>
            <div className="addProductItem">
              <label>Product Name</label>
              <Field
                name="title"
                type="text"
                placeholder="Product Name"
                required
              />
              <ErrorMessage name="title" component="div" />
            </div>
            <div className="addProductItem">
              <label>Description</label>
              <Field
                as="textarea"
                name="desc"
                placeholder="Product Description"
                required
              />
              <ErrorMessage name="desc" component="div" />
            </div>
            <div className="addProductItem">
              <label>Color</label>
              <Field
                name="color"
                type="text"
                placeholder="Product color"
                required
              />
              <button
                type="button"
                onClick={() => handleColorAdd(values.color)}
              >
                Add Color
              </button>
              {colors.map((color, index) => (
                <div key={index} className="chip">
                  {color}
                  <button
                    type="button"
                    onClick={() => handleColorRemove(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="addProductItem">
              <label>Size</label>
              <Field
                name="size"
                type="text"
                placeholder="Product size"
                required
              />
              <button type="button" onClick={() => handleSizeAdd(values.size)}>
                Add Size
              </button>
              {sizes.map((size, index) => (
                <div key={index} className="chip">
                  {size}
                  <button type="button" onClick={() => handleSizeRemove(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="addProductItem">
              <label>Price</label>
              <Field
                name="price"
                type="number"
                placeholder="Product Price"
                required
              />
              <ErrorMessage name="price" component="div" />
            </div>
            <div className="addProductItem">
              <label>Category</label>
              <Field
                as="select"
                name="categories"
                onChange={(e) => setFieldValue("categories", e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="categories" component="div" />
            </div>
            <button
              type="submit"
              className={`addProductButton ${isValid ? "" : "disabled"}`}
              disabled={!isValid}
            >
              Create Product
            </button>
          </Form>
        )}
      </Formik>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <SnackbarContent
          style={{
            backgroundColor:
              snackbarSeverity === "error" ? "#f44336" : "#4caf50",
          }}
          message={
            <span style={{ display: "flex", alignItems: "center" }}>
              {snackbarSeverity === "error" ? (
                <ErrorIcon style={{ marginRight: "8px" }} />
              ) : (
                <CheckCircleIcon style={{ marginRight: "8px" }} />
              )}
              {snackbarMessage}
            </span>
          }
          action={[
            <Button
              key="close"
              color="inherit"
              size="small"
              onClick={handleCloseSnackbar}
            >
              Close
            </Button>,
          ]}
        />
      </Snackbar>
    </div>
  );
}