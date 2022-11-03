export function emailValidation(email: string) {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(
    email
  );
}

export function cardNameValidation(name: string) {
  return /^[a-zA-Z]+[\s']+([a-zA-Z]+[\s']*){1,}$/.test(name);
}

export function digitValidation(text: string) {
  return /^\d+$/.test(text);
}

export function qrCodeValidation(code: string) {
  return /^[a-zA-Z]{6}(\|[0-9]{3})(\|[0-9]{18})(\|[0-9]{11})(\|[0-9]{2,11})$/.test(
    code
  );
}
