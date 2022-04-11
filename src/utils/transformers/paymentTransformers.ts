export function paymentSubjectTransform(subject: string | null | undefined) {
  return subject?.includes("/TXT") ? subject.split("/TXT/")[1] : subject;
}

export const getNoticeInfoFrom = (rptid: string) => ({
  billCode: rptid?.slice(11) || "",
  cf: rptid?.slice(0, 11) || "",
});
