import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { visuallyHidden } from "@mui/utils";
import { alpha } from "@mui/material/styles";
import EditDialog from "./EditDialog";
import ConfirmDialog from "./ConfirmDialog";

const getHeadCells = (columnOrder) =>
  columnOrder === "en-de"
    ? [
      { id: "enWords", label: "English" },
      { id: "deWords", label: "Deutsch" },
      { id: "lastModifiedBy", label: "Editor" },
      { id: "lastModifiedAt", label: "Timestamp" },
      { id: "edit", label: "Edit" },
      { id: "delete", label: "Delete" },
    ]
    : [
      { id: "deWords", label: "Deutsch" },
      { id: "enWords", label: "English" },
      { id: "lastModifiedBy", label: "Editor" },
      { id: "lastModifiedAt", label: "Timestamp" },
      { id: "edit", label: "Edit" },
      { id: "delete", label: "Delete" },
    ];

function descendingComparator(a, b, orderBy) {
  if (a[orderBy] === undefined || b[orderBy] === undefined) return 0;
  return String(b[orderBy]).localeCompare(String(a[orderBy]));
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function EnhancedTableHead({
  order,
  orderBy,
  onRequestSort,
  columnOrder,
  selectedCount,
  clearSelection,
  totalVisibleRows,
}) {
  const createSortHandler = (property) => (event) =>
    onRequestSort(event, property);

  return (
    <TableHead>
      <TableRow
        sx={{
          position: "sticky",
          top: -8,
          zIndex: 2,
          backgroundColor: "#f5f5f5",
          "& .MuiTableCell-head": {
            fontWeight: "bold",
            color: "#555",
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={selectedCount > 0}
            indeterminate={
              selectedCount > 0 && selectedCount < totalVisibleRows
            }
            onChange={() => {
              if (selectedCount > 0) clearSelection();
            }}
          />
        </TableCell>

        {getHeadCells(columnOrder).map((headCell) => (
          <TableCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === "edit" || headCell.id === "delete" ? (
              headCell.label
            ) : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function EnhancedTableToolbar({ numSelected, onDeleteSelected, totalCount }) {
  return (
    <Toolbar
      sx={{
        pl: 2,
        pr: 1,
        position: "sticky",
        top: 0,
        zIndex: 3,
        backgroundColor: "#fff",
        borderBottom: "1px solid #ddd",
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: "1 1 80%" }} color="inherit" variant="subtitle1">
          {numSelected} items selected
        </Typography>
      ) : (
        <Typography sx={{ flex: "1 1 80%" }} variant="h6">
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

        <Typography
          variant="body2"
          sx={{
            px: 1.2,
            py: 0.3,
            borderRadius: 2,
            backgroundColor: "#f0f0f0",
            color: "#555",
            fontWeight: 600
          }}
        >
          {totalCount} items
        </Typography>





      )}
    </Toolbar>
  );
}

export default function GlossaryTable({
  data,
  columnOrder,
  handleDeleteRow,
  handleDeleteSelected,
  handleFinalEdit, // (payload, id) => Promise
}) {
  const [selectedRows, setSelectedRows] = useState([]);
  const [order, setOrder] = useState(null);
  const [orderBy, setOrderBy] = useState(null);

  const [visibleCount, setVisibleCount] = useState(40);
  const sentinelRef = useRef(null);

  const [editIndex, setEditIndex] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [deleteMode, setDeleteMode] = useState(null);

  const dataRows = useMemo(
    () =>
      data.map((entry) => ({
        id: entry.id,
        enWords: entry.en?.map((e) => e.word).join(", ") || "",
        deWords: entry.de?.map((d) => d.word).join(", ") || "",
        lastModifiedBy: entry.lastModifiedBy || "",
        lastModifiedAt: entry.lastModifiedAt || "",
        en: entry.en || [],
        de: entry.de || [],
      })),
    [data]
  );

  useEffect(() => setVisibleCount(40), [data]);

  const handleRequestSort = (_, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedRows = useMemo(() => {
    let rows = [...dataRows];
    if (orderBy && order) rows = rows.sort(getComparator(order, orderBy));
    return rows;
  }, [dataRows, order, orderBy]);

  const visibleRows = sortedRows.slice(0, visibleCount);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 40, sortedRows.length));
  }, [sortedRows.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isSelected = (id) => selectedRows.includes(id);

  const handleEditRow = (row) => {
    setEditIndex(row.id);
    setEditForm({
      id: row.id,
      en: row.en || [],
      de: row.de || [],
    });
    setOpenEditDialog(true);
  };

  const handleSaveEdit = async () => {

    const original = data.find((item) => item.id === editIndex);
    if (!original) {
      console.warn("No original row found for editIndex:", editIndex);
      setOpenConfirmDialog(false);
      return;
    }

    // ---------- NORMALIZATION (THE FIX) ----------
    // Preserve gender even when it's removed so deepEqual can detect change
    const normalizeEntry = (arr) =>
      arr.map((w) => {
        const obj = { word: w.word };

        // COMMENT (track removal)
        if ("comment" in w) {
          obj.comment = w.comment?.trim() || null;
        }

        // NOTE (track removal)
        if ("note" in w) {
          obj.note = w.note?.trim() || null;
        }

        // POS
        if ("pos" in w) {
          obj.pos = w.pos || null;
        }

        // GENDER
        if ("gender" in w) {
          obj.gender = w.gender || null;
        }

        return obj;
      });

    const originalEntry = {
      en: normalizeEntry(original.en || []),
      de: normalizeEntry(original.de || []),
    };

    const editedEntry = {
      en: normalizeEntry(editForm.en || []),
      de: normalizeEntry(editForm.de || []),
    };

    if (deepEqual(originalEntry, editedEntry)) {
      setOpenConfirmDialog(false);
      return;
    }

    // If we reach here → REAL CHANGES DETECTED
    await handleFinalEdit(
      {
        en: editForm.en,
        de: editForm.de,
      },
      editIndex
    );

    setOpenConfirmDialog(false);
  };


  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2, position: "relative" }}>
        <EnhancedTableToolbar
          totalCount={dataRows.length}
          numSelected={selectedRows.length}
          onDeleteSelected={() => {
            setDeleteMode("bulk");
            setOpenDeleteDialog(true);
          }}
        />

        <TableContainer
          sx={{
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          <Table size="small" stickyHeader>
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              columnOrder={columnOrder}
              selectedCount={selectedRows.length}
              clearSelection={() => setSelectedRows([])}
              totalVisibleRows={visibleRows.length}
            />

            <TableBody>
              {visibleRows.map((row) => {
                const selected = isSelected(row.id);

                return (
                  <TableRow key={row.id} hover selected={selected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected}
                        onChange={() => handleRowSelection(row.id)}
                      />
                    </TableCell>

                    {getHeadCells(columnOrder).map((headCell) => {
                      if (headCell.id === "edit")
                        return (
                          <TableCell key="edit">
                            <IconButton onClick={() => handleEditRow(row)}>
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        );

                      if (headCell.id === "delete")
                        return (
                          <TableCell key="delete">
                            <IconButton
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                setRowToDelete(row.id);
                                setDeleteMode("single");
                                setOpenDeleteDialog(true);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>

                          </TableCell>
                        );

                      return (
                        <TableCell key={headCell.id}>
                          {row[headCell.id]}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}

              <TableRow>
                <TableCell colSpan={10}>
                  <div ref={sentinelRef} style={{ height: 1 }} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <EditDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        onSave={(cleanedData) => {

          setEditForm((prev) => ({
            ...prev,
            en: cleanedData.en,
            de: cleanedData.de,
          }));
          setOpenEditDialog(false);
          setOpenConfirmDialog(true);
        }}
        editForm={editForm}
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
          else handleDeleteSelected(selectedRows);
          setSelectedRows([]);
          setOpenDeleteDialog(false);
        }}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${deleteMode === "single"
          ? "this entry"
          : `${selectedRows.length} entries`
          }?`}
      />
    </Box>
  );
}
