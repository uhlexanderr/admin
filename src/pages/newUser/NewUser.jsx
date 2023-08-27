import "./newUser.css";

export default function NewUser() {
  return (
    <div className="newUser">
      <h1 className="newUserTitle">New User</h1>
      <form className="newUserForm">
        <div className="newUserItem">
          <label>First Name</label>
          <input type="text" placeholder="First Name" />
        </div>
        <div className="newUserItem">
          <label>Last Name</label>
          <input type="text" placeholder="Last Name" />
        </div>
        <div className="newUserItem">
          <label>Username</label>
          <input type="text" placeholder="Username" />
        </div>
        <div className="newUserItem">
          <label>Email</label>
          <input type="email" placeholder="Email" />
        </div>
        <div className="newUserItem">
          <label>Mobile Number</label>
          <input type="text" placeholder="Mobile Number" />
        </div>
        <div className="newUserItem">
          <label>Password</label>
          <input type="password" placeholder="Password" />
        </div>
        <div className="newUserItem">
          <label>Administrator</label>
          <select className="newUserSelect" name="active" id="active">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <button className="newUserButton">Create</button>
      </form>
    </div>
  );
}