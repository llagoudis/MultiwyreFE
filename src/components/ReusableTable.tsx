import { Fade, Paper, Stack, TablePagination } from "@mui/material";
import Image, { type StaticImageData } from "next/image";
import React, { useEffect, useRef, useState } from "react";
import ThreeDots from "~/assets/general/menu-dots.svg";
import LoaderIcon from "./LoaderIcon";

// Generic type for table data
interface ReusableTableProps<T> {
  data: T[];
  columns: ColumnSpec<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
  visibleColumns?: string[];
  getRowActions?: (row: T) => RowAction[];
  emptyMessage?: string;
}

interface ColumnSpec<T> {
  label: string;
  name: string;
  key?: keyof T;
  type?: string;
  className?: string;
  getValue?: (row: T) => string | number | React.ReactNode;
  render?: (row: T) => React.ReactNode;
}

interface RowAction {
  label: string;
  onClick: () => void;
  className?: string;
  renderCustom?: () => React.ReactNode;
}

function ReusableTable<T extends { id?: string | number }>({
  data,
  columns,
  loading = false,
  pagination,
  onPaginationChange,
  visibleColumns,
  getRowActions,
  emptyMessage = "No data found",
}: ReusableTableProps<T>) {
  const [checkedRowId, setCheckedRowId] = useState<string | number | null>(
    null,
  );

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setCheckedRowId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleChangePagination = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    onPaginationChange?.(newPage, pagination?.pageSize ?? 10);
  };

  const handleChangeRowsPerPage: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = (event) => {
    const pageSize = parseInt(event.target.value);
    onPaginationChange?.(0, pageSize);
  };

  const handleRowMenuToggle = (rowId: string | number) => {
    setCheckedRowId((prev) => (prev === rowId ? null : rowId));
  };

  const renderCellContent = (column: ColumnSpec<T>, row: T) => {
    // Custom render function takes priority
    if (column.render) {
      return column.render(row);
    }

    // getValue function
    if (column.getValue) {
      return column.getValue(row);
    }

    // Direct key access
    if (column.key) {
      return String(row[column.key]) ?? "-";
    }

    return "-";
  };

  const displayColumns = visibleColumns
    ? columns.filter((col) => visibleColumns.includes(col.name))
    : columns;

  const rowActions = (row: T) => getRowActions?.(row) ?? [];

  return (
    <div>
      <div className="mt-6 h-fit max-h-[65vh] overflow-x-scroll shadow-lg">
        {loading ? (
          <div className="flex h-full min-h-[50vh] items-center justify-center">
            <LoaderIcon className="h-12 w-12" />
          </div>
        ) : (
          <div className="max-h-fit max-w-[100%]">
            <table className="w-full min-w-max border-separate border-spacing-0 bg-white">
              <thead className="sticky top-0 z-10 px-10 pb-10 text-[#646464]">
                <tr>
                  {displayColumns.map((item, i) => (
                    <th
                      key={i}
                      className="border-b-[1px] border-[#BABABA] bg-[#E8E9EB] py-3 pl-4 pr-8 text-start font-semibold"
                    >
                      {item.label}
                    </th>
                  ))}
                  {getRowActions && (
                    <th className="border-b-[1px] border-[#BABABA] bg-[#E8E9EB]"></th>
                  )}
                </tr>
              </thead>
              <tbody className="h-full bg-white text-sm">
                {data.length ? (
                  data.map((row, i) => (
                    <tr key={i} className="border-b p-10">
                      {displayColumns.map((key, idx) => (
                        <td
                          key={idx}
                          className="border-b-[1px] border-[#BABABA] py-2 pl-4 pr-[1.5rem] text-start"
                        >
                          <div className={`${key.className ?? ""}`}>
                            {renderCellContent(key, row)}
                          </div>
                        </td>
                      ))}

                      {getRowActions && rowActions(row).length > 0 && (
                        <td
                          key={row.id}
                          className="sticky right-[-1px] bg-white md:right-0"
                        >
                          <div className="relative" ref={menuRef}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                row.id && handleRowMenuToggle(row.id);
                              }}
                            >
                              <Image
                                src={ThreeDots as StaticImageData}
                                alt="menu"
                                className="m-auto"
                              />
                            </button>

                            <div className="absolute right-8 top-[-0.5rem]">
                              {checkedRowId === row.id && (
                                <Fade in={true} className="cursor-pointer">
                                  <Paper className="p-2">
                                    {rowActions(row).map((action, idx) => (
                                      <div key={idx}>
                                        {action.renderCustom ? (
                                          <div
                                            onClick={() => {
                                              action.onClick();
                                              setCheckedRowId(null);
                                            }}
                                          >
                                            {action.renderCustom()}
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              action.onClick();
                                              setCheckedRowId(null);
                                            }}
                                            className={
                                              action.className ??
                                              "rounded-md bg-white p-4 shadow-md"
                                            }
                                          >
                                            <span>{action.label}</span>
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </Paper>
                                </Fade>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={displayColumns.length + (getRowActions ? 1 : 0)}
                    >
                      <div className="flex flex-col items-center justify-center px-4 py-16">
                        <svg
                          width="120"
                          height="120"
                          viewBox="0 0 120 120"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 14a4 4 0 0 1 4-4h44l24 24v62a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V14Z"
                            fill="#FFFFFF"
                            stroke="#E2E8F0"
                            strokeWidth="2"
                          />
                          <path
                            d="M70 10v20a4 4 0 0 0 4 4h20"
                            fill="#F8FAFC"
                            stroke="#E2E8F0"
                            strokeWidth="2"
                          />
                          <rect x="34" y="46" width="40" height="4" rx="2" fill="#E2E8F0" />
                          <rect x="34" y="56" width="50" height="4" rx="2" fill="#E2E8F0" />
                          <rect x="34" y="66" width="32" height="4" rx="2" fill="#E2E8F0" />
                          <circle cx="78" cy="86" r="14" fill="#FFFFFF" stroke="#F5B544" strokeWidth="3" />
                          <line x1="89" y1="97" x2="100" y2="108" stroke="#F5B544" strokeWidth="4" strokeLinecap="round" />
                          <path d="M14 26 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 z" fill="#FBBF24" />
                          <path d="M104 18 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5 z" fill="#FBBF24" />
                          <path d="M100 60 l1 2 2 1 -2 1 -1 2 -1 -2 -2 -1 2 -1 z" fill="#FBBF24" />
                        </svg>
                        <p className="mt-4 text-lg font-semibold text-black">
                          {emptyMessage}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          There are no transaction to display for the selected filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && onPaginationChange && (
        <div className="my-4 ml-auto flex w-fit justify-between">
          <Stack spacing={2}>
            <div className="flex items-center justify-between gap-4">
              <TablePagination
                component="div"
                count={pagination.totalCount}
                page={pagination.page}
                onPageChange={handleChangePagination}
                rowsPerPage={pagination.pageSize}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          </Stack>
        </div>
      )}
    </div>
  );
}

export default ReusableTable;
