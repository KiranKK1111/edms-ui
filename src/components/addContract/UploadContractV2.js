import React, { useEffect, useMemo, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { FormField } from "../../design-system";
import { toast as message } from "../../design-system/toast";
import "./VendorContacts.css";
import { upload } from "../../store/actions/contractAction";
import { bindData } from "./bindData";
import { API_ADD_FILE_URL, FILE_BASE_ENDPOINT } from "../../utils/Config";

const UploadContract = (props) => {
  const { formData } = props;
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.contract);

  const { control, setValue, getValues, reset, trigger } = useForm({
    defaultValues: {
      urlToAgreement: "",
    },
    mode: "onChange",
  });

  // Adapter exposing the antd form API expected by the shared bindData helper.
  const formApi = useMemo(
    () => ({
      setFieldsValue: (obj) =>
        Object.keys(obj).forEach((k) => setValue(k, obj[k])),
      getFieldValue: (name) => getValues(name),
      getFieldsValue: () => getValues(),
      resetFields: () => reset(),
    }),
    [setValue, getValues, reset]
  );

  // The upload slice is a single object { urlToAgreement, fileName } — the
  // uploaded file's name must survive Next/Previous round trips alongside the
  // URL field (an array-of-File shape here used to be overwritten on Next).
  // The legacy array-of-file shape is still read for backward compatibility.
  const uploadedFileName =
    (Array.isArray(reduxData.upload)
      ? reduxData.upload[0] && reduxData.upload[0].name
      : reduxData.upload && reduxData.upload.fileName) || "";

  const onFinish = (values) => {
    dispatch(upload({ ...values, fileName: uploadedFileName }));
    props.next(true);
  };

  let selectedData = [];

  if (reduxData.selectedContract.length) {
    selectedData = [
      {
        urlToAgreement: reduxData.selectedContract[0].agreementLink,
      },
    ];
  }

  const data =
    !Array.isArray(reduxData.upload) && Object.keys(reduxData.upload).length
      ? [reduxData.upload]
      : selectedData;

  useEffect(() => {
    bindData(data, formApi);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxData]);

  useEffect(() => {
    if (formData) {
      trigger().then((ok) => {
        if (ok) onFinish(getValues());
      });
      props.next(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Let the controller persist the current (unvalidated) input when Previous
  // is clicked, so the URL and the uploaded file's name are not lost.
  useEffect(() => {
    if (!props.registerDraftSaver) return;
    props.registerDraftSaver(() =>
      dispatch(upload({ ...getValues(), fileName: uploadedFileName }))
    );
    return () => props.registerDraftSaver(null);
  });

  const deleteHandler = async () => {
    const fileName = uploadedFileName;
    let raw = JSON.stringify({ fileName: `${fileName}` });
    const res = await fetch(
      `${API_ADD_FILE_URL}/${FILE_BASE_ENDPOINT}/delete`,
      {
        method: "DELETE",
        body: raw,
        redirect: "follow",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (res.status === 200) {
      message.success("File deleted successfully");
      dispatch(upload({ urlToAgreement: getValues("urlToAgreement") }));
    } else {
      message.error("Error while deleting");
    }
  };

  // Replaces antd Upload beforeUpload — only PDF files are accepted.
  const beforeUpload = (file) => {
    if (file.type !== "application/pdf") {
      message.error(`${file.name} is not a pdf file`);
      return false;
    }
    return file.type === "application/pdf";
  };

  // Replaces antd Upload customRequest — push the file then store it in redux.
  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!beforeUpload(file)) {
      e.target.value = "";
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    const response = await fetch(
      `${API_ADD_FILE_URL}/${FILE_BASE_ENDPOINT}/upload/file`,
      {
        method: "post",
        body: fd,
      }
    );
    if (response.status === 200) {
      dispatch(
        upload({
          urlToAgreement: getValues("urlToAgreement"),
          fileName: file.name,
        })
      );
    }
    e.target.value = "";
  };

  const hasFile = !!uploadedFileName;
  const uploadedName = uploadedFileName;
  const uploadedUrl = hasFile
    ? `${API_ADD_FILE_URL}/${FILE_BASE_ENDPOINT}/download/${uploadedFileName}`
    : "";

  const prefixSelector = (
    <Select
      value="https://"
      variant="standard"
      disableUnderline
      sx={{ "& .MuiSelect-select": { py: 0 } }}
    >
      <MenuItem value="https://">https://</MenuItem>
    </Select>
  );

  return (
    <div>
      <Box component="form" noValidate>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormField
              name="urlToAgreement"
              label="URL to Agreement"
              control={control}
              placeholder="Agreement Link"
              startAdornment={
                <InputAdornment position="start">
                  {prefixSelector}
                </InputAdornment>
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Click to Upload
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </Button>
            {hasFile ? (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mt: 1 }}
              >
                <Link href={uploadedUrl} target="_blank" rel="noreferrer">
                  {uploadedName}
                </Link>
                <IconButton
                  size="small"
                  aria-label="delete"
                  onClick={deleteHandler}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : null}
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default memo(UploadContract);
