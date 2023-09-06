import React from "react";
import PageContainer from "../components/PageContent/PageContainer";
import CheckoutLoader from "../components/PageContent/CheckoutLoader";

const GDICheckPage = () => {
  const iframeUrl = window.location.hash.substring(1);
  return (
    <PageContainer>
      <CheckoutLoader />
      <iframe src={`https://${iframeUrl}`} style={{ display: "none" }} />
    </PageContainer>
  );
};
export default GDICheckPage;
