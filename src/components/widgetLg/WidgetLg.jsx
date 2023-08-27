import { useEffect, useState } from "react";
import "./widgetLg.css";
import { userRequest } from "../../redux/requestMethods";
import { format } from "timeago.js";

export default function WidgetLg() {
  const [orders, setOrders] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user")); // Assuming user data is stored in localStorage

  useEffect(() => {
    const getOrders = async () => {
      try {
        const res = await userRequest.get("orders", {
          headers: {
            Authorization: currentUser?.accessToken
              ? `Bearer ${currentUser.accessToken}`
              : "",
          },
        });
        setOrders(res.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        // You can display an error message to the user or handle the error as needed.
      }
    };
    getOrders();
  }, [currentUser?.accessToken]);

  const Button = ({ type }) => {
    return <button className={"widgetLgButton " + type}>{type}</button>;
  };

  // Show only the latest 5 transactions
  const latestTransactions = orders.slice(-5).reverse();

  return (
    <div className="widgetLg">
      <h3 className="widgetLgTitle">Latest transactions</h3>
      <table className="widgetLgTable">
        <thead>
          <tr className="widgetLgTr">
            <th className="widgetLgTh">Customer</th>
            <th className="widgetLgTh">Reference Number</th>
            <th className="widgetLgTh">Date</th>
            <th className="widgetLgTh">Amount</th>
            <th className="widgetLgTh">Status</th>
          </tr>
        </thead>
        <tbody>
          {latestTransactions.map((order) => (
            <tr className="widgetLgTr" key={order._id}>
              <td className="widgetLgUser">
                <span className="widgetLgName">
                  {order.firstName} {order.lastName}
                </span>
              </td>
              <td className="widgetLgAmount">{order.reference_number}</td>
              <td className="widgetLgDate">{format(order.createdAt)}</td>
              <td className="widgetLgAmount">₱{order.amount}</td>
              <td className="widgetLgStatus">
                <Button type={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
