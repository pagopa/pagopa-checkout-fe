import React from "react";
import { resetThreshold } from "../redux/slices/threshold";
import PageContainer from "../components/PageContent/PageContainer";
import PrivacyInfo from "../components/PrivacyPolicy/PrivacyInfo";
import { PaymentNoticeChoice } from "../features/payment/components/PaymentNoticeChoice/PaymentNoticeChoice";
import { useAppDispatch } from "../redux/hooks/hooks";
import { clearStorage } from "../utils/storage/sessionStorage";

let didInit = false;

export default function IndexPage() {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
      if(!didInit){
    dispatch(resetThreshold());
        didInit=true;
      }
  }, []);
  clearStorage();

  return (
    <PageContainer
      title="indexPage.title"
      description="indexPage.description"
      childrenSx={{ mt: 6 }}
    >
      <PaymentNoticeChoice />
      <PrivacyInfo />
    </PageContainer>
  );
}
