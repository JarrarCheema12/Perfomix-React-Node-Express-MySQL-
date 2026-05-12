import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Button,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { IoIosLogOut, IoIosArrowDown } from "react-icons/io";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoPerson, IoSettingsSharp } from "react-icons/io5";

const Navbar = ({ handleDrawerToggle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarMenuAnchorEl, setAvatarMenuAnchorEl] = useState(null);

  // State variables for user data
  const [fullName, setFullName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    // Get data from localStorage and set state variables
    setFullName(localStorage.getItem("full_name") || "User");
    setProfilePhoto(localStorage.getItem("profile_photo") || "/default-avatar.png");
    setEmail(localStorage.getItem("email") || "No Email");
  }, []);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleAvatarMenuClick = (event) => setAvatarMenuAnchorEl(event.currentTarget);
  const handleCloseAvatarMenu = () => setAvatarMenuAnchorEl(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Box>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#f1f1f4",
          boxShadow: "none",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            padding: "0 16px",
            backgroundColor: "#ffff",
            margin: "10px",
            borderRadius: "10px",
            boxShadow: "none",
            marginLeft: { xs: 2, sm: 2, md: "250px", lg: "250px" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "start", justifyContent: "flex-start" }}>
            <Button
              variant="text"
              sx={{ display: { xs: "block", md: "none" } }}
              onClick={handleDrawerToggle}
            >
              <MenuIcon style={{ color: "black" }} />
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexGrow: 1,
              marginLeft: isSmallScreen ? 0 : "auto",
            }}
          >
            <IconButton onClick={handleAvatarMenuClick}>
              <Avatar
                src={profilePhoto}
                alt={fullName}
                sx={{ width: 40, height: 40 }}
              />
            </IconButton>
          
              <>
                <Box sx={{ ml: 1, textAlign: "left", padding: "10px" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "black" }}>
                    {fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {email}
                  </Typography>
                </Box>
                {/* <IoIosArrowDown size={25} onClick={handleMenuClick} style={{ color: "black" }} /> */}
              </>
            
          </Box>
{/* 
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
            <MenuItem onClick={handleCloseMenu}>
              <IoPerson style={{ marginRight: 8 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleCloseMenu}>
              <IoSettingsSharp style={{ marginRight: 8 }} /> Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <IoIosLogOut style={{ marginRight: 8 }} /> Logout
            </MenuItem>
          </Menu> */}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
