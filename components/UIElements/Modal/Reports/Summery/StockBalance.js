import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import "react-toastify/dist/ReactToastify.css";
import { Visibility } from "@mui/icons-material";
import GetReportSettingValueByName from "@/components/utils/GetReportSettingValueByName";
import { Report } from "Base/report";
import SearchItemByName from "@/components/utils/SearchItemByName";
import BASE_URL from "Base/api";
import { Catelogue } from "Base/catelogue";
import useApi from "@/components/utils/useApi";

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

export default function StockBalance({ docName, reportName }) {
  const warehouseId = localStorage.getItem("warehouse");
  const name = localStorage.getItem("name");
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState(0);
  const [items, setItems] = useState([]);
  const [itemId, setItemId] = useState(0);
  const { data: StockBalanceReport } = GetReportSettingValueByName(reportName);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(0);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoryId, setSubCategoryId] = useState(0);


  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemId(0);
    setSupplierId(0)
  };

  const {
    data: supplierList,
    loading: Loading,
    error: Error,
  } = useApi("/Supplier/GetAllSupplier");
  const { data: categoryList } = useApi("/Category/GetAllCategory");

  const handleGetSupplierItems = async (id) => {
    setItemId(0);
    handleGetFilteredItems(id, categoryId, subCategoryId);
  }

  const handleGetFilteredItems = async (supplier, category, subCategory) => {
    setItemId(0);
    try {
      const token = localStorage.getItem("token");
      const query = `${BASE_URL}/Items/GetFilteredItems?supplier=${supplier}&category=${category}&subCategory=${subCategory}`;
      const response = await fetch(query, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      setItems(data.result);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleGetSubCategories = async (id) => {
    setItemId(0);
    setSubCategoryId(0);
    handleGetFilteredItems(supplierId, id, subCategoryId);
    try {
      const token = localStorage.getItem("token");
      const query = `${BASE_URL}/SubCategory/GetAllSubCategoriesByCategoryId?categoryId=${id}`;
      const response = await fetch(query, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      setSubCategories(data.result);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  useEffect(() => {
    if (supplierList) {
      setSuppliers(supplierList);
    }
    if (categoryList) {
      setCategories(categoryList);
    }
  }, [categoryList]);

  return (
    <>
      <Tooltip title="View" placement="top">
        <IconButton onClick={handleOpen} aria-label="View" size="small">
          <Visibility color="primary" fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="bg-black">
          <Box>
            <Grid container spacing={1}>
              <Grid item xs={12} my={2} display="flex" justifyContent="space-between">
                <Typography variant="h5" fontWeight="bold">
                  Stock Balance Report
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography as="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }}>
                  Select Supplier
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={supplierId}
                  onChange={(e) => {
                    setSupplierId(e.target.value);
                    handleGetSupplierItems(e.target.value);
                  }}
                >
                  <MenuItem value={0}>All</MenuItem>
                  {suppliers.length === 0 ? <MenuItem value="">No Suppliers Available</MenuItem>
                    : (suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
                    )))}
                </Select>
              </Grid>
              <Grid item xs={12} lg={6}>
                <Typography as="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }}>
                  Select Category
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    handleGetSubCategories(e.target.value);
                  }}
                >
                  <MenuItem value={0}>All</MenuItem>
                  {categories.length === 0 ? <MenuItem disabled value="">No Categories Available</MenuItem>
                    : (categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                    )))}
                </Select>
              </Grid>
              <Grid item xs={12} lg={6}>
                <Typography as="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }}>
                  Select Sub Category
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={subCategoryId}
                  onChange={(e) => {
                    setSubCategoryId(e.target.value);
                    handleGetFilteredItems(supplierId, categoryId, e.target.value);
                  }}
                >
                  <MenuItem value={0}>All</MenuItem>
                  {subCategories.length === 0 ? <MenuItem disabled value="">No Sub Categories Available</MenuItem>
                    : (subCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                    )))}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <Typography as="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }}>
                  Select Item
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={itemId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const item = items.find((x) => x.id === selectedId);

                    setItemId(selectedId);
                    if (item) {
                      setCategoryId(item.categoryId);
                      setSubCategoryId(item.subCategoryId);
                    }
                  }}
                >
                  <MenuItem value={0}>All</MenuItem>
                  {items.length === 0 ? <MenuItem value="">No Items Available</MenuItem>
                    : (items.map((item) => (
                      <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                    )))}
                </Select>
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="space-between" mt={2}>
                <Button onClick={handleClose} variant="contained" color="error">
                  Close
                </Button>
                <a href={`${Report}/${docName}?InitialCatalog=${Catelogue}&reportName=${StockBalanceReport}&supplierId=${supplierId != 0 ? supplierId : selectedItem.supplier || 0}&categoryId=${categoryId}&subCategoryid=${subCategoryId}&productId=${itemId}&warehouseId=${warehouseId}&currentUser=${name}`} target="_blank">
                  <Button variant="contained" aria-label="print" size="small">
                    Submit
                  </Button>
                </a>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
