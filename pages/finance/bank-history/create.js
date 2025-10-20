import React, { useEffect, useRef, useState } from "react";
import { Grid, MenuItem, Select, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { lg: 400, xs: 350 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
};

const validationSchema = Yup.object().shape({
  Amount: Yup.string().required("Amount is required"),
  Description: Yup.string().required("Description is required"),
});

export default function CreateBankHistory({ banks, fetchItems }) {
  const [open, setOpen] = React.useState(false);
  const [transactionType, setTransactionType] = useState(1);
  const handleClose = () => setOpen(false);
  const inputRef = useRef(null);
   const [bankId, setBankId] = useState(null);

  const handleOpen = async () => {
    setOpen(true);
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  const handleSubmit = (values) => {
    if(!bankId){
      toast.error("Please Select Bank");
      return;
    }
    const payload = {
      Amount: values.Amount,
      Description: values.Description,
      RemainingBalance: null,
      TransactionType: transactionType,
      IsCheque: false,
      DocumentNo: "",
      WarehouseId: null,
      BankId : bankId
    }
    fetch(`${BASE_URL}/BankHistory/CreateBankHistory`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode == 200) {
          toast.success(data.message);
          setOpen(false);
          fetchItems();
        } else {
          toast.error(data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message || "");
      });
  };

  return (
    <>
      <Button variant="outlined" onClick={handleOpen}>
        + Cash In/Out
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="bg-black">
          <Formik
            initialValues={{
              Description: "",
              Amount: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "500",
                        mb: "5px",
                      }}
                    >
                      Cash In/ Out
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      sx={{
                        fontWeight: "500",
                        mb: "5px",
                      }}
                    >
                      Description
                    </Typography>
                    <Field
                      as={TextField}
                      fullWidth
                      name="Description"
                      error={touched.Description && Boolean(errors.Description)}
                      helperText={touched.Description && errors.Description}
                    />
                  </Grid>
                  <Grid item xs={12} mt={1}>
                    <Typography
                      sx={{
                        fontWeight: "500",
                        mb: "5px",
                      }}
                    >
                      Bank
                    </Typography>
                    <Select value={bankId} onChange={(e) => setBankId(e.target.value)} fullWidth>
                      {banks.length === 0 ? <MenuItem value="">No Data Available</MenuItem> :
                        (banks.map((bank, i) => (
                          <MenuItem key={i} value={bank.id}>{bank.name} - {bank.accountNo}</MenuItem>
                        )))}
                    </Select>
                  </Grid>
                  <Grid item xs={12} mt={1}>
                    <Typography
                      sx={{
                        fontWeight: "500",
                        mb: "5px",
                      }}
                    >
                      Transaction Type
                    </Typography>
                    <Select fullWidth value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                      <MenuItem value={1}>Credit</MenuItem>
                      <MenuItem value={2}>Debit</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={12} mt={1}>
                    <Typography
                      sx={{
                        fontWeight: "500",
                        fontSize: "14px",
                        mb: "5px",
                      }}
                    >
                      Amount
                    </Typography>
                    <Field
                      as={TextField}
                      fullWidth
                      name="Amount"
                      error={touched.Amount && Boolean(errors.Amount)}
                      helperText={touched.Amount && errors.Amount}
                    />
                  </Grid>
                  <Grid
                    display="flex"
                    justifyContent="space-between"
                    item
                    xs={12}
                    p={1}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" size="small">
                      Save
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>
    </>
  );
}
