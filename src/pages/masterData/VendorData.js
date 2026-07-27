import React, { useEffect, memo, useMemo } from "react";
import { connect, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  RemoveCircleOutlined as RemoveCircleIcon,
} from "@mui/icons-material";
import dayjs from "../../design-system/dayjs";

import { clearDataset } from "../../store/actions/datasetFormActions";
import {
  startUpdateAgreement,
  startGetContracts,
} from "../../store/actions/contractAction";
import {
  cleanResponse,
  startAddLicense,
} from "../../store/actions/licenseAction";
import { camelText, checkUrlSlash } from "../../components/stringConversion";
import { CamelText } from "../../components/addContract/ContractDetails.js";
import isButtonObject from "../../utils/accessButtonCheck";
import {
  MASTERDATA_MANAGEMENT_PAGE,
  MASTERDATA_AGREMENT_PAGE_AND_BUTTON,
  MASTERDATA_LICENSE_PAGE_BUTTON,
  MASTERDATA_ADD_DATASET_PAGES_BUTTON,
} from "../../utils/Constants";
import { warning } from "../../utils/warningUtils.js";
import {
  DataTable,
  ActionsMenu,
  useConfirm,
  useSnackbar,
} from "../../design-system";

import "./VendorData.css";

const greenStatus = ["approved", "live", "active", "setup"];

const StatusChip = ({ value }) => {
  if (!value) return null;
  const v = value.toLowerCase();
  if (greenStatus.includes(v)) {
    return <Chip size="small" color="success" variant="outlined" label={value} />;
  }
  return <Chip size="small" color="warning" variant="outlined" label={CamelText(value)} />;
};

const VendorData = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const confirmer = useConfirm();
  const snackbar = useSnackbar();

  const licenceList = props.licenses;
  const vendorID = props.vendorId;

  useEffect(() => {
    dispatch(clearDataset());
    dispatch(cleanResponse());
  }, [dispatch]);

  const isAgreementDisabled = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_AGREMENT_PAGE_AND_BUTTON
  );
  const isLicenceDisabled = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_LICENSE_PAGE_BUTTON
  );
  const isDatasetDisabled = isButtonObject(
    MASTERDATA_MANAGEMENT_PAGE,
    MASTERDATA_ADD_DATASET_PAGES_BUTTON
  );

  const handleContractDelete = async (Data) => {
    const dataObj = { ...Data };
    const licenceListByAgreement = (licenceList || []).filter(
      (id) => dataObj.agreementId === id.licenseAgreementId
    );
    const licenceStatusArr = licenceListByAgreement.find((sub) => {
      const s = (sub.licenseStatus || "").toLowerCase();
      return s === "active" || s === "pending";
    });
    if (licenceStatusArr && licenceListByAgreement.length > 0) {
      await confirmer.info({
        title: "Unable to Deactivate Agreement!",
        content: "Status of licence(s) under this Agreement is still active.",
        okText: "Ok",
      });
      return;
    }
    const ok = await confirmer.confirm({
      title: "Deactivate Agreement?",
      content: "Are you sure you want to proceed?",
      okText: "Deactivate",
      okColor: "error",
    });
    if (!ok) return;
    dataObj.agreementStatus = "Deactivate";
    dataObj.agreementUpdateFlag = "Y";
    dataObj.agreementLastUpdatedBy = localStorage.getItem("psid");
    delete dataObj.contractId;
    delete dataObj.key;
    delete dataObj.AGREEMENTEDMSENTIRYID;
    delete dataObj.contractName;
    delete dataObj.licenses;
    delete dataObj.expiryDate;
    delete dataObj.taskStatus;
    delete dataObj.vendorId;
    const res = await startUpdateAgreement(dataObj);
    if (res && res.data) {
      snackbar.success("Agreement deactivation request submitted successfully.");
    }
    dispatch(startGetContracts());
  };

  const handleLicenseDeactivate = async (LicenseData) => {
    const dataObj = { ...LicenseData };
    const datasetListByLicense = (props.datasets || []).filter(
      (ds) => LicenseData.licenseId === ds.licenseId
    );
    delete dataObj.key;
    delete dataObj.id;
    delete dataObj.name;
    delete dataObj.expiryDate;
    delete dataObj.status;
    delete dataObj.taskStatus;
    delete dataObj.LICECONTRACT;
    delete dataObj.datasets;
    delete dataObj.contractId;
    delete dataObj.licenseName;

    const dsStatusArr = datasetListByLicense.find((ds) => {
      const s = (ds.datasetStatus || "").toLowerCase();
      return s === "active" || s === "pending";
    });
    if (dsStatusArr && datasetListByLicense.length > 0) {
      await confirmer.info({
        title: "Unable to deactivate Licence!",
        content: "Status of Dataset(s) under this Licence is still active.",
        okText: "Ok",
      });
      return;
    }
    const ok = await confirmer.confirm({
      title: "Deactivate Licence?",
      content: "Are you sure you want to proceed?",
      okText: "Deactivate",
      okColor: "error",
    });
    if (!ok) return;
    dataObj.licenseStatus = "Deactivate";
    dataObj.licenseUpdateFlag = "Y";
    dataObj.licenseLastUpdatedBy = localStorage.getItem("psid");
    dataObj.isUpdate = true;
    const res = await dispatch(startAddLicense(dataObj));
    if (res && res.data) {
      snackbar.success("Licence deactivation request submitted successfully.");
    }
  };

  // Build the contracts data
  const dataContract = useMemo(() => {
    const out = [];
    if (!props.contracts || !props.contracts[0]) return out;
    props.contracts[0].forEach((ele, i) => {
      if (ele.agreementEdmsEntiryId !== vendorID) return;
      const licenceCount =
        props.licenses
          ? props.licenses.filter(
              (l) => l.licenseAgreementId === ele.agreementId
            ).length
          : 0;
      out.push({
        ...ele,
        key: i,
        contractId: ele.agreementId,
        AGREEMENTEDMSENTIRYID: ele.agreementEdmsEntiryId,
        licenses: licenceCount,
        expiryDate: ele.contractExpDate
          ? dayjs(ele.contractExpDate).format("DD MMM, YYYY")
          : dayjs().format("DD MMM, YYYY"),
        status: ele.contractStatus,
      });
    });
    return out;
  }, [props.contracts, props.licenses, vendorID]);

  const dataLicensesByAgreement = (agreementId) =>
    (props.licenses || [])
      .filter((l) => l.licenseAgreementId === agreementId)
      .map((lic, g) => {
        const datasetCount = (props.datasets || []).filter(
          (ds) => ds.licenseId === lic.licenseId
        ).length;
        return {
          ...lic,
          key: g,
          id: lic.licenseId,
          name: lic.licenseShortName,
          expiryDate: dayjs(lic.licenseExpiryDate).format("DD MMM, YYYY"),
          status: lic.licenseStatus,
          taskStatus: lic.licenseStatus,
          LICECONTRACT: lic.licenseAgreementId,
          datasets: datasetCount,
        };
      });

  const renderLicensesTable = (row) => {
    const data = dataLicensesByAgreement(row.agreementId);
    const columns = [
      {
        accessorKey: "licenseShortName",
        header: "Licence Name",
        size: 220,
        Cell: ({ row: liRow }) => {
          const item = liRow.original;
          const liscShort = checkUrlSlash(item.name);
          const canEdit = (item.licenseUpdateFlag || "").toLowerCase() === "n";
          if (canEdit) {
            return (
              <Link
                to={{
                  pathname: `/masterData/${liscShort}/modifylicense`,
                  state: { vendorId: vendorID, record: item },
                }}
                onClick={() =>
                  localStorage.setItem("agRecord", JSON.stringify(row))
                }
              >
                {item.licenseShortName}
              </Link>
            );
          }
          return (
            <Link to="#" onClick={warning}>
              {item.licenseShortName}
            </Link>
          );
        },
      },
      { accessorKey: "id", header: "Licence ID", size: 240 },
      { accessorKey: "datasets", header: "Datasets", size: 100 },
      {
        accessorKey: "expiryDate",
        header: "Expiration Date",
        size: 160,
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 130,
        Cell: ({ cell }) => {
          const status = cell.getValue();
          if (!status) return null;
          if (greenStatus.includes(status.toLowerCase())) {
            return <Chip size="small" color="success" variant="outlined" label={status} />;
          }
          return <Chip size="small" color="warning" variant="outlined" label={camelText(status)} />;
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableColumnFilter: false,
        size: 220,
        Cell: ({ row: liRow }) => {
          const record = liRow.original;
          const LicenseData = {
            ...record,
            contractId: record.LICECONTRACT,
            licenseId: record.id,
            licenseName: record.name,
            taskStatus:
              record &&
              record.taskStatus &&
              record.taskStatus.toLowerCase() === "draft"
                ? "draft"
                : "pending",
          };
          const status = (LicenseData.licenseStatus || "").toLowerCase();
          const flag = (LicenseData.licenseUpdateFlag || "").toLowerCase();
          const canEdit = (record.licenseUpdateFlag || "").toLowerCase() === "n";
          const liscShort = checkUrlSlash(record.name);

          const menuItems = [
            {
              key: "edit",
              icon: <EditIcon fontSize="small" />,
              label: "Edit",
              ...(canEdit
                ? {
                    // Must carry the record in router state exactly like the
                    // licence-name link — the edit screen prefills from
                    // location.state.record and has no fetch-by-id fallback.
                    to: {
                      pathname: `/masterData/${liscShort}/modifylicense`,
                      state: { vendorId: vendorID, record },
                    },
                    onClick: () =>
                      localStorage.setItem("agRecord", JSON.stringify(row)),
                  }
                : { onClick: warning }),
            },
            status === "active" && flag === "n"
              ? {
                  key: "deactivate",
                  icon: <RemoveCircleIcon fontSize="small" />,
                  label: "Deactivate",
                  danger: true,
                  onClick: () => handleLicenseDeactivate(LicenseData),
                }
              : status === "active" && flag === "y"
              ? {
                  key: "deactivate",
                  icon: <RemoveCircleIcon fontSize="small" />,
                  label: "Deactivate",
                  danger: true,
                  onClick: warning,
                }
              : {
                  key: "deactivate",
                  icon: <RemoveCircleIcon fontSize="small" />,
                  label: "Deactivate",
                  danger: true,
                  disabled: true,
                },
          ];

          return (
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center" }}
              className="row-actions"
            >
              <Button
                variant="text"
                size="small"
                disabled={
                  isDatasetDisabled ||
                  status === "pending" ||
                  status === "inactive"
                }
                onClick={() => {
                  history.push({
                    pathname: `/masterData/${LicenseData.licenseShortName}/dataset`,
                    state: {
                      licence: LicenseData,
                      isUpdate: false,
                      eid: row.agreementEdmsEntiryId,
                    },
                  });
                }}
              >
                Add Dataset
              </Button>
              <ActionsMenu items={menuItems} />
            </Stack>
          );
        },
      },
    ];

    return (
      <Box
        sx={{
          py: 1.5,
          px: 0,
          background: "var(--color-bg-subtle)",
          borderTop: "1px solid var(--color-border-secondary)",
          borderBottom: "1px solid var(--color-border-secondary)",
          width: "100%",
        }}
      >
        <Box sx={{ fontWeight: 600, mb: 1, px: 2 }}>Licences</Box>
        <DataTable
          columns={columns}
          data={data}
          rowKey="key"
          enablePagination={false}
          enableTopToolbar={false}
          enableBottomToolbar={false}
          enableColumnFilters={false}
          enableStickyHeader={false}
          enableColumnActions={false}
          enableColumnResizing={false}
          bordered={false}
          layoutMode="semantic"
          muiTableContainerProps={{ sx: { maxHeight: "none" } }}
          muiTableProps={{ sx: { tableLayout: "auto", width: "100%" } }}
          muiTablePaperProps={{
            sx: {
              borderRadius: 0,
              border: "none",
              boxShadow: "none",
              background: "transparent",
              width: "100%",
            },
          }}
        />
      </Box>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "agreementName",
        header: "Agreement Name",
        size: 240,
        Cell: ({ row }) => {
          const item = row.original;
          if (
            item &&
            item.agreementUpdateFlag &&
            item.agreementUpdateFlag.toLowerCase() === "n"
          ) {
            return (
              <Link
                to={`/masterData/${props.entityName}/modifyAgreement`}
                onClick={() => {
                  localStorage.setItem("agId", item.agreementId);
                  localStorage.setItem(
                    "entityIdInfo",
                    item.agreementEdmsEntiryId
                  );
                }}
                className="agreementname-disp"
              >
                {item.agreementName}
              </Link>
            );
          }
          return (
            <Link
              to={`/masterData/${props.entityName}/modifyAgreement`}
              onClick={warning}
            >
              {item.agreementName}
            </Link>
          );
        },
      },
      { accessorKey: "agreementId", header: "Agreement ID", size: 260 },
      { accessorKey: "licenses", header: "Licences", size: 100 },
      {
        accessorKey: "agreementExpiryDate",
        header: "Expiration Date",
        size: 160,
        sortingFn: (a, b) =>
          new Date(a.original.agreementExpiryDate) -
          new Date(b.original.agreementExpiryDate),
        Cell: ({ cell }) => {
          const v = cell.getValue();
          return v ? dayjs(v).format("DD MMM YYYY") : "No Expiry";
        },
      },
      {
        accessorKey: "agreementStatus",
        header: "Status",
        size: 120,
        filterVariant: "select",
        filterSelectOptions: ["Active", "Pending", "Inactive", "Approved"],
        Cell: ({ cell }) => <StatusChip value={cell.getValue()} />,
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableColumnFilter: false,
        size: 220,
        Cell: ({ row }) => {
          const record = row.original;
          const PassData = {
            ...record,
            contractId: record.contractId,
            contractName: record.contractName,
            vendorId: vendorID,
            taskStatus: "Pending",
            licenses: record.licenses,
            contractStatus: record.contractStatus,
          };
          const licenceButtonDispflag =
            !isLicenceDisabled &&
            record &&
            (record.agreementStatus.toLowerCase() === "active" ||
              record.agreementStatus.toLowerCase() === "planned")
              ? false
              : true;
          const addLicenceAgreementName = checkUrlSlash(record.agreementName);
          const canEdit =
            (PassData.agreementUpdateFlag || "").toLowerCase() === "n";
          const status = (PassData.agreementStatus || "").toLowerCase();
          const flag = (PassData.agreementUpdateFlag || "").toLowerCase();
          const warnDeactivate =
            flag === "y" && (status === "pending" || status === "active");
          const deactivateDisabled =
            status === "inactive" ||
            (flag === "n" && status === "pending") ||
            (flag === "y" && status === "active");

          const menuItems = [
            {
              key: "edit",
              icon: <EditIcon fontSize="small" />,
              label: "Edit",
              ...(canEdit
                ? {
                    to: `/masterData/${props.entityName}/modifyAgreement`,
                    onClick: () => {
                      localStorage.setItem("agId", PassData.agreementId);
                      localStorage.setItem(
                        "entityIdInfo",
                        PassData.agreementEdmsEntiryId
                      );
                    },
                  }
                : { onClick: warning }),
            },
            {
              key: "deactivate",
              icon: <RemoveCircleIcon fontSize="small" />,
              label: "Deactivate",
              danger: true,
              disabled: !warnDeactivate && deactivateDisabled,
              onClick: warnDeactivate
                ? warning
                : () => handleContractDelete(PassData),
            },
          ];

          return (
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center" }}
              className="row-actions"
            >
              <Button
                component={Link}
                variant="text"
                size="small"
                to={`/masterData/${addLicenceAgreementName}/addLicense`}
                onClick={() =>
                  localStorage.setItem("agRecord", JSON.stringify(record))
                }
                disabled={isLicenceDisabled || licenceButtonDispflag}
              >
                Add Licence
              </Button>
              <ActionsMenu
                items={menuItems}
                disabled={isAgreementDisabled}
              />
            </Stack>
          );
        },
      },
    ],
    [
      props.entityName,
      vendorID,
      isLicenceDisabled,
      isAgreementDisabled,
      isDatasetDisabled,
    ]
  );

  return (
    <Box id="main">
      <Box className="dashboard-table">
        <DataTable
          columns={columns}
          data={dataContract}
          rowKey="key"
          initialState={{
            density: "compact",
            pagination: { pageIndex: 0, pageSize: 10 },
          }}
          enableExpanding
          renderDetailPanel={({ row }) => renderLicensesTable(row.original)}
          layoutMode="semantic"
          muiTableProps={{ sx: { tableLayout: "auto", width: "100%" } }}
          muiDetailPanelProps={{ sx: { p: 0, border: 0 } }}
        />
      </Box>
    </Box>
  );
};

const mapStateToProps = (state) => ({
  contracts: state.contract.data,
  licenses: state && state.license && state.license.data && state.license.data[0],
  vendors: state.vendor.list,
  datasets: state.dataset.datasetsInfo,
});

export default connect(mapStateToProps)(memo(VendorData));
