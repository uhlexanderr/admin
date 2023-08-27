import React, { useEffect, useState } from "react";
import "./reports.css";
import { userRequest } from "../../redux/requestMethods";
import * as XLSX from "xlsx";
import { CloudDownload } from "@material-ui/icons";

export default function Reports() {
  const [ordersStats, setOrdersStats] = useState({});
  const [productsStats, setProductsStats] = useState({});
  const [usersStats, setUsersStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersResponse = await userRequest.get("/reports/orders");
        setOrdersStats(ordersResponse.data);

        const productsResponse = await userRequest.get("/reports/products");
        setProductsStats(productsResponse.data);

        const usersResponse = await userRequest.get("/reports/users");
        setUsersStats(usersResponse.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

// Function to handle the download button click
const handleDownload = () => {
  const workbook = XLSX.utils.book_new();

  // Create custom arrays for each statistics section with desired headers
  const ordersData = [
    {
      "Total Orders": ordersStats.totalOrders,
      "Completed Orders": ordersStats.completedOrders,
      "Pending Orders": ordersStats.pendingOrders,
      "Waiting for Pick-up Orders": ordersStats.waitingForPickupOrders,
      "Invalid GCash Reference Number Orders": ordersStats.invalidGcashRefOrders,
      "Canceled Orders": ordersStats.canceledOrders,
    },
  ];
  
  const productsData = [
    {
      "Total Products": productsStats.totalProducts,
      "In Stock Products": productsStats.inStockProducts,
      "Not Available Products": productsStats.outOfStockProducts,
    },
  ];
  
  const usersData = [
    {
      "Total Users": usersStats.totalUsers,
      "Admin Users": usersStats.adminUsers,
      "Regular Users": usersStats.regularUsers,
    },
  ];

  const ordersSheet = XLSX.utils.json_to_sheet(ordersData, { header: Object.keys(ordersData[0]) });
  const productsSheet = XLSX.utils.json_to_sheet(productsData, { header: Object.keys(productsData[0]) });
  const usersSheet = XLSX.utils.json_to_sheet(usersData, { header: Object.keys(usersData[0]) });

  // Automatically adjust column widths and enable text wrap
  const sheets = [ordersSheet, productsSheet, usersSheet];
  sheets.forEach((sheet) => {
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const colWidths = [];
  
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxLen = 0;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })];
        if (!cell) continue;
        const len = cell.v.toString().length;
        if (len > maxLen) {
          maxLen = len;
        }
      }
      colWidths[C] = maxLen + 1; // Adjust this value as needed
    }
  
    sheet['!cols'] = colWidths.map((width) => ({ width }));
    sheet['!merges'] = []; // Clear merges to prevent incorrect auto-sizing
  });

  XLSX.utils.book_append_sheet(workbook, ordersSheet, "Orders");
  XLSX.utils.book_append_sheet(workbook, productsSheet, "Products");
  XLSX.utils.book_append_sheet(workbook, usersSheet, "Users");

  XLSX.writeFile(workbook, "reports.xlsx");
};

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="reports">
      <div className="reportsSection">
        <h2>Orders Statistics</h2>
        <hr />
        <p className="total-stat">Total Orders: {ordersStats.totalOrders}</p>
        <p>Completed Orders: <span className="status-label status-completed">{ordersStats.completedOrders}</span></p>
        <p>Pending Orders: <span className="status-label status-pending">{ordersStats.pendingOrders}</span></p>
        <p>Waiting for Pick-up Orders: <span className="status-label status-waiting">{ordersStats.waitingForPickupOrders}</span></p>
        <p>Invalid GCash Reference Number Orders: <span className="status-label status-invalid">{ordersStats.invalidGcashRefOrders}</span></p>
        <p>Canceled Orders: <span className="status-label status-canceled">{ordersStats.canceledOrders}</span></p>
      </div>
      <div className="reportsSection">
        <h2>Products Statistics</h2>
        <hr />
        <p className="total-stat">Total Products: {productsStats.totalProducts}</p>
        <p>In Stock Products: <span className="status-label status-in-stock">{productsStats.inStockProducts}</span></p>
        <p>Not Available Products: <span className="status-label status-out-of-stock">{productsStats.outOfStockProducts}</span></p>
      </div>
      <div className="reportsSection" style={{ borderRight: "1px solid #ccc" }}>
        <h2>Users Statistics</h2>
        <hr />
        <p className="total-stat">Total Users: {usersStats.totalUsers}</p>
        <p>Admin Users: <span className="status-label status-admin">{usersStats.adminUsers}</span></p>
        <p>Regular Users: <span className="status-label status-regular">{usersStats.regularUsers}</span></p>
      </div>
      <div className="button">
        {/* Adjusted download button */}
        <button className="reportsDownloadButton" onClick={handleDownload}>
          <CloudDownload style={{ fontSize: '1rem', marginRight: '5px' }} /> Download Reports Data
        </button>
      </div>
    </div>
  );
}