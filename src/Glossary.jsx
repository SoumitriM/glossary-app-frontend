import { useState, useEffect } from "react";
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
  const [searchLang, setSearchLang] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // 📖 Fetch glossary entries
  const fetchData = () => {
    const url =
      search !== ""
        ? `${BASE_URLS.SEARCH}?q=${search}&lang=${searchLang}`
        : BASE_URLS.GET_ALL;

    api
      .get(url)
      .then((json) => setData(json))
      .catch(() => toast.error("Something went wrong! Failed to fetch glossary."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData();
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, searchLang]);


  // Delete single row
  const handleDeleteRow = async (id) => {
    try {
      setIsLoading(true);
      await api.delete(`${BASE_URLS.DELETE_ENTRY}/${id}`);
      toast.success("Entry deleted");
      fetchData();
    } catch {
      toast.error("Something went wrong! Failed to delete item.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete multiple rows
  const handleDeleteSelected = async (ids) => {
    if (!ids || ids.length === 0) return;
    try {
      setIsLoading(true);
      const result = await api.post(`${BASE_URLS.DELETE_MULTIPLE}`, { ids });
      toast.success(result.message || "Selected entries deleted");
      fetchData();
    } catch {
      toast.error("Something went wrong! Failed to delete selected items.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✏️ Edit / Update glossary entry
  const handleFinalEdit = async (updatedItem, id) => {
    try {
      setIsLoading(true);
      await api.put(`${BASE_URLS.UPDATE_ENTRY}/${id}`, updatedItem);
      toast.success("Entry updated");
      fetchData();
    } catch {
      toast.error("Something went wrong! Failed to update entry.");
    } finally {
      setIsLoading(false);
    }
  };

  // ➕ Add new glossary entry
  const handleAdd = async (newItem) => {
    try {
      setIsLoading(true);
      await api.post(`${BASE_URLS.ADD_ENTRY}`, newItem);
      toast.success("Word added successfully");
      fetchData();
      setDialogOpen(false);
    } catch {
      toast.error("Something went wrong! Failed to add word.");
    } finally {
      setIsLoading(false);
    }
  };

  // 💾 Export JSON file
  const exportData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(BASE_URLS.EXPORT_JSON, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Something went wrong! Export failed.");

      const blob = await response.blob();
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
      setIsLoading(false);
    }
  };

  // 🧩 UI
  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <Box maxWidth="xl" mx="auto">
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

            <Box display="flex" gap={2} height="56px">
              <TextField
                label="Search"
                variant="outlined"
                fullWidth
                value={search}
                sx={{ minWidth: 400 }}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                variant="contained"
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
              setData={setData}
              searchLang={searchLang}
              search={search}
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
      )}
    </>
  );
}
