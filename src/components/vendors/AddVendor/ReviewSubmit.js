import { useSelector } from "react-redux";
import { Box, Grid, Typography } from "@mui/material";
import { normalText } from "../../stringConversion";

const ReviewSubmit = () => {
  const data = useSelector((state) => state.vendor);

  const keys = Object.keys(data.data || {});
  const idx = keys.indexOf("entityDescription");
  if (idx >= 0) keys.push(keys.splice(idx, 1)[0]);

  return (
    <Box id="main">
      <Grid container spacing={2}>
        {keys.map((item, i) => (
          <Grid
            size={{
              xs: 12,
              sm: item === "entityDescription" ? 12 : 6,
              md: item === "entityDescription" ? 12 : 4,
            }}
            key={i}
          >
            <Typography component="span" className="label-review">
              {normalText(item)
                .replace("Entity Description", "Description")
                .replace("Entity Status", "Status")}{" "}
              :
            </Typography>{" "}
            {data.data[item] ? (
              item === "website" ? (
                <a href={`https://${data.data[item]}`} target="_blank" rel="noreferrer">
                  {data.data[item]}
                </a>
              ) : (
                data.data[item]
              )
            ) : (
              "-"
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReviewSubmit;
