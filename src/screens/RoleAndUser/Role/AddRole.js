import React, { useEffect, useState, useMemo } from "react";
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Grid,
  Button,
  Typography,
  Paper,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

// =========================================================================
// THE FIX: Import `allRoutes` from your main router file.
// IMPORTANT: Adjust the import path `../../MainIndex` based on your project's folder structure.
// =========================================================================
import { allRoutes } from "../../MainIndex";

// This map is now only for displaying user-friendly labels in the UI
const privilegeLabelMap = {
  "/dashboard": "Dashboard",
  "/app-management": "App Management",
  "/astrologer-management": "Astrologer Management",
  "/astrologer-support-operations": "Astrologer Support & Operations",
  "/user-support-operations": "User Support & Operations",
  "/product-management": "Product Management",
  "/admin": "Admin",
  "/cms": "CMS",
  "/reports": "Reports",
};

// These are the parent categories shown in the dropdown
const allParentPrivileges = Object.keys(privilegeLabelMap);

function RoleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("User-admin-token");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // This map helps convert the backend's flat list of privileges back to parent groups for the UI.
  const childToParentMap = useMemo(() => {
    const map = {};
    allRoutes.forEach(route => {
      map[route.path] = route.category;
    });
    return map;
  }, []);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      roleName: "",
      privileges: [], // This will store parent route categories for the UI
    },
  });

  useEffect(() => {
    if (id) {
      const fetchRoleDetails = async () => {
        setInitialLoading(true);
        try {
          const res = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/role/${id}`, {
            headers: { Authorization: token },
          });
          const role = res?.data?.data;

          // Convert the flat list of child privileges from the backend into parent groups for the UI
          const parentPrivileges = new Set();
          if (role.privileges && Array.isArray(role.privileges)) {
            role.privileges.forEach(childRoute => {
              if (childToParentMap[childRoute]) {
                parentPrivileges.add(childToParentMap[childRoute]);
              }
            });
          }

          reset({
            roleName: role?.roleName || "",
            privileges: Array.from(parentPrivileges),
          });
        } catch (err) {
          toast.error("Failed to load role details");
        } finally {
          setInitialLoading(false);
        }
      };
      fetchRoleDetails();
    } else {
      setInitialLoading(false);
    }
  }, [id, reset, childToParentMap, token]);

  // This function now expands selected parent categories into a full list of child permissions.
  const onSubmit = async (formData) => {
    setLoading(true);

    const expandedPrivileges = new Set();
    const selectedParentCategories = formData.privileges || [];

    // Find all child routes from `allRoutes` that belong to the selected parent categories
    allRoutes.forEach(route => {
      if (selectedParentCategories.includes(route.category)) {
        expandedPrivileges.add(route.path);
      }
    });

    const payload = {
      roleName: formData.roleName,
      privileges: Array.from(expandedPrivileges), // Send the complete list of child routes
    };

    try {
      if (id) {
        await axios.patch(`${process.env.REACT_APP_BASEURL}/admin/role/${id}`, payload, {
          headers: { Authorization: token },
        });
        toast.success("Role updated successfully!");
      } else {
        await axios.post(`${process.env.REACT_APP_BASEURL}/admin/role`, payload, {
          headers: { Authorization: token },
        });
        toast.success("Role created successfully!");
      }
      navigate("/role-management");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error while saving role");
    } finally {
      setLoading(false);
    }
  };

  const formatPrivilegeLabel = (route) => privilegeLabelMap[route] || route;

  if (initialLoading) return <div className="p-4">Loading...</div>;

  return (
    <div style={{ padding: "24px" }}>
      <Toaster />
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h6" gutterBottom>
          {id ? "Edit Role" : "Create Role"}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role Name"
                placeholder="e.g. Admin, Manager"
                {...register("roleName", { required: "Role name is required" })}
                error={!!errors.roleName}
                helperText={errors.roleName?.message}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="privileges"
                control={control}
                rules={{
                  validate: (val) => val?.length > 0 || "Select at least one privilege",
                }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    multiple
                    fullWidth
                    options={allParentPrivileges}
                    getOptionLabel={formatPrivilegeLabel}
                    value={field.value}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Privileges"
                        placeholder="Select privileges"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ minWidth: 140 }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : id ? "Update Role" : "Create Role"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
}

export default RoleEdit;