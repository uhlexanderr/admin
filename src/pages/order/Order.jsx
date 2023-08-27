// Order.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userRequest } from "../../redux/requestMethods";
import { Typography, Grid, Select, MenuItem, Snackbar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MuiAlert from "@material-ui/lab/Alert";
import "./order.css";

const useStyles = makeStyles((theme) => ({
  order: {
    padding: theme.spacing(2),
  },
  orderTitle: {
    marginBottom: theme.spacing(2),
  },
  orderProduct: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  orderProductImg: {
    width: 100,
    marginRight: theme.spacing(2),
  },
  statusDropdown: {
    minWidth: 200,
    borderRadius: 5,
  },
  menuItem: {
    color: "white",
    "&.Pending": {
      backgroundColor: "#4287f5",
    },
    "&.InvalidReferenceNumber": {
      backgroundColor: "#a30a5c",
    },
    "&.WaitingForPickUp": {
      backgroundColor: "#f59042",
    },
    "&.PickupSuccessful": {
      backgroundColor: "#33c45f",
    },
    "&.Canceled": {
      backgroundColor: "#c43350",
    },
  },
  selectedStatus: {
    backgroundColor: "#f5a742",
    color: "white",
  },
}));

export default function Order() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await userRequest.get(`/orders/${orderId}`);
        setOrder(res.data);
        setSelectedStatus(res.data.status);
      } catch (err) {
        console.log("Error fetching order:", err);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);

    try {
      await userRequest.put(`/orders/${orderId}`, { status: newStatus });
      setOrder((prevOrder) => ({ ...prevOrder, status: newStatus }));
      setShowSnackbar(true);
    } catch (err) {
      console.log("Error updating order status:", err);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowSnackbar(false);
  };

  if (!order) {
    return <div>Error fetching order data. Please try again later.</div>;
  }

  const formatCurrency = (amount) => {
    const formattedAmount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
    return `₱${formattedAmount}`;
  };

  const calculateTotalPrice = () => {
    const totalPrice = order.products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
    return formatCurrency(totalPrice);
  };

  return (
    <div className={classes.order}>
      <Typography variant="h4" className={classes.orderTitle}>
        Order Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <div className="orderProducts">
            {order.products.map((product) => (
              <div key={product._id} className={classes.orderProduct}>
                <img
                  src={product.img}
                  alt={product.title}
                  className={classes.orderProductImg}
                />
                <div>
                  <Typography variant="h6">{product.title}</Typography>
                  <Typography variant="body1">
                    Size: {product.size.join(", ")}
                  </Typography>
                  <Typography variant="body1">
                    Color: {product.color.join(", ")}
                  </Typography>
                  <Typography variant="body1">
                    Price: {formatCurrency(product.price)}
                  </Typography>
                  <Typography variant="body1">
                    Quantity: {product.quantity}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <div className="orderTopRight">
            <div className="orderSummary">
              <Typography variant="h6">Order Summary</Typography>
              <div className="orderSummaryItem">
                <Typography>Total Amount:</Typography>
                <Typography>{calculateTotalPrice()}</Typography>
              </div>
              <div className="orderSummaryItem">
                <Typography>Reference Number:</Typography>
                <Typography>{order.reference_number}</Typography>
              </div>
              <div className="orderSummaryItem">
                <Typography>Status:</Typography>
                <Select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className={`${classes.statusDropdown} ${
                    classes.menuItem
                  } ${selectedStatus.split(" ").join("")} ${
                    classes.selectedStatus
                  }`}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    getContentAnchorEl: null,
                  }}
                >
                  <MenuItem
                    value={"Pending"}
                    className={`${classes.menuItem} Pending`}
                  >
                    Pending
                  </MenuItem>
                  <MenuItem
                    value={"Invalid Reference Number"}
                    className={`${classes.menuItem} InvalidReferenceNumber`}
                  >
                    Invalid Reference Number
                  </MenuItem>
                  <MenuItem
                    value={"Waiting for Pick-Up"}
                    className={`${classes.menuItem} WaitingForPickUp`}
                  >
                    Waiting for Pick-Up
                  </MenuItem>
                  <MenuItem
                    value={"Pickup Successful"}
                    className={`${classes.menuItem} PickupSuccessful`}
                  >
                    Pickup Successful
                  </MenuItem>
                  <MenuItem
                    value={"Canceled"}
                    className={`${classes.menuItem} Canceled`}
                  >
                    Canceled
                  </MenuItem>
                </Select>
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity="success"
        >
          Status updated successfully!
        </MuiAlert>
      </Snackbar>
    </div>
  );
}
