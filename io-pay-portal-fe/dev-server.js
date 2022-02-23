/**
 * Development server built as an express application,
 * able to run frontend (thanks to parcel-bundler) and an API server with json response example.
 *
 * Note: to run the development server must be set IO_PAY_PORTAL_API_HOST=http://localhost:1234
 */

const Bundler = require("parcel-bundler");
const express = require("express");

const app = express();

app.use(express.json()) 

app.get("/api/checkout/payments/v1/payment-requests/:rptId", (_, res) => {
  // test scenario for an error message
  if (_.params.rptId == "00000000000000000000000000000" ) {
    res.status(500).send("Error!");
  } else if (_.params.rptId == "00000000000000000000000000009" ) {
    res.status(400).send( { detail: "PAA_PAGAMENTO_DUPLICATO" } );
  } else if (_.params.rptId == "00000000000000000000000000008" ) {
    res.status(400).send( { detail: "PAA_PAGAMENTO_IN_CORSO" } );
  } else if (_.params.rptId == "00000000000000000000000000007" ) {
    res.status(400).send( { detail: "PAA_PAGAMENTO_SCADUTO" } );
  } else if (_.params.rptId == "00000000000000000000000000006" ) {
    res.status(400).send( { detail: "PPT_DOMINIO_SCONOSCIUTO" } );
  } else if (_.params.rptId == "00000000000000000000000000005" ) {
    res.status(400).send( { detail: "PPT_SINTASSI_EXTRAXSD" } );
  } else if (_.params.rptId == "00000000000000000000000000004" ) {
    res.status(400).send( { detail: "UNKNOWN_ERROR" } );
  } else if (_.params.rptId == "00000000000000000000000000010") {
    res.status(400).send( { detail: "PPT_PAGAMENTO_DUPLICATO" } );
  }else if (_.params.rptId == "00000000000000000000000000011") {
    res.status(400).send( { detail: "PPT_PAGAMENTO_IN_CORSO" } );
  }
  else {
    res.send({
      importoSingoloVersamento: 1100,
      codiceContestoPagamento: "6f69d150541e11ebb70c7b05c53756dd",
      ibanAccredito: "IT21Q0760101600000000546200",
      causaleVersamento: "Retta asilo [demo]",
      enteBeneficiario: {
        identificativoUnivocoBeneficiario: "01199250158",
        denominazioneBeneficiario: "Comune di Milano",
      },
    });
  }
});

app.post("/api/payportal/v1/payment-activations", (_, res) => {

  if (_.body.rptId == "00000000000000000000000000099" ) {
    res.status(400).send( { detail: "PAA_PAGAMENTO_DUPLICATO" } );
  } else {
    res.send({
      codiceContestoPagamento: "6f69d150541e11ebb70c7b05c53756dd",
      ibanAccredito: "IT21Q0760101600000000546200",
      causaleVersamento: "Retta asilo [demo]",
      enteBeneficiario: {
        identificativoUnivocoBeneficiario: "01199250158",
        denominazioneBeneficiario: "Comune di Milano",
      },
      importoSingoloVersamento: 1100,
    });
  }

});

app.get(
  "/api/payportal/v1/payment-activations/:codiceContestoPagamento",
  (_, res) => {
    res.send({
      idPagamento: "123455",
    });
  }
);

const bundler = new Bundler("src/*.html");
app.use(bundler.middleware());

app.listen(Number(1234));
