import {
  InboxOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Form, message, Upload, Button, Input, Select, Row, Col } from "antd";
import axios from "axios";
import "antd/dist/antd.css";
import React, { useState, createRef, useEffect, memo } from "react";
import "./VendorContacts.css";
import { vendorContacts } from "../../store/actions/contractAction";
import { useSelector, useDispatch } from "react-redux";
import { upload } from "../../store/actions/contractAction";
import { bindData } from "./bindData";
import { API_ADD_FILE_URL, FILE_BASE_ENDPOINT } from "../../utils/Config";

const { Dragger } = Upload;
const { Option } = Select;

const UploadContract = (props) => {
  const { formData } = props;
  const dispatch = useDispatch();
  const { pdfOfContract } = props;
  const button = createRef();
  const formRef = createRef();
  const [fileList, updateFileList] = useState([]);
  const reduxData = useSelector((state) => state.contract);

  const errorMessageKey = "upload-pdf-file-error";

  const onFinish = (values) => {
    dispatch(upload(values));
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

  const data = Object.keys(reduxData.upload).length
    ? [reduxData.upload]
    : selectedData;

  useEffect(() => {
    bindData(data, formRef.current);
    
  }, [reduxData]);

  useEffect(() => {
    if (formData) {
      button.current.click();
      props.next(false);
    }
    
  }, [formData]);
  const deleteHandler = async () => {
    const fileName = reduxData.upload[0].name;
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
      dispatch(upload([]));
    } else {
      message.error("Error while deleting");
    }
  };
  let defaultList = {};
  if (reduxData.upload && reduxData.upload.length) {
    defaultList = {
      name: reduxData.upload[0].name,
      uid: "1",
      status: "done",
      url: `${API_ADD_FILE_URL}/${FILE_BASE_ENDPOINT}/download/${reduxData.upload[0].name}`,
    };
  }

  const propsfile = {
    defaultFileList:
      reduxData.upload && reduxData.upload.length ? [defaultList] : null,
    multiple: false,
    showUploadList: {
      showRemoveIcon: true,
      removeIcon: <DeleteOutlined onClick={deleteHandler} />,
    },
    async customRequest({ file, onSuccess }) {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch(
        `${API_ADD_FILE_URL}/${FILE_BASE_ENDPOINT}/upload/file`,
        {
          method: "post",
          body: formData,
        }
      );
      if (response.status === 200) {
        onSuccess(response.url);
        file.url = `${API_ADD_FILE_URL}/${FILE_BASE_ENDPOINT}/download/${file.name}`;
        dispatch(upload([file]));
      }
    },
    beforeUpload: (file, fileList) => {
      if (file.type !== "application/pdf") {
        message.destroy(errorMessageKey);
        message.error({
          content: `${file.name} is not a pdf file`,
          key: errorMessageKey,
        });
        return false;
      } else {
        return file.type === "application/pdf";
      }
    },
  };
  const prefixSelector = (
    <Select defaultValue="https://">
      <Option value="https://">https://</Option>
    </Select>
  );
  return (
    <div>
      <Form ref={formRef} onFinish={onFinish}>
        
        <Row gutter={[78, 0]}>
          <Col span={12}>
            <Form.Item label="URL to Agreement" name="urlToAgreement">
              <Input
                addonBefore={prefixSelector}
                placeholder="Agreement Link"
                name="urlToAgreement"
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item style={{ display: "none" }}>
          <Button htmlType="submit" ref={button}></Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default memo(UploadContract);