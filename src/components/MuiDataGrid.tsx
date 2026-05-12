import React, { useEffect, useState } from "react";
import {
  DataGrid,
  gridClasses,
  GridToolbar,
  type DataGridProps,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";

const MuiDataGrid = ({
  rows = [],
  columns,
  checkboxSelection,
  disableRowSelectionOnClick,
  // columnVisibilityModel,
  hideFooterPagination,
  rowModesModel,
  onRowModesModelChange,
  onRowEditStop,
  slots,
  slotProps,
  // onColumnVisibilityModelChange,
  editMode,
  processRowUpdate,
  onPaginationModelChange,
  loading,

  ...props
}: DataGridProps) => {
  // const handleColumnVisibilityChange = (columns: any) => {
  //   setColumns(columns);
  //   const columnsJSON = JSON.stringify(columns);
  //   localStorage.setItem(storageName ?? "", columnsJSON);
  // };

  // const [col, setColumns] = useState<any>(null);
  // useEffect(() => {
  //   const storedColumnsJSON = localStorage.getItem(storageName ?? "");
  //   if (storedColumnsJSON) {
  //     const storedColumns = JSON.parse(storedColumnsJSON);
  //     setColumns(storedColumns);
  //   }
  // }, []);

  return (
    <Box>
      {/* {loading ? (
        <LinearBuffer />
      ) : ( */}
      <DataGrid
        // onColumnVisibilityModelChange={handleColumnVisibilityChange}
        editMode={editMode}
        slotProps={slotProps}
        // slotProps={{
        //   toolbar: { printOptions: { disableToolbarButton: true } },
        // }}
        hideFooterPagination={hideFooterPagination}
        slots={slots ? slots : { toolbar: GridToolbar }}
        processRowUpdate={processRowUpdate}
        onRowModesModelChange={onRowModesModelChange}
        rowModesModel={rowModesModel}
        onPaginationModelChange={onPaginationModelChange}
        sx={{
          color: "#1E293B",
          fontSize: 12,
          // borderColor: "rgb(224, 224, 224)",
          borderColor: "#fff",

          "& .MuiDataGrid-columnHeader": {
            color: "#646464",
            background: "#E8E9EB",
            fontSize: 14,
          },

          "& .MuiButtonBase-root": {
            color: "#646464",
          },
          [`& .${gridClasses.cell}`]: {
            py: 1,
          },
        }}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        disableVirtualization={true}
        onRowEditStop={onRowEditStop}
        checkboxSelection={checkboxSelection}
        {...props}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? "" : "bg-[#F2F2F2]"
        }
        // columnVisibilityModel={{ id: true, ...col }}
        rows={rows}
        columns={columns}
        className={rows?.length > 0 ? "text-[14px]" : "h-[200px] text-[14px]"}
        localeText={{
          noRowsLabel: "No data found",
        }}
        loading={loading}
      />
      {/* )} */}
    </Box>
  );
};

export default MuiDataGrid;
