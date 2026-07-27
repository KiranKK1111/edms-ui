import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Card, Divider, Typography } from "@mui/material";
import { JSONTree } from "react-json-tree";
import { XMLParser } from "fast-xml-parser";

import { getMatadataInfo } from "../../store/actions/DatasetPageActions";
import { useThemeMode } from "../../design-system";

const MetadataTab = () => {
  const [data, setData] = useState(null);
  const dispatch = useDispatch();
  const datafeedInfo = useSelector((state) => state.datafeedInfo.datafeedById);
  const feedId =
    datafeedInfo && datafeedInfo.datafeed && datafeedInfo.datafeed.feedId;

  useEffect(() => {
    dispatch(getMatadataInfo(feedId));
  }, [dispatch]);

  const { metadatadetail: metadataInfoDetail } = useSelector(
    (state) => state.datafeedInfo
  );

  const { isDark } = useThemeMode();
  const theme = {
    scheme: "monokai",
    base00: isDark ? "#1d1e21" : "#FFFFFF",
  };

  useEffect(() => {
    if (
      metadataInfoDetail &&
      metadataInfoDetail.data &&
      metadataInfoDetail.data.type === "JSON"
    ) {
      setData(metadataInfoDetail.data.schemaString);
    }
    if (
      metadataInfoDetail &&
      metadataInfoDetail.data &&
      metadataInfoDetail.data.type === "XML"
    ) {
      try {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "",
        });
        const result = parser.parse(metadataInfoDetail.data.schemaString);
        setData(JSON.stringify(result));
      } catch {
        setData("Invalid XML");
      }
    }
  }, [metadataInfoDetail]);

  return (
    <Card sx={{ p: 2 }}>
      <Typography
        component="h3"
        className="content-header"
        sx={{ fontWeight: 700, fontSize: 16 }}
      >
        Schema
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Box>
        {data && data !== "Invalid XML" ? (
          <JSONTree
            data={JSON.parse(data)}
            theme={theme}
            invertTheme={false}
            hideRoot
          />
        ) : data ? (
          data
        ) : (
          "No Schema"
        )}
      </Box>
    </Card>
  );
};

export default MetadataTab;
