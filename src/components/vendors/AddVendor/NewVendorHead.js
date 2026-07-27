import React, { useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";

import { PageHeader, DataTable } from "../../../design-system";
import "./NewVendorHead.css";

const NewVendorHead = (props) => {
  const [visible, setVisible] = useState(false);
  const [dataSource] = useState([]);
  const [columns] = useState([]);
  const history = useHistory();
  const params = useParams();
  const cancelHandler = () => {
    history.push("/masterData");
  };

  return (
    <div className="header-one">
      <Dialog
        open={visible}
        onClose={() => setVisible(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Audit Log</DialogTitle>
        <DialogContent>
          <DataTable columns={columns} data={dataSource} pagination={false} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVisible(false)} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <div className="nvh-top-bar">
        <Breadcrumbs className="nvh-breadcrumb" separator="/">
          <Link to="/catalog" style={{ display: "inline-flex" }}>
            <HomeIcon fontSize="small" />
          </Link>
          <Link to="/masterData">Entities</Link>
          <Box component="span">
            {params.id ? "Edit entity" : "Add entity"}
          </Box>
        </Breadcrumbs>
        <div className="nvh-actions">
          <Button variant="outlined" onClick={cancelHandler}>
            Cancel
          </Button>
          <Button
            onClick={props.handleSubmitSuccess}
            variant="contained"
            disabled={props.activeSubmit || props.isSubmitted}
          >
            Submit
          </Button>
        </div>
      </div>
      <div>
        <PageHeader
          title={params.id ? "Edit Entity" : "Add Entity"}
          ghost={false}
          onBack={() => history.push("/masterData")}
          className="home-page"
        />
      </div>
    </div>
  );
};

export default NewVendorHead;
