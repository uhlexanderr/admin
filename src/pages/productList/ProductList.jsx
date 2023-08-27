import React, { useState, useEffect } from "react";
import "./productList.css";
import { DataGrid } from "@material-ui/data-grid";
import { DeleteOutline } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProducts, deleteProduct } from "../../redux/apiCalls";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  SnackbarContent,
} from "@material-ui/core";
import { CloudDownload } from "@material-ui/icons";
import * as XLSX from "xlsx";

export default function ProductList() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products);

  useEffect(() => {
    getProducts(dispatch);
  }, [dispatch]);

  const handleDelete = (id) => {
    deleteProduct(id, dispatch);
  };

  const formatPrice = (price) => {
    const formattedPrice = Number(price).toFixed(2);
    return formattedPrice.replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  // Add state to keep track of the product to be deleted
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Function to handle opening the delete confirmation dialog
  const handleDialogOpen = (product) => {
    setSelectedProduct(product);
  };

  // Function to handle closing the delete confirmation dialog
  const handleDialogClose = () => {
    setSelectedProduct(null);
  };

  // Function to handle the actual deletion after confirmation
  const handleDeleteConfirmed = () => {
    if (selectedProduct) {
      handleDelete(selectedProduct._id);
      handleDialogClose();
      showSnackbar("Product deleted successfully!", "success");
    }
  };

  // Add state to manage the Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Default to success severity

  // Function to handle opening the Snackbar with a message
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Close the Snackbar after it's shown
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleDownload = () => {
    const formattedProducts = products.map((product) => ({
      ID: product._id,
      Product: product.title,
      Category: product.categories[0],
      Colors: product.color.join(", "),
      Sizes: product.size.join(", "),
      Price: formatPrice(product.price),
      Stock: product.inStock,
      Image: product.img,
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(formattedProducts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  
    // Adjust column widths (including the new fields)
    worksheet["!cols"] = [
      { width: 25 },  // ID
      { width: 35 },  // Product
      { width: 15 },  // Category
      { width: 65 },  // Colors
      { width: 30 },  // Sizes
      { width: 15 },  // Price
      { width: 10 },
      { width: 60 },
    ];
  
    // Enable text wrapping for all cells
    for (let row = 2; row <= formattedProducts.length + 1; row++) {
      for (let col = 1; col <= 5; col++) {
        const cell = XLSX.utils.encode_cell({ r: row, c: col });
        const cellStyle = worksheet[cell] ? worksheet[cell].s || {} : {};
        cellStyle.alignment = { wrapText: true };
        worksheet[cell] = { ...worksheet[cell], s: cellStyle };
      }
    }
  
    const blob = new Blob(
      [s2ab(XLSX.write(workbook, { bookType: "xlsx", type: "binary" }))],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );
  
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.xlsx";
    a.click();
  
    window.URL.revokeObjectURL(url);
  };
  
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };

  const columns = [
    { field: "_id", headerName: "ID", width: 250 },
    {
      field: "product",
      headerName: "Product",
      width: 350,
      renderCell: (params) => {
        return (
          <div className="productListItem">
            <img className="productListImg" src={params.row.img} alt="" />
            {params.row.title}
          </div>
        );
      },
    },
    { field: "category", headerName: "Category", width: 180, renderCell: (params) => params.row.categories[0] },
    { field: "inStock", headerName: "Stock", width: 150 },
    {
      field: "price",
      headerName: "Price",
      width: 160,
      renderCell: (params) => {
        return (
          <div>
            {formatPrice(params.row.price)}
          </div>
        );
      },
    },
    {
      field: "action",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => {
        return (
          <>
            <Link to={"/product/" + params.row._id}>
              <button className="productListEdit">Edit Product</button>
            </Link>
            <DeleteOutline
              className="productListDelete"
              onClick={() => handleDialogOpen(params.row)}
            />
          </>
        );
      },
    },
  ];

  return (
    <div className="productList">
      <div className="buttonContainer">
        <Link to="/newproduct">
          <button className="productAddButton">Create Product</button>
        </Link>
        <button className="productDownloadButton" onClick={handleDownload}>
        <CloudDownload style={{ marginRight: '5px' }} /> Download Product Data
        </button>
      </div>
      <DataGrid
        rows={products}
        disableSelectionOnClick
        columns={columns}
        getRowId={(row) => row._id}
        pageSize={20}
        checkboxSelection
      />

      {/* Confirmation Dialog */}
      <Dialog open={selectedProduct !== null} onClose={handleDialogClose}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this product?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirmed} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={openSnackbar}
        autoHideDuration={3000} // Snackbar will be hidden after 3 seconds
        onClose={handleSnackbarClose}
      >
        {/* Custom SnackbarContent for success messages */}
        <SnackbarContent
          style={{ backgroundColor: snackbarSeverity === "success" ? "green" : "red" }}
          message={snackbarMessage}
        />
      </Snackbar>
    </div>
  );
}
