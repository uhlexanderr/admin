import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import "./App.css";
import Home from "./pages/home/Home";
import UserList from "./pages/userList/UserList";
import User from "./pages/user/User";
import NewUser from "./pages/newUser/NewUser";
import ProductList from "./pages/productList/ProductList";
import Product from "./pages/product/Product";
import NewProduct from "./pages/newProduct/NewProduct";
import OrderList from "./pages/orderList/OrderList";
import Order from "./pages/order/Order";
import Reports from "./pages/report/Reports";
import Login from "./pages/login/Login";

function App() {
  const { currentUser } = useSelector((state) => state.user);
  const isAdmin = currentUser?.isAdmin || false;

  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        {isAdmin ? (
          <>
            <Topbar />
            <div className="container">
              <Sidebar />
              <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/users" component={UserList} />
                <Route path="/user/:userId" component={User} />
                <Route path="/newUser" component={NewUser} />
                <Route path="/products" component={ProductList} />
                <Route path="/product/:productId" component={Product} />
                <Route path="/newproduct" component={NewProduct} />
                <Route path="/orders" component={OrderList} />
                <Route path="/order/:orderId" component={Order} />
                <Route path="/reports" component={Reports} />
                <Redirect to="/" />
              </Switch>
            </div>
          </>
        ) : (
          <Redirect to="/login" />
        )}
      </Switch>
    </Router>
  );
}

export default App;
