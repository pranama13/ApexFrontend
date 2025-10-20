import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Button,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "Base/api";
import { useRouter } from "next/router";
import { formatCurrency, formatDate } from "@/components/utils/formatHelper";
import LoadingButton from "@/components/UIElements/Buttons/LoadingButton";

const ShipmentEdit = () => {
  const [shipmentLineDetails, setShipmentLineDetails] = useState([]);
   const [isDisable, setIsDisable] = useState(false);
  const [order, setOrder] = useState({});
  const [referenceNo, setReferenceNo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remark, setRemark] = useState("");
  const [status, setStatus] = useState(null);
  const router = useRouter();
  const shipmentStatusTypes = [
    { name: "Order", value: 1 },
    { name: "Invoice", value: 2 },
    { name: "Warehouse Issued", value: 3 },
    { name: "Dispatched", value: 4 },
    { name: "Arrive", value: 5 },
    { name: "Cusotomer Warehouse", value: 6 },
    { name: "Completed", value: 7 },
  ];

  const navigateToBack = () => {
    router.push({
      pathname: "/inventory/shipment",
    });
  };
  const { id } = router.query;

  const fetchShipmentNote = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/ShipmentNote/GetShipmentOrderById?id=${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();

      const result = data.result;
      const shipmentDetailsWithLineTotal = result.shipmentNoteLineDetails.map(
        (row) => ({
          ...row,
          lineTotal: parseFloat(row.receivedQty) * parseFloat(row.unitPrice),
        })
      );

      setOrder(data.result);
      setReferenceNo(result.referanceNo);
      setRemark(result.remark);
      setStatus(result.status);
      setShipmentLineDetails(shipmentDetailsWithLineTotal);
    } catch (error) {
      console.error("Error fetching :", error);
    }
  };
  useEffect(() => {
    fetchShipmentNote();
  }, []);

  const handleChange = (index, field, value) => {
    const updatedShipmentLineDetails = [...shipmentLineDetails];
    updatedShipmentLineDetails[index][field] = parseFloat(value) || 0;

    updatedShipmentLineDetails[index].lineTotal =
      updatedShipmentLineDetails[index].receivedQty *
      updatedShipmentLineDetails[index].unitPrice;

    setShipmentLineDetails(updatedShipmentLineDetails);
  };

  const finalTotal = shipmentLineDetails.reduce(
    (total, row) => total + row.lineTotal,
    0
  );

  const handleSubmit = async () => {
    let hasInvalidValues = false;

    shipmentLineDetails.forEach((row) => {
      if (row.receivedQty === 0 || row.unitPrice === 0) {
        hasInvalidValues = true;
      }
    });

    // if (hasInvalidValues) {
    //   toast.info(
    //     "Please enter values greater than 0 for Received Quantity and Unit Price."
    //   );
    //   return;
    // }

    const data = {
      Id: id,
      documentNo: order.documentNo,
      supplierCode: "0",
      supplierName: order.supplierName,
      warehouseCode: order.warehouseCode,
      warehouseName: order.warehouseName,
      shipmentDate: order.shipmentDate,
      status: status,
      shipmentNoteLineDetails: shipmentLineDetails.map((row) => ({
        Id: row.id,
        shipmentNoteId: row.shipmentNoteId,
        grnHeaderId: row.grnHeaderId,
        purchaseOrderNo: row.purchaseOrderNo,
        documentNo: row.documentNo,
        warehouseCode: row.warehouseCode,
        warehouseName: row.warehouseName,
        productId: row.productId,
        productCode: row.productCode,
        productName: row.productName,
        qty: row.qty,
        receivedQty: row.receivedQty,
        freightDutyCost: row.freightDutyCost,
        additionalCost: row.additionalCost,
        LineTotal: row.lineTotal,
        UnitPrice: row.unitPrice,
        Remark: row.remark,
      })),
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${BASE_URL}/ShipmentNote/UpdateShipmentNote`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const jsonResponse = await response.json();
        if (jsonResponse.result.result != "") {
          setIsDisable(true);
          toast.success(jsonResponse.result.message);
          setTimeout(() => {
            window.location.href = "/inventory/shipment";
          }, 1500);
        } else {
          toast.error(jsonResponse.result.message);
        }
      } else {
        toast.error("Please fill all required fields");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Shipment Note Edit</h1>
        <ul>
          <li>
            <Link href="/inventory/shipment">Shipment Note</Link>
          </li>
          <li>Edit</li>
        </ul>
      </div>

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} sx={{ background: "#fff" }}>
          <Grid container p={1}>
            <Grid item gap={2} xs={12} display="flex" justifyContent="end">
              <Button variant="outlined" disabled>
                <Typography sx={{ fontWeight: "bold" }}>
                  Shipment No: {order.documentNo}
                </Typography>
              </Button>
              <Button variant="outlined" onClick={() => navigateToBack()}>
                <Typography sx={{ fontWeight: "bold" }}>Go Back</Typography>
              </Button>
            </Grid>
            <Grid
              item
              xs={12}
              lg={6}
              display="flex"
              justifyContent="space-between"
              mt={1}
            >
              <Typography
                component="label"
                sx={{
                  fontWeight: "500",
                  p: 1,
                  fontSize: "14px",
                  display: "block",
                  width: "35%",
                }}
              >
                Supplier
              </Typography>
              <TextField
                disabled
                fullWidth
                value={order.supplierName}
                sx={{ width: "60%" }}
                size="small"
              />
            </Grid>
            <Grid
              item
              xs={12}
              lg={6}
              display="flex"
              justifyContent="space-between"
              mt={1}
            >
              <Typography
                component="label"
                sx={{
                  fontWeight: "500",
                  p: 1,
                  fontSize: "14px",
                  display: "block",
                  width: "35%",
                }}
              >
                Reference No:
              </Typography>
              <TextField
                sx={{ width: "60%" }}
                size="small"
                fullWidth
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={12}
              lg={6}
              display="flex"
              justifyContent="space-between"
              mt={1}
            >
              <Typography
                component="label"
                sx={{
                  fontWeight: "500",
                  p: 1,
                  fontSize: "14px",
                  display: "block",
                  width: "35%",
                }}
              >
                Shipment Date
              </Typography>
              <TextField
                sx={{ width: "60%" }}
                size="small"
                type="date"
                fullWidth
                value={formatDate(order.shipmentDate)}
                disabled
              />
            </Grid>
            <Grid
              item
              xs={12}
              lg={6}
              display="flex"
              justifyContent="space-between"
              mt={1}
            >
              <Typography
                component="label"
                sx={{
                  fontWeight: "500",
                  p: 1,
                  fontSize: "14px",
                  display: "block",
                  width: "35%",
                }}
              >
                Remark
              </Typography>
              <TextField
                sx={{ width: "60%" }}
                size="small"
                type="text"
                fullWidth
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={12}
              lg={6}
              display="flex"
              justifyContent="space-between"
              mt={1}
            >
              <Typography
                component="label"
                sx={{
                  fontWeight: "500",
                  p: 1,
                  fontSize: "14px",
                  display: "block",
                  width: "35%",
                }}
              >
                Status
              </Typography>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                sx={{ width: "60%" }}
                size="small"
                fullWidth
              >
                {shipmentStatusTypes.map((statusType) => (
                  <MenuItem key={statusType.value} value={statusType.value}>
                    {statusType.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} mt={2}>
              <TableContainer component={Paper}>
                <Table
                  size="small"
                  aria-label="simple table"
                  className="dark-table"
                >
                  <TableHead>
                    <TableRow sx={{ background: "#757fef" }}>
                      <TableCell sx={{ color: "#fff" }}>#</TableCell>
                      <TableCell sx={{ color: "#fff" }}>PO No</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        Product&nbsp;Name{" "}
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>Ordered Qty</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Unit Price</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Received Qty</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        Additional Cost
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        Freight Duty Cost
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>Remark</TableCell>
                      <TableCell sx={{ color: "#fff" }} align="right">
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shipmentLineDetails.map((row, index) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell sx={{ p: 1 }}>{index + 1}</TableCell>
                        <TableCell sx={{ p: 1 }} component="th" scope="row">
                          {row.purchaseOrderNo}
                        </TableCell>
                        <TableCell sx={{ p: 1 }} component="th" scope="row">
                          {row.productName}
                        </TableCell>
                        <TableCell sx={{ p: 1 }} component="th" scope="row">
                          {row.qty}
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>
                          <TextField
                            type="number"
                            value={row.unitPrice}
                            fullWidth
                            size="small"
                            onChange={(e) =>
                              handleChange(
                                index,
                                "unitPrice",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>
                          <TextField
                            type="number"
                            value={row.receivedQty}
                            fullWidth
                            size="small"
                            onChange={(e) =>
                              handleChange(
                                index,
                                "receivedQty",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>
                          <TextField
                            type="number"
                            value={row.additionalCost}
                            fullWidth
                            size="small"
                            onChange={(e) =>
                              handleChange(
                                index,
                                "additionalCost",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>
                          <TextField
                            type="number"
                            value={row.freightDutyCost}
                            fullWidth
                            size="small"
                            onChange={(e) =>
                              handleChange(
                                index,
                                "freightDutyCost",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>
                          <TextField
                            type="text"
                            value={row.remark}
                            fullWidth
                            size="small"
                            onChange={(e) =>
                              handleChange(
                                index,
                                "remark",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ p: 1 }}>
                          {row.lineTotal || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell align="right" colSpan={8}>
                        Total
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(finalTotal || 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} my={3}>
              <LoadingButton
                loading={isSubmitting}
                handleSubmit={() => handleSubmit()}
                disabled={isDisable}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default ShipmentEdit;
