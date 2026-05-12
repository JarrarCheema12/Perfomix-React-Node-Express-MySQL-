
import React from "react";
import ChangePassword from "./Settings/ChangePassword";
import UpdateProfile from "./Settings/UpdateProfile";

const Settings = () => {
  return (
    <div className="m-4">
      <UpdateProfile />
      <ChangePassword />
    </div>
  );
};

export default Settings;
