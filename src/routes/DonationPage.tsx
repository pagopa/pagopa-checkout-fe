import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { Box, Typography, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ErrorModal from "../components/modals/ErrorModal";
import PageContainer from "../components/PageContent/PageContainer";
import PrivacyInfo from "../components/PrivacyPolicy/PrivacyInfo";
import SkeletonDonationFieldContainer from "../components/Skeletons/SkeletonDonationFieldContainer";
import FieldContainer from "../components/TextFormField/FieldContainer";
import { Donation } from "../features/payment/models/donationModel";
import { resetCheckData } from "../redux/slices/checkData";
import { getDonationEntityList } from "../utils/api/helper";

export default function DonationPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [loadingList, setLoadingList] = React.useState(true);
  const [entityList, setEntityList] = React.useState<Array<Donation>>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    dispatch(resetCheckData());
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

  return (
    <PageContainer
      title="donationPage.title"
      description="donationPage.description"
    >
      <Box sx={{ mt: 6 }}>
        <Typography
          variant="sidenav"
          component="div"
          sx={{
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            mb: 2,
          }}
        >
          <SupervisorAccountIcon
            sx={{ mr: 1, color: theme.palette.text.primary }}
          />
          {t("donationPage.entity")}
        </Typography>
        {loadingList ? (
          <SkeletonDonationFieldContainer />
        ) : (
          entityList.map((entity, index) => (
            <FieldContainer
              key={index}
              title={entity.companyName}
              body={entity.reason}
              icon={
                <img
                  src={`data:image/png;base64,${entity.base64Logo}`}
                  alt="Logo ente donazione"
                  style={{ width: "40px", height: "40px" }}
                />
              }
            />
          ))
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
