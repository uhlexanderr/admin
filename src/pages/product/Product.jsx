import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Snackbar, SnackbarContent } from "@material-ui/core";
import { Publish } from "@material-ui/icons";
import { useSelector, useDispatch } from "react-redux";
import { updateProductData } from "../../redux/apiCalls";
import { userRequest } from "../../redux/requestMethods";
import Chart from "../../components/chart/Chart";
import "./product.css";


// Define a custom SnackbarContent component with color based on severity
function CustomSnackbarContent(props) {
  const { message, severity } = props;
  const backgroundColor = severity === "error" ? "#f44336" : "#4caf50";

  return (
    <SnackbarContent
      style={{ backgroundColor: backgroundColor }}
      message={message}
    />
  );
}

export default function Product() {
  const location = useLocation();
  const productId = location.pathname.split("/")[2];
  const dispatch = useDispatch();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const [pStats, setPStats] = useState([]);
  const [inputs, setInputs] = useState({
    size: "",
    color: "",
  });

  const product = useSelector((state) =>
    state.product.products.find((product) => product._id === productId)
  );

  const MONTHS = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    []
  );

  useEffect(() => {
    const getStats = async () => {
      try {
        const res = await userRequest.get("orders/income?pid=" + productId);
        const list = res.data.sort((a, b) => {
          return a._id - b._id;
        });
        list.map((item) =>
          setPStats((prev) => [
            ...prev,
            { name: MONTHS[item._id - 1], Sales: item.total },
          ])
        );
      } catch (err) {
        console.log(err);
      }
    };
    getStats();
  }, [productId, MONTHS]);

  const [colors, setColors] = useState(product.color || []);
  const [sizes, setSizes] = useState(product.size || []);

  useEffect(() => {
    setUpdatedProduct((prevUpdatedProduct) => ({
      ...prevUpdatedProduct,
      color: colors,
      size: sizes,
    }));
  }, [colors, sizes]);

  useEffect(() => {
    setInputs((prevInputs) => ({
      ...prevInputs,
      color: colors[colors.length - 1] || "",
      size: sizes[sizes.length - 1] || "",
    }));
  }, [colors, sizes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  const handleColorAdd = () => {
    if (inputs.color !== "" && !colors.includes(inputs.color)) {
      setColors((prevColors) => [...prevColors, inputs.color]);
      setInputs((prevInputs) => ({
        ...prevInputs,
        color: "",
      }));
    }
  };

  const handleColorRemove = (index) => {
    setColors((prevColors) => [
      ...prevColors.slice(0, index),
      ...prevColors.slice(index + 1),
    ]);
  };

  const handleSizeAdd = () => {
    if (inputs.size !== "" && !sizes.includes(inputs.size)) {
      setSizes((prevSizes) => [...prevSizes, inputs.size]);
      setInputs((prevInputs) => ({
        ...prevInputs,
        size: "",
      }));
    }
  };

  const handleSizeRemove = (index) => {
    setSizes((prevSizes) => [
      ...prevSizes.slice(0, index),
      ...prevSizes.slice(index + 1),
    ]);
  };

  const [updatedProduct, setUpdatedProduct] = useState({
    title: product.title,
    desc: product.desc,
    img: product.img,
    categories: product.categories.join(", "),
    price: product.price,
    inStock: product.inStock,
    color: product.color,
    size: product.size,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (
      !updatedProduct.title ||
      !updatedProduct.desc ||
      !updatedProduct.price ||
      colors.length === 0 ||
      sizes.length === 0
    ) {
      setSnackbarMessage("Please fill in all the required fields.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
  
    try {
      await updateProductData(productId, updatedProduct, dispatch);
      setSnackbarMessage("Product updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error updating product:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setSnackbarMessage(err.response.data.error);
      } else {
        setSnackbarMessage("Failed to update product. Please try again later.");
      }
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="product">
      <div className="productTitleContainer">
        <h1 className="productTitle">Product Details</h1>
        <Link to="/newproduct">
          <button className="productAddButton">Create Product</button>
        </Link>
      </div>
      <div className="productTop">
        <div className="productTopLeft">
          <Chart data={pStats} dataKey="Sales" title="Sales Performance" />
        </div>
        <div className="productTopRight">
          <div className="productInfoTop">
            <img src={product.img} alt="" className="productInfoImg" />
            <span className="productName">{product.title}</span>
          </div>
          <div className="productInfoBottom">
            <div className="productInfoItem">
              <span className="productInfoKey">id:</span>
              <span className="productInfoValue">{product._id}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">sales:</span>
              <span className="productInfoValue">5123</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">in-stock:</span>
              <span className="productInfoValue">
                {product.inStock ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="productBottom">
        <form className="productForm" onSubmit={handleSubmit}>
          <div className="productFormLeft">
            <label htmlFor="productName">Product Name</label>
            <input
              type="text"
              name="title"
              value={updatedProduct.title}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, title: e.target.value })
              }
            />

            <label htmlFor="productDescription">Product Description</label>
            <textarea
              name="desc"
              value={updatedProduct.desc}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, desc: e.target.value })
              }
              rows={10}
            />

            <label htmlFor="productPrice">Price</label>
            <input
              type="text"
              name="price"
              value={updatedProduct.price}
              onChange={(e) =>
                setUpdatedProduct({ ...updatedProduct, price: e.target.value })
              }
            />

            <div className="addProductItem">
              <label>Color</label>
              <input
                name="color"
                type="text"
                placeholder="Product color"
                value={inputs.color}
                onChange={handleChange}
                required
              />
              <button type="button" onClick={handleColorAdd} disabled={inputs.color === ""}>
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
              <input
                name="size"
                type="text"
                placeholder="Product size"
                value={inputs.size}
                onChange={handleChange}
                required
              />
              <button type="button" onClick={handleSizeAdd} disabled={inputs.size === ""}>
                Add Size
              </button>
              {sizes.map((size, index) => (
                <div key={index} className="chip">
                  {size}
                  <button
                    type="button"
                    onClick={() => handleSizeRemove(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <label htmlFor="categories">Categories</label>
            <select
              name="categories"
              id="categories"
              value={updatedProduct.categories}
              onChange={(e) =>
                setUpdatedProduct({
                  ...updatedProduct,
                  categories: e.target.value,
                })
              }
            >
              <option value="curtains">curtains</option>
              <option value="accessories">accessories</option>
              <option value="decors">decors</option>
            </select>
            <label htmlFor="inStock">In-Stock</label>
            <select
              name="inStock"
              id="inStock"
              value={updatedProduct.inStock}
              onChange={(e) =>
                setUpdatedProduct({
                  ...updatedProduct,
                  inStock: e.target.value === "true",
                })
              }
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="productFormRight">
            <div className="productUpload">
              <img src={product.img} alt="" className="productUploadImg" />
              <label htmlFor="file">
                <Publish />
              </label>
              <input type="file" id="file" style={{ display: "none" }} />
            </div>
            <button type="submit" className="productButton">
              Update Product
            </button>
          </div>
        </form>
      </div>
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        {/* Use the CustomSnackbarContent component */}
        <CustomSnackbarContent
          message={snackbarMessage}
          severity={snackbarSeverity}
        />
      </Snackbar>
    </div>
  );
}