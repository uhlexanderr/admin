// orderList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DataGrid } from "@material-ui/data-grid";
import { useDispatch } from "react-redux";
import { DeleteOutline } from "@material-ui/icons";
import { getOrders, deleteOrder } from "../../redux/apiCalls";
import "./orderList.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Snackbar,
  SnackbarContent,
} from "@material-ui/core";
import { CloudDownload } from "@material-ui/icons";
import * as XLSX from "xlsx";

export default function OrderList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orders = await getOrders(dispatch);
        if (Array.isArray(orders)) {
          const mappedOrders = orders.map((order) => ({
            ...order,
            id: order._id,
            fullName: `${order.firstName} ${order.lastName}`,
            username: order.username,
          }));
          setData(mappedOrders);
          setLoading(false);
        } else {
          setLoading(false);
          console.error("Orders data is not an array:", orders);
        }
      } catch (error) {
        setLoading(false);
        console.error("Error fetching orders:", error);
      }
    };
    fetchData();
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#4287f5";
      case "Invalid Reference Number":
        return "#a30a5c";
      case "Waiting for Pick-Up":
        return "#f59042";
      case "Pickup Successful":
        return "#33c45f";
      case "Canceled":
        return "#c43350";
      default:
        return "blue";
    }
  };

  const handleDelete = async (id) => {
    setSelectedOrderId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteOrder(selectedOrderId, dispatch);
      setData((prevData) => prevData.filter((item) => item.id !== selectedOrderId));
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting order:", error);
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleOrderDownload = () => {
    const formattedOrders = data.map((order) => ({
      ID: order.id,
      Username: order.username,
      "Full Name": order.fullName,
      "Total Amount": `₱${Number(order.amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      "Gcash Reference No.": order.reference_number,
      "Order Date": new Date(order.createdAt).toLocaleString(),
      Status: order.status,
      ...order.products.reduce((acc, product, index) => {
        acc[`Product ${index + 1} Title`] = product.title;
        acc[`Product ${index + 1} Image`] = product.img;
        acc[`Product ${index + 1} Size`] = product.size.join(", ");
        acc[`Product ${index + 1} Color`] = product.color.join(", ");
        acc[`Product ${index + 1} Price`] = `₱${Number(product.price).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
        acc[`Product ${index + 1} Quantity`] = product.quantity;
        return acc;
      }, {}),
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(formattedOrders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
  
    // Automatically adjust column widths based on content
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    const colWidths = [];
  
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxLen = 0;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = worksheet[XLSX.utils.encode_cell({ c: C, r: R })];
        if (!cell) continue;
        const len = cell.v.toString().length;
        if (len > maxLen) {
          maxLen = len;
        }
      }
      colWidths[C] = maxLen + 0; // Adjust this value as needed
    }
  
    worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));
  
    const blob = new Blob(
      [s2ab(XLSX.write(workbook, { bookType: "xlsx", type: "binary" }))],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );
  
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.xlsx";
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
    { field: "id", headerName: "ID", width: 230 },
    {
      field: "username",
      headerName: "Username",
      width: 150,
    },
    {
      field: "fullName",
      headerName: "Full Name",
      width: 200,
    },
    {
      field: "amount",
      headerName: "Total Amount",
      width: 170,
      valueFormatter: (params) => {
        const formattedAmount = Number(params.value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return `₱${formattedAmount}`;
      },
    },
    {
      field: "reference_number",
      headerName: "Gcash Reference No.",
      width: 200,
    },
    {
      field: "createdAt",
      headerName: "Order Date",
      width: 200,
      valueFormatter: (params) => {
        const formattedDate = new Date(params.value).toLocaleString();
        return formattedDate;
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 210,
      renderCell: (params) => {
        const status = params.value;
        const statusColor = getStatusColor(status);
    
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                backgroundColor: statusColor,
                color: "white",
                borderRadius: "25px",
                padding: "5px",
              }}
            >
              {status}
            </div>
          </div>
        );
      },
    },
    {
      field: "action",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => {
        return (
          <>
            <Link to={`/order/${params.row._id}`}>
              <button className="orderListEdit">View Order</button>
            </Link>
            <DeleteOutline
              className="orderListDelete"
              onClick={() => handleDelete(params.row.id)}
            />
          </>
        );
      },
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="orderList">
      <div className="buttonContainer">
      <button className="orderDownloadButton" onClick={handleOrderDownload}>
  <CloudDownload style={{ marginRight: '5px' }} /> Download Order Data
</button>
</div>
      <DataGrid
        rows={data}
        disableSelectionOnClick
        columns={columns}
        pageSize={20}
        checkboxSelection
      />

      {/* Confirm Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Order"}</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this order?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <SnackbarContent
          style={{ backgroundColor: "#4caf50" }}
          message="Order deleted successfully!"
        />
      </Snackbar>
    </div>
  );
}
