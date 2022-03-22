import CreditCardIcon from "@mui/icons-material/CreditCard";
import EditIcon from "@mui/icons-material/Edit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import {
  Box,
  Button,
  Grid,
  SvgIcon,
  SxProps,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { useDispatch } from "react-redux";
import ErrorModal from "../components/modals/ErrorModal";
import InformationModal from "../components/modals/InformationModal";
import PageContainer from "../components/PageContent/PageContainer";
import PrivacyInfo from "../components/PrivacyPolicy/PrivacyInfo";
import SkeletonDonationFieldContainer from "../components/Skeletons/SkeletonDonationFieldContainer";
import FieldContainer from "../components/TextFormField/FieldContainer";
import {
  Donation,
  DonationSlice,
} from "../features/payment/models/donationModel";
import { resetCheckData } from "../redux/slices/checkData";
import { getDonationEntityList } from "../utils/api/helper";
import { moneyFormat } from "../utils/form/formatters";

export default function DonationPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [loadingList, setLoadingList] = React.useState(false);
  const [entityList, setEntityList] = React.useState<Array<Donation>>([]);
  const [selectedEntity, setSelectedEntity] = React.useState<Donation>();
  const [selectedSlice, setSelectedSlice] = React.useState<DonationSlice>();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    dispatch(resetCheckData());
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

  const getEntityContainer = ({
    entity,
    key,
    sx,
    onClick,
  }: {
    entity: Donation;
    key?: number;
    sx?: SxProps;
    onClick?: () => void;
  }) => (
    <FieldContainer
      key={key}
      title={entity.companyName}
      body={entity.reason}
      titleVariant="sidenav"
      bodyVariant="body2"
      icon={
        <SvgIcon>
          <img
            src={`data:image/png;base64,${entity.base64Logo}`}
            alt="Logo ente"
            style={{ width: "40px", height: "40px" }}
          />
        </SvgIcon>
      }
      endAdornment={
        <a
          href={entity.web_site}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", marginRight: "16px" }}
          title={`${t("ariaLabels.informationLink")} ${entity.companyName}`}
        >
          <InfoOutlinedIcon
            sx={{ color: "primary.main", cursor: "pointer" }}
            fontSize="medium"
            tabIndex={0}
          />
        </a>
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
            entityList.map((entity, index) =>
              getEntityContainer({
                entity,
                key: index,
                sx: { cursor: "pointer" },
                onClick: () => setSelectedEntity(entity),
              })
            )
          ))}
        {!!selectedEntity && (
          <>
            {getEntityContainer({ entity: selectedEntity })}
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
                      {moneyFormat(slice.amount, 0)}
                    </Button>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
            {!!selectedSlice && (
              <>
                <Button
                  variant="contained"
                  onClick={() => onEdit()}
                  startIcon={<CreditCardIcon />}
                  aria-label={t("donationPage.submitCard")}
                  sx={{ width: "100%", marginBottom: 2 }}
                >
                  {t("donationPage.submitCard")}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setModalOpen(true)}
                  startIcon={<CreditCardIcon />}
                  aria-label={t("donationPage.submitIO")}
                  sx={{ width: "100%", marginBottom: 2 }}
                >
                  {t("donationPage.submitIO")}
                </Button>
                <Typography variant="caption-semibold" component="div">
                  {t("donationPage.ioDescription")}
                </Typography>
              </>
            )}
          </>
        )}
      </Box>
      <PrivacyInfo />
      <InformationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        hideIcon={true}
      >
        <Typography variant="h6" component={"div"} sx={{ pb: 2 }}>
          {t("donationPage.modalTitle")}
        </Typography>
        <Typography
          variant="body1"
          component={"div"}
          sx={{ whiteSpace: "pre-line" }}
        >
          {t("donationPage.modalBody1")}
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
        <ErrorModal
          error={error}
          open={errorModalOpen}
          onClose={() => {
            setErrorModalOpen(false);
          }}
        />
      )}
    </PageContainer>
  );
}
