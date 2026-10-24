// Prestations : accordéon sur téléphone (repliées au chargement), toujours ouvertes sur
// grand écran. Sans JavaScript, elles restent ouvertes (attribut open dans le HTML).
(function () {
  "use strict";

  var blocs = document.querySelectorAll("details.prestation");
  if (!blocs.length || !window.matchMedia) return;
  var grandEcran = window.matchMedia("(min-width: 48rem)"); // même seuil que site.css

  function appliquer() {
    for (var i = 0; i < blocs.length; i++) blocs[i].open = grandEcran.matches;
  }

  appliquer();
  if (grandEcran.addEventListener) grandEcran.addEventListener("change", appliquer);
  else if (grandEcran.addListener) grandEcran.addListener(appliquer);

  // Sur grand écran, un clic ou la touche Entrée ne doit pas replier une prestation
  for (var i = 0; i < blocs.length; i++) {
    blocs[i].addEventListener("toggle", function (e) {
      if (grandEcran.matches && !e.target.open) e.target.open = true;
    });
  }
})();

// Formulaire de contact : envoi par Web3Forms, sans quitter la page.
// Tant que la clé Web3Forms n'est pas posée dans index.html, le message s'ouvre dans la messagerie.
(function () {
  "use strict";

  var form = document.getElementById("formulaire");
  if (!form || !window.fetch || !window.FormData) return; // sans JS moderne : envoi classique

  var statut = form.querySelector(".statut");
  var bouton = form.querySelector('button[type="submit"]');
  var CLE_ABSENTE = "A_COMPLETER";
  var EMAIL = "lea@ellesadomicile.fr";

  function afficher(texte, classe) {
    statut.textContent = texte;
    statut.className = "statut " + classe;
  }

  function ouvrirMessagerie() {
    var corps =
      "Nom : " + form.elements.name.value + "\n" +
      "Téléphone : " + form.elements.phone.value + "\n" +
      (form.elements.email.value ? "Email : " + form.elements.email.value + "\n" : "") +
      "\n" + form.elements.message.value;
    window.location.href =
      "mailto:" + EMAIL +
      "?subject=" + encodeURIComponent("Demande depuis ellesadomicile.fr") +
      "&body=" + encodeURIComponent(corps);
    afficher("Votre messagerie devrait s’ouvrir avec le message prêt à envoyer. Sinon, appelez-moi au 06 33 38 10 34.", "ok");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.elements.botcheck.checked) return;

    if (form.elements.access_key.value.indexOf(CLE_ABSENTE) === 0) {
      ouvrirMessagerie();
      return;
    }

    bouton.disabled = true;
    afficher("Envoi en cours…", "");

    fetch(form.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    })
      .then(function (r) {
        return r.json().catch(function () { return { success: false }; });
      })
      .then(function (reponse) {
        if (!reponse.success) throw new Error(reponse.message || "refus");
        form.reset();
        afficher("Message envoyé. Je vous recontacte dès que possible.", "ok");
      })
      .catch(function () {
        afficher("Le message n’est pas parti. Appelez-moi au 06 33 38 10 34 ou écrivez à " + EMAIL + ".", "erreur");
      })
      .then(function () {
        bouton.disabled = false;
      });
  });
})();
