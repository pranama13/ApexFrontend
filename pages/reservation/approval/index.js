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
import { Pagination, Typography, FormControl, InputLabel, MenuItem, Select, Box, Tabs, Tab } from "@mui/material";
import { ToastContainer } from "react-toastify";
import BASE_URL from "Base/api";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import { formatCurrency, formatDate } from "@/components/utils/formatHelper";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import AddPencilNote from "@/components/UIElements/Modal/AddPencilNote";
import ReservationPayment from "@/components/UIElements/Modal/ReservationPayment";
import PaymentApproval from "@/components/UIElements/Modal/PaymentApproval";
import RejectById from "@/components/UIElements/Modal/RejectById";
import MakePayment from "@/components/UIElements/Modal/MakePayment";
import { getPaymentMethods } from "@/components/types/types";
import EditApproval from "./edit";

export default function Approval() {
  const cId = sessionStorage.getItem("category")
  const { navigate, create, update, remove, print, approve1 } = IsPermissionEnabled(cId);
  const [resList, setResList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setPage(1);
    fetchResList(1, searchTerm, pageSize);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setPage(1);
    fetchResList(1, value, pageSize);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchResList(value, searchTerm, pageSize);
  };

  const handlePageSizeChange = (event) => {
    const newSize = event.target.value;
    setPageSize(newSize);
    setPage(1);
    fetchResList(1, searchTerm, newSize);
  };

  const fetchResList = async (page = 1, search = "", size = pageSize) => {
    try {
      const token = localStorage.getItem("token");
      const skip = (page - 1) * size;
      const query = `${BASE_URL}/ReservationApproval/GetAllReservationApproval?SkipCount=${skip}&MaxResultCount=${size}&Search=${search || "null"}&isInitailPaymentDone=${false}`;

      const response = await fetch(query, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      setResList(data.result.items);
      setTotalCount(data.result.totalCount || 0);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchResList();
  }, []);

  if (!navigate) {
    return <AccessDenied />;
  }

  const filteredData = resList.filter(
    (item) =>
      (tabIndex === 0 && item.reservationType === 3 && item.isRejected === false) ||
      (tabIndex === 1 && item.reservationType === 10) ||
      (tabIndex === 2 && item.reservationType === 1 && item.isRejected === true)
  );

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Payment Approval</h1>
        <ul>
          <li>
            <Link href="/reservation/approval/">Payment Approval</Link>
          </li>
        </ul>
      </div>
      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Pending Approval" />
        <Tab label="Balance" />
        <Tab label="Rejected" />
      </Tabs>
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
        <Grid item xs={12} lg={8} mb={1} display="flex" justifyContent="end" gap={1} order={{ xs: 1, lg: 2 }}>
          <AddPencilNote
            date={new Date().toISOString().split("T")[0]}
            type={3}
          />
          {create ? <ReservationPayment fetchItems={() => fetchResList()} /> : ""}
        </Grid>
        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
            <Table className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>Doc. No</TableCell>
                  <TableCell>Payment Code</TableCell>
                  <TableCell>Wedding&nbsp;Date</TableCell>
                  {tabIndex === 0 || tabIndex === 2 ? (
                    <TableCell>Payment&nbsp;Date</TableCell>
                  ) : (
                    ""
                  )}
                  <TableCell>Customer&nbsp;Name</TableCell>
                  <TableCell>Mobile No</TableCell>
                  <TableCell>NIC/Passport</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Payment Description</TableCell>
                  <TableCell>Payment Type</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Paid Amount</TableCell>
                  {tabIndex === 1 ? <TableCell>Balance Amount</TableCell> : ""}
                  {tabIndex === 0 || tabIndex === 2 ?
                    <TableCell>Pay Slip</TableCell>
                    : ""}
                  {tabIndex === 2 ?
                    <TableCell>Rejected Reason</TableCell>
                    : ""}
                  {tabIndex === 0 || tabIndex === 1 ?
                    <TableCell align="right">Action</TableCell>
                    : ""}

                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center">
                      <Typography color="error">
                        No Reservations Available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow key={index} sx={{ background: item.isFinalPaymentDone ? '#F8F8E1' : "" }}>
                      <TableCell>{item.documentNo}</TableCell>
                      <TableCell>{item.paymentCode}</TableCell>
                      <TableCell>{formatDate(item.weddingDate)}</TableCell>
                      {tabIndex === 0 || tabIndex === 2 ? (
                        <TableCell>{formatDate(item.paymentDate)}</TableCell>
                      ) : (
                        ""
                      )}
                      <TableCell>
                        {item.customerName}
                      </TableCell>
                      <TableCell>{item.mobileNo}</TableCell>
                      <TableCell>{item.nic}</TableCell>
                      <TableCell>
                        {item.description}
                      </TableCell>
                      <TableCell>
                        {item.paymentDescription}
                      </TableCell>
                      <TableCell>{getPaymentMethods(item.paymentType)}</TableCell>
                      <TableCell>{formatCurrency(item.totalAmount)}</TableCell>

                      <TableCell>{formatCurrency(item.paidAmount)}</TableCell>
                      {tabIndex === 1 ? (
                        <TableCell>{formatCurrency(item.balanceAmount)}</TableCell>
                      ) : (
                        ""
                      )}
                      {tabIndex === 0 || tabIndex === 2 ? (
                        <TableCell>
                          {item.paySlipURL ?
                            <a href={item.paySlipURL} target="_blank">
                              View
                            </a> : "-"}
                        </TableCell>
                      ) : (
                        ""
                      )}
                      {tabIndex === 2 && (
                        <TableCell>{item.rejectRemark}</TableCell>
                      )}
                      {tabIndex === 0 || tabIndex === 1 ?
                        <TableCell align="right">
                          {tabIndex === 0 ? (
                            <Box display="flex" gap={1} justifyContent="end">
                              {update ? <EditApproval item={item} fetchItems={() => fetchResList()} /> : ""}
                              {approve1 ? <PaymentApproval
                                item={item}
                                fetchItems={() => fetchResList()}
                              /> : ""}
                              {remove ? <RejectById id={item.paymentApprovalId} fetchItems={() => fetchResList()} /> : ""}
                            </Box>
                          ) : tabIndex === 1 && create ? (
                            <MakePayment
                              customer={item.reservationId}
                              fetchItems={fetchResList}
                              type={2}
                              item={item}
                              res={item}
                            />
                          ) : (
                            ""
                          )}
                        </TableCell>
                        : ""}

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <Grid container justifyContent="space-between" mt={2} mb={2}>
              <Pagination count={Math.ceil(totalCount / pageSize)} page={page} onChange={handlePageChange} color="primary" shape="rounded" />
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
