import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  AttachFile as PaperClipIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

import { DataTable, useSnackbar } from "../../design-system";
import { fetchUrlsInfo } from "../../store/actions/DatasetPageActions";
import {
  startGetAllDocuments,
  startDownloadDocument,
} from "../../store/actions/datafeedAction";

const DocumentationTab = (props) => {
  const [taskStatus, setTaskStatus] = useState("pending");
  const { data } = useSelector((state) => state.dataset.subscriptionInfo);
  const dispatch = useDispatch();
  const snackbar = useSnackbar();
  const reduxData = useSelector((state) => state.fileUpload);
  const [fileLists, setFileLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const catalogueObj = props.catalogueObj;

  const getDocuments = async () => {
    await dispatch(startGetAllDocuments());
  };

  useEffect(() => {
    const listsOfFiles = reduxData.fileLists.documentList || [];
    const filtered = listsOfFiles.filter(
      (item) =>
        item.docObjectId === catalogueObj.datasetId ||
        item.docObjectId === catalogueObj.dataFeedId
    );
    setFileLists(
      filtered.sort(
        (a, b) => new Date(b.docUpdatedOn) - new Date(a.docUpdatedOn)
      )
    );
  }, [reduxData.fileLists]);

  useEffect(() => {
    getDocuments();
  }, []);

  const downloadFiles = async (record) => {
    setLoading(true);
    const res = await dispatch(
      startDownloadDocument(record.docDisplayFilename, record.docDid)
    );
    if (res && res.includes("Successfully")) {
      snackbar.success(res);
    } else {
      snackbar.error(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    const run = async () => {
      const keys = Object.keys(data);
      const tStatus = data.taskStatus && data.taskStatus.toLowerCase();
      setTaskStatus(tStatus);
      if (keys.length > 0 && taskStatus === "approved") {
        await dispatch(fetchUrlsInfo(data.subscriptionId));
      }
      setLoading(false);
    };
    run();
  }, [dispatch, data, taskStatus]);

  const columns = [
    {
      accessorKey: "docObjectType",
      header: "Object",
      size: 120,
    },
    {
      accessorKey: "docDisplayFilename",
      header: "Document name",
      size: 360,
      Cell: ({ row, cell }) => {
        const record = row.original;
        const text = cell.getValue();
        const isHttp =
          record.docDisplayFilename &&
          record.docDisplayFilename.includes("http");
        return (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {!isHttp ? (
              <>
                <PaperClipIcon fontSize="small" />
                <Button
                  variant="text"
                  size="small"
                  className="link-button talign"
                  onClick={() => downloadFiles(record)}
                >
                  <strong>{record.docTitle}</strong>
                </Button>
              </>
            ) : (
              <>
                <LinkIcon fontSize="small" />
                <Link to={{ pathname: text }} target="_blank" rel="noreferrer">
                  {record.docTitle}
                </Link>
              </>
            )}
          </Stack>
        );
      },
    },
    {
      accessorKey: "docDescription",
      header: "Description",
      size: 480,
    },
    {
      accessorKey: "docUpdatedOn",
      header: "Updated on",
      size: 140,
      Cell: ({ cell }) =>
        cell.getValue() ? dayjs(cell.getValue()).format("DD MMM YYYY") : "",
    },
  ];

  return (
    <Box id="main">
      {loading ? (
        <Box sx={{ width: "100%", textAlign: "center", py: 8 }}>
          <CircularProgress size={48} />
        </Box>
      ) : (
        <Card sx={{ p: 2 }}>
          <Typography
            component="h3"
            className="content-header"
            sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}
          >
            Documentation
          </Typography>
          <DataTable
            columns={columns}
            data={fileLists}
            initialState={{
              density: "compact",
              pagination: { pageIndex: 0, pageSize: 5 },
            }}
          />
        </Card>
      )}
    </Box>
  );
};

export default DocumentationTab;
