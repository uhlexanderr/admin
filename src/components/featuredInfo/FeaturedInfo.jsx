import { useEffect, useState } from "react";
import "./featuredInfo.css";
import { ArrowDownward, ArrowUpward } from "@material-ui/icons";
import { userRequest } from "../../redux/requestMethods";
import * as XLSX from "xlsx";
import { CloudDownload } from "@material-ui/icons";

export default function FeaturedInfo() {
  const [income, setIncome] = useState([]);
  const [lastMonthIncome, setLastMonthIncome] = useState([]);
  const [perc, setPerc] = useState(0);
  const [lastMonthPerc, setLastMonthPerc] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  

  useEffect(() => {
    const getIncome = async () => {
      try {
        const res = await userRequest.get("/orders/income");
        // Assuming the API returns an array of objects with { _id, total } properties
        const sortedIncome = res.data.sort((a, b) => a._id - b._id);
        setIncome(sortedIncome);
      } catch (error) {
        console.error("Error fetching income:", error);
        // Handle error as needed
      }
    };

    const getLastMonthIncome = async () => {
      try {
        const res = await userRequest.get("/orders/income");
        const sortedIncome = res.data.sort((a, b) => a._id - b._id);
        setLastMonthIncome(sortedIncome.slice(-2, -1)); // Get the second-to-last item
      } catch (error) {
        console.error("Error fetching last month income:", error);
        // Handle error as needed
      }
    };

    const getTotalUsers = async () => {
      try {
        const res = await userRequest.get("/users");
        setTotalUsers(res.data.length);
      } catch (error) {
        console.error("Error fetching total users:", error);
        // Handle error as needed
      }
    };

    const getTotalProducts = async () => {
      try {
        const res = await userRequest.get("/products/total");
        setTotalProducts(res.data.total);
      } catch (error) {
        console.error("Error fetching total products:", error);
        // Handle error as needed
      }
    };

    const getTotalOrders = async () => {
      try {
        const res = await userRequest.get("/orders/total");
        setTotalOrders(res.data.total);
      } catch (error) {
        console.error("Error fetching total orders:", error);
        // Handle error as needed
      }
    };

    const getTotalSales = async () => {
      try {
        const res = await userRequest.get("/orders/sales/total");
        setTotalSales(res.data);
      } catch (error) {
        console.error("Error fetching total sales:", error);
      }
    };

    getIncome();
    getLastMonthIncome();
    getTotalUsers();
    getTotalProducts();
    getTotalOrders();
    getTotalSales();
  }, []);

  useEffect(() => {
    if (income.length > 1) {
      const lastIndex = income.length - 1;
      setPerc(((income[lastIndex].total - income[lastIndex - 1].total) * 100) / income[lastIndex - 1].total);
    }
  }, [income]);
  
  useEffect(() => {
    if (lastMonthIncome.length > 0 && income.length > 0) {
      const lastMonthSales = lastMonthIncome[0].total;
      const currentMonthSales = income[income.length - 1].total;
      setLastMonthPerc(((lastMonthSales - currentMonthSales) * 100) / lastMonthSales);
    }
  }, [lastMonthIncome, income]);
  
  
  const formatIncome = (value) => {
    return ` ${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  

  const handleDownloadSalesData = async () => {
    // Fetch user analytics data
    let userAnalyticsData = [];
    try {
      const res = await userRequest.get("/users/registered-by-month-year");
      userAnalyticsData = res.data;
    } catch (error) {
      console.error("Error fetching user analytics data:", error);
    }
  
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
  
    // First worksheet: Income Data
    const incomeWorksheetData = income.map((item) => ({
      Month: `${monthNames[item._id - 1]} ${new Date().getFullYear()}`, // Include year
      'Total Income': `₱${formatIncome(item.total)}`,
    }));
    const incomeWorksheet = XLSX.utils.json_to_sheet(incomeWorksheetData);
    XLSX.utils.book_append_sheet(workbook, incomeWorksheet, "Income Data");
  
    // Second worksheet: User Analytics Data
    const userAnalyticsFormattedData = userAnalyticsData.map((item) => ({
      Month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      'Registered Users': item.total,
    }));
    const userAnalyticsWorksheet = XLSX.utils.json_to_sheet(userAnalyticsFormattedData);
    XLSX.utils.book_append_sheet(workbook, userAnalyticsWorksheet, "User Analytics Data");
  
    // Automatically adjust column widths based on content for both worksheets
    [incomeWorksheet, userAnalyticsWorksheet].forEach((worksheet) => {
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
        colWidths[C] = maxLen + 1; // Adjust this value as needed
      }
  
      worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));
    });
  
    // Generate the blob and download the file
    const blob = new Blob(
      [s2ab(XLSX.write(workbook, { bookType: "xlsx", type: "binary" }))],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );
  
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales_data.xlsx";
    a.click();
  
    window.URL.revokeObjectURL(url);
  };

  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };
  
  return (
    <div className="featured">
      <div className="featuredRow">
        <div className="featuredItem">
          <span className="featuredTitle">Sales This Month</span>
          {income.length > 0 && (
            <div className="featuredMoneyContainer">
              <span className="featuredMoney">
                ₱{formatIncome(income[income.length - 1].total)}
              </span>
              <span className="featuredMoneyRate">
                %{Math.floor(Math.abs(perc))}{" "}
                {perc < 0 ? (
                  <ArrowDownward className="featuredIcon negative" />
                ) : (
                  <ArrowUpward className="featuredIcon" />
                )}
              </span>
            </div>
          )}
          <span className="featuredSub">Compared to last month</span>
        </div>
        <div className="featuredItem">
          <span className="featuredTitle">Sales Last Month</span>
          {lastMonthIncome.length > 0 && (
            <div className="featuredMoneyContainer">
              <span className="featuredMoney">
                ₱{formatIncome(lastMonthIncome[0].total)}
              </span>
              <span className="featuredMoneyRate">
                %{Math.floor(Math.abs(lastMonthPerc))}{" "}
                {lastMonthPerc < 0 ? (
                  <ArrowDownward className="featuredIcon negative" />
                ) : (
                  <ArrowUpward className="featuredIcon" />
                )}
              </span>
            </div>
          )}
          <span className="featuredSub">Compared to current month</span>
        </div>
        <div className="featuredItem">
          <span className="featuredTitle">Total Order Sales</span>
          <div className="featuredMoneyContainer">
            <span className="featuredMoney">₱{formatIncome(totalSales)}</span>
          </div>
          <span className="featuredSub">Overall Total Sales</span>
        </div>
      </div>
      <div className="featuredRow">
        <div className="featuredItem">
          <span className="featuredTitle">Total Users</span>
          <div className="featuredMoneyContainer">
            <span className="featuredMoney">{totalUsers}</span>
          </div>
          <span className="featuredSub">Total number of users</span>
        </div>
        <div className="featuredItem">
          <span className="featuredTitle">Total Products</span>
          <div className="featuredMoneyContainer">
            <span className="featuredMoney">{totalProducts}</span>
          </div>
          <span className="featuredSub">Total number of products</span>
        </div>
        <div className="featuredItem">
          <span className="featuredTitle">Total Orders</span>
          <div className="featuredMoneyContainer">
            <span className="featuredMoney">{totalOrders}</span>
          </div>
          <span className="featuredSub">Total number of orders</span>
        </div>
      </div>
      <button className="DownloadButton" onClick={handleDownloadSalesData}>
        <CloudDownload style={{ marginRight: '5px' }} /> Download Sales Data and User Analytics
        </button>
    </div>
  );
} 
