import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  RemoveCircleOutlined as RemoveCircleOutlineIcon,
  MoreHoriz as MoreHorizIcon,
} from "@mui/icons-material";

import { DataTable, PageHero, useConfirm, useSnackbar } from "../../design-system";
import { getPageConfig } from "../../config/pageConfig";
import {
  getAllSubscriptionDataList,
  getAllDataOwner,
} from "../../store/actions/SubscriptionDataActions";
import { unsubscribe } from "../../store/actions/requestAccessActions";
import { camelText } from "../../components/stringConversion";
import { checkForString } from "../../utils/warningUtils";
import { DATASET_DELEGATE } from "../../utils/Constants";
import dayjs from "../../design-system/dayjs";

import "./subscriptionData.css";

export const getData = (list, feedId, type) => {
  if (list && list.length > 0) {
    const index = list.findIndex(
      (item) => item && item.feedId && item.feedId === feedId
    );
    return list && list[index] && list[index][type] ? list[index][type] : null;
  }
};

export const updateSubscription = (subscription) => {
  subscription.subscriptionStatus = "Inactive";
  subscription.lastUpdatedBy = localStorage.getItem("psid");
  subscription.roleName = localStorage.getItem("currentUserRole");
  delete subscription.dataOwner;
  delete subscription.datafeedName;
  return subscription;
};

const greenStatus = ["approved", "live", "active", "setup"];

const StatusChip = ({ value }) => {
  if (!value) return null;
  const v = value.toLowerCase();
  if (greenStatus.includes(v)) {
    return <Chip label={value} size="small" color="success" variant="outlined" />;
  }
  if (v === "pending") {
    return <Chip label={value} size="small" color="warning" variant="outlined" />;
  }
  return (
    <Chip
      label={camelText(value)}
      size="small"
      color="error"
      variant="outlined"
    />
  );
};

const RowActionsMenu = ({ subscription, onUnsubscribe }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const allowed = checkForString("currentUserRole", DATASET_DELEGATE);

  const status = (subscription.subscriptionStatus || "").toLowerCase();
  const unsubscribeDisabled =
    !greenStatus.includes(status) && status !== "pending";

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Button
        size="small"
        variant="text"
        endIcon={<MoreHorizIcon />}
        onClick={handleClick}
        disabled={!allowed}
      >
        More
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleClose();
          }}
          sx={{ gap: 1, color: "primary.main" }}
        >
          <EditIcon fontSize="small" /> Edit
        </MenuItem>
        <MenuItem
          disabled={unsubscribeDisabled}
          onClick={() => {
            handleClose();
            onUnsubscribe(subscription);
          }}
          sx={{ gap: 1, color: "error.main" }}
        >
          <RemoveCircleOutlineIcon fontSize="small" /> Unsubscribe
        </MenuItem>
      </Menu>
    </>
  );
};

const SubscriptionManagement = () => {
  const subscriptionsPage = getPageConfig("subscriptions");
  const breadcrumb = subscriptionsPage.breadcrumb;
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const dispatch = useDispatch();
  const history = useHistory();
  const confirmer = useConfirm();
  const snackbar = useSnackbar();

  const getSubscriptionDataList = async () => {
    const res = await dispatch(getAllSubscriptionDataList());
    const dataOwners = await dispatch(getAllDataOwner());
    if (res && res.subscriptions) {
      res.subscriptions = res.subscriptions.map((subscription) => {
        const result = { ...subscription };
        result.dataOwner = getData(
          dataOwners.agreementMgrBankIds,
          subscription.dataFeedId,
          "agreementScbAgreementMgrBankId"
        );
        result.datafeedName = getData(
          dataOwners.agreementMgrBankIds,
          subscription.dataFeedId,
          "datafeedShortName"
        );
        return result;
      });
      return { subscriptions: res.subscriptions };
    }
    return undefined;
  };

  const generate = () => {
    let isMounted = true;
    setLoading(true);
    getSubscriptionDataList().then((data) => {
      if (!isMounted) return;
      setList(
        data && data.subscriptions && data.subscriptions.length > 0
          ? data.subscriptions
          : []
      );
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    return generate();
  }, []);

  const handleSubscriptionDeactivation = async (subscription) => {
    if (subscription.subscriptionUpdateFlag === "N") {
      const ok = await confirmer.confirm({
        title: "Unsubscribe from Data Feed?",
        content:
          "This will revoke Subscriber's access to Data Feed. Are you sure you want to proceed?",
        okText: "Unsubscribe",
        okColor: "error",
      });
      if (!ok) return;
      const res = await unsubscribe(updateSubscription(subscription));
      if (
        res &&
        res.data &&
        res.data.statusMessage &&
        res.data.statusMessage.code == 200
      ) {
        snackbar.success("Unsubscribe request submitted successfully");
      }
      generate();
    } else {
      await confirmer.info({
        title: "An unsubscribe request for this Data Feed is already pending approval",
        content: "The details remain unchanged until your request is approved.",
        okText: "Ok",
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "requester",
        header: "Requestor",
        size: 140,
      },
      {
        accessorKey: "subscriptionType",
        header: "Subscription type",
        size: 200,
        filterVariant: "select",
        filterSelectOptions: [
          { value: "Individual Subscription", label: "Individual Subscription" },
          { value: "Application Subscription", label: "Application Subscription" },
        ],
      },
      {
        accessorKey: "subscriber",
        header: "Subscriber",
        size: 140,
      },
      {
        accessorKey: "dataFeedId",
        header: "Data Feed ID",
        size: 220,
      },
      {
        accessorKey: "datafeedName",
        header: "Data Feed name",
        size: 200,
      },
      {
        accessorKey: "licensesSubscribed",
        header: "Number of Licences",
        size: 170,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
      },
      {
        accessorKey: "subscriptionStatus",
        header: "Status",
        size: 130,
        filterVariant: "select",
        filterSelectOptions: [
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Inactive" },
          { value: "Pending", label: "Pending" },
        ],
        Cell: ({ cell }) => <StatusChip value={cell.getValue()} />,
      },
      {
        accessorKey: "createdOn",
        header: "Created on",
        size: 140,
        sortingFn: (rowA, rowB) =>
          new Date(rowA.original.createdOn) - new Date(rowB.original.createdOn),
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return (
            <span className="expDate-styling">
              {value ? dayjs(value).format("DD MMM YYYY") : "No Expiry"}
            </span>
          );
        },
      },
      {
        accessorKey: "dataOwner",
        header: "Data Owner",
        size: 150,
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableColumnFilter: false,
        enableColumnActions: false,
        size: 110,
        Cell: ({ row }) => (
          <RowActionsMenu
            subscription={row.original}
            onUnsubscribe={handleSubscriptionDeactivation}
          />
        ),
      },
    ],
    []
  );

  return (
    <div className="subscriptions-page">
      <div className="panel-top">
        <PageHero
          breadcrumb={breadcrumb}
          title={subscriptionsPage.title}
          subtitle={subscriptionsPage.subtitle}
          backTo={subscriptionsPage.backTo}
          badge={subscriptionsPage.badge}
        />
      </div>

      <div className="content-area">
        <div className="content-wrapper">
          <Box
            className="header-utlis"
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <Typography
              component="h3"
              sx={{ fontSize: 16, fontWeight: 600, color: "text.primary", m: 0 }}
            >
              Subscriptions ({list ? list.length : 0})
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />

          <div className="dashboard-table">
            {loading ? (
              <div className="subscriptions-loader">
                <CircularProgress size={40} />
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={list}
                rowKey="subscriptionId"
                initialState={{
                  density: "compact",
                  sorting: [{ id: "createdOn", desc: true }],
                }}
                emptyState={{ title: "No Subscriptions" }}
                muiTableContainerProps={{ sx: { maxHeight: "none" } }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(SubscriptionManagement);
