import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
  TablePagination,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import { alpha } from "@mui/material/styles";
import EditDialog from "./EditDialog";
import ConfirmDialog from "./ConfirmDialog";

// 🧩 Updated column definitions
const getHeadCells = (columnOrder) =>
  columnOrder === "en-de"
    ? [
        { id: "enWords", label: "English" },
        { id: "deWords", label: "Deutsch" },
        { id: "lastModifiedBy", label: "Modified By" },
        { id: "lastModifiedAt", label: "Last Modified" },
        { id: "edit", label: "Edit" },
        { id: "delete", label: "Delete" },
      ]
    : [
        { id: "deWords", label: "Deutsch" },
        { id: "enWords", label: "English" },
        { id: "lastModifiedBy", label: "Modified By" },
        { id: "lastModifiedAt", label: "Last Modified" },
        { id: "edit", label: "Edit" },
        { id: "delete", label: "Delete" },
      ];

function descendingComparator(a, b, orderBy) {
  if (a[orderBy] === undefined || b[orderBy] === undefined) return 0;
  return b[orderBy].localeCompare(a[orderBy]);
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Table header
function EnhancedTableHead({ order, orderBy, onRequestSort, columnOrder }) {
  const createSortHandler = (property) => (event) => onRequestSort(event, property);

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox disabled />
        </TableCell>
        {getHeadCells(columnOrder).map((headCell) => (
          <TableCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// Toolbar
function EnhancedTableToolbar({ numSelected, onDeleteSelected }) {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: "1 1 100%" }} color="inherit" variant="subtitle1">
          {numSelected} Row/s selected
        </Typography>
      ) : (
        <Typography sx={{ flex: "1 1 100%" }} variant="h6">
          Glossary
        </Typography>
      )}

      {numSelected > 1 ? (
        <Tooltip title={`Delete ${numSelected} selected rows`}>
          <IconButton onClick={onDeleteSelected}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list (future)">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

// Main table component
export default function GlossaryTable({
  data,
  columnOrder,
  handleDeleteRow,
  handleDeleteSelected,
  handleFinalEdit,
}) {
  const [selectedRows, setSelectedRows] = useState([]);
  const [order, setOrder] = useState(null);
  const [orderBy, setOrderBy] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editIndex, setEditIndex] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteMode, setDeleteMode] = useState(null);

  // 🧾 Map backend entries to table rows
  const dataRows = useMemo(
    () =>
      data.map((entry) => ({
        id: entry.id,
        enWords: Array.isArray(entry.en)
          ? entry.en.map((e) => e.word).join(", ")
          : "",
        deWords: Array.isArray(entry.de)
          ? entry.de.map((d) => d.word).join(", ")
          : "",
        lastModifiedBy: entry.lastModifiedBy || " ",
        lastModifiedAt: entry.lastModifiedAt || " ",
        en: entry.en,
        de: entry.de,
      })),
    [data]
  );

  useEffect(() => setPage(0), [data]);

  const handleRequestSort = (_, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleRowSelection = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selId) => selId !== id)
        : [...prevSelected, id]
    );
  };

  const isSelected = (id) => selectedRows.includes(id);

  const handleEditRow = (row) => {
    setEditIndex(row.id);
    setEditForm({ ...row });
    setOpenEditDialog(true);
  };

const handleSaveEdit = async () => {
  const original = data.find((item) => item.id === editIndex);

  // Normalize both word + comment for comparison
  const normalize = (arr) =>
    Array.isArray(arr)
      ? arr
          .map(
            (a) =>
              `${a.word?.trim().toLowerCase() || ""}:${a.comment?.trim().toLowerCase() || ""}`
          )
          .join(",")
      : "";

  const oldEn = normalize(original.en);
  const oldDe = normalize(original.de);
  const newEn = normalize(editForm.en);
  const newDe = normalize(editForm.de);

  if (oldEn === newEn && oldDe === newDe) {
    console.log("⚠️ No changes detected — skipping API call");
    setOpenConfirmDialog(false);
    return;
  }

  const updatedItem = { en: editForm.en, de: editForm.de };
  await handleFinalEdit(updatedItem, editIndex);
  setOpenConfirmDialog(false);
};


  const visibleRows = useMemo(() => {
    let rows = [...dataRows];
    if (orderBy && order) rows = rows.sort(getComparator(order, orderBy));
    return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [dataRows, order, orderBy, page, rowsPerPage]);

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={selectedRows.length}
          onDeleteSelected={() => {
            setDeleteMode("bulk");
            setOpenDeleteDialog(true);
          }}
        />
        <TableContainer>
          <Table size="small">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              columnOrder={columnOrder}
            />
            <TableBody>
              {visibleRows.map((row) => {
                const isItemSelected = isSelected(row.id);
                return (
                  <TableRow
                    hover
                    key={row.id}
                    role="checkbox"
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => handleRowSelection(row.id)}
                      />
                    </TableCell>

                    {getHeadCells(columnOrder).map((headCell) => {
                      if (headCell.id === "edit") {
                        return (
                          <TableCell key="edit">
                            <IconButton onClick={() => handleEditRow(row)}>
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        );
                      }

                      if (headCell.id === "delete") {
                        return (
                          <TableCell key="delete">
                            <IconButton
                              onClick={() => {
                                setRowToDelete(row.id);
                                setDeleteMode("single");
                                setOpenDeleteDialog(true);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell key={headCell.id}>
                          {row[headCell.id]}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={dataRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Dialogs */}
      <EditDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        onSave={() => {
          setOpenEditDialog(false);
          setOpenConfirmDialog(true);
        }}
        editForm={editForm}
        setEditForm={setEditForm}
      />

      <ConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onConfirm={handleSaveEdit}
      />

      <ConfirmDialog
        open={openDeleteDialog}
        primaryBtnText="Delete"
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={() => {
          if (deleteMode === "single") handleDeleteRow(rowToDelete);
          else if (deleteMode === "bulk") handleDeleteSelected(selectedRows);
          setSelectedRows([]);
          setOpenDeleteDialog(false);
        }}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${
          deleteMode === "single"
            ? "this entry"
            : `${selectedRows.length} entries`
        }?`}
      />
    </Box>
  );
}
