import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  dataProtocolById,
  apiRequestParamsAllData,
  apiSourceConfigAllData,
  fileFormatDatabase,
} from "../../../store/actions/SourceConfigActions";
import { normalText } from "../../stringConversion";

// Small read-only table that mirrors the old antd <Table> (title/dataIndex).
const SimpleTable = ({ columns, dataSource }) => (
  <TableContainer component={Paper} variant="outlined" sx={{ mb: "30px" }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          {columns.map((c) => (
            <TableCell key={c.dataIndex} sx={{ fontWeight: 600 }}>
              {c.title}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {dataSource.map((row, i) => (
          <TableRow key={i}>
            {columns.map((c) => (
              <TableCell key={c.dataIndex}>{row[c.dataIndex]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const SourceConfigDetails = (props) => {
  const [protocolData, setProtocolData] = useState({});
  const [requestParams, setRequestParams] = useState([]);
  const [responseConfig, setResponseConfig] = useState([]);
  const [fileFormatData, setFileFormatData] = useState({});
  const params = useParams();
  useEffect(() => {
    const getData = async () => {
      const response = await dataProtocolById(params.id);
      if (!response.message) {
        setProtocolData(response.data);
      }
    };
    getData();
  }, []);
  useEffect(() => {
    const idFromBreadcrumb = params.id;
    const schDatabase = async () => {
      const res = await apiRequestParamsAllData();

      if (!res.message) {
        const idStatus = res.data.apiRequestParams.some(
          (n) => n.licenseId === idFromBreadcrumb
        );

        if (idStatus) {
          const dataToFill = res.data.apiRequestParams.filter(
            (n) => n.licenseId === idFromBreadcrumb
          );
          let finalData = { ...dataToFill[0] };
          const paramType = finalData["paramType"].split(",");
          const parameter = finalData["parameter"].split(",");
          const rank = finalData["rank"].split(",");
          const value = finalData["value"].split(",");

          const finalDataVals = rank.map((n, i) => {
            return {
              paramType: paramType[i],
              parameter: parameter[i],
              rank: n,
              value: value[i],
            };
          });
          setRequestParams(finalDataVals);
        }
      }
    };
    schDatabase();
  }, []);
  useEffect(() => {
    const idFromBreadcrumb = params.id;

    const schDatabase = async () => {
      const res = await apiSourceConfigAllData();
      if (!res.message) {
        const idStatus = res.data.apiResponseConfig.some(
          (n) => n.licenseId === idFromBreadcrumb
        );

        if (idStatus) {
          const dataToFill = res.data.apiResponseConfig.filter(
            (n) => n.licenseId === idFromBreadcrumb
          );
          let finalData = { ...dataToFill[0] };
          const data = finalData["data"].split(",");
          const httpStatusCode = finalData["httpStatusCode"].split(",");
          const error = finalData["error"].split(",");
          const errorMessage = finalData["errorMessage"].split(",");
          const nextAction = finalData["nextAction"].split(",");

          const finalDataVals = nextAction.map((n, i) => {
            return {
              data: data[i],
              httpStatusCode: httpStatusCode[i],
              error: error[i],
              errorMessage: errorMessage[i],
              nextAction: n,
            };
          });
          setResponseConfig(finalDataVals);
        }
      }
    };
    schDatabase();
  }, []);
  useEffect(() => {
    const idFromBreadcrumb = params.id;

    const schDatabase = async () => {
      const res = await fileFormatDatabase();

      if (!res.message) {
        const idStatus = res.data.fileFormatConfig.some(
          (n) => n.licenseId === idFromBreadcrumb
        );

        if (idStatus) {
          const dataToFill = res.data.fileFormatConfig.filter(
            (n) => n.licenseId === idFromBreadcrumb
          );

          let finalData = { ...dataToFill[0] };
          setFileFormatData(finalData);
        }
      }
    };
    schDatabase();
  }, []);

  let dataProtocolFieldInfo = { ...protocolData };
  let dataProtocolKeys = Object.keys(protocolData);
  let ftp;
  let api;

  if (dataProtocolKeys.length > 0) {
    //including protocol ftp sftp in includes not working so using ||
    
    ftp = dataProtocolKeys.filter(
      (n) => n.includes("protocol") || n.includes("ftp", "sftp")
    );
    api = dataProtocolKeys.filter((n) => n.includes("api"));
    ftp.push("useCaseName");
    ftp.unshift("licenseId");
  }

  let dataFormatFieldInfo = { ...fileFormatData };
  const dataFormatKeys = Object.keys(dataFormatFieldInfo);

  let csv;
  let excel;
  let log;
  let protobuf;
  let xml;

  if (dataFormatKeys.length > 0) {
    csv = dataFormatKeys.filter((n) => n.includes("csv"));
    excel = dataFormatKeys.filter((n) => n.includes("excel"));
    log = dataFormatKeys.filter((n) => n.includes("log"));
    protobuf = dataFormatKeys.filter((n) => n.includes("protobuf"));
    xml = dataFormatKeys.filter((n) => n.includes("xml"));
  }

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
    },
    {
      title: "Param Type",
      dataIndex: "paramType",
      width: "30%",
      editable: true,
    },
    {
      title: "Parameter",
      dataIndex: "parameter",
      width: "30%",
      editable: true,
    },
    {
      title: "Value",
      dataIndex: "value",
      width: "30%",
      editable: true,
    },
  ];
  const columns1 = [
    {
      title: "http Status Code",
      dataIndex: "httpStatusCode",
      width: "20%",
      editable: true,
    },
    {
      title: "Data",
      dataIndex: "data",
      width: "20%",
      editable: true,
    },
    {
      title: "Error",
      dataIndex: "error",
      width: "20%",
      editable: true,
    },
    {
      title: "Error Message",
      dataIndex: "errorMessage",
      width: "20%",
      editable: true,
    },
    {
      title: "Next Action",
      dataIndex: "nextAction",
      width: "20%",
      editable: true,
    },
  ];

  return (
    <div>
      <div className="content-area">
        <div className="content-wrapper">
          <div className="review-submit">
            <h3 style={{ paddingBottom: "0px" }}>Data Protocol</h3>
            <Divider textAlign="center" sx={{ my: 1 }}>
              <strong style={{ fontSize: "13px" }}>Ftp & Sftp</strong>
            </Divider>
            <Grid container spacing={2}>
              {dataProtocolKeys.length > 0 &&
                ftp.map((item, i) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                    <span className="label-review">
                      {normalText(item)
                        .replace("Ftps Mode", "FTPS Mode")
                        .replace(
                          "Ftps Data Channel Protection Level",

                          "FTPS Data Channel Protection Level"
                        )
                        .replace("Records", "(Records)")
                        .replace(
                          "Use Client Certificate For",
                          "Use Client Certificate For FTPS"
                        )
                        .replace("Ftp", "")
                        .replace("Sftp", "")
                        .replace("Ftps", "")
                        .replace("Ms", "(Ms)")
                        .replace("Protocol", "Source Protocol")}
                      :
                    </span>
                    {dataProtocolFieldInfo[item]}
                  </Grid>
                ))}
            </Grid>
            <Divider textAlign="center" sx={{ my: 1 }}>
              <strong style={{ fontSize: "13px" }}>Api</strong>
            </Divider>
            <Grid container spacing={2}>
              {dataProtocolKeys.length > 0 &&
                api.map((item, i) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                    <span className="label-review">
                      {normalText(item).replace("Api", "")}:
                    </span>
                    {dataProtocolFieldInfo[item]}
                  </Grid>
                ))}
            </Grid>
            <Divider sx={{ my: 1 }} />
            {requestParams.length > 0 && (
              <>
                <h3>API Request Params</h3>
                <SimpleTable dataSource={requestParams} columns={columns} />
              </>
            )}
            {responseConfig.length > 0 && (
              <>
                <h3>API Response Config</h3>
                <SimpleTable dataSource={responseConfig} columns={columns1} />
              </>
            )}
            {dataFormatKeys.length > 0 && (
              <>
                <h3 style={{ paddingBottom: "0px" }}>Data Format</h3>
                <Divider textAlign="center" sx={{ my: 1 }}>
                  <strong style={{ fontSize: "13px" }}>CSV</strong>
                </Divider>
                <Grid container spacing={2}>
                  {csv.map((item, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                      <span className="label-review">
                        {normalText(item)
                          .replace("Csv", "")
                          .replace("Compressed Dir", "Compressed Directory")
                          .replace("Control Char", "Control Characters")
                          .replace("Escape Char", "Escape Character")
                          .replace("Quote Char", "Quote Character")
                          .replace(
                            "Pattern Compressed",
                            "Pattern Within Compressed"
                          )}
                        :
                      </span>
                      {dataFormatFieldInfo[item]}
                    </Grid>
                  ))}
                </Grid>
                <Divider textAlign="center" sx={{ my: 1 }}>
                  <strong style={{ fontSize: "13px" }}>Excel</strong>
                </Divider>
                <Grid container spacing={2}>
                  {excel.map((item, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                      <span className="label-review">
                        {normalText(item)
                          .replace("Excel", "")
                          .replace(
                            "File Name Pattern Compressed Dir",
                            "File Name Pattern Compressed Directory"
                          )

                          .replace(
                            "Pattern Compressed",
                            "Pattern Within Compressed"
                          )

                          .replace("Control Char", "Control Characters")}
                        :
                      </span>
                      {dataFormatFieldInfo[item]}
                    </Grid>
                  ))}
                </Grid>
                <Divider textAlign="center" sx={{ my: 1 }}>
                  <strong style={{ fontSize: "13px" }}>Log</strong>
                </Divider>
                <Grid container spacing={2}>
                  {log.map((item, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                      <span className="label-review">
                        {normalText(item)
                          .replace("Log", "")
                          .replace(
                            "File Name Pattern Compressed Dir",
                            "File Name Pattern Compressed Directory"
                          )

                          .replace(
                            "Pattern Compressed",
                            "Pattern Within Compressed"
                          )

                          .replace("Control Char", "Control Characters")}
                        :
                      </span>
                      {dataFormatFieldInfo[item]}
                    </Grid>
                  ))}
                </Grid>
                <Divider textAlign="center" sx={{ my: 1 }}>
                  <strong style={{ fontSize: "13px" }}>Protobuf</strong>
                </Divider>
                <Grid container spacing={2}>
                  {protobuf.map((item, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                      <span className="label-review">
                        {normalText(item)
                          .replace("Protobuf", "")
                          .replace(
                            "File Name Pattern Compressed Dir",
                            "File Name Pattern Compressed Directory"
                          )

                          .replace(
                            "Pattern Compressed",
                            "Pattern Within Compressed"
                          )}
                        :
                      </span>
                      {dataFormatFieldInfo[item]}
                    </Grid>
                  ))}
                </Grid>
                <Divider textAlign="center" sx={{ my: 1 }}>
                  <strong style={{ fontSize: "13px" }}>Xml</strong>
                </Divider>
                <Grid container spacing={2}>
                  {xml.map((item, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                      <span className="label-review">
                        {normalText(item)
                          .replace("Xml", "")
                          .replace(
                            "File Name Pattern Compressed Dir",
                            "File Name Pattern Compressed Directory"
                          )
                          .replace(
                            "Pattern Compressed",
                            "Pattern Within Compressed"
                          )

                          .replace("Control Char", "Control Characters")}
                        :
                      </span>
                      {dataFormatFieldInfo[item]}
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SourceConfigDetails;