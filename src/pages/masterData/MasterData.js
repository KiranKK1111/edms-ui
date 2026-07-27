import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  ArrowDropDown as ArrowDropDownIcon,
  Edit as EditIcon,
  RemoveCircleOutlined as RemoveCircleOutlineIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import VendorData from "./VendorData";
import DataSetData from "./DataSetData";
import {
  startGetVendors,
  startUpdateEntity,
} from "../../store/actions/VendorActions";
import { startGetContracts } from "../../store/actions/contractAction";
import { startGetLicenses } from "../../store/actions/licenseAction";
import { startGetDatasets } from "../../store/actions/DatasetPageActions";
import { startGetDatafeeds } from "../../store/actions/datafeedAction";
import { resetState } from "../../store/actions/contractAction";
import {
  selectDatasetsInfo,
  selectDatafeedsInfo,
  selectContractData,
  selectVendorState,
} from "../../store/selectors";
import isAcessMasterDataDisabled from "../../utils/accessMasterData";
import isButtonObject from "../../utils/accessButtonCheck";
import {
  MASTERDATA_MANAGEMENT_ENTITY_BTN,
  MASTERDATA_MANAGEMENT_PAGE,
  MASTERDATA_ENTITY_EDIT_DEACTIVATE_BTN,
  MASTERDATA_AGREMENT_PAGE_AND_BUTTON,
} from "../../utils/Constants";
import {
  EmptyState,
  PageLayout,
  SideNav,
  useConfirm,
  useSnackbar,
} from "../../design-system";
import { getPageConfig } from "../../config/pageConfig";

import "./VendorDashboard.css";

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s === "active") {
    return <Chip size="small" color="success" variant="outlined" label="Active" />;
  }
  if (s === "pending") {
    return <Chip size="small" color="warning" variant="outlined" label="Pending" />;
  }
  if (s === "inactive") {
    return (
      <Chip
        size="small"
        variant="outlined"
        label="Inactive"
        sx={{ color: "var(--color-text-tertiary)", borderColor: "var(--color-border)" }}
      />
    );
  }
  return <Chip size="small" variant="outlined" label={status} />;
};

const DetailField = ({ label, children, full }) => (
  <Box
    sx={{
      gridColumn: full ? "1 / -1" : "auto",
      display: "flex",
      flexDirection: "column",
      gap: 0.25,
      minWidth: 0,
    }}
  >
    <Typography
      component="div"
      sx={{
        fontWeight: 600,
        fontSize: 12,
        color: "text.secondary",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {label}
    </Typography>
    <Box
      sx={{
        fontSize: 14,
        color: "text.primary",
        wordBreak: "break-word",
        minHeight: 22,
      }}
    >
      {children || (
        <Typography component="span" sx={{ color: "text.disabled", fontSize: 13 }}>
          —
        </Typography>
      )}
    </Box>
  </Box>
);

const ManageMenu = ({ entity, disabled, onDeactivate, warning }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const status = (entity && entity.entityStatus ? entity.entityStatus : "").toLowerCase();
  const updateFlag =
    entity && entity.entityUpdateFlag != null
      ? entity.entityUpdateFlag.toString().toLowerCase()
      : "";
  const canEdit = updateFlag === "n";
  const deactivateWarn =
    updateFlag === "y" && (status === "pending" || status === "active");
  const deactivateDisabled =
    !deactivateWarn &&
    (status === "inactive" || (updateFlag === "n" && status === "pending"));

  return (
    <>
      <ButtonGroup variant="outlined" size="small" disabled={disabled}>
        <Button onClick={(e) => setAnchorEl(e.currentTarget)}>Manage</Button>
        <Button
          size="small"
          aria-label="Open manage menu"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <ArrowDropDownIcon fontSize="small" />
        </Button>
      </ButtonGroup>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem
          component={canEdit ? Link : "div"}
          to={canEdit ? `/masterData/modifyEntity/${entity?.entityId}` : undefined}
          onClick={() => {
            setAnchorEl(null);
            if (!canEdit && warning) warning();
          }}
          sx={{ gap: 1 }}
        >
          <EditIcon fontSize="small" />
          <strong>Edit</strong>
        </MenuItem>
        <MenuItem
          disabled={deactivateDisabled}
          onClick={() => {
            setAnchorEl(null);
            if (deactivateWarn) {
              warning && warning();
            } else {
              onDeactivate(entity);
            }
          }}
          sx={{ gap: 1, color: "error.main" }}
        >
          <RemoveCircleOutlineIcon fontSize="small" />
          <strong>Deactivate</strong>
        </MenuItem>
      </Menu>
    </>
  );
};

const MasterData = (props) => {
  const [vendorID, setVendorId] = useState(0);
  const dispatch = useDispatch();
  const datasetsInfo = useSelector(selectDatasetsInfo);
  const datafeedsInfo = useSelector(selectDatafeedsInfo);
  const contractInfo = useSelector(selectContractData);
  const vendorState = useSelector(selectVendorState);

  const [activeTab, setActiveTab] = useState("1");
  const [entitySiderType, setEntitySiderType] = useState("activeAndPending");
  const [loading, setLoading] = useState(false);
  const [filterEntityList, setFilterEntityList] = useState([]);
  const [outerEntityList, setOuterEntityList] = useState([]);
  const [pendingAlertOpen, setPendingAlertOpen] = useState(true);

  const confirmer = useConfirm();
  const snackbar = useSnackbar();

  const isMasterDataDisabled = isAcessMasterDataDisabled();
  const isAddEntity = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_MANAGEMENT_ENTITY_BTN
  );
  const isEditDeactivateEntity = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_ENTITY_EDIT_DEACTIVATE_BTN
  );
  const agreementList = contractInfo && contractInfo[0];

  const headerActions = (
    <Button
      component={Link}
      to="/masterData/addEntity"
      variant="contained"
      disabled={isAddEntity}
    >
      + Add entity
    </Button>
  );

  let vendorDetails = {};
  const fixingVendorKey = sessionStorage.getItem("dashKey")
    ? sessionStorage.getItem("dashKey")
    : 0;

  const getData = useCallback(() => dispatch(startGetVendors(true)), [dispatch]);

  useEffect(() => {
    dispatch(resetState());
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    dispatch(startGetContracts());
    dispatch(startGetDatasets());
    dispatch(startGetDatafeeds());
    dispatch(startGetLicenses());
    getData().then((res) => {
      if (!mounted) return;
      if (res.status === 200) {
        if (vendorID === 0) {
          if (
            Number(fixingVendorKey) === 0 &&
            res.data.entityManagementList.length > 0
          ) {
            setVendorId(res.data.entityManagementList[0].entityId);
            setLoading(false);
          } else {
            setVendorId(sessionStorage.getItem("vendorid"));
            setLoading(false);
          }
        }
        const entList = res.data.entityManagementList.filter((el) => {
          const s = (el.entityStatus || "").toLowerCase();
          return s === "active" || s === "pending";
        });
        setFilterEntityList(entList);
        setOuterEntityList(res.data.entityManagementList);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (vendorState && vendorState.list && vendorState.list.length > 0) {
    vendorDetails = vendorState.list.find((ele) => ele.entityId === vendorID);
  }

  if (
    vendorState &&
    vendorState.list &&
    vendorState.list.length > 0 &&
    !vendorDetails
  ) {
    const paramID = vendorState.list[0].vendorId;
    vendorDetails = vendorState.list.find((ele) => ele.entityId === paramID);
  }

  const renderEntityUrl = (entityUrl) => {
    if (!entityUrl) return entityUrl;
    if (entityUrl.includes("http://") || entityUrl.includes("https://")) {
      return entityUrl;
    }
    return entityUrl.trim().length > 0 ? "https://" + entityUrl : entityUrl;
  };

  const handleVendorClick = (paramId, i) => {
    sessionStorage.setItem("dashKey", `${i}`);
    sessionStorage.setItem("vendorid", paramId);
    setVendorId(paramId);
  };

  const vendorMenuItems = useMemo(
    () =>
      filterEntityList && filterEntityList.length > 0
        ? filterEntityList.map((ele, i) => ({
            key: i,
            label: ele.shortName,
            onClick: () => handleVendorClick(ele.entityId, i),
          }))
        : [],
    [filterEntityList]
  );

  const handleDeleteVendor = async (Data) => {
    const dataObj = { ...Data };
    const agreementListByEntity = (agreementList || []).filter(
      (id) => dataObj.entityId === id.agreementEdmsEntiryId
    );
    const agreementStatusArr = agreementListByEntity.find((sub) => {
      const s = (sub.agreementStatus || "").toLowerCase();
      return s === "active" || s === "pending";
    });

    if (agreementStatusArr && agreementListByEntity.length > 0) {
      await confirmer.info({
        title: "Unable to Deactivate Entity!",
        content: "Status of Agreement(s) under this Entity is still active.",
        okText: "Ok",
      });
      return;
    }

    const ok = await confirmer.confirm({
      title: "Deactivate Entity?",
      content: "Are you sure you want to proceed?",
      okText: "Deactivate",
      okColor: "error",
    });
    if (!ok) return;
    dataObj.entityStatus = "Deactivate";
    dataObj.entityUpdateFlag = "Y";
    dataObj.lastUpdatedBy = localStorage.getItem("psid");
    const res = await startUpdateEntity(dataObj);
    if (res && res.data) {
      snackbar.success("Entity deactivation request submitted successfully.");
    }
    dispatch(startGetVendors(false));
  };

  const showWarning = () =>
    confirmer.info({
      title: "Notice",
      content: "This entity has a pending update request.",
      okText: "Ok",
    });

  let disableAddContract = false;
  let disableManage = false;
  let disableAll = false;

  if (vendorDetails) {
    const venStatus =
      vendorDetails && vendorDetails.taskStatus
        ? vendorDetails.taskStatus.toLowerCase()
        : "";
    if (venStatus === "approved") {
      disableAddContract = false;
      disableManage = false;
    }
    if (venStatus === "pending") {
      disableAddContract = true;
      disableManage = true;
      disableAll = true;
    }
    if (venStatus === "rejected") {
      disableAddContract = true;
      disableManage = false;
      disableAll = true;
    }
  }

  const isDisableManage = isEditDeactivateEntity || disableManage;

  const wordSearchHandler = (e) => {
    setEntitySiderType("all");
    const value = e.target.value || "";
    if (value.length > 0) {
      const term = value.toLowerCase().trim();
      const filterVendorsList = outerEntityList.filter((element) => {
        if (!element) return false;
        const fields = [
          element.entityId,
          element.shortName,
          element.longName,
        ];
        return fields.some(
          (field) => field && field.toString().toLowerCase().includes(term)
        );
      });
      if (filterVendorsList.length > 0) {
        setVendorId(filterVendorsList[0].entityId);
        setFilterEntityList(filterVendorsList);
      } else {
        setFilterEntityList([]);
      }
    } else {
      setFilterEntityList(outerEntityList);
    }
  };

  const handleTabChange = (_, key) => {
    setActiveTab(key);
  };

  const renderAgreementButton = () => {
    if (activeTab !== "1") return null;
    const isDisabled = !isButtonObject(
      MASTERDATA_MANAGEMENT_PAGE,
      MASTERDATA_AGREMENT_PAGE_AND_BUTTON
    );
    const status = vendorDetails && vendorDetails.entityStatus
      ? vendorDetails.entityStatus.toLowerCase()
      : "";
    const agreementButtonDispFlag =
      isDisabled && (status === "active" || status === "planned") ? false : true;
    return (
      <Button
        component={Link}
        to={`/masterData/${vendorDetails.shortName}/addAgreement`}
        onClick={() =>
          localStorage.setItem("entityIdInfo", vendorDetails.entityId)
        }
        disabled={agreementButtonDispFlag}
        variant="text"
      >
        + Add Agreement
      </Button>
    );
  };

  const handleEntitySiderType = (_, value) => {
    if (!value) return;
    let entList = [];
    if (value === "activeAndPending") {
      entList = outerEntityList.filter((el) => {
        const s = (el.entityStatus || "").toLowerCase();
        return s === "active" || s === "pending";
      });
    } else if (value === "inactive") {
      entList = outerEntityList.filter(
        (el) => (el.entityStatus || "").toLowerCase() === "inactive"
      );
    } else {
      entList = outerEntityList;
    }
    setFilterEntityList(entList);
    if (entList.length > 0) setVendorId(entList[0].entityId);
    setEntitySiderType(value);
  };

  const masterDataPage = getPageConfig("masterData");

  return (
    <PageLayout
      bounded
      breadcrumb={masterDataPage.breadcrumb}
      title={masterDataPage.title}
      subtitle={masterDataPage.subtitle}
      backTo={masterDataPage.backTo}
      badge={masterDataPage.badge}
      actions={headerActions}
    >
      {loading ? (
        <Box
          className="dashboard-content"
          sx={{
            flex: "1 1 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 320,
          }}
        >
          <CircularProgress size={48} />
        </Box>
      ) : (
        <Box className="dashboard-content">
          <Box className="dashboard-content-title">
            <Box
              className="dashboard-content-toolbar"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <ToggleButtonGroup
                size="small"
                color="primary"
                exclusive
                value={entitySiderType}
                onChange={handleEntitySiderType}
              >
                <ToggleButton value="activeAndPending">Active & Pending</ToggleButton>
                <ToggleButton value="inactive">Inactive</ToggleButton>
                <ToggleButton value="all">All</ToggleButton>
              </ToggleButtonGroup>
              <Box className="dashboard-content-search" sx={{ minWidth: 240 }}>
                <TextField
                  name="Search entity"
                  size="small"
                  fullWidth
                  placeholder="Search entity"
                  id="inp-search"
                  onChange={(e) => wordSearchHandler(e)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

            {vendorDetails ? (
              <Box className="dashboard-vendors" sx={{ display: "flex", gap: 2 }}>
                <Box
                  className="dashboard-vendors-sider"
                  sx={{ width: 240, flex: "0 0 auto" }}
                >
                  <Box className="dashboard-vendors-list">
                    <SideNav
                      defaultSelectedKey={
                        fixingVendorKey ? `${fixingVendorKey}` : "0"
                      }
                      items={vendorMenuItems}
                    />
                  </Box>
                </Box>
                <Box className="dashboard-vendors-data" sx={{ flex: 1, minWidth: 0 }}>
                  {vendorDetails &&
                    vendorDetails.entityStatus &&
                    vendorDetails.entityStatus.toLowerCase() === "pending" &&
                    pendingAlertOpen && (
                      <Alert
                        className="dashboard-vendors-alert"
                        severity="warning"
                        onClose={() => setPendingAlertOpen(false)}
                        sx={{ mb: 2 }}
                      >
                        This Entity is currently under review. You will be able to add Agreements once the Entity is approved and the status is &ldquo;Active&rdquo; or &ldquo;Planned&rdquo;.
                      </Alert>
                    )}

                  <Box className="dashboard-entity-details">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Typography
                        component="h3"
                        sx={{ fontSize: 16, fontWeight: 600, m: 0 }}
                      >
                        Entity Details
                      </Typography>
                      <ManageMenu
                        entity={vendorDetails}
                        disabled={isDisableManage}
                        onDeactivate={handleDeleteVendor}
                        warning={showWarning}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, minmax(0, 1fr))",
                          md: "repeat(3, minmax(0, 1fr))",
                        },
                        rowGap: 2,
                        columnGap: 3,
                      }}
                    >
                      <DetailField label="Entity ID">{vendorDetails.entityId}</DetailField>
                      <DetailField label="Long Name">{vendorDetails.longName}</DetailField>
                      <DetailField label="Short Name">{vendorDetails.shortName}</DetailField>
                      <DetailField label="Entity Type">{vendorDetails.entityType}</DetailField>
                      <DetailField label="Website">
                        {vendorDetails.website ? (
                          <a
                            href={renderEntityUrl(vendorDetails.website)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {vendorDetails.website}
                          </a>
                        ) : null}
                      </DetailField>
                      <DetailField label="Status">
                        <StatusBadge status={vendorDetails.entityStatus} />
                      </DetailField>
                      {vendorDetails.entityDescription && (
                        <DetailField label="Description" full>
                          {vendorDetails.entityDescription}
                        </DetailField>
                      )}
                    </Box>
                  </Box>

                  <Box className="dashboard-entity-modules">
                    <Typography
                      component="h3"
                      sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}
                    >
                      Agreements, Licences, Datasets and Data Feeds
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        borderBottom: "1px solid var(--color-border-secondary)",
                      }}
                    >
                      <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{ minHeight: 44 }}
                      >
                        <Tab value="1" label="Agreements & Licences" />
                        <Tab value="2" label="Datasets & Data Feeds" />
                      </Tabs>
                      {renderAgreementButton()}
                    </Box>

                    {activeTab === "1" && (
                      <Box className="dashboard-modules-content">
                        {contractInfo ? (
                          contractInfo.length > 0 ? (
                            <VendorData
                              className="dashboard-data-table"
                              vendorId={vendorID}
                              disableAllButtons={disableAll}
                              entityName={vendorDetails.shortName}
                              entityId={vendorDetails.entityId}
                            />
                          ) : (
                            <Box sx={{ textAlign: "center", py: 6 }}>
                              <CircularProgress size={40} />
                            </Box>
                          )
                        ) : (
                          <Box className="dashboard-vendors-contracts-empty">
                            <Typography component="h2" sx={{ fontSize: 18 }}>
                              No agreements
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    {activeTab === "2" && (
                      <Box className="dashboard-modules-content">
                        {datasetsInfo ? (
                          datasetsInfo.length > 0 ? (
                            <DataSetData
                              className="dashboard-data-table"
                              dataSetEntityId={vendorDetails.entityId}
                              datasetsInfo={datasetsInfo}
                              datafeedsInfo={datafeedsInfo}
                              vendorId={vendorID}
                              handleTabClick={(key) => setActiveTab(String(key))}
                            />
                          ) : (
                            <Box sx={{ textAlign: "center", py: 6 }}>
                              <CircularProgress size={40} />
                            </Box>
                          )
                        ) : (
                          <Box className="dashboard-vendors-contracts-empty">
                            <Typography component="h2" sx={{ fontSize: 18 }}>
                              No Datasets
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box className="dashboard-vendors-empty-page" sx={{ py: 6 }}>
                <EmptyState
                  title="There are no active vendors"
                  action={
                    <Button
                      component={Link}
                      to="/masterData/addEntity"
                      variant="contained"
                      disabled={isAddEntity}
                    >
                      + Add entity
                    </Button>
                  }
                />
              </Box>
            )}
          </Box>
      )}
    </PageLayout>
  );
};

const mapStateToProps = (state) => {
  return {
    contracts: state.contract.data,
    licenses: state.license.data,
    vendors: state.vendor,
  };
};

export default connect(mapStateToProps)(memo(MasterData));
