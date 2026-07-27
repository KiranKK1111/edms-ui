import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import "../../common.css";
import "./CatalogPage.css";

import Catalog from "../../components/catalog/Catalog";
import { EmptyState, PageHero, useSnackbar } from "../../design-system";
import { getPageConfig } from "../../config/pageConfig";
import { newCataloguePageData } from "../../store/actions/CatalogPageActions";
import { selectCatalogueState } from "../../store/selectors";

import { startGetVendors } from "../../store/actions/VendorActions";
import isButtonObject from "../../utils/accessButtonCheck";
import {
  CATELOG_MANAGEMENT_PAGE,
  CATELOG_MANAGEMENT_FILTER_BTN,
  SUBSCRIBER,
} from "../../utils/Constants";
import { checkForString } from "../../utils/warningUtils";

const initialFilters = {
  datafeeds: "",
  datasource: "",
  datafeedStatus: "",
};

const CatalogPage = () => {
  const [searchWord, setSearchWord] = useState("");
  const [catalogueNewList, setCatalogueNewList] = useState({
    loading: false,
    catalogueList: [],
  });

  const [filterValues, setFilterValues] = useState(initialFilters);
  const [filterShown, setFilterShown] = useState(false);
  const [datasourceList, setDatasourceList] = useState([]);
  const [feedStatus, setFeedStatus] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const dispatch = useDispatch();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const getEntityData = useCallback(async () => {
    await dispatch(startGetVendors(true));
  }, [dispatch]);

  useEffect(() => {
    dispatch(newCataloguePageData());
    const loggedUser = localStorage.getItem("entitlementType");
    const loginedRoleName =
      loggedUser && loggedUser.toString().toLocaleLowerCase();
    if (
      loginedRoleName === "dataset delegate" ||
      loginedRoleName === "dataset owner" ||
      loginedRoleName === "read only" ||
      loginedRoleName === "iam admin"
    ) {
      getEntityData();
    }
  }, [dispatch, getEntityData]);

  const catalogueList = useSelector(selectCatalogueState) || {};
  useEffect(() => {
    setCatalogueNewList(catalogueList);
  }, [catalogueList]);

  const onFilterButtonClick = useCallback(() => {
    setFilterShown((prev) => !prev);
  }, []);

  const applyFilters = useCallback(
    (obj) => {
      const advancedFilter =
        catalogueList &&
        catalogueList.catalogueList &&
        catalogueList.catalogueList.filter((v) => {
          let filterResponse = true;
          if (filterResponse && obj.datasource) {
            filterResponse = obj.datasource === v.entityShortName;
          }
          if (
            filterResponse &&
            obj &&
            obj.datafeedStatus &&
            v &&
            v.dataFeedStatus
          ) {
            filterResponse =
              obj.datafeedStatus.toLowerCase() ===
              v.dataFeedStatus.toLowerCase();
          }
          if (filterResponse && !obj.datafeeds) {
            return filterResponse;
          }
          if (filterResponse && obj.datafeeds === "subscribed") {
            return (filterResponse = v.subscription);
          }
          if (filterResponse && obj.datafeeds !== "subscribed") {
            return (filterResponse = !v.subscription);
          }
          return filterResponse;
        });

      setCatalogueNewList((prev) => ({
        ...prev,
        catalogueList: advancedFilter,
      }));
    },
    [catalogueList]
  );

  const filter = useCallback(() => {
    applyFilters(filterValues);
    if (isMobile) setFilterShown(false);
  }, [applyFilters, filterValues, isMobile]);

  const onReset = useCallback(() => {
    setFilterValues(initialFilters);
    applyFilters(initialFilters);
  }, [applyFilters]);

  const setFilterField = (field) => (event) => {
    const value = event && event.target ? event.target.value : event;
    setFilterValues((prev) => ({ ...prev, [field]: value ?? "" }));
  };

  const setDatafeedsToggle = (_, value) => {
    setFilterValues((prev) => ({ ...prev, datafeeds: value || "" }));
  };

  const guestRole = localStorage.getItem("guestRole");

  const getList = useCallback(
    (value) => {
      const list = (catalogueList.catalogueList || []).map((item) => item[value]);
      return [...new Set(list)];
    },
    [catalogueList.catalogueList]
  );

  const getListStatus = useCallback(
    (value) => {
      const list = (catalogueList.catalogueList || []).map(
        (item) =>
          item[value] &&
          item[value].replace(/(^\w{1})|(\s{1}\w{1})/g, (m) => m.toUpperCase())
      );
      const out = [];
      list &&
        list.forEach((item = "inactive") => {
          if (item.toLowerCase() === "inactive") out.push("Inactive");
          else out.push(item);
        });
      return [...new Set(out)];
    },
    [catalogueList.catalogueList]
  );

  useEffect(() => {
    if (catalogueList && catalogueList.catalogueList) {
      setDatasourceList(getList("entityShortName"));
      setFeedStatus(getListStatus("dataFeedStatus"));
    }
  }, [catalogueList.catalogueList, getList, getListStatus]);

  const filterMenuProps = {
    anchorOrigin: { vertical: "bottom", horizontal: "left" },
    transformOrigin: { vertical: "top", horizontal: "left" },
    slotProps: {
      paper: {
        sx: {
          mt: 0.5,
          minHeight: 120,
          maxHeight: 280,
          overflowY: "auto",
        },
      },
    },
  };

  const filterForm = (
    <Box className="catalog-filters-drawer" sx={{ p: 2 }}>
      <Box className="catalog-filters-row">
        <Box className="catalog-filter-field catalog-filter-segmented">
          <Typography component="div" sx={{ fontWeight: 600, fontSize: 13, mb: 0.5 }}>
            Data Feeds
          </Typography>
          <ToggleButtonGroup
            size="small"
            color="primary"
            exclusive
            value={filterValues.datafeeds}
            onChange={setDatafeedsToggle}
            disabled={!!guestRole}
          >
            <ToggleButton value="">All</ToggleButton>
            <ToggleButton value="subscribed">Subscribed</ToggleButton>
            <ToggleButton value="unsubscribed">Unsubscribed</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <FormControl className="catalog-filter-field" size="small" fullWidth>
          <InputLabel id="ds-filter-datasource-label">Data Source</InputLabel>
          <Select
            labelId="ds-filter-datasource-label"
            label="Data Source"
            value={filterValues.datasource}
            onChange={setFilterField("datasource")}
            MenuProps={filterMenuProps}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {datasourceList.map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl className="catalog-filter-field" size="small" fullWidth>
          <InputLabel id="ds-filter-status-label">Data Feed Status</InputLabel>
          <Select
            labelId="ds-filter-status-label"
            label="Data Feed Status"
            value={filterValues.datafeedStatus}
            onChange={setFilterField("datafeedStatus")}
            MenuProps={filterMenuProps}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {feedStatus.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box className="catalog-filter-actions" sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button onClick={onReset} variant="outlined" size="small">
            Reset
          </Button>
          <Button onClick={filter} variant="contained" size="small">
            Apply
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const revisedCatalogueList = useMemo(() => {
    if (
      !catalogueNewList ||
      !catalogueNewList.catalogueList ||
      catalogueNewList.catalogueList.length === 0
    ) {
      return [];
    }
    return catalogueNewList.catalogueList.filter(
      (catalogue) =>
        catalogue.dataFeedStatus &&
        catalogue.dataFeedStatus.toLowerCase() !== "deleted"
    );
  }, [catalogueNewList]);

  const catalogueCount = revisedCatalogueList.length;

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(catalogueCount / pageSize));
    if (currentPage > totalPages) setCurrentPage(1);
  }, [catalogueCount, pageSize, currentPage]);

  let catalogListDisplay;
  let catalogPagination = null;
  if (catalogueNewList.loading) {
    catalogListDisplay = (
      <div className="catalog-state-center">
        <CircularProgress size={40} />
      </div>
    );
  } else if (revisedCatalogueList.length > 0) {
    const startIdx = (currentPage - 1) * pageSize;
    const pagedList = revisedCatalogueList.slice(startIdx, startIdx + pageSize);
    catalogListDisplay = (
      <div className="catalog-grid-wrap">
        <div className="catalog-grid">
          {pagedList.map((d) => (
            <Catalog
              key={d.dataFeedId || `${d.entityShortName}-${d.dataFeedShortName}`}
              catalogueInfo={d}
            />
          ))}
        </div>
      </div>
    );
    if (revisedCatalogueList.length > pageSize) {
      catalogPagination = (
        <Box
          className="catalog-pagination"
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="page-size-label">Page size</InputLabel>
            <Select
              labelId="page-size-label"
              label="Page size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <MenuItem value={12}>12</MenuItem>
              <MenuItem value={24}>24</MenuItem>
              <MenuItem value={48}>48</MenuItem>
            </Select>
          </FormControl>
          <Pagination
            count={Math.ceil(revisedCatalogueList.length / pageSize)}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            size="small"
            showFirstButton
            showLastButton
          />
        </Box>
      );
    }
  } else if (
    catalogueNewList.catalogueList &&
    catalogueNewList.catalogueList.length === 0
  ) {
    catalogListDisplay = (
      <div className="catalog-state-center">
        <EmptyState
          title="No data feeds found"
          description="Try adjusting your search or filters to find what you need."
          variant="search"
        />
      </div>
    );
  } else {
    catalogListDisplay = (
      <div className="catalog-state-center">
        <CircularProgress size={40} />
      </div>
    );
  }

  const searchByWordFn = useCallback(
    (word) => {
      const searchText = word.toLowerCase().trim();
      const revisedList =
        catalogueList &&
        catalogueList.catalogueList &&
        catalogueList.catalogueList.filter(
          (u) =>
            (u.entityShortName && u.entityShortName.toLowerCase().includes(searchText)) ||
            (u.datasetShortName && u.datasetShortName.toLowerCase().includes(searchText)) ||
            (u.dataFeedLongName && u.dataFeedLongName.toLowerCase().includes(searchText)) ||
            (u.dataFeedDescription && u.dataFeedDescription.toLowerCase().includes(searchText)) ||
            (u.dataFeedId && u.dataFeedId.toLowerCase().includes(searchText)) ||
            (u.dataFeedShortName && u.dataFeedShortName.toLowerCase().includes(searchText))
        );
      setCatalogueNewList((prev) => ({
        ...prev,
        catalogueList: revisedList,
      }));
    },
    [catalogueList]
  );

  useEffect(() => {
    if (searchWord) {
      const t = setTimeout(() => {
        searchByWordFn(searchWord);
      }, 500);
      return () => clearTimeout(t);
    }
    setCatalogueNewList(catalogueList);
  }, [searchWord, catalogueList, searchByWordFn]);

  const wordSearchHandler = (e) => {
    setSearchWord(e.target.value);
  };

  const isFilterButton = isButtonObject(
    CATELOG_MANAGEMENT_PAGE,
    CATELOG_MANAGEMENT_FILTER_BTN
  );

  const handleCopyToken = () => {
    navigator.clipboard.writeText(localStorage.getItem("access_token") || "");
    snackbar.success("Access Token Copied Successfully!");
  };

  const cataloguePage = getPageConfig("catalogue");

  return (
    <div className="catalog-page" id="main">
      <Box className="catalog-page-bg">
        <div className="catalog-shell">
          <div className="catalog-fixed">
            <PageHero
              breadcrumb={cataloguePage.breadcrumb}
              title={cataloguePage.title}
              subtitle={cataloguePage.subtitle}
              badge={cataloguePage.badge}
              actions={
                <div className="catalog-hero-actions">
                  <Button
                    startIcon={<FilterIcon />}
                    variant="outlined"
                    onClick={onFilterButtonClick}
                    disabled={!guestRole && isFilterButton}
                    id="btn-filter"
                  >
                    Filters
                  </Button>
                  <Button
                    onClick={() => setTokenDialogOpen(true)}
                    className="btn-token1"
                    variant="contained"
                    disabled={!checkForString("entitlementType", SUBSCRIBER)}
                  >
                    Access Token
                  </Button>
                </div>
              }
            >
              <div
                className={
                  !isMobile && filterShown
                    ? "catalog-hero-search is-filtering"
                    : "catalog-hero-search"
                }
              >
                <TextField
                  name="searchText"
                  size="small"
                  fullWidth
                  value={searchWord || ""}
                  onChange={wordSearchHandler}
                  placeholder="Search data feeds, datasets, or data sources..."
                  disabled={!guestRole && isFilterButton}
                  className="catalog-hero-input"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: searchWord ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            aria-label="Clear search"
                            onClick={() => setSearchWord("")}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                />

                {!isMobile && filterShown && (
                  <div className="catalog-inline-filters">
                    <ToggleButtonGroup
                      size="small"
                      color="primary"
                      exclusive
                      value={filterValues.datafeeds}
                      onChange={setDatafeedsToggle}
                      disabled={!!guestRole}
                      className="catalog-inline-toggle"
                    >
                      <ToggleButton value="">All</ToggleButton>
                      <ToggleButton value="subscribed">Subscribed</ToggleButton>
                      <ToggleButton value="unsubscribed">
                        Unsubscribed
                      </ToggleButton>
                    </ToggleButtonGroup>

                    <FormControl size="small" className="catalog-inline-field">
                      <InputLabel id="ds-filter-datasource-label">
                        Data Source
                      </InputLabel>
                      <Select
                        labelId="ds-filter-datasource-label"
                        label="Data Source"
                        value={filterValues.datasource}
                        onChange={setFilterField("datasource")}
                        MenuProps={filterMenuProps}
                      >
                        <MenuItem value="">
                          <em>All</em>
                        </MenuItem>
                        {datasourceList.map((v) => (
                          <MenuItem key={v} value={v}>
                            {v}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" className="catalog-inline-field">
                      <InputLabel id="ds-filter-status-label">
                        Data Feed Status
                      </InputLabel>
                      <Select
                        labelId="ds-filter-status-label"
                        label="Data Feed Status"
                        value={filterValues.datafeedStatus}
                        onChange={setFilterField("datafeedStatus")}
                        MenuProps={filterMenuProps}
                      >
                        <MenuItem value="">
                          <em>All</em>
                        </MenuItem>
                        {feedStatus.map((c) => (
                          <MenuItem key={c} value={c}>
                            {c}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Button onClick={onReset} variant="outlined" size="small">
                      Reset
                    </Button>
                    <Button onClick={filter} variant="contained" size="small">
                      Apply
                    </Button>
                  </div>
                )}
              </div>
            </PageHero>
          </div>

          <Drawer
            anchor="right"
            open={isMobile && filterShown}
            onClose={() => setFilterShown(false)}
            slotProps={{ paper: { sx: { width: "min(420px, 92vw)" } } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, borderBottom: "1px solid var(--color-border-secondary)" }}>
              <Typography component="h3" sx={{ fontSize: 16, fontWeight: 600, m: 0 }}>
                Filters
              </Typography>
              <IconButton size="small" onClick={() => setFilterShown(false)} aria-label="Close">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            {filterForm}
          </Drawer>

          <div className="catalog-card-shell">
            <div className="catalog-section-title">
              <span className="content-title">
                All Data Feeds ({catalogueCount})
              </span>
            </div>
            <div className="catalog-scroll">{catalogListDisplay}</div>
            {catalogPagination}
          </div>
        </div>
      </Box>

      <Dialog
        open={tokenDialogOpen}
        onClose={() => setTokenDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Access Token</DialogTitle>
        <DialogContent>
          <Typography component="div" sx={{ mb: 2 }}>
            Below is the access token generated. Click Copy Token.
          </Typography>
          <Card
            className="noselect"
            sx={{
              p: 2,
              maxWidth: 900,
              wordBreak: "break-all",
              fontFamily: "monospace",
              fontSize: 12,
              background: "var(--color-bg-subtle)",
            }}
          >
            {localStorage.getItem("access_token")}
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTokenDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleCopyToken}>
            Copy Token
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CatalogPage;
