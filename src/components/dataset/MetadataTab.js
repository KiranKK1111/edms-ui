import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Divider, Spin, Col, message } from "antd";
import { getMatadataInfo } from "../../store/actions/DatasetPageActions";
import { JSONTree } from "react-json-tree";
import { parseString } from "xml2js";

const MetadataTab = (props) => {
  const [data, setData] = useState(null);
  const dispatch = useDispatch();
  const datafeedInfo = useSelector((state) => state.datafeedInfo.datafeedById);
  const feedId =
    datafeedInfo && datafeedInfo.datafeed && datafeedInfo.datafeed.feedId;

  useEffect(() => {
    dispatch(getMatadataInfo(feedId));
  }, [dispatch]);

  const { metadatadetail: metadataInfoDetail } = useSelector((state) => state.datafeedInfo);

  const theme = {
    scheme: "monokai",
    base00: "#FFFFFF",
  };

  useEffect(() => {
    if (
      metadataInfoDetail &&
      metadataInfoDetail.data &&
      metadataInfoDetail.data.type === "JSON"
    ) {
      setData(metadataInfoDetail.data.schemaString);
    }
    if (metadataInfoDetail && metadataInfoDetail.data && metadataInfoDetail.data.type === "XML") {
      parseString(
        metadataInfoDetail.data.schemaString,
        { mergeAttrs: true },
        function (err, result) {
          if (err) {
            setData("Invalid XML");
          }
          setData(JSON.stringify(result));
        }
      );
    }
  }, [metadataInfoDetail]);

  return (
    <Card>
      <h3 className="content-header" style={{ fontWeight: "bold" }}>
        Schema
      </h3>
      <Divider />
      {data && data !== "Invalid XML" ? (
        <JSONTree
          data={JSON.parse(data)}
          theme={theme}
          invertTheme={false}
          hideRoot="true"
        />
      ) : data ? (
        data
      ) : (
        "No Schema"
      )}
    </Card>
  );
};

export default MetadataTab;