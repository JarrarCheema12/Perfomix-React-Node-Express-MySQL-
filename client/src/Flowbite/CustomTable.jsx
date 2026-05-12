import React, { useState } from "react";
import { Table } from "flowbite-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Menu, MenuItem } from "@mui/material";

const CustomTable = ({ data, columns, currentPage, rowsPerPage, onEdit, onDelete }) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentRows = data.slice(startIndex, startIndex + rowsPerPage);
  
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
  
    const handleMenuOpen = (event, row) => {
      setAnchorEl(event.currentTarget);
      setSelectedRow(row);
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null);
      setSelectedRow(null);
    };
  
    return (
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-4">
        <Table className="min-w-[900px]">
          <Table.Head>
            {columns.map((col, index) => (
              <Table.HeadCell key={index} className="min-w-[150px]">
                {col.header}
              </Table.HeadCell>
            ))}
          </Table.Head>
          <Table.Body className="divide-y">
            {currentRows.map((row, rowIndex) => (
              <Table.Row
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                {columns.map((col, colIndex) => (
                  <Table.Cell key={colIndex} className="min-w-[150px]">
                    {col.key === "action" ? (
                      <>
                        <BsThreeDotsVertical
                          className="cursor-pointer text-gray-600 hover:text-gray-900"
                          size={20}
                          onClick={(event) => handleMenuOpen(event, row)}
                        />
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleMenuClose}
                          sx={{
                            "& .MuiPaper-root": {
                              backgroundColor: "white",
                              width: "150px",
                              fontSize: "17px",
                              fontWeight: "bold",
                            },
                          }}
                        >
                          <MenuItem
                            onClick={() => {
                              onEdit(selectedRow); // Call onEdit
                              handleMenuClose();
                            }}
                            sx={{
                              color: "black",
                            }}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              onDelete(selectedRow); // Call onDelete
                              handleMenuClose();
                            }}
                            sx={{
                              color: "red",
                            }}
                          >
                            Delete
                          </MenuItem>
                        </Menu>
                      </>
                    )  : col.key === "ids" ? (
                      <span className="text-gray-800 font-semibold">{startIndex + rowIndex + 1}</span> 
                    ) : (
                      row[col.key]
                    )}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    );
  };
  
  export default CustomTable;