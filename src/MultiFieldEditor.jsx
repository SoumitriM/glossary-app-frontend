import { useRef, useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import AddVariantDialog from "./AddVariantDialog";

const MultiFieldEditor = ({
  label,
  wordEntries = [{ word: "", comment: "" }],
  onChange,
  scrollToBottom,
}) => {
  const containerRef = useRef(null);

  const [variantDialog, setVariantDialog] = useState({
    open: false,
    idx: null,
    mode: "add",
    data: {},
  });

  const openAddVariant = () => {
    setVariantDialog({
      open: true,
      idx: wordEntries.length,
      mode: "add",
      data: { word: "" },
    });
  };

  const openEditVariant = (idx) => {
    setVariantDialog({
      open: true,
      idx,
      mode: "edit",
      data: { ...wordEntries[idx] },
    });
  };

  const closeVariant = () => {
    setVariantDialog({ open: false, idx: null, mode: "add", data: {} });
  };

  const saveVariant = (data) => {
    const updated = [...wordEntries];

    if (variantDialog.mode === "add") {
      updated.push({ ...data });
    } else {
      const old = updated[variantDialog.idx];
      const merged = { ...old, ...data };

      // REMOVE comment if empty
      if (!("comment" in data) || data.comment === "") {
        delete merged.comment;
      }

      // REMOVE note if empty
      if (!("note" in data) || data.note === "") {
        delete merged.note;
      }

      // REMOVE pos if empty
      if (!("pos" in data) || data.pos === "") {
        delete merged.pos;
      }

      // REMOVE gender if empty  (already fixed)
      if (!("gender" in data) || data.gender === "") {
        delete merged.gender;
      }

      updated[variantDialog.idx] = merged;


    }

    onChange(updated);
    closeVariant();
  };

  const handleRemove = (idx) => {
    const updated = wordEntries.filter((_, i) => i !== idx);
    onChange(updated);
  };

  useEffect(() => {
    if (scrollToBottom && containerRef.current?.lastElementChild) {
      setTimeout(() => {
        containerRef.current.lastElementChild.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 50);
    }
  }, [scrollToBottom]);

  const mapGender = (g) =>
    g === "m"
      ? "maskulin"
      : g === "f"
        ? "feminin"
        : g === "n"
          ? "neutral"
          : "";

  const joinMeta = (...items) => items.filter(Boolean).join(" · ");

  return (
    <Box
      ref={containerRef}
      sx={{
        mb: 3,
        height: 400,
        maxHeight: 400,
        overflowY: "auto",
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        bgcolor: "#fafafa",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.2,
          borderBottom: "1px solid #ddd",
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {wordEntries.filter((w) => w.word.trim() !== "").length} words
        </Typography>
      </Box>

      {/* Word List */}
      <Box sx={{ p: 1.5 }}>
        {wordEntries.map((entry, idx) => {
          const metaLeft = joinMeta(
            entry.pos,
            label === "Deutsch" ? mapGender(entry.gender) : ""
          );

          return (
            <Box
              key={`${label}-${idx}`}
              sx={{
                mb: 1.5,
                border: "1px solid #eaeaea",
                borderRadius: 2,
                p: 1.2,
                bgcolor: "white",
                boxShadow: "0 0 3px rgba(0, 0, 0, 0.04)",
              }}
            >
              {/* META ROW */}
              {(metaLeft || true) && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.8,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontStyle: "italic",
                      color: "#666",
                    }}
                  >
                    {metaLeft}
                  </Typography>

                  {/* <Typography
                    variant="caption"
                    sx={{
                      fontStyle: "italic",
                      color: "#666",
                    }}
                  >
                    Added by User
                  </Typography> */}
                </Box>
              )}

              {/* WORD + ACTIONS */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <TextField
                  label="Word"
                  size="small"
                  variant="outlined"
                  sx={{ flex: "0 0 60%" }}
                  value={entry.word}
                  onChange={(e) => {
                    const updated = [...wordEntries];
                    updated[idx].word = e.target.value;
                    onChange(updated);
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton size="small" onClick={() => openEditVariant(idx)}>
                    <EditIcon fontSize="small" />
                  </IconButton>

                  <IconButton size="small" onClick={() => handleRemove(idx)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* COMMENT */}
              {entry.comment?.trim() && (
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    ml: 0.3,
                    fontStyle: "italic",
                    color: "#777",
                    fontSize: "0.7rem",
                    display: "block",
                  }}
                >
                  <strong>Comment:</strong> {entry.comment}
                </Typography>
              )}

              {/* INTERNAL NOTE */}
              {entry.note?.trim() && (
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    ml: 0.3,
                    fontStyle: "italic",
                    color: "#777",
                    fontSize: "0.7rem",
                    display: "block",
                  }}
                >
                  <strong>Internal Note:</strong> {entry.note}
                </Typography>
              )}
            </Box>
          );
        })}

        {/* ADD BUTTON */}
        <Button
          type="button"
          startIcon={<AddIcon />}
          onClick={openAddVariant}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          {wordEntries.length === 0 ? "Add a Word" : "Add Variant"}
        </Button>
      </Box>

      {/* Add/Edit Variant Dialog */}
      <AddVariantDialog
        open={variantDialog.open}
        mode={variantDialog.mode}
        initialData={variantDialog.data}
        lang={label === "Deutsch" ? "de" : "en"}
        onPOSChange={() => { }}
        onClose={closeVariant}
        onSave={saveVariant}
      />
    </Box>
  );
};

export default MultiFieldEditor;
