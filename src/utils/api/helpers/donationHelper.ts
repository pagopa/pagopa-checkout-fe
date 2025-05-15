import { getConfigOrThrow } from "../../../utils/config/config";
import { ErrorsType } from "../../../utils/errors/checkErrorsModel";

export const getDonationEntityList = async (
  onError: (e: string) => void,
  onResponse: (data: any) => void
) => {
  window
    .fetch(getConfigOrThrow().CHECKOUT_DONATIONS_URL)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(ErrorsType.DONATIONLIST_ERROR);
    })
    .then((data) => {
      onResponse(data);
    })
    .catch(() => {
      onError(ErrorsType.DONATIONLIST_ERROR);
    });
};
