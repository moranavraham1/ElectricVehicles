import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../designs/ChangePassword.css";

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("User not authenticated. Please log in again.");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("Server response is not JSON:", text);
        toast.error("Server error: Invalid response format.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password.");
      }

      toast.success("Password changed successfully! A confirmation email has been sent.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  return (
    <div className="change-password-container">
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

      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button onClick={handlePasswordChange} className="change-btn">
        Change Password
      </button>
    </div>
  );
}

export default ChangePassword;
