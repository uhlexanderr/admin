import { useEffect, useState } from "react";
import { DataGrid } from "@material-ui/data-grid";
import { useDispatch } from "react-redux";
import { DeleteOutline } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { getAllUsers, deleteUser } from "../../redux/apiCalls";
import "./userList.css";
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


export default function UserList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false); // State for Confirm Dialog
  const [selectedUserId, setSelectedUserId] = useState(null); // State to store selected user ID for deletion
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await getAllUsers(dispatch);
        const mappedUsers = users.map((user) => ({ ...user, id: user._id }));
        setData(mappedUsers);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching users:", error);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleDelete = async (id) => {
    setSelectedUserId(id);
    setConfirmOpen(true); // Open the Confirm Dialog when the user clicks delete
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUser(selectedUserId, dispatch);
      setData((prevData) => prevData.filter((item) => item.id !== selectedUserId));
      setSnackbarOpen(true); // Show the Snackbar on successful deletion
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setConfirmOpen(false); // Close the Confirm Dialog after deletion
    }
  };

  // Close the Confirm Dialog if the user cancels the deletion
  const handleCancelDelete = () => {
    setConfirmOpen(false);
  };

  // Close the Snackbar after it's shown
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleUserDownload = () => {
    const formattedUsers = data.map((user) => ({
      ID: user.id,
      Username: user.username,
      "First Name": user.firstName,
      "Last Name": user.lastName,
      Email: user.email,
      "Mobile Number": user.mobile_number,
      "Is Admin": user.isAdmin ? "Yes" : "No",
      "Created at": new Date(user.createdAt).toLocaleString(),
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(formattedUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Adjust column widths
    worksheet["!cols"] = [
      { width: 25 },
      { width: 15 },
      { width: 20 },
      { width: 20 },
      { width: 30 },
      { width: 18 },
      { width: 10 },
      { width: 22 },

    ];

  // Enable text wrapping for all cells
  for (let row = 2; row <= formattedUsers.length + 1; row++) {
    for (let col = 1; col <= 8; col++) {
      const cell = XLSX.utils.encode_cell({ r: row, c: col });
      const cellStyle = worksheet[cell] ? worksheet[cell].s || {} : {};
      cellStyle.alignment = { wrapText: true };
      worksheet[cell] = { ...worksheet[cell], s: cellStyle };
    }
  }

  const blob = new Blob(
    [s2ab(XLSX.write(workbook, { bookType: "xlsx", type: "binary" }))],
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "users.xlsx";
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
    { field: "id", headerName: "ID", width: 250 },
    {
      field: "user",
      headerName: "Username",
      width: 150,
      renderCell: (params) => {
        return <div className="userListUser">{params.row.username}</div>;
      },
    },
    { field: "email", headerName: "Email", width: 250 },
    {
      field: "firstName",
      headerName: "First Name",
      width: 150,
    },
    {
      field: "lastName",
      headerName: "Last Name",
      width: 160,
    },
    {
      field: "mobile_number",
      headerName: "Mobile Number",
      width: 180,
    },
    {
      field: "isAdmin",
      headerName: "Admin",
      width: 120,
      renderCell: (params) => (
        <div className="userListIsAdmin">{params.row.isAdmin ? "Yes" : "No"}</div>
      ),
    },
    {
      field: "action",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => {
        return (
          <>
            <Link to={`/user/${params.row.id}`}>
              <button className="userListEdit">Edit User</button>
            </Link>
            <DeleteOutline
              className="userListDelete"
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
    <div className="userList">
      <div className="buttonContainer">
      <button className="userDownloadButton" onClick={handleUserDownload}>
  <CloudDownload style={{ marginRight: '5px' }} /> Download User Data
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
        <DialogTitle id="alert-dialog-title">{"Deleter User"}</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this user?</p>
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
          style={{ backgroundColor: "#4caf50" }} // Make the Snackbar green
          message="User deleted successfully!"
        />
      </Snackbar>
    </div>
  );
}