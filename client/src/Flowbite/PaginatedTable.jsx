// PaginatedTable.js
import React, { useState } from "react";
import { Pagination } from "flowbite-react";
import CustomTable from "./CustomTable"; // Correct import path

export function PaginatedTable({ data, columns , row , onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = row; // You can adjust this as needed

  const onPageChange = (page) => setCurrentPage(page);

  return (
    <div>
      <CustomTable
        data={data}
        columns={columns}
        currentPage={currentPage} 
        
        rowsPerPage={rowsPerPage}
        onEdit={onEdit} // Pass onEdit
        onDelete={onDelete} // Pass onDelete
      />
      
      {/* Pagination */}
      <div className="flex justify-end mt-4"> {/* Updated: 'justify-end' to align to the right */}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(data.length / rowsPerPage)} // Calculate total pages
          onPageChange={onPageChange}
          showIcons
     
        />
      </div>
    </div>
  );
}

export default PaginatedTable;
