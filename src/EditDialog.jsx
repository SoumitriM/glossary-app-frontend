import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Box,
} from "@mui/material";
import MultiFieldEditor from "./MultiFieldEditor";

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const EditDialog = ({
  open,
  formType = "Edit",
  onClose,
  onSave,            // (cleanedData) => void
  editForm,          // { en: [...], de: [...] }
}) => {
  const [tempForm, setTempForm] = useState({
    en: [{ word: "", comment: "" }],
    de: [{ word: "", comment: "" }],
  });

  const [error, setError] = useState({ isError: false, message: "" });

  // When dialog opens, make a fresh temporary copy
  useEffect(() => {
    if (open && editForm && editForm.en && editForm.de) {
      setTempForm(deepClone(editForm));
    }
  }, [open, editForm]);

  const handleWordsChange = (lang, updatedWords) => {
    setTempForm((prev) => ({ ...prev, [lang]: updatedWords }));
  };

  const handleCancel = () => {
    if (editForm && editForm.en && editForm.de) {
      setTempForm(deepClone(editForm));
    } else {
      setTempForm({
        en: [{ word: "", comment: "" }],
        de: [{ word: "", comment: "" }],
      });
    }
    setError({ isError: false, message: "" });
    onClose();
  };

  const cleanEntry = (w) => {
    const word = w.word?.trim() || "";
    if (!word) return null;

    const cleaned = { word };

    if (w.comment?.trim()) cleaned.comment = w.comment.trim();
    if (w.note?.trim()) cleaned.note = w.note.trim();
    if (w.pos) cleaned.pos = w.pos;
    if (w.gender) cleaned.gender = w.gender; // ONLY keep gender if non-empty

    return cleaned;
  };

  const handleFinalSave = () => {
    const cleaned = {
      en:
        tempForm.en
          .map(cleanEntry)
          .filter(Boolean) || [],
      de:
        tempForm.de
          .map(cleanEntry)
          .filter(Boolean) || [],
    };

    // At least one word in each language
    if (cleaned.en.length === 0 || cleaned.de.length === 0) {
      setError({
        isError: true,
        message: "There should be at least one English and one Deutsch word.",
      });
      return;
    }

    // Duplicate detection (within each language)
    const hasDuplicate = (arr) => {
      const words = arr.map((w) => w.word.toLowerCase());
      return new Set(words).size !== words.length;
    };

    if (hasDuplicate(cleaned.en) || hasDuplicate(cleaned.de)) {
      setError({
        isError: true,
        message:
          "There are one or more duplicate words added. Please remove them before saving.",
      });
      return;
    }
    onSave(cleaned);
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="lg">
      <DialogTitle>{formType} Entry</DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box
          sx={{
            display: "flex",
            width: "100%",
            gap: 2,
            alignItems: "stretch",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <MultiFieldEditor
              label="Deutsch"
              wordEntries={tempForm.de}
              onChange={(val) => handleWordsChange("de", val)}
              scrollToBottom={open}
            />
          </Box>
           <Divider orientation="vertical" flexItem />
          <Box sx={{ flex: 1 }}>
            <MultiFieldEditor
              label="English"
              wordEntries={tempForm.en}
              onChange={(val) => handleWordsChange("en", val)}
              scrollToBottom={open}
            />
          </Box>

         

          
        </Box>

        {error.isError && (
          <Box sx={{ color: "red", mt: 2 }}>*{error.message}</Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button type="button" onClick={handleCancel}>Cancel</Button>
        <Button
          variant="contained"
          type="button"     // prevent any default form submit
          onClick={handleFinalSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDialog;
