import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import { FileDown } from "lucide-react";
import { Add } from "@mui/icons-material";
import GlossaryTable from "./Table";
import EditDialog from "./EditDialog";
import { BASE_URLS } from "./config";
import Loader from "./Loader";
import { api } from "./apiClient";
import { toast } from "react-toastify";

export default function Glossary() {
  const [columnOrder, setColumnOrder] = useState("de-en");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const searchLang = "all";
  const [isFetching, setIsFetching] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isLoading = isFetching || isMutating || isExporting;

  const fetchData = useCallback(async () => {
    const url =
      search !== ""
        ? `${BASE_URLS.SEARCH}?q=${encodeURIComponent(search)}&lang=${searchLang}`
        : BASE_URLS.GET_ALL;

    try {
      setIsFetching(true);
      const json = await api.get(url);
      setData(json);
    } catch {
      toast.error("Something went wrong! Failed to fetch glossary.");
    } finally {
      setIsFetching(false);
    }
  }, [search, searchLang]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData();
    }, 400);

    return () => clearTimeout(timeout);
  }, [fetchData]);

  const handleDeleteRow = async (id) => {
    try {
      setIsMutating(true);
      await api.delete(`${BASE_URLS.DELETE_ENTRY}/${id}`);
      toast.success("Entry deleted");
      await fetchData();
    } catch {
      toast.error("Something went wrong! Failed to delete item.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteSelected = async (ids) => {
    if (!ids || ids.length === 0) return;

    try {
      setIsMutating(true);
      const result = await api.post(`${BASE_URLS.DELETE_MULTIPLE}`, { ids });
      toast.success(result.message || "Selected entries deleted");
      await fetchData();
    } catch {
      toast.error("Something went wrong! Failed to delete selected items.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleFinalEdit = async (updatedItem, id, options = {}) => {
    try {
      setIsMutating(true);
      await api.put(`${BASE_URLS.UPDATE_ENTRY}/${id}`, updatedItem);
      if (!options.suppressToast) {
        toast.success("Entry updated");
      }
      await fetchData();
      return true;
    } catch {
      if (!options.suppressToast) {
        toast.error("Something went wrong! Failed to update entry.");
      }
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const handleAdd = async (newItem) => {
    try {
      setIsMutating(true);
      await api.post(`${BASE_URLS.ADD_ENTRY}`, newItem);
      toast.success("Word added successfully");
      await fetchData();
      setDialogOpen(false);
    } catch {
      toast.error("Something went wrong! Failed to add word.");
    } finally {
      setIsMutating(false);
    }
  };

  const exportData = async () => {
    try {
      setIsExporting(true);
      const blob = await api.blob(BASE_URLS.EXPORT_JSON);
      if (!blob) return;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "glossary_bilingual.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Glossary file has been successfully downloaded.");
    } catch {
      toast.error("Error exporting data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box maxWidth="xl" mx="auto" position="relative">
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.45)",
          }}
        >
          <Loader />
        </Box>
      )}

      <Box
        sx={{
          opacity: isLoading ? 0.7 : 1,
          pointerEvents: isLoading ? "none" : "auto",
          transition: "opacity 0.2s ease",
        }}
      >
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          gap={4}
        >
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={2}
          >
            <FormControl>
              <Select
                value={columnOrder}
                onChange={(e) => setColumnOrder(e.target.value)}
                sx={{ width: 220 }}
              >
                <MenuItem value="en-de">English → Deutsch</MenuItem>
                <MenuItem value="de-en">Deutsch → English</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={2}
            width={{ xs: "100%", sm: "auto" }}
            minHeight={{ sm: "56px" }}
          >
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              value={search}
              sx={{ minWidth: { xs: "100%", sm: 260, md: 400 } }}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Button
              variant="contained"
              type="button"
              startIcon={<Add />}
              onClick={() => setDialogOpen(true)}
              sx={{
                height: "100%",
                minWidth: 160,
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#1565c0" },
              }}
            >
              Add Word
            </Button>

            <Button
              type="button"
              variant="outlined"
              startIcon={<FileDown />}
              onClick={exportData}
              sx={{
                height: "100%",
                minWidth: 160,
                borderColor: "#1976d2",
                color: "#1976d2",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                  borderColor: "#1565c0",
                  color: "#1565c0",
                },
              }}
            >
              Export
            </Button>
          </Box>
        </Box>

        <Box overflow="auto">
          <GlossaryTable
            data={data}
            columnOrder={columnOrder}
            handleDeleteRow={handleDeleteRow}
            handleDeleteSelected={handleDeleteSelected}
            handleFinalEdit={handleFinalEdit}
          />
        </Box>

        <EditDialog
          open={dialogOpen}
          formType="Add"
          onClose={() => setDialogOpen(false)}
          onSave={handleAdd}
        />
      </Box>
    </Box>
  );
}
