import React, { useState } from "react";

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordChange = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      if (!response.ok) throw new Error("Failed to change password");

      alert("Password changed successfully!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Change Password</h2>
      <input
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handlePasswordChange}>Change Password</button>
    </div>
  );
}

export default ChangePassword;
