// Implementazione con chiamata API e supporto per hash multipli
const loadNpgSDK = async () => {
  try {
    // Chiamata API al microservizio per ottenere i valori hash
    const response = await fetch('http://localhost:8080/ecommerce/checkout/v1/integrities/npg');
    const { hashes, crossOriginDomain } = await response.json();
    
    const integrityValue = hashes.map(({ value }) => value).join(' ');
    
    const elementScriptNpg = document.createElement("script");
    const urlScriptNpg = window._env_.CHECKOUT_NPG_SDK_URL;
    
    elementScriptNpg.setAttribute("src", urlScriptNpg);
    elementScriptNpg.setAttribute("type", "text/javascript");
    elementScriptNpg.setAttribute("charset", "UTF-8");
    elementScriptNpg.onerror = (e) => { 
        /* Log + logica retry + strategie spiegate nel catch sottostante */
        console.log("Errore dopo aver recuperato gli hash:", e)
    };
    elementScriptNpg.setAttribute("integrity", integrityValue);
    elementScriptNpg.setAttribute("crossorigin", crossOriginDomain);
    
    document.head.appendChild(elementScriptNpg);
  } catch (error) {
    console.error("Errore nel caricamento dello script NPG con integrità:", error);
    // Log verso ELK RUM (o equivalente, vedi sezione relativa)
    // Non mostrato: logiche di retry
    // Opzione 1: Strategia bloccante: redirect in pagina errore dedicata con possibilità di retry guidato
    // Opzione 2: Strategia permissiva: caricamento senza controllo di integrità
    const fallbackElementScriptNpg = document.createElement("script");
    fallbackElementScriptNpg.setAttribute("src", window._env_.CHECKOUT_NPG_SDK_URL);
    fallbackElementScriptNpg.setAttribute("type", "text/javascript");
    fallbackElementScriptNpg.setAttribute("charset", "UTF-8");
    document.head.appendChild(fallbackElementScriptNpg);
  }
};

loadNpgSDK();