import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Box,
  IconButton, // Import IconButton
  Tooltip, // Import Tooltip for better UX
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit"; // Import Edit Icon
import DeleteIcon from "@mui/icons-material/Delete"; // Import Delete Icon
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import useApi from "@/components/utils/useApi";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import BASE_URL from "Base/api";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";

// This object acts as a dictionary to translate stage numbers to names
const LEAD_STAGE_MAP = {
  1: "New",
  2: "Contacted",
  3: "Qualified",
  4: "Unqualified",
};

const Leads = () => {
  const cId = sessionStorage.getItem("category");
  const { navigate, create, update, remove } = IsPermissionEnabled(cId);

  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const apiUrl = `/Leads/GetAllLeads?Filter=${searchTerm}&SkipCount=${
    page * rowsPerPage
  }&MaxResultCount=${rowsPerPage}`;
  const {
    data: apiResponse,
    loading: leadsLoading,
    error,
    refetch,
  } = useApi(apiUrl);

  useEffect(() => {
    if (apiResponse && apiResponse.items) {
      setLeads(apiResponse.items || []);
      setTotalCount(apiResponse.totalCount || 0);
    } else if (error) {
      toast.error("Failed to fetch leads.");
      console.error("Error fetching leads:", error);
    }
  }, [apiResponse, error]);

  const navigateToCreate = () => router.push("/crm/lead/create-lead");

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        const response = await fetch(
          `${BASE_URL}/api/Leads/DeleteLead?id=${id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          toast.success("Lead deleted successfully!");
          refetch(); // Reload the data
        } else {
          toast.error(result.message || "Failed to delete lead.");
        }
      } catch (err) {
        toast.error("An error occurred.");
      }
    }
  };

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when changing page size
  };

  const getStageChipColor = (stageId) => {
    const stageName = LEAD_STAGE_MAP[stageId] || "";
    switch (stageName.toLowerCase()) {
      case "qualified":
        return "success";
      case "contacted":
        return "warning";
      case "new":
        return "primary";
      case "unqualified":
        return "error";
      default:
        return "default";
    }
  };

  if (!navigate) {
    return <AccessDenied />;
  }

  return (
    <>
      <ToastContainer />
      <div style={{ marginBottom: "1rem" }}>
        <h1>Leads</h1>
      </div>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Search className="search-form">
            <StyledInputBase
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Search>
        </Grid>
        <Grid item xs={12} md={8} display="flex" justifyContent="end" gap={1}>
          {create && (
            <Button variant="outlined" onClick={navigateToCreate}>
              New Lead
            </Button>
          )}
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leadsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No Leads Available
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.firstName} {item.lastName}
                      </TableCell>
                      <TableCell>{item.company}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>{item.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={LEAD_STAGE_MAP[item.stage] || "Unknown"}
                          color={getStageChipColor(item.stage)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          {update && (
                            <Tooltip title="Edit Lead">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  router.push(`/crm/leads/edit/${item.id}`)
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {remove && (
                            <Tooltip title="Delete Lead">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(item.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
};

export default Leads;