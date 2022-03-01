export const onBrowserUnload = (e: any) => {
  e.preventDefault();
  // eslint-disable-next-line functional/immutable-data
  return (e.returnValue = "");
};
