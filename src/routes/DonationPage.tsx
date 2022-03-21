import EditIcon from "@mui/icons-material/Edit";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import {
  Box,
  Button,
  Grid,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ErrorModal from "../components/modals/ErrorModal";
import PageContainer from "../components/PageContent/PageContainer";
import PrivacyInfo from "../components/PrivacyPolicy/PrivacyInfo";
import SkeletonDonationFieldContainer from "../components/Skeletons/SkeletonDonationFieldContainer";
import FieldContainer from "../components/TextFormField/FieldContainer";
import {
  Donation,
  DonationSlice,
} from "../features/payment/models/donationModel";
import { resetCheckData } from "../redux/slices/checkData";
import { moneyFormat } from "../utils/form/formatters";

export default function DonationPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [loadingList, setLoadingList] = React.useState(false);
  const [entityList, setEntityList] = React.useState<Array<Donation>>([]);
  const [selectedEntity, setSelectedEntity] = React.useState<Donation>();
  const [selectedSlice, setSelectedSlice] = React.useState<DonationSlice>();
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    dispatch(resetCheckData());
    setLoadingList(true);
    // void getDonationEntityList(onError, onResponse);
    setTimeout(() => {
      setLoadingList(false);
      setEntityList([
        {
          name: "Croce Rossa Italiana",
          reason: "Donazione Emergenza Ucraina",
          web_site: "https://cri.it/emergenzaucraina/",
          base64Logo: "/9j/4AAQSk",
          cf: "11111111110",
          paymentDescription: "Donazione Emergenza Ucraina",
          companyName: "Croce Rossa Italiana",
          officeName: "Croce Rossa Italiana ",
          transferCategory: "0101002IM",
          slices: [
            {
              idDonation: "00",
              amount: 500,
              nav: "300001647862165438",
            },
            {
              idDonation: "01",
              amount: 1000,
              nav: "300011647862165438",
            },
            {
              idDonation: "02",
              amount: 2000,
              nav: "300021647862165438",
            },
            {
              idDonation: "03",
              amount: 5000,
              nav: "300031647862165438",
            },
            {
              idDonation: "04",
              amount: 10000,
              nav: "300041647862165438",
            },
            {
              idDonation: "05",
              amount: 20000,
              nav: "300051647862165438",
            },
          ],
        },
        {
          name: "Basilica minore di Santa maria in Sofia",
          reason: "Donazione sostegno Ucraina",
          web_site: "https://bmsms.it/sostegnoucraina/",
          base64Logo: "/9j/4AAQSkZJR",
          cf: "22222222220",
          paymentDescription: "Donazione sostegno Ucraina",
          companyName: "Basilica minore di Santa maria in Sofia",
          officeName: "Basilica minore di Santa maria in Sofia ",
          transferCategory: "0101002IM",
          slices: [
            {
              idDonation: "06",
              amount: 500,
              nav: "300061647862165438",
            },
            {
              idDonation: "07",
              amount: 1000,
              nav: "300071647862165438",
            },
            {
              idDonation: "08",
              amount: 2000,
              nav: "300081647862165438",
            },
            {
              idDonation: "09",
              amount: 5000,
              nav: "300091647862165438",
            },
            {
              idDonation: "10",
              amount: 10000,
              nav: "300101647862165438",
            },
            {
              idDonation: "11",
              amount: 20000,
              nav: "300111647862165438",
            },
          ],
        },
      ]);
    }, 3000);
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

  return (
    <PageContainer
      title="donationPage.title"
      description="donationPage.description"
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
            entityList.map((entity, index) => (
              <FieldContainer
                key={index}
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
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  mb: 1,
                  p: 2,
                  cursor: "pointer",
                }}
                onClick={() => setSelectedEntity(entity)}
              />
            ))
          ))}
        {!!selectedEntity && (
          <>
            <FieldContainer
              title={selectedEntity.companyName}
              body={selectedEntity.reason}
              titleVariant="sidenav"
              bodyVariant="body2"
              icon={
                <SvgIcon>
                  <img
                    src={`data:image/png;base64,${selectedEntity.base64Logo}`}
                    alt="Logo ente"
                    style={{ width: "40px", height: "40px" }}
                  />
                </SvgIcon>
              }
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                mb: 1,
                p: 2,
              }}
            />
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
            <Grid container spacing={3}>
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
          </>
        )}
      </Box>
      <PrivacyInfo />
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
