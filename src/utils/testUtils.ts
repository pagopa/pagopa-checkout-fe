import axios from "axios";

export async function getIdPaymentMock(pmMockHost: string, pmMockPort: string) {
  return (await axios.get(`http://${pmMockHost}:${pmMockPort}/getPaymentId`))
    .data.idPayment;
}
