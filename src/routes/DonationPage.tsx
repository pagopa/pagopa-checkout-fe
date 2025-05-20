/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EditIcon from "@mui/icons-material/Edit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import {
  Alert,
  Box,
  Button,
  Grid,
  Icon,
  Link,
  Snackbar,
  SvgIcon,
  SxProps,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { resetThreshold } from "../redux/slices/threshold";
import sprite from "../assets/images/app.svg";
import InformationModal from "../components/modals/InformationModal";
import PageContainer from "../components/PageContent/PageContainer";
import PrivacyInfo from "../components/PrivacyPolicy/PrivacyInfo";
import SkeletonDonationFieldContainer from "../components/Skeletons/SkeletonDonationFieldContainer";
import FieldContainer from "../components/TextFormField/FieldContainer";
import {
  Donation,
  DonationSlice,
} from "../features/payment/models/donationModel";
import { useAppDispatch } from "../redux/hooks/hooks";
import { getDonationEntityList } from "../utils/api/helper";
import { moneyFormat } from "../utils/form/formatters";

export default function DonationPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loadingList, setLoadingList] = React.useState(false);
  const [entityList, setEntityList] = React.useState<Array<Donation>>([]);
  const [selectedEntity, setSelectedEntity] = React.useState<Donation>();
  const [selectedSlice, setSelectedSlice] = React.useState<DonationSlice>();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const isMobileDevice = useMediaQuery(theme.breakpoints.down("sm"));

  React.useEffect(() => {
    dispatch(resetThreshold());
    setLoadingList(true);
    void getDonationEntityList(onError, onResponse);
  }, []);
  sessionStorage.clear();

  const onError = (m: string) => {
    setLoadingList(false);
    setError(m);
    setErrorModalOpen(true);
  };

  const onResponse = (list: Array<Donation>) => {
    setEntityList(list);
    setLoadingList(false);
  };

  const onEdit = () => {
    setSelectedEntity(undefined);
    setSelectedSlice(undefined);
  };

  const onSubmit = () => {
    navigate(`/${selectedEntity?.cf}${selectedSlice?.nav}`);
  };

  const onAPPIO = React.useCallback(() => {
    if (isMobileDevice) {
      window.open("https://io.italia.it/donazioni-ucraina/", "_blank")?.focus();
    } else {
      setModalOpen(true);
    }
  }, [isMobileDevice]);

  const getEntityContainer = ({
    entity,
    key,
    sx,
    onClick,
    onKeyDown,
    tabIndex,
    role,
  }: {
    entity: Donation;
    key?: number;
    sx?: SxProps;
    onClick?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    tabIndex?: number;
    role?: string;
  }) => (
    <FieldContainer
      key={key}
      title={entity.companyName}
      body={entity.reason}
      titleVariant="sidenav"
      bodyVariant="body2"
      icon={
        <Icon sx={{ width: "40px", height: "40px" }} aria-hidden="true">
          <img
            src={`data:image/png;base64,${entity.base64Logo}`}
            alt="Logo ente"
            style={{ height: "100%" }}
          />
        </Icon>
      }
      endAdornment={
        <Link
          href={entity.web_site}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: "flex", mx: 1 }}
          title={`${t("ariaLabels.informationLink")} ${entity.companyName}`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <InfoOutlinedIcon
            sx={{ color: "primary.main", cursor: "pointer" }}
            fontSize="medium"
            aria-hidden="true"
          />
        </Link>
      }
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        mb: 1,
        p: 2,
        ...sx,
      }}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      role={role}
    />
  );

  return (
    <PageContainer
      title="donationPage.title"
      {...(selectedEntity
        ? { description: undefined }
        : { description: "donationPage.description" })}
    >
      <Box sx={{ mt: 6 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="sidenav"
            component="div"
            sx={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              paddingY: 2,
            }}
          >
            <SupervisorAccountIcon
              sx={{ mr: 1, color: theme.palette.text.primary }}
            />
            {t("donationPage.entity")}
          </Typography>
          {!!selectedEntity && (
            <Button
              variant="text"
              onClick={() => onEdit()}
              startIcon={<EditIcon />}
              aria-label={t("ariaLabels.editDonation")}
              sx={{ padding: 2 }}
            >
              {t("clipboard.edit")}
            </Button>
          )}
        </Box>
        {!selectedEntity &&
          (loadingList ? (
            <SkeletonDonationFieldContainer />
          ) : (
            // eslint-disable-next-line functional/immutable-data
            entityList
              .sort((a, b) => (a.companyName > b.companyName ? 1 : -1))
              .map((entity, index) =>
                getEntityContainer({
                  entity,
                  key: index,
                  sx: { cursor: "pointer" },
                  onClick: () => setSelectedEntity(entity),
                  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
                    if (e.key === "Enter") {
                      setSelectedEntity(entity);
                    }
                  },
                  tabIndex: 0,
                  role: "listitem",
                })
              )
          ))}
        {!!selectedEntity && (
          <>
            {getEntityContainer({
              entity: selectedEntity,
            })}
            <Typography
              variant="sidenav"
              component="div"
              sx={{
                display: "flex",
                justifyContent: "start",
                alignItems: "center",
                mt: 5,
                mb: 3,
              }}
            >
              <VolunteerActivismIcon
                sx={{ mr: 1, color: theme.palette.text.primary }}
              />
              {t("donationPage.volunteer")}
            </Typography>
            <Grid container spacing={3} mb={6}>
              {selectedEntity.slices?.map((slice, index) => (
                <React.Fragment key={index}>
                  <Grid item xs={4}>
                    <Button
                      variant={
                        selectedSlice === slice ? "contained" : "outlined"
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: 45,
                      }}
                      onClick={() => setSelectedSlice(slice)}
                    >
                      {moneyFormat(slice.amount, 2, 0)}
                    </Button>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
            {!!selectedSlice && (
              <>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={{ xs: 2, sm: 3 }}
                  sx={{
                    flexDirection: { xs: "column", sm: "row-reverse" },
                    mb: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => onSubmit()}
                    startIcon={<CreditCardIcon />}
                    aria-label={t("donationPage.submitCard")}
                    sx={{ width: "100%" }}
                  >
                    {t("donationPage.submitCard")}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={onAPPIO}
                    startIcon={
                      <SvgIcon
                        sx={{
                          fill: theme.palette.primary.main,
                        }}
                      >
                        <use href={sprite + "#appIO"} />
                      </SvgIcon>
                    }
                    aria-label={t("donationPage.submitIO")}
                    sx={{ display: { xs: "none", sm: "flex" }, width: "100%" }}
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    {t("donationPage.submitIO")}
                  </Button>
                </Box>
                <Typography
                  variant="caption-semibold"
                  component="div"
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  {t("donationPage.ioDescription")}
                </Typography>
              </>
            )}
          </>
        )}
      </Box>
      <PrivacyInfo showDonationPrivacy={true} />
      <InformationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        hideIcon={true}
      >
        <Typography variant="h6" component={"div"} sx={{ pb: 2 }}>
          {t("donationPage.modalTitle")}
        </Typography>
        <Typography variant="body1" component={"div"}>
          {`${t("donationPage.openSection")} `}
          <Typography
            variant="body1"
            component={"span"}
            sx={{ fontWeight: 600 }}
          >
            {`${t("donationPage.portfolio")}, `}
          </Typography>
          {`${t("donationPage.click")} `}
          <Typography
            variant="body1"
            component={"span"}
            sx={{ fontWeight: 600 }}
          >
            {`${t("donationPage.payNotice")} `}
          </Typography>
          {t("donationPage.code")}
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" my={4}>
          <QRCode
            value={`PAGOPA|002|${selectedSlice?.nav}|${selectedEntity?.cf}|${selectedSlice?.amount}`}
            size={172}
          />
        </Box>
        <Typography
          variant="body1"
          component={"div"}
          sx={{ whiteSpace: "pre-line" }}
        >
          {t("donationPage.modalBody2")}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setModalOpen(false)}
          sx={{ width: "100%", marginTop: 3 }}
        >
          {t("errorButton.close")}
        </Button>
      </InformationModal>
      {!!error && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          open={errorModalOpen}
          autoHideDuration={6000}
          onClose={() => {
            setErrorModalOpen(false);
          }}
          sx={{
            position: "fixed",
            bottom: "64px !important",
            boxShadow: theme.shadows[4],
          }}
        >
          <Alert
            onClose={() => {
              setErrorModalOpen(false);
            }}
            severity="error"
            sx={{
              width: "100%",
              alignItems: "center",
              background: theme.palette.background.default,
              borderLeftColor: theme.palette.error.main + " !important",
              borderLeft: "4px solid",
            }}
            action={
              <Button
                variant="text"
                onClick={() => {
                  setLoadingList(true);
                  void getDonationEntityList(onError, onResponse);
                }}
              >
                {t("errorButton.retry")}
              </Button>
            }
          >
            {t(error)}
          </Alert>
        </Snackbar>
      )}
    </PageContainer>
  );
}
