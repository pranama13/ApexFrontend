import React, { useEffect, useState } from "react";
import styles from "@/styles/PageTitle.module.css";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Pagination, Typography, FormControl, InputLabel, MenuItem, Select, Button } from "@mui/material";
import { ToastContainer } from "react-toastify";
import BASE_URL from "Base/api";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import { useRouter } from "next/router";

export default function Projects() {
  const cId = sessionStorage.getItem("category")
  const { navigate, create, update, remove, print } = IsPermissionEnabled(cId);
  const [projectsList, setProjectsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const router = useRouter();

  const navigateToDetails = (id) => {
    router.push({
      pathname: "/production/projects/details",
      query: { id: id },
    });
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setPage(1);
    fetchProjectsList(1, value, pageSize);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchProjectsList(value, searchTerm, pageSize);
  };

  const handlePageSizeChange = (event) => {
    const newSize = event.target.value;
    setPageSize(newSize);
    setPage(1);
    fetchProjectsList(1, searchTerm, newSize);
  };

  const fetchProjectsList = async (page = 1, search = "", size = pageSize) => {
    try {
      const token = localStorage.getItem("token");
      const skip = (page - 1) * size;
      const query = `${BASE_URL}/Inquiry/GetAllProjectsByStatus?SkipCount=${skip}&MaxResultCount=${size}&Search=${search || "null"}&InquiryStatus=6`;

      const response = await fetch(query, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      setProjectsList(data.result.items);
      setTotalCount(data.result.totalCount || 0);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchProjectsList();
  }, []);

  if (!navigate) {
    return <AccessDenied />;
  }

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Projects</h1>
        <ul>
          <li>
            <Link href="/production/projects/">Projects</Link>
          </li>
        </ul>
      </div>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}>
        <Grid item xs={12} lg={4} order={{ xs: 2, lg: 1 }}>
          <Search className="search-form">
            <StyledInputBase
              placeholder="Search here.."
              inputProps={{ "aria-label": "search" }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Search>
        </Grid>
        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
           <Table aria-label="simple table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>Company</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Style Name</TableCell>
                  <TableCell>Project Completed Percentage</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projectsList.length == 0 ? (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell colSpan={7} component="th" scope="row">
                      <Typography color="error">No Projects Found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  projectsList.map((project, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell>
                        {project.customerDetails != null
                          ? project.customerDetails.company
                          : ""}
                      </TableCell>
                      <TableCell>
                        {project.customerDetails != null
                          ? project.customerDetails.firstName
                          : ""}{" "}
                        {project.customerDetails != null
                          ? project.customerDetails.lastName
                          : ""}
                          {project.customerName}
                      </TableCell>
                      <TableCell>{project.inquiryDetails.styleName}</TableCell>
                      <TableCell>50%</TableCell>
                      <TableCell>
                        <span className="primaryBadge">pending</span>
                      </TableCell>
                      <TableCell>
                        <span className="dangerBadge">not delivered</span>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          onClick={() => navigateToDetails(project.summeryPanelId)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <Grid container justifyContent="space-between" mt={2} mb={2}>
              <Pagination
                count={Math.ceil(totalCount / pageSize)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
              />
              <FormControl size="small" sx={{ mr: 2, width: "100px" }}>
                <InputLabel>Page Size</InputLabel>
                <Select value={pageSize} label="Page Size" onChange={handlePageSizeChange}>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
}
