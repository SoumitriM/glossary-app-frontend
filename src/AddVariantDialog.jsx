import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
} from "@mui/material";

export default function AddVariantDialog({
  open,
  mode = "add",
  initialData = {},
  lang = "en",          // "de" or "en"
  showPOS = false,      // control POS visibility from parent
  onPOSChange = () => { },
  onClose,
  onSave,               // (data) => void
}) {
  const isGerman = lang === "de";

  const genderOptions = [
    { value: "", label: "None" },
    { value: "m", label: "Masculine (m)" },
    { value: "f", label: "Feminine (f)" },
    { value: "n", label: "Neuter (n)" },
  ];

  const posOptions = [
    { value: "", label: "None" },
    { value: "noun", label: "Noun" },
    { value: "verb", label: "Verb" },
    { value: "adj", label: "Adjective" },
    { value: "adv", label: "Adverb" },
  ];

  // Local form state
  const [form, setForm] = React.useState({
    word: "",
    pos: "",
    gender: "",
    comment: "",
    note: "",
  });

  const prevOpen = React.useRef(false);

  React.useEffect(() => {
    if (!prevOpen.current && open) {
      setForm({
        word: initialData.word ?? "",
        pos: initialData.pos ?? "",
        gender: initialData.gender ?? "",
        comment: initialData.comment ?? "",
        note: initialData.note ?? "",
      });
    }
    prevOpen.current = open;
  }, [open, initialData]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === "pos") {
      onPOSChange(value);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    const data = {};

    data.word = form.word.trim();

    if (form.pos?.trim()) data.pos = form.pos.trim();
    if (form.comment?.trim()) data.comment = form.comment.trim();
    if (form.note?.trim()) data.note = form.note.trim();

    // include gender only if actually selected
    if (isGerman && form.gender) {
      data.gender = form.gender;
    }

    onSave(data);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { height: "45vh" },
      }}
    >
      <DialogTitle>
        {mode === "edit" ? "Edit Entry" : "Add New Entry"}
      </DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pt: 12,
          mt: 1,
        }}
      >
        {/* WORD + POS + GENDER ROW */}
        <Box sx={{ display: "flex", gap: 2, pt: 1 }}>
          <TextField
            label="Word *"
            required
            sx={{ flex: 1 }}
            value={form.word}
            onChange={handleChange("word")}
          />

          {showPOS && (
            <TextField
              select
              label="Word Type"
              sx={{ width: "30%" }}
              value={form.pos}
              onChange={handleChange("pos")}
            >
              {posOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          {isGerman && (
            <TextField
              select
              label="Gender"
              sx={{ width: "30%" }}
              value={form.gender}
              onChange={handleChange("gender")}
            >
              {genderOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Box>

        {/* COMMENT */}
        <TextField
          label="Comment"
          multiline
          minRows={2}
          fullWidth
          value={form.comment}
          onChange={handleChange("comment")}
        />

        {/* INTERNAL NOTE */}
        <TextField
          label="Internal Note"
          multiline
          minRows={2}
          fullWidth
          value={form.note}
          onChange={handleChange("note")}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button type="button" onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          type="button"           // prevent accidental submit
          onClick={handleSave}
          disabled={!form.word.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
