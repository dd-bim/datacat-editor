import React, { useMemo } from "react";
import { Table, Column, AutoSizer } from "react-virtualized";
import "react-virtualized/styles.css";
import Checkbox from "@mui/material/Checkbox";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    border: "2px solid #ccc",
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    margin: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    overflow: "hidden",
  },
  checkboxCell: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  headerStyle: {
    backgroundColor: "#f2f2f2",
    fontWeight: "bold",
    textAlign: "left",
    padding: theme.spacing(1),
  },
  rowStyle: {
    borderBottom: "1px solid #ddd",
  },
}));

interface RowData {
  uniqueId: number;
  document?: string;
  model?: string;
  group?: string;
  class?: string;
  propertyGroup?: string;
  property?: string;
}

interface Props {
  rows: RowData[];
  visibleColumns: {
    document: boolean;
    model: boolean;
    group: boolean;
    class: boolean;
    propertyGroup: boolean;
    property: boolean;
  };
  selectedRows?: { [key: number]: boolean };
  onSelectRow?: (selectedRows: { [key: number]: boolean }) => void;
}

const VirtualizedTable: React.FC<Props> = ({
  rows,
  visibleColumns,
  selectedRows = {},
  onSelectRow,
}) => {
  const classes = useStyles();
  const memoizedRows = useMemo(() => rows, [rows]);

  console.log("Rows received in VirtualizedTable:", rows);
  console.log("Row count in VirtualizedTable:", memoizedRows.length);

  return (
    <div className={classes.tableContainer} style={{ height: "500px" }}>
      <AutoSizer>
        {({ height, width }) => {
          console.log("AutoSizer dimensions:", { height, width });
          const columnWidth = width / Object.values(visibleColumns).filter(Boolean).length;

          return (
            <Table
              width={width}
              height={height}
              headerHeight={50}
              rowHeight={50}
              rowCount={memoizedRows.length}
              rowGetter={({ index }) => memoizedRows[index]}
              rowClassName={({ index }) =>
                index % 2 === 0 ? classes.rowStyle : ""
              }
            >
              {/* Checkbox-Spalte */}
              <Column
                label={
                  <Checkbox
                    color="primary"
                    checked={Object.keys(selectedRows).length === rows.length}
                    onChange={() => {
                      const allSelected =
                        Object.keys(selectedRows).length === rows.length;
                      const newSelectedRows = rows.reduce((acc, row) => {
                        acc[row.uniqueId] = !allSelected;
                        return acc;
                      }, {} as { [key: number]: boolean });
                      onSelectRow && onSelectRow(newSelectedRows);
                    }}
                  />
                }
                dataKey="checkbox"
                width={50}
                cellRenderer={({ rowData }: { rowData: RowData }) => (
                  <div className={classes.checkboxCell}>
                    <Checkbox
                      checked={!!selectedRows[rowData.uniqueId]}
                      onChange={() =>
                        onSelectRow &&
                        onSelectRow({
                          ...selectedRows,
                          [rowData.uniqueId]: !selectedRows[rowData.uniqueId],
                        })
                      }
                      color="primary"
                    />
                  </div>
                )}
              />
              {/* Dynamische Spalten */}
              {Object.entries(visibleColumns).map(([key, isVisible]) =>
                isVisible ? (
                  <Column
                    key={key}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    dataKey={key}
                    width={columnWidth}
                    headerRenderer={({ label }) => (
                      <div className={classes.headerStyle}>{label}</div>
                    )}
                    cellRenderer={({ rowData }) => (
                      <div style={{ padding: "8px" }}>
                        {rowData[key] || "\u00A0"}
                      </div>
                    )}
                  />
                ) : null
              )}
            </Table>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedTable;
